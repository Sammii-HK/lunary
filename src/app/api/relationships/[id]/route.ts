import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  generateBirthChart,
  parseLocationToCoordinates,
} from '../../../../../utils/astrology/birthChart';
import tzLookup from 'tz-lookup';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request);
    const { id } = await params;

    const result = await sql`
      SELECT id, name, relationship_type, birthday, birth_time, birth_location, birth_chart, notes, created_at
      FROM relationship_profiles
      WHERE id = ${id}::uuid AND user_id = ${user.id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      profile: result.rows[0],
    });
  } catch (error) {
    console.error('[Relationships] Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch relationship profile' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      relationshipType,
      birthday,
      birthTime,
      birthLocation,
      notes,
    } = body;

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

    const result = await sql`
      UPDATE relationship_profiles
      SET
        name = COALESCE(${name}, name),
        relationship_type = ${relationshipType || null},
        birthday = COALESCE(${birthday}, birthday),
        birth_time = ${birthTime || null},
        birth_location = ${birthLocation || null},
        birth_chart = ${birthChart ? JSON.stringify(birthChart) : null}::jsonb,
        notes = ${notes || null},
        updated_at = NOW()
      WHERE id = ${id}::uuid AND user_id = ${user.id}
      RETURNING id, name, relationship_type, birthday, birth_time, birth_location, notes, created_at
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      profile: result.rows[0],
    });
  } catch (error) {
    console.error('[Relationships] Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update relationship profile' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request);
    const { id } = await params;

    await sql`
      DELETE FROM relationship_profiles
      WHERE id = ${id}::uuid AND user_id = ${user.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Relationships] Error deleting profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete relationship profile' },
      { status: 500 },
    );
  }
}
