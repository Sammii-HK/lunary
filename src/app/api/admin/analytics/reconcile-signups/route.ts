import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp } from '@/lib/analytics/date-range';
import { requireAdminAuth } from '@/lib/admin-auth';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

const buildRangeClause = (
  startDate: Date | null,
  endDate: Date | null,
  startIndex: number,
) => {
  let clause = '';
  const params: string[] = [];

  if (startDate) {
    params.push(formatTimestamp(startDate));
    clause += ` AND u."createdAt" >= $${startIndex + params.length - 1}`;
  }

  if (endDate) {
    params.push(formatTimestamp(endDate));
    clause += ` AND u."createdAt" <= $${startIndex + params.length - 1}`;
  }

  return { clause, params };
};

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json().catch(() => ({}));
    const startDate = body?.start_date ? new Date(body.start_date) : null;
    const endDate = body?.end_date ? new Date(body.end_date) : null;
    const dryRun = Boolean(body?.dry_run);

    if (
      (startDate && Number.isNaN(startDate.getTime())) ||
      (endDate && Number.isNaN(endDate.getTime()))
    ) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 },
      );
    }

    const baseParams = [TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT];
    const { clause: rangeClause, params: rangeParams } = buildRangeClause(
      startDate,
      endDate,
      baseParams.length + 1,
    );

    const missingQuery = `
      SELECT COUNT(*) AS count
      FROM "user" u
      WHERE u."createdAt" IS NOT NULL
        AND (u.email IS NULL OR (u.email NOT LIKE $1 AND u.email != $2))
        ${rangeClause}
        AND NOT EXISTS (
          SELECT 1
          FROM conversion_events ce
          WHERE ce.event_type = 'signup'
            AND ce.user_id = u.id
        )
    `;
    const missingResult = await sql.query(missingQuery, [
      ...baseParams,
      ...rangeParams,
    ]);
    const missing = Number(missingResult.rows[0]?.count || 0);

    if (dryRun || missing === 0) {
      return NextResponse.json({
        success: true,
        dry_run: dryRun,
        missing,
        inserted: 0,
      });
    }

    const insertQuery = `
      INSERT INTO conversion_events (
        event_type,
        user_id,
        user_email,
        metadata,
        created_at
      )
      SELECT
        'signup',
        u.id,
        LOWER(u.email),
        jsonb_build_object('source', 'reconcile'),
        u."createdAt"
      FROM "user" u
      WHERE u."createdAt" IS NOT NULL
        AND (u.email IS NULL OR (u.email NOT LIKE $1 AND u.email != $2))
        ${rangeClause}
        AND NOT EXISTS (
          SELECT 1
          FROM conversion_events ce
          WHERE ce.event_type = 'signup'
            AND ce.user_id = u.id
        )
    `;
    const insertResult = await sql.query(insertQuery, [
      ...baseParams,
      ...rangeParams,
    ]);

    return NextResponse.json({
      success: true,
      dry_run: false,
      missing,
      inserted: insertResult.rowCount ?? 0,
    });
  } catch (error) {
    console.error(
      '[analytics/reconcile-signups] Failed to backfill signups',
      error,
    );
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
