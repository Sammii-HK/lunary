import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  generateBirthChart,
  parseLocationToCoordinates,
} from '../../../../../utils/astrology/birthChart';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';
import { CURRENT_BIRTH_CHART_VERSION } from '../../../../../utils/astrology/chart-version';
import { ensureRelationshipChartFresh } from '../../../../../utils/astrology/regenerateRelationshipChart';
import tzLookup from 'tz-lookup';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request);
    const { id } = await params;

    // Try with birth_chart_version column; fall back without it if migration hasn't run
    let result;
    try {
      result = await sql`
        SELECT id, name, relationship_type, birthday, birth_time, birth_location, birth_chart, birth_chart_version, notes, created_at
        FROM relationship_profiles
        WHERE id = ${id}::uuid AND user_id = ${user.id}
      `;
    } catch {
      // birth_chart_version column may not exist yet — query without it
      result = await sql`
        SELECT id, name, relationship_type, birthday, birth_time, birth_location, birth_chart, notes, created_at
        FROM relationship_profiles
        WHERE id = ${id}::uuid AND user_id = ${user.id}
      `;
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = result.rows[0];

    // Regenerate chart if stale — ensureRelationshipChartFresh handles all errors gracefully
    try {
      const { chart } = await ensureRelationshipChartFresh({
        id: profile.id,
        birthday: profile.birthday,
        birth_time: profile.birth_time,
        birth_location: profile.birth_location,
        birth_chart: profile.birth_chart as BirthChartData[] | null,
        birth_chart_version: profile.birth_chart_version ?? undefined,
      });
      if (chart) {
        profile.birth_chart = chart;
      }
    } catch {
      // If regeneration fails entirely, serve existing chart
    }

    return NextResponse.json({
      profile,
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

    // Try with birth_chart_version; fall back without it if migration hasn't run
    let result;
    try {
      result = await sql`
        UPDATE relationship_profiles
        SET
          name = COALESCE(${name}, name),
          relationship_type = ${relationshipType || null},
          birthday = COALESCE(${birthday}, birthday),
          birth_time = ${birthTime || null},
          birth_location = ${birthLocation || null},
          birth_chart = COALESCE(${birthChart ? JSON.stringify(birthChart) : null}::jsonb, birth_chart),
          birth_chart_version = COALESCE(${birthChart ? CURRENT_BIRTH_CHART_VERSION : null}, birth_chart_version),
          notes = ${notes || null},
          updated_at = NOW()
        WHERE id = ${id}::uuid AND user_id = ${user.id}
        RETURNING id, name, relationship_type, birthday, birth_time, birth_location, notes, created_at
      `;
    } catch {
      // birth_chart_version column may not exist yet — update without it
      result = await sql`
        UPDATE relationship_profiles
        SET
          name = COALESCE(${name}, name),
          relationship_type = ${relationshipType || null},
          birthday = COALESCE(${birthday}, birthday),
          birth_time = ${birthTime || null},
          birth_location = ${birthLocation || null},
          birth_chart = COALESCE(${birthChart ? JSON.stringify(birthChart) : null}::jsonb, birth_chart),
          notes = ${notes || null},
          updated_at = NOW()
        WHERE id = ${id}::uuid AND user_id = ${user.id}
        RETURNING id, name, relationship_type, birthday, birth_time, birth_location, notes, created_at
      `;
    }

    // Invalidate stale synastry cache when chart is regenerated
    if (birthChart) {
      try {
        await sql`DELETE FROM synastry_reports WHERE relationship_profile_id = ${id}::uuid`;
      } catch (cacheError) {
        console.warn(
          '[Relationships] Failed to invalidate synastry cache:',
          cacheError,
        );
      }
    }

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
