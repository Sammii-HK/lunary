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

    // Query CTA metrics grouped by location (seo_inline_post_tldr vs seo_contextual_nudge)
    const results = await sql.query(
      `
        WITH clicks AS (
          SELECT
            created_at,
            user_id,
            anonymous_id,
            COALESCE(metadata->>'cta_location', 'unknown') AS location,
            COALESCE(metadata->>'cta_id', 'unknown') AS cta_id
          FROM conversion_events
          WHERE event_type = 'cta_clicked'
            AND created_at >= $1
            AND created_at <= $2
            AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))
        ),
        impressions AS (
          SELECT
            created_at,
            user_id,
            anonymous_id,
            COALESCE(metadata->>'cta_location', 'unknown') AS location,
            COALESCE(metadata->>'cta_id', 'unknown') AS cta_id
          FROM conversion_events
          WHERE event_type = 'cta_impression'
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
        ),
        impression_counts AS (
          SELECT
            location,
            cta_id,
            COUNT(*) AS total_impressions,
            COUNT(DISTINCT COALESCE(user_id::text, anonymous_id)) AS unique_viewers
          FROM impressions
          GROUP BY location, cta_id
        )
        SELECT
          clicks.location AS location,
          clicks.cta_id AS cta_id,
          COUNT(*) AS total_clicks,
          COUNT(DISTINCT COALESCE(clicks.user_id::text, clicks.anonymous_id)) AS unique_clickers,
          COUNT(DISTINCT signup_match.user_id) AS signups,
          COALESCE(ic.total_impressions, 0) AS total_impressions,
          COALESCE(ic.unique_viewers, 0) AS unique_viewers
        FROM clicks
        LEFT JOIN impression_counts ic ON ic.location = clicks.location AND ic.cta_id = clicks.cta_id
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
        GROUP BY clicks.location, clicks.cta_id, ic.total_impressions, ic.unique_viewers
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

    const locations = results.rows.map((row) => {
      const totalClicks = Number(row.total_clicks || 0);
      const uniqueClickers = Number(row.unique_clickers || 0);
      const signups = Number(row.signups || 0);
      const totalImpressions = Number(row.total_impressions || 0);
      const uniqueViewers = Number(row.unique_viewers || 0);

      const conversionRate =
        uniqueClickers > 0 ? (signups / uniqueClickers) * 100 : 0;
      const clickThroughRate =
        uniqueViewers > 0 ? (uniqueClickers / uniqueViewers) * 100 : 0;

      // Friendly label for location
      const locationLabel = formatLocationLabel(
        String(row.location || 'unknown'),
      );

      return {
        location: String(row.location || 'unknown'),
        location_label: locationLabel,
        cta_id: String(row.cta_id || 'unknown'),
        total_impressions: totalImpressions,
        unique_viewers: uniqueViewers,
        total_clicks: totalClicks,
        unique_clickers: uniqueClickers,
        signups_7d: signups,
        click_through_rate:
          totalImpressions > 0 ? Number(clickThroughRate.toFixed(2)) : null,
        conversion_rate: Number(conversionRate.toFixed(2)),
      };
    });

    const response = NextResponse.json({
      locations,
      source: 'database',
    });
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}`,
    );
    return response;
  } catch (error) {
    console.error(
      '[analytics/cta-locations] Failed to load CTA location metrics',
      error,
    );
    return NextResponse.json(
      {
        locations: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

function formatLocationLabel(location: string): string {
  const labels: Record<string, string> = {
    seo_inline_post_tldr: 'Inline (after TL;DR)',
    seo_contextual_nudge: 'Full CTA (bottom)',
    unknown: 'Unknown',
  };
  return labels[location] || location.replace(/_/g, ' ');
}
