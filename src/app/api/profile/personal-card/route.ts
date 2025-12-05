import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT personal_card FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    if (result.rows.length === 0 || !result.rows[0].personal_card) {
      return NextResponse.json({ personalCard: null });
    }

    return NextResponse.json({
      personalCard: result.rows[0].personal_card,
    });
  } catch (error) {
    console.error('Error fetching personal card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personal card' },
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
    const { personalCard } = body;

    if (!personalCard || typeof personalCard !== 'object') {
      return NextResponse.json(
        { error: 'Invalid personal card data' },
        { status: 400 },
      );
    }

    await sql`
      INSERT INTO user_profiles (user_id, personal_card)
      VALUES (${user.id}, ${JSON.stringify(personalCard)}::jsonb)
      ON CONFLICT (user_id) DO UPDATE SET
        personal_card = EXCLUDED.personal_card,
        updated_at = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving personal card:', error);
    return NextResponse.json(
      { error: 'Failed to save personal card' },
      { status: 500 },
    );
  }
}
