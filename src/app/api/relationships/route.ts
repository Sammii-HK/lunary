import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  generateBirthChart,
  parseLocationToCoordinates,
} from '../../../../utils/astrology/birthChart';
import { CURRENT_BIRTH_CHART_VERSION } from '../../../../utils/astrology/chart-version';
import tzLookup from 'tz-lookup';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    const result = await sql`
      SELECT id, name, relationship_type, birthday, birth_time, birth_location, notes, created_at
      FROM relationship_profiles
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      profiles: result.rows,
    });
  } catch (error: any) {
    if (error?.code === '42P01') {
      return NextResponse.json({ profiles: [] });
    }
    console.error('[Relationships] Error fetching profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch relationship profiles' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json();

    const {
      name,
      relationshipType,
      birthday,
      birthTime,
      birthLocation,
      notes,
    } = body;

    if (!name || !birthday) {
      return NextResponse.json(
        { error: 'Name and birthday are required' },
        { status: 400 },
      );
    }

    // Resolve timezone from birth location for accurate chart generation
    let birthChart = null;
    if (birthday) {
      try {
        let birthTimezone: string | undefined;
        if (birthLocation) {
          const coords = await parseLocationToCoordinates(birthLocation);
          if (coords) {
            try {
              birthTimezone = tzLookup(coords.latitude, coords.longitude);
            } catch {
              // tz-lookup failed, will proceed without timezone
            }
          }
        }
        birthChart = await generateBirthChart(
          birthday,
          birthTime || undefined,
          birthLocation || undefined,
          birthTimezone,
        );
      } catch (chartError) {
        console.error(
          '[Relationships] Error generating birth chart:',
          chartError,
        );
      }
    }

    // Try with birth_chart_version; fall back without it if migration hasn't run
    let result;
    try {
      result = await sql`
        INSERT INTO relationship_profiles (
          user_id, name, relationship_type, birthday, birth_time, birth_location, birth_chart, birth_chart_version, notes
        )
        VALUES (
          ${user.id},
          ${name},
          ${relationshipType || null},
          ${birthday},
          ${birthTime || null},
          ${birthLocation || null},
          ${birthChart ? JSON.stringify(birthChart) : null}::jsonb,
          ${birthChart ? CURRENT_BIRTH_CHART_VERSION : 0},
          ${notes || null}
        )
        RETURNING id, name, relationship_type, birthday, birth_time, birth_location, notes, created_at
      `;
    } catch {
      // birth_chart_version column may not exist yet — insert without it
      result = await sql`
        INSERT INTO relationship_profiles (
          user_id, name, relationship_type, birthday, birth_time, birth_location, birth_chart, notes
        )
        VALUES (
          ${user.id},
          ${name},
          ${relationshipType || null},
          ${birthday},
          ${birthTime || null},
          ${birthLocation || null},
          ${birthChart ? JSON.stringify(birthChart) : null}::jsonb,
          ${notes || null}
        )
        RETURNING id, name, relationship_type, birthday, birth_time, birth_location, notes, created_at
      `;
    }

    return NextResponse.json({
      profile: result.rows[0],
    });
  } catch (error) {
    console.error('[Relationships] Error creating profile:', error);
    return NextResponse.json(
      { error: 'Failed to create relationship profile' },
      { status: 500 },
    );
  }
}
