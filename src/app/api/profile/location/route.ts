import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';
import { decryptLocation, encryptLocation } from '@/lib/location-encryption';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT location FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    if (result.rows.length === 0 || !result.rows[0].location) {
      return NextResponse.json({ location: null });
    }

    return NextResponse.json({
      location: decryptLocation(result.rows[0].location),
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { location } = body;

    if (!location || typeof location !== 'object') {
      return NextResponse.json(
        { error: 'Invalid location data' },
        { status: 400 },
      );
    }

    const locationWithTimestamp = {
      ...location,
      lastUpdated: new Date().toISOString(),
    };
    const encryptedLocation = encryptLocation(locationWithTimestamp);

    await sql`
      INSERT INTO user_profiles (user_id, location)
      VALUES (${user.id}, ${JSON.stringify(encryptedLocation)}::jsonb)
      ON CONFLICT (user_id) DO UPDATE SET
        location = EXCLUDED.location,
        updated_at = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving location:', error);
    return NextResponse.json(
      { error: 'Failed to save location' },
      { status: 500 },
    );
  }
}
