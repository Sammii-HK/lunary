import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import { generateBirthChart } from '../../../../utils/astrology/birthChart';

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

    // Generate birth chart if we have enough info
    let birthChart = null;
    if (birthday) {
      try {
        birthChart = await generateBirthChart(
          birthday,
          birthTime || undefined,
          birthLocation || undefined,
        );
      } catch (chartError) {
        console.error(
          '[Relationships] Error generating birth chart:',
          chartError,
        );
      }
    }

    const result = await sql`
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
