import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { revalidateTag } from 'next/cache';
import { requireUser } from '@/lib/ai/auth';
import { decrypt } from '@/lib/encryption';
import { getEnhancedPersonalizedHoroscope } from '../../../../../utils/astrology/enhancedHoroscope';
import { getDailyCacheHeaders } from '@/lib/cache-utils';
import { CURRENT_BIRTH_CHART_VERSION } from '../../../../../utils/astrology/chart-version';
import { decryptLocation } from '@/lib/location-encryption';

export const runtime = 'nodejs';

interface UserProfile {
  name?: string;
  birthday?: string;
  birthChart?: any;
  birthChartVersion?: number;
}

async function getUserProfile(userId: string): Promise<UserProfile> {
  try {
    const result = await sql`
      SELECT name, birthday, birth_chart, location
      FROM user_profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return {};
    }

    const row = result.rows[0];
    const locationData = row.location ? decryptLocation(row.location) : null;
    return {
      name: row.name ? decrypt(row.name) : undefined,
      birthday: row.birthday ? decrypt(row.birthday) : undefined,
      birthChart: row.birth_chart || undefined,
      birthChartVersion: locationData?.birthChartVersion ?? undefined,
    };
  } catch (error: any) {
    if (error?.code === '42P01') {
      console.warn('[Daily Horoscope] user_profiles table not found');
      return {};
    }
    console.error('[Daily Horoscope] Failed to fetch user profile:', error);
    return {};
  }
}

interface CachedHoroscope {
  userId: string;
  date: string;
  sunSign: string;
  moonPhase: string;
  headline: string;
  overview: string;
  focusAreas: Array<{
    area: 'love' | 'work' | 'inner';
    title: string;
    guidance: string;
  }>;
  tinyAction: string;
  dailyGuidance: string;
  personalInsight: string;
  luckyElements: string[];
  cosmicHighlight: string;
  dailyAffirmation: string;
  generatedAt: string;
  birthChartVersion?: number;
}

// Get cached horoscope from database
async function getCachedHoroscope(
  userId: string,
  date: string,
): Promise<CachedHoroscope | null> {
  try {
    const result = await sql`
      SELECT horoscope_data, generated_at
      FROM daily_horoscopes
      WHERE user_id = ${userId} AND horoscope_date = ${date}
      LIMIT 1
    `;

    if (result.rows.length > 0) {
      const data = result.rows[0].horoscope_data as CachedHoroscope;
      return {
        ...data,
        generatedAt: result.rows[0].generated_at,
      };
    }
    return null;
  } catch (error: any) {
    // Table might not exist yet
    if (error?.code === '42P01') {
      console.warn('[Daily Horoscope] Table not found, will create on save');
      return null;
    }
    console.error('[Daily Horoscope] Cache read error:', error);
    return null;
  }
}

// Save horoscope to database
async function saveHoroscope(
  userId: string,
  date: string,
  horoscope: CachedHoroscope,
): Promise<void> {
  try {
    await sql`
      INSERT INTO daily_horoscopes (user_id, horoscope_date, horoscope_data, generated_at)
      VALUES (${userId}, ${date}, ${JSON.stringify(horoscope)}::jsonb, NOW())
      ON CONFLICT (user_id, horoscope_date)
      DO UPDATE SET
        horoscope_data = ${JSON.stringify(horoscope)}::jsonb,
        generated_at = NOW()
    `;

    revalidateTag(`horoscope-${userId}`);
    revalidateTag(`horoscope-${userId}-${date}`);
  } catch (error: any) {
    // If table doesn't exist, create it
    if (error?.code === '42P01') {
      console.log('[Daily Horoscope] Creating daily_horoscopes table...');
      await sql`
        CREATE TABLE IF NOT EXISTS daily_horoscopes (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          horoscope_date DATE NOT NULL,
          horoscope_data JSONB NOT NULL,
          generated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, horoscope_date)
        )
      `;
      // Retry the insert
      await sql`
        INSERT INTO daily_horoscopes (user_id, horoscope_date, horoscope_data, generated_at)
        VALUES (${userId}, ${date}, ${JSON.stringify(horoscope)}::jsonb, NOW())
        ON CONFLICT (user_id, horoscope_date)
        DO UPDATE SET
          horoscope_data = ${JSON.stringify(horoscope)}::jsonb,
          generated_at = NOW()
      `;
    } else {
      console.error('[Daily Horoscope] Cache write error:', error);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check for demo mode header first
    const demoUserId = request.headers.get('X-Demo-User');

    let userId: string;

    if (demoUserId && process.env.PERSONA_EMAIL) {
      // Demo mode: Look up REAL persona account from database
      const { sql } = await import('@vercel/postgres');

      try {
        const userResult = await sql`
          SELECT id FROM "user" WHERE email = ${process.env.PERSONA_EMAIL} LIMIT 1
        `;

        if (userResult.rows.length === 0) {
          return NextResponse.json(
            { error: 'Persona account not found' },
            { status: 500 },
          );
        }

        userId = userResult.rows[0].id;
        console.log('[Horoscope API] Using real persona account:', userId);
      } catch (dbError: any) {
        // Database not set up - use fallback persona data
        if (dbError?.code === '42P01') {
          console.warn(
            '[Horoscope API] Database tables not found - using fallback data',
          );

          // Load reference chart data for fallback
          const referenceData = await import('@/lib/reference-chart-data.json');
          const today = new Date();

          const horoscope = getEnhancedPersonalizedHoroscope(
            referenceData.persona.birthDate,
            referenceData.persona.name,
            {
              birthday: referenceData.persona.birthDate,
              birthChart: referenceData.planets,
            },
            today,
          );

          const horoscopeData = {
            userId: 'demo-fallback',
            date: today.toISOString().split('T')[0],
            sunSign: horoscope.sunSign,
            moonPhase: horoscope.moonPhase,
            headline: horoscope.headline,
            overview: horoscope.overview,
            focusAreas: horoscope.focusAreas,
            tinyAction: horoscope.tinyAction,
            dailyGuidance: horoscope.dailyGuidance,
            personalInsight: horoscope.personalInsight,
            luckyElements: horoscope.luckyElements,
            cosmicHighlight: horoscope.cosmicHighlight,
            dailyAffirmation: horoscope.dailyAffirmation,
            generatedAt: new Date().toISOString(),
          };

          const response = NextResponse.json(
            {
              ...horoscopeData,
              cached: false,
            },
            {
              headers: getDailyCacheHeaders(),
            },
          );

          // Aggressive caching for demo mode
          const now = new Date();
          const midnight = new Date(
            Date.UTC(
              now.getUTCFullYear(),
              now.getUTCMonth(),
              now.getUTCDate() + 1,
              0,
              0,
              0,
              0,
            ),
          );
          const secondsUntilMidnight = Math.floor(
            (midnight.getTime() - now.getTime()) / 1000,
          );
          response.headers.set(
            'Cache-Control',
            `public, max-age=${secondsUntilMidnight}, s-maxage=${secondsUntilMidnight}`,
          );

          return response;
        }
        throw dbError;
      }
    } else {
      // Normal mode: use session
      const user = await requireUser(request);
      userId = user.id;
    }

    // Get today's date string
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // Check for cached horoscope first
    const cached = await getCachedHoroscope(userId, dateStr);
    const isCacheComplete =
      cached?.headline && cached?.overview && cached?.tinyAction;
    // Fetch profile to check birth chart version before serving from cache
    const profile = cached ? await getUserProfile(userId) : null;
    const currentChartVersion = profile?.birthChartVersion ?? null;
    const cacheIsStale =
      currentChartVersion !== null &&
      cached?.birthChartVersion !== undefined &&
      cached.birthChartVersion !== currentChartVersion;
    if (cached && isCacheComplete && !cacheIsStale) {
      const response = NextResponse.json(
        {
          ...cached,
          cached: true,
        },
        {
          headers: getDailyCacheHeaders(), // Resets at midnight London time
        },
      );

      // Aggressive caching for demo mode - cache until UTC midnight
      if (demoUserId) {
        const now = new Date();
        const midnight = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + 1,
            0,
            0,
            0,
            0,
          ),
        );
        const secondsUntilMidnight = Math.floor(
          (midnight.getTime() - now.getTime()) / 1000,
        );
        response.headers.set(
          'Cache-Control',
          `public, max-age=${secondsUntilMidnight}, s-maxage=${secondsUntilMidnight}`,
        );
      }

      return response;
    }

    // Fetch user profile from database (reuse if already fetched for version check)
    const freshProfile = profile ?? (await getUserProfile(userId));

    // Generate fresh horoscope
    const userBirthday = freshProfile.birthday;
    const userName = freshProfile.name;
    const birthChart = freshProfile.birthChart;
    const birthChartVersion =
      freshProfile.birthChartVersion ?? CURRENT_BIRTH_CHART_VERSION;

    const horoscope = getEnhancedPersonalizedHoroscope(
      userBirthday,
      userName,
      { birthday: userBirthday, birthChart },
      today,
    );

    const horoscopeData: CachedHoroscope = {
      userId,
      date: dateStr,
      sunSign: horoscope.sunSign,
      moonPhase: horoscope.moonPhase,
      headline: horoscope.headline,
      overview: horoscope.overview,
      focusAreas: horoscope.focusAreas,
      tinyAction: horoscope.tinyAction,
      dailyGuidance: horoscope.dailyGuidance,
      personalInsight: horoscope.personalInsight,
      luckyElements: horoscope.luckyElements,
      cosmicHighlight: horoscope.cosmicHighlight,
      dailyAffirmation: horoscope.dailyAffirmation,
      generatedAt: new Date().toISOString(),
      birthChartVersion,
    };

    // Save to cache (fire and forget)
    saveHoroscope(userId, dateStr, horoscopeData).catch((err) =>
      console.error('[Daily Horoscope] Background save failed:', err),
    );

    return NextResponse.json(
      {
        ...horoscopeData,
        cached: false,
      },
      {
        headers: getDailyCacheHeaders(), // Resets at midnight London time
      },
    );
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[Daily Horoscope] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get horoscope' },
      { status: 500 },
    );
  }
}

// Allow force refresh
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userId = user.id;

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // Fetch user profile from database
    const postProfile = await getUserProfile(userId);

    // Generate fresh horoscope (skip cache)
    const userBirthday = user.birthday || postProfile.birthday;
    const userName = user.displayName || postProfile.name;
    const birthChart = postProfile.birthChart;
    const birthChartVersion =
      postProfile.birthChartVersion ?? CURRENT_BIRTH_CHART_VERSION;

    const horoscope = getEnhancedPersonalizedHoroscope(
      userBirthday,
      userName,
      { birthday: userBirthday, birthChart },
      today,
    );

    const horoscopeData: CachedHoroscope = {
      userId,
      date: dateStr,
      sunSign: horoscope.sunSign,
      moonPhase: horoscope.moonPhase,
      headline: horoscope.headline,
      overview: horoscope.overview,
      focusAreas: horoscope.focusAreas,
      tinyAction: horoscope.tinyAction,
      dailyGuidance: horoscope.dailyGuidance,
      personalInsight: horoscope.personalInsight,
      luckyElements: horoscope.luckyElements,
      cosmicHighlight: horoscope.cosmicHighlight,
      dailyAffirmation: horoscope.dailyAffirmation,
      generatedAt: new Date().toISOString(),
      birthChartVersion,
    };

    // Save to cache
    await saveHoroscope(userId, dateStr, horoscopeData);

    return NextResponse.json({
      ...horoscopeData,
      cached: false,
      refreshed: true,
    });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[Daily Horoscope] Error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh horoscope' },
      { status: 500 },
    );
  }
}
