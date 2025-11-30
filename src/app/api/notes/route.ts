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
      SELECT * FROM user_notes
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      notes: result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        content: row.content,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO user_notes (user_id, title, content)
      VALUES (${user.id}, ${title}, ${content})
      RETURNING *
    `;

    const note = result.rows[0];
    return NextResponse.json({
      note: {
        id: note.id,
        userId: note.user_id,
        title: note.title,
        content: note.content,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
      },
    });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 },
    );
  }
}
