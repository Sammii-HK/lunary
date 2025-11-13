import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, pagePath, metadata } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }

    await sql`
      INSERT INTO user_sessions (
        user_id,
        session_date,
        session_timestamp,
        page_path,
        metadata,
        created_at
      ) VALUES (
        ${userId},
        CURRENT_DATE,
        NOW(),
        ${pagePath || null},
        ${metadata ? JSON.stringify(metadata) : null},
        NOW()
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking session:', error);

    if (
      error instanceof Error &&
      error.message.includes('relation "user_sessions" does not exist')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'User sessions table not initialized',
          message:
            'Run the database setup script to create the user_sessions table',
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
