import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';
import { invalidateSnapshot } from '@/lib/cosmic-snapshot/cache';
import {
  generateBirthChart,
  parseLocationToCoordinates,
} from '../../../../../../utils/astrology/birthChart';
import { CURRENT_BIRTH_CHART_VERSION } from '../../../../../../utils/astrology/chart-version';
import { encryptLocation, decryptLocation } from '@/lib/location-encryption';
import { Observer } from 'astronomy-engine';
import tzLookup from 'tz-lookup';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { birthDate, birthTime, birthLocation, fallbackTimezone } = body;

    if (!birthDate || typeof birthDate !== 'string') {
      return NextResponse.json(
        { error: 'birthDate is required' },
        { status: 400 },
      );
    }

    // 1. Geocode location server-side (has LOCATIONIQ_API_KEY)
    let coords: { latitude: number; longitude: number } | null = null;
    if (birthLocation) {
      coords = await parseLocationToCoordinates(birthLocation);
    }

    // 2. Resolve timezone from coordinates; fall back to user's browser timezone
    let timezone: string | undefined;
    let timezoneSource: 'location' | 'fallback' = 'fallback';
    if (coords) {
      try {
        timezone = tzLookup(coords.latitude, coords.longitude);
        timezoneSource = 'location';
      } catch {
        timezone = fallbackTimezone;
      }
    } else {
      timezone = fallbackTimezone;
    }

    // 3. Create Observer from coordinates
    const observer = coords
      ? new Observer(coords.latitude, coords.longitude, 0)
      : undefined;

    // 4. Generate birth chart
    const birthChart = await generateBirthChart(
      birthDate,
      birthTime || undefined,
      birthLocation || undefined,
      timezone,
      observer,
    );

    // 5. Validate chart
    if (!birthChart || !Array.isArray(birthChart) || birthChart.length === 0) {
      return NextResponse.json(
        { error: 'Birth chart generation produced empty result' },
        { status: 500 },
      );
    }

    // 6. Save birth chart to DB
    await sql`
      INSERT INTO user_profiles (user_id, birth_chart)
      VALUES (${user.id}, ${JSON.stringify(birthChart)}::jsonb)
      ON CONFLICT (user_id) DO UPDATE SET
        birth_chart = EXCLUDED.birth_chart,
        updated_at = NOW()
    `;

    // 7. Update location metadata (birthTimezone, birthChartVersion)
    const existingResult = await sql`
      SELECT location FROM user_profiles WHERE user_id = ${user.id} LIMIT 1
    `;
    const existingLocation = existingResult.rows[0]?.location
      ? decryptLocation(existingResult.rows[0].location) || {}
      : {};

    const resolvedTimezone =
      timezoneSource === 'location' ? timezone : existingLocation.birthTimezone;

    const updatedLocation = {
      ...existingLocation,
      ...(birthTime ? { birthTime } : {}),
      ...(birthLocation ? { birthLocation } : {}),
      ...(resolvedTimezone ? { birthTimezone: resolvedTimezone } : {}),
      birthChartVersion: CURRENT_BIRTH_CHART_VERSION,
    };

    await sql`
      UPDATE user_profiles
      SET location = ${JSON.stringify(encryptLocation(updatedLocation))}::jsonb,
          updated_at = NOW()
      WHERE user_id = ${user.id}
    `;

    // 8. Cache invalidation (same as existing PUT route)
    const tablesToInvalidate = [
      'synastry_reports',
      'daily_horoscopes',
      'monthly_insights',
      'cosmic_snapshots',
      'cosmic_reports',
      'journal_patterns',
      'pattern_analysis',
      'year_analysis',
    ];

    for (const table of tablesToInvalidate) {
      try {
        await sql.query(`DELETE FROM ${table} WHERE user_id = $1`, [user.id]);
      } catch (tableError) {
        console.warn(`[BirthChart] Failed to invalidate ${table}:`, tableError);
      }
    }

    // Invalidate friend connection synastry caches
    try {
      await sql`
        UPDATE friend_connections
        SET synastry_score = NULL, synastry_data = NULL, last_synastry_calc = NULL
        WHERE user_id = ${user.id} OR friend_id = ${user.id}
      `;
    } catch (friendError) {
      console.warn(
        '[BirthChart] Failed to invalidate friend synastry:',
        friendError,
      );
    }

    // Invalidate Next.js server-side cache tags
    try {
      invalidateSnapshot(user.id);
    } catch (tagError) {
      console.warn(
        '[BirthChart] Failed to invalidate snapshot cache tags:',
        tagError,
      );
    }

    // Track explorer progress
    try {
      const { setExplorerProgress } = await import('@/lib/progress/server');
      await setExplorerProgress(user.id, 1);
    } catch (progressError) {
      console.warn('[BirthChart] Failed to track progress:', progressError);
    }

    return NextResponse.json({
      success: true,
      birthChart,
      timezone,
      timezoneSource,
    });
  } catch (error) {
    console.error('[BirthChart] Server-side generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate birth chart' },
      { status: 500 },
    );
  }
}
