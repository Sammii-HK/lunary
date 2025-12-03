console.log('📦 [cosmic/snapshot] Module loaded at:', new Date().toISOString());

import { NextRequest, NextResponse } from 'next/server';
import {
  getCachedSnapshot,
  buildSnapshotWithGlobalCache,
  saveSnapshot,
} from '@/lib/cosmic-snapshot/cache';
import {
  getGlobalCosmicData,
  buildGlobalCosmicData,
} from '@/lib/cosmic-snapshot/global-cache';
import { requireUser, AuthenticatedUser } from '@/lib/ai/auth';
import { auth } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import { loadJazzProfile } from '@/lib/jazz/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_TIMEZONE = 'Europe/London';
const DEFAULT_LOCALE = 'en-GB';
const SNAPSHOT_CACHE_HEADER = 'private, no-store, max-age=0, must-revalidate';

type SnapshotProfile = {
  email?: string;
  name?: string;
  timezone: string;
  locale: string;
  birthday?: string;
};

const buildProfileFromUser = (user: AuthenticatedUser): SnapshotProfile => ({
  email: user.email ?? undefined,
  name: user.displayName ?? user.email ?? undefined,
  timezone: user.timezone ?? DEFAULT_TIMEZONE,
  locale: user.locale ?? DEFAULT_LOCALE,
  birthday: user.birthday ?? undefined,
});

async function hydrateProfileFromDatabase(
  userId: string,
  baseProfile: SnapshotProfile,
): Promise<SnapshotProfile> {
  try {
    const result = await sql`
      SELECT name, birthday
      FROM user_profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    const dbProfile = result.rows[0];
    if (!dbProfile) {
      return baseProfile;
    }

    return {
      email: baseProfile.email ?? undefined,
      name: baseProfile.name ?? dbProfile.name ?? undefined,
      timezone: baseProfile.timezone ?? DEFAULT_TIMEZONE,
      locale: baseProfile.locale ?? DEFAULT_LOCALE,
      birthday: baseProfile.birthday ?? dbProfile.birthday ?? undefined,
    };
  } catch (error: any) {
    // 42P01 = relation does not exist (user_profiles table missing in some envs)
    if (error?.code === '42P01') {
      console.warn(
        '[cosmic/snapshot] user_profiles table not found – skipping DB profile fallback',
      );
      return baseProfile;
    }
    console.error('[cosmic/snapshot] Failed to hydrate profile from DB', error);
    return baseProfile;
  }
}

const ensureProfileFromJazz = async (
  userId: string,
  baseProfile: SnapshotProfile,
): Promise<SnapshotProfile> => {
  if (
    baseProfile.birthday &&
    baseProfile.timezone &&
    baseProfile.locale &&
    baseProfile.name
  ) {
    return baseProfile;
  }

  console.log('[cosmic/snapshot] Loading Jazz profile for userId:', userId);
  const jazzProfile = await loadJazzProfile(userId);
  console.log('[cosmic/snapshot] Jazz profile loaded:', {
    hasProfile: !!jazzProfile,
    profileType: jazzProfile ? typeof jazzProfile : 'null',
    profileKeys: jazzProfile ? Object.keys(jazzProfile as any) : [],
    birthday: (jazzProfile as any)?.birthday,
    name: (jazzProfile as any)?.name,
  });

  if (!jazzProfile) {
    console.warn('[cosmic/snapshot] No Jazz profile found');
    return baseProfile;
  }

  const finalProfile = {
    email: baseProfile.email,
    name: baseProfile.name ?? (jazzProfile as any)?.name ?? undefined,
    timezone:
      baseProfile.timezone ??
      (jazzProfile as any)?.timezone ??
      DEFAULT_TIMEZONE,
    locale:
      baseProfile.locale ?? (jazzProfile as any)?.locale ?? DEFAULT_LOCALE,
    birthday:
      baseProfile.birthday ?? (jazzProfile as any)?.birthday ?? undefined,
  };

  console.log('[cosmic/snapshot] Final profile after Jazz merge:', {
    hasBirthday: !!finalProfile.birthday,
    birthday: finalProfile.birthday,
    hasName: !!finalProfile.name,
  });

  return finalProfile;
};

export async function GET(request: NextRequest) {
  console.log('[cosmic/snapshot] GET request received');
  try {
    console.log('[cosmic/snapshot] Calling requireUser...');
    const user = await requireUser(request);
    console.log('[cosmic/snapshot] User authenticated:', {
      id: user.id,
      email: user.email,
      hasBirthday: !!user.birthday,
      timezone: user.timezone,
      locale: user.locale,
    });

    // Try to get Jazz account ID from session if available
    // Better Auth with Jazz adapter stores accountID in the user object
    let jazzAccountId = user.id;
    try {
      const sessionResponse = await (auth as any).api.getSession({
        headers: request.headers,
      });
      const authUser =
        sessionResponse?.data?.user ??
        sessionResponse?.user ??
        sessionResponse?.session?.user;
      const accountId =
        (authUser as any)?.accountID || (authUser as any)?.accountId;
      if (accountId && accountId !== user.id) {
        console.log('[cosmic/snapshot] Found Jazz account ID:', accountId);
        jazzAccountId = accountId;
      }
    } catch (err) {
      console.warn(
        '[cosmic/snapshot] Could not get Jazz account ID from session:',
        err,
      );
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    const date = dateParam ? new Date(dateParam) : new Date();

    // Try to get cached snapshot first
    // getCachedSnapshot checks DB and returns snapshot if it exists and is <24h old
    // Next.js cache layer (revalidate: 3600) provides additional caching
    console.log('[cosmic/snapshot] Checking for cached snapshot...');
    let snapshot = await getCachedSnapshot(user.id, date);
    console.log('[cosmic/snapshot] Cached snapshot result:', {
      hasSnapshot: !!snapshot,
    });

    console.log('[cosmic/snapshot] Building profile from user session...');
    let profile = buildProfileFromUser(user);
    console.log('[cosmic/snapshot] Base profile:', {
      hasBirthday: !!profile.birthday,
      hasName: !!profile.name,
      timezone: profile.timezone,
      locale: profile.locale,
    });

    console.log('[cosmic/snapshot] Hydrating profile from database...');
    profile = await hydrateProfileFromDatabase(user.id, profile);
    console.log('[cosmic/snapshot] After DB hydration:', {
      hasBirthday: !!profile.birthday,
      hasName: !!profile.name,
    });

    console.log('[cosmic/snapshot] Ensuring profile from Jazz...');
    profile = await ensureProfileFromJazz(jazzAccountId, profile);
    console.log('[cosmic/snapshot] Final profile:', {
      hasBirthday: !!profile.birthday,
      hasName: !!profile.name,
      birthday: profile.birthday,
    });

    // Generate snapshot if it doesn't exist or is stale (>24h old)
    // This ensures cosmic data is always available and fresh
    if (!snapshot) {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[cosmic/snapshot] No snapshot found, generating new one...',
            {
              userId: user.id,
              date: date.toISOString(),
            },
          );
        }

        if (!profile?.birthday) {
          console.error('[cosmic/snapshot] Birthday required but not set:', {
            userId: user.id,
          });
          return NextResponse.json(
            { error: 'Birthday required to generate cosmic snapshot' },
            { status: 400 },
          );
        }

        // Get or build global cosmic data
        let globalData = await getGlobalCosmicData(date);
        if (!globalData) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[cosmic/snapshot] Building global cosmic data...');
          }
          globalData = await buildGlobalCosmicData(date);
        }

        // Build snapshot - ALWAYS generate fresh data
        snapshot = await buildSnapshotWithGlobalCache(
          user.id,
          globalData,
          profile.timezone || DEFAULT_TIMEZONE,
          profile.locale || DEFAULT_LOCALE,
          profile.name,
          profile.birthday,
          date,
        );

        // Ensure snapshot has data - if not, something went wrong
        if (
          !snapshot ||
          (!snapshot.birthChart &&
            snapshot.currentTransits.length === 0 &&
            !snapshot.moon)
        ) {
          console.error('[cosmic/snapshot] Generated snapshot is empty:', {
            userId: user.id,
            hasBirthChart: !!snapshot?.birthChart,
            hasTransits: snapshot?.currentTransits.length || 0,
            hasMoon: !!snapshot?.moon,
            hasTarot: !!snapshot?.tarot?.daily || !!snapshot?.tarot?.weekly,
          });
          // Still return it - let the UI handle empty state
        }

        // Save snapshot for future use
        await saveSnapshot(user.id, date, snapshot);

        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[cosmic/snapshot] Successfully generated and saved snapshot:',
            {
              userId: user.id,
              hasBirthChart: !!snapshot.birthChart,
              hasTransits: snapshot.currentTransits.length > 0,
              hasMoon: !!snapshot.moon,
              hasTarot: !!snapshot.tarot.daily || !!snapshot.tarot.weekly,
            },
          );
        }
      } catch (error) {
        console.error('[cosmic/snapshot] Failed to generate snapshot:', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          userId: user.id,
        });
        return NextResponse.json(
          {
            error: 'Failed to generate cosmic snapshot',
            details:
              process.env.NODE_ENV === 'development'
                ? error instanceof Error
                  ? error.message
                  : String(error)
                : undefined,
          },
          { status: 500 },
        );
      }
    }

    // ALWAYS ensure snapshot exists - if generation failed, try one more time
    if (!snapshot) {
      console.error(
        '[cosmic/snapshot] Snapshot still null after generation attempt',
      );
      return NextResponse.json(
        { error: 'Failed to generate cosmic snapshot' },
        { status: 500 },
      );
    }

    return NextResponse.json(snapshot, {
      headers: {
        'Cache-Control': SNAPSHOT_CACHE_HEADER,
      },
    });
  } catch (error) {
    console.error('[cosmic/snapshot] Error:', error);
    // Try to generate snapshot even on error
    try {
      const user = await requireUser(request);
      const profile = buildProfileFromUser(user);
      if (profile?.birthday) {
        const globalData = await buildGlobalCosmicData(new Date());
        const snapshot = await buildSnapshotWithGlobalCache(
          user.id,
          globalData,
          profile.timezone || DEFAULT_TIMEZONE,
          profile.locale || DEFAULT_LOCALE,
          profile.name,
          profile.birthday,
          new Date(),
        );
        await saveSnapshot(user.id, new Date(), snapshot);
        return NextResponse.json(snapshot, {
          headers: {
            'Cache-Control': SNAPSHOT_CACHE_HEADER,
          },
        });
      }
    } catch (retryError) {
      console.error('[cosmic/snapshot] Retry failed:', retryError);
    }
    return NextResponse.json(
      { error: 'Failed to fetch cosmic snapshot' },
      { status: 500 },
    );
  }
}
