import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';
import { sql } from '@vercel/postgres';

const COOKIES_KEY = 'substack_auth_cookies';

async function saveCookiesToDatabase(cookies: any[]): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`
    INSERT INTO app_config (key, value, updated_at)
    VALUES (${COOKIES_KEY}, ${JSON.stringify(cookies)}, NOW())
    ON CONFLICT (key) 
    DO UPDATE SET value = ${JSON.stringify(cookies)}, updated_at = NOW()
  `;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cookies } = await request.json();

    if (!cookies || !Array.isArray(cookies)) {
      return NextResponse.json(
        { error: 'Invalid cookies format. Expected array of cookies.' },
        { status: 400 },
      );
    }

    await saveCookiesToDatabase(cookies);

    return NextResponse.json({
      success: true,
      message: 'Cookies saved to database',
    });
  } catch (error) {
    console.error('Failed to save cookies:', error);
    return NextResponse.json(
      {
        error: 'Failed to save cookies',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT value, updated_at FROM app_config 
      WHERE key = ${COOKIES_KEY}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ exists: false, message: 'No cookies found' });
    }

    const cookies = JSON.parse(result.rows[0].value);
    return NextResponse.json({
      exists: true,
      cookieCount: Array.isArray(cookies) ? cookies.length : 0,
      updatedAt: result.rows[0].updated_at,
    });
  } catch (error) {
    console.error('Failed to check cookies:', error);
    return NextResponse.json(
      {
        error: 'Failed to check cookies',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
