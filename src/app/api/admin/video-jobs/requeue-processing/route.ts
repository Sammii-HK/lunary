import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';

export const runtime = 'nodejs';

async function ensureVideoJobsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS video_jobs (
      id SERIAL PRIMARY KEY,
      script_id INTEGER NOT NULL,
      week_start DATE,
      date_key DATE,
      topic TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_video_jobs_script_id
    ON video_jobs(script_id)
  `;
}

export async function POST(request: Request) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    await ensureVideoJobsTable();

    const result = await sql`
      UPDATE video_jobs
      SET status = 'pending',
          attempts = 0,
          last_error = NULL,
          updated_at = NOW()
      WHERE status = 'processing'
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      requeued: result.rows.length,
    });
  } catch (error) {
    console.error('Failed to requeue processing video jobs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
