import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/bip-metrics
 *
 * Accepts SEO and other metrics from external sources (daily metrics script,
 * Claude /seo skill) and stores them in bip_state for the BIP daily cron.
 *
 * Body: { impressions_per_day?: number, clicks_per_day?: number, avg_position?: number }
 * Auth: Bearer CRON_SECRET
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Ensure bip_state table exists
  await sql`
    CREATE TABLE IF NOT EXISTS bip_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  const updated: string[] = [];

  if (body.impressions_per_day != null) {
    const val = String(Math.round(Number(body.impressions_per_day)));
    await sql`
      INSERT INTO bip_state (key, value, updated_at) VALUES ('seo_impressions_per_day', ${val}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${val}, updated_at = NOW()
    `;
    updated.push(`seo_impressions_per_day=${val}`);
  }

  if (body.clicks_per_day != null) {
    const val = String(Math.round(Number(body.clicks_per_day)));
    await sql`
      INSERT INTO bip_state (key, value, updated_at) VALUES ('seo_clicks_per_day', ${val}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${val}, updated_at = NOW()
    `;
    updated.push(`seo_clicks_per_day=${val}`);
  }

  if (body.avg_position != null) {
    const val = String(Number(body.avg_position).toFixed(1));
    await sql`
      INSERT INTO bip_state (key, value, updated_at) VALUES ('seo_avg_position', ${val}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${val}, updated_at = NOW()
    `;
    updated.push(`seo_avg_position=${val}`);
  }

  if (updated.length === 0) {
    return NextResponse.json(
      { error: 'No valid metrics provided' },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true, updated });
}
