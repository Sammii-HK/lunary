import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getContextualHub } from '@/lib/grimoire/getContextualNudge';

const EVENT_TYPES = ['signup_completed', 'signup'] as const;

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizePath(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed, 'https://example.com');
    const normalized = (url.pathname || '/').replace(/\/+$/, '') || '/';
    return normalized;
  } catch {
    return trimmed.replace(/\/+$/, '') || '/';
  }
}

type SignupRecord = {
  user_id: string;
  metadata: Record<string, unknown> | null;
  page_path: string | null;
  created_at: Date | null;
};

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const totalSignupsResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM conversion_events
      WHERE event_type = ANY(${EVENT_TYPES})
    `;
    const totalSignups = Number(totalSignupsResult.rows[0]?.count ?? 0);

    const signupRowsResult = await sql<SignupRecord>`
      SELECT DISTINCT ON (ce.user_id)
        ce.user_id,
        ce.metadata,
        ce.page_path,
        ce.created_at
      FROM conversion_events ce
      WHERE ce.event_type = ANY(${EVENT_TYPES})
        AND NOT EXISTS (
          SELECT 1
          FROM user_profiles up
          WHERE up.user_id = ce.user_id
            AND (
              up.origin_hub IS NOT NULL
              OR up.origin_page IS NOT NULL
              OR up.origin_type IS NOT NULL
            )
        )
      ORDER BY ce.user_id, ce.created_at
    `;

    const rows = signupRowsResult.rows;
    let usersUpdated = 0;
    let usersMissingOriginPage = 0;
    let usersHubDerived = 0;

    for (const row of rows) {
      const metadata =
        row.metadata && typeof row.metadata === 'object' ? row.metadata : null;

      const originPage = normalizePath(metadata?.origin_page ?? null) ?? null;
      const originType = normalizeString(metadata?.origin_type ?? null);
      const metadataHub = normalizeString(metadata?.origin_hub ?? null);
      const derivedHub =
        !metadataHub && originPage
          ? getContextualHub(originPage, 'universal')
          : null;
      const originHub = metadataHub ?? derivedHub;

      if (!originPage) {
        usersMissingOriginPage += 1;
      }
      if (!metadataHub && derivedHub) {
        usersHubDerived += 1;
      }

      const signupAt = row.created_at ?? new Date();

      const result = await sql`
        INSERT INTO user_profiles (
          user_id,
          origin_hub,
          origin_page,
          origin_type,
          signup_at
        )
        VALUES (
          ${row.user_id},
          ${originHub},
          ${originPage},
          ${originType},
          ${signupAt}
        )
        ON CONFLICT (user_id) DO UPDATE
        SET
          origin_hub = COALESCE(user_profiles.origin_hub, EXCLUDED.origin_hub),
          origin_page = COALESCE(user_profiles.origin_page, EXCLUDED.origin_page),
          origin_type = COALESCE(user_profiles.origin_type, EXCLUDED.origin_type),
          signup_at = COALESCE(user_profiles.signup_at, EXCLUDED.signup_at)
        WHERE
          user_profiles.origin_hub IS NULL
          AND user_profiles.origin_page IS NULL
          AND user_profiles.origin_type IS NULL
        RETURNING user_id
      `;

      if (result.rows.length > 0) {
        usersUpdated += 1;
      }
    }

    const usersSkipped = totalSignups - rows.length;

    console.log(
      `[Backfill Origins] Processed ${rows.length} users (total signups ${totalSignups}).`,
      `[Backfill Origins] Updated ${usersUpdated} profiles.`,
      `[Backfill Origins] Missing origin_page: ${usersMissingOriginPage}.`,
      `[Backfill Origins] Hub derived: ${usersHubDerived}.`,
      `[Backfill Origins] Skipped ${usersSkipped} users with existing origin data.`,
    );

    return NextResponse.json({
      success: true,
      totalSignups,
      processed: rows.length,
      updated: usersUpdated,
      missingOriginPage: usersMissingOriginPage,
      hubDerived: usersHubDerived,
      skippedExistingOrigins: usersSkipped,
    });
  } catch (error: any) {
    console.error('[Backfill Origins] Failed', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}
