import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Only allow in development/test environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 },
    );
  }

  try {
    const { testUser } = await request.json();

    if (testUser) {
      // Clean up test users (emails ending with @test.lunary.app)
      await sql`
        DELETE FROM users 
        WHERE email LIKE '%@test.lunary.app'
        OR email LIKE 'test-%@example.com'
      `;
    }

    return NextResponse.json({ success: true, message: 'Test data cleaned' });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      {
        error: 'Cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
