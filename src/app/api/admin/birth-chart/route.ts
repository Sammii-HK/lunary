import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { decrypt } from '@/lib/encryption';
import { normalizeIsoDateOnly } from '@/lib/date-only';
import { decryptLocation, encryptLocation } from '@/lib/location-encryption';
import { invalidateSnapshot } from '@/lib/cosmic-snapshot/cache';
import {
  generateBirthChart,
  parseLocationToCoordinates,
} from '../../../../../utils/astrology/birthChart';
import { CURRENT_BIRTH_CHART_VERSION } from '../../../../../utils/astrology/chart-version';
import { Observer } from 'astronomy-engine';
import tzLookup from 'tz-lookup';

export const dynamic = 'force-dynamic';

async function isAdmin(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userEmail = session?.user?.email?.toLowerCase();
    if (!userEmail) return false;

    const adminEmails = (
      process.env.ADMIN_EMAILS ||
      process.env.ADMIN_EMAIL ||
      process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
      process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
      ''
    )
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    return adminEmails.includes(userEmail);
  } catch (error) {
    console.error('Admin auth check failed:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authorized = await isAdmin(request);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = request.nextUrl.searchParams.get('email')?.trim();
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 },
      );
    }

    // Look up user by email
    const userResult = await sql`
      SELECT id, name, email FROM "user"
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: `No user found with email: ${email}` },
        { status: 404 },
      );
    }

    const user = userResult.rows[0];

    // Get profile with birth chart and location
    const profileResult = await sql`
      SELECT birth_chart, birthday, location
      FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    if (profileResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User has no profile record' },
        { status: 404 },
      );
    }

    const profile = profileResult.rows[0];
    const locationData = profile.location
      ? decryptLocation(profile.location)
      : null;
    const decryptedBirthday = normalizeIsoDateOnly(
      profile.birthday ? decrypt(profile.birthday) : null,
    );

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      name: user.name,
      birthday: decryptedBirthday,
      birthTime: locationData?.birthTime ?? null,
      birthLocation: locationData?.birthLocation ?? null,
      birthTimezone: locationData?.birthTimezone ?? null,
      birthChart: profile.birth_chart,
      chartVersion: locationData?.birthChartVersion ?? null,
    });
  } catch (error) {
    console.error('[AdminBirthChart] GET failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorized = await isAdmin(request);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : null;
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Look up user
    const userResult = await sql`
      SELECT id, name, email FROM "user"
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: `No user found with email: ${email}` },
        { status: 404 },
      );
    }

    const user = userResult.rows[0];

    // Get current profile
    const profileResult = await sql`
      SELECT birth_chart, birthday, location
      FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    if (profileResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User has no profile record' },
        { status: 404 },
      );
    }

    const profile = profileResult.rows[0];
    const locationData = profile.location
      ? decryptLocation(profile.location)
      : null;

    const birthday = normalizeIsoDateOnly(
      profile.birthday ? decrypt(profile.birthday) : null,
    );
    const birthTime = locationData?.birthTime;
    const birthLocation = locationData?.birthLocation;

    if (!birthday) {
      return NextResponse.json(
        { error: 'User has no birthday set — cannot regenerate chart' },
        { status: 400 },
      );
    }

    const previousChart = profile.birth_chart;

    // Geocode location
    let coords: { latitude: number; longitude: number } | null = null;
    if (birthLocation) {
      coords = await parseLocationToCoordinates(birthLocation);
    }

    // Resolve timezone
    let timezone: string | undefined;
    if (coords) {
      try {
        timezone = tzLookup(coords.latitude, coords.longitude);
      } catch {
        timezone = locationData?.birthTimezone;
      }
    } else {
      timezone = locationData?.birthTimezone;
    }

    // Create Observer from coordinates
    const observer = coords
      ? new Observer(coords.latitude, coords.longitude, 0)
      : undefined;

    // Generate new birth chart
    const newChart = await generateBirthChart(
      birthday,
      birthTime || undefined,
      birthLocation || undefined,
      timezone,
      observer,
    );

    if (!newChart || !Array.isArray(newChart) || newChart.length === 0) {
      return NextResponse.json(
        { error: 'Birth chart generation produced empty result' },
        { status: 500 },
      );
    }

    // Save new chart
    await sql`
      UPDATE user_profiles
      SET birth_chart = ${JSON.stringify(newChart)}::jsonb,
          updated_at = NOW()
      WHERE user_id = ${user.id}
    `;

    // Update location metadata with new chart version
    const updatedLocation = {
      ...(locationData || {}),
      birthChartVersion: CURRENT_BIRTH_CHART_VERSION,
      ...(timezone ? { birthTimezone: timezone } : {}),
    };

    await sql`
      UPDATE user_profiles
      SET location = ${JSON.stringify(encryptLocation(updatedLocation))}::jsonb,
          updated_at = NOW()
      WHERE user_id = ${user.id}
    `;

    // Cache invalidation cascade (same as generate route)
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
        console.warn(
          `[AdminBirthChart] Failed to invalidate ${table}:`,
          tableError,
        );
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
        '[AdminBirthChart] Failed to invalidate friend synastry:',
        friendError,
      );
    }

    // Invalidate Next.js cache tags
    try {
      invalidateSnapshot(user.id);
    } catch (tagError) {
      console.warn(
        '[AdminBirthChart] Failed to invalidate snapshot cache:',
        tagError,
      );
    }

    return NextResponse.json({
      success: true,
      previousChart,
      newChart,
      timezone,
      chartVersion: CURRENT_BIRTH_CHART_VERSION,
    });
  } catch (error) {
    console.error('[AdminBirthChart] POST failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
