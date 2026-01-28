import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { revalidateTag } from 'next/cache';
import { requireUser } from '@/lib/ai/auth';
import { decrypt } from '@/lib/encryption';
import { getEnhancedPersonalizedHoroscope } from '../../../../../utils/astrology/enhancedHoroscope';
import {
  getDailyCacheHeaders,
  getDailyRevalidateTime,
} from '@/lib/cache-utils';

export const runtime = 'nodejs';
export const revalidate = getDailyRevalidateTime(); // Resets at midnight London time

interface UserProfile {
  name?: string;
  birthday?: string;
  birthChart?: any;
}

async function getUserProfile(userId: string): Promise<UserProfile> {
  try {
    const result = await sql`
      SELECT name, birthday, birth_chart
      FROM user_profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return {};
    }

    const row = result.rows[0];
    return {
      name: row.name ? decrypt(row.name) : undefined,
      birthday: row.birthday ? decrypt(row.birthday) : undefined,
      birthChart: row.birth_chart || undefined,
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
    const user = await requireUser(request);
    const userId = user.id;

    // Get today's date string
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // Check for cached horoscope first
    const cached = await getCachedHoroscope(userId, dateStr);
    if (cached) {
      return NextResponse.json(
        {
          ...cached,
          cached: true,
        },
        {
          headers: getDailyCacheHeaders(), // Resets at midnight London time
        },
      );
    }

    // Fetch user profile from database
    const profile = await getUserProfile(userId);

    // Generate fresh horoscope
    const userBirthday = user.birthday || profile.birthday;
    const userName = user.displayName || profile.name;
    const birthChart = profile.birthChart;

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
    const profile = await getUserProfile(userId);

    // Generate fresh horoscope (skip cache)
    const userBirthday = user.birthday || profile.birthday;
    const userName = user.displayName || profile.name;
    const birthChart = profile.birthChart;

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
