import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const identityLinksExistsResult = await sql.query(
      `SELECT to_regclass('analytics_identity_links') IS NOT NULL AS exists`,
    );
    const hasIdentityLinks = Boolean(identityLinksExistsResult.rows[0]?.exists);

    const results = await sql.query(
      `
        WITH clicks AS (
          SELECT
            created_at,
            user_id,
            anonymous_id,
            COALESCE(metadata->>'hub', 'unknown') AS hub
          FROM conversion_events
          WHERE event_type = 'cta_clicked'
            AND created_at >= $1
            AND created_at <= $2
            AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))
        ),
        signups AS (
          SELECT
            created_at,
            user_id,
            anonymous_id
          FROM conversion_events
          WHERE event_type = 'signup_completed'
            AND created_at >= $1
            AND created_at <= $2
            AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))
        )
        SELECT
          clicks.hub AS hub,
          COUNT(*) AS total_clicks,
          COUNT(DISTINCT clicks.user_id) AS unique_clickers,
          COUNT(DISTINCT signup_match.user_id) AS signups
        FROM clicks
        LEFT JOIN LATERAL (
          SELECT s.user_id
          FROM signups s
          WHERE s.created_at >= clicks.created_at
            AND (
              s.user_id = clicks.user_id
              OR (
                $5::boolean = true
                AND clicks.anonymous_id IS NOT NULL
                AND EXISTS (
                  SELECT 1
                  FROM analytics_identity_links l
                  WHERE l.user_id = s.user_id
                    AND l.anonymous_id = clicks.anonymous_id
                )
              )
            )
          LIMIT 1
        ) signup_match ON true
        GROUP BY clicks.hub
        ORDER BY signups DESC, total_clicks DESC
      `,
      [
        formatTimestamp(range.start),
        formatTimestamp(range.end),
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
        hasIdentityLinks,
      ],
    );

    const hubs = results.rows.map((row) => {
      const totalClicks = Number(row.total_clicks || 0);
      const uniqueClickers = Number(row.unique_clickers || 0);
      const signups = Number(row.signups || 0);
      const conversionRate =
        uniqueClickers > 0 ? (signups / uniqueClickers) * 100 : 0;

      return {
        hub: String(row.hub || 'unknown'),
        total_clicks: totalClicks,
        unique_clickers: uniqueClickers,
        signups_7d: signups,
        conversion_rate: Number(conversionRate.toFixed(2)),
      };
    });

    const response = NextResponse.json({
      hubs,
      source: 'database',
    });
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}`,
    );
    return response;
  } catch (error) {
    console.error(
      '[analytics/cta-conversions] Failed to load CTA metrics',
      error,
    );
    return NextResponse.json(
      {
        hubs: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
