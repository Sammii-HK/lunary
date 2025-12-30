import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const result = await sql`
      UPDATE social_quotes
      SET status = 'available',
          used_at = NULL
      WHERE status = 'used'
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      message: `Reset ${result.rows.length} quotes.`,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Failed to reset quotes:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
