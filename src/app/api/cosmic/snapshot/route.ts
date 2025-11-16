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
import { requireUser } from '@/lib/ai/auth';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    const date = dateParam ? new Date(dateParam) : new Date();

    // Try to get cached snapshot first
    // getCachedSnapshot checks DB and returns snapshot if it exists and is <24h old
    // Next.js cache layer (revalidate: 3600) provides additional caching
    let snapshot = await getCachedSnapshot(user.id, date);

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

        // Get user profile data
        const profileResult = await sql`
          SELECT email, name, birthday, timezone, locale
          FROM accounts
          WHERE id = ${user.id}
          LIMIT 1
        `;
        const profile = profileResult.rows[0];

        if (!profile) {
          console.error('[cosmic/snapshot] User profile not found:', {
            userId: user.id,
          });
          return NextResponse.json(
            { error: 'User profile not found' },
            { status: 404 },
          );
        }

        if (!profile?.birthday) {
          console.error('[cosmic/snapshot] Birthday required but not set:', {
            userId: user.id,
            hasProfile: !!profile,
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
          profile.timezone || 'Europe/London',
          profile.locale || 'en-GB',
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
            hasTarot:
              !!snapshot?.tarot?.daily ||
              !!snapshot?.tarot?.weekly ||
              !!snapshot?.tarot?.personal,
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
              hasTarot:
                !!snapshot.tarot.daily ||
                !!snapshot.tarot.weekly ||
                !!snapshot.tarot.personal,
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
        'Cache-Control': 'public, s-maxage=14400, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('[cosmic/snapshot] Error:', error);
    // Try to generate snapshot even on error
    try {
      const user = await requireUser(request);
      const profileResult = await sql`
        SELECT email, name, birthday, timezone, locale
        FROM accounts
        WHERE id = ${user.id}
        LIMIT 1
      `;
      const profile = profileResult.rows[0];
      if (profile?.birthday) {
        const globalData = await buildGlobalCosmicData(new Date());
        const snapshot = await buildSnapshotWithGlobalCache(
          user.id,
          globalData,
          profile.timezone || 'Europe/London',
          profile.locale || 'en-GB',
          profile.name,
          profile.birthday,
          new Date(),
        );
        await saveSnapshot(user.id, new Date(), snapshot);
        return NextResponse.json(snapshot);
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
