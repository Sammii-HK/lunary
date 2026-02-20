import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    await sql`
      DELETE FROM content_rotation
      WHERE rotation_type = 'theme'
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS theme_publications (
        id SERIAL PRIMARY KEY,
        week_start DATE NOT NULL,
        theme_name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(week_start, theme_name)
      )
    `;

    await sql`DELETE FROM theme_publications`;

    return NextResponse.json({
      success: true,
      message: 'Theme rotation reset.',
    });
  } catch (error) {
    console.error('Failed to reset theme rotation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
