import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';
import { queryPostHogAPI } from '@/lib/posthog-server';

export const dynamic = 'force-dynamic';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

type ImpressionSource = 'posthog' | 'neon_fallback' | 'none';

type ImpressionCounts = {
  location: string;
  cta_id: string;
  total_impressions: number;
  unique_viewers: number;
};

type PostHogQueryResponse = {
  results?: unknown[][];
  error?: string | null;
};

function metricKey(location: string, ctaId: string): string {
  return `${location}::${ctaId}`;
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

function formatHogQlDateTime(value: string): string {
  return value.slice(0, 19).replace('T', ' ');
}

function escapeHogQlString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function loadPostHogImpressions(
  startIso: string,
  endExclusiveIso: string,
): Promise<Map<string, ImpressionCounts> | null> {
  const start = escapeHogQlString(formatHogQlDateTime(startIso));
  const end = escapeHogQlString(formatHogQlDateTime(endExclusiveIso));

  const query = `
    SELECT
      coalesce(nullIf(properties.cta_location, ''), nullIf(properties.location, ''), 'unknown') AS location,
      coalesce(nullIf(properties.cta_id, ''), nullIf(properties.ctaId, ''), 'unknown') AS cta_id,
      count() AS total_impressions,
      count(DISTINCT coalesce(toString(person_id), distinct_id)) AS unique_viewers
    FROM events
    WHERE event = 'cta_impression'
      AND timestamp >= toDateTime('${start}')
      AND timestamp < toDateTime('${end}')
    GROUP BY location, cta_id
    ORDER BY total_impressions DESC
    LIMIT 500
  `;

  const result = await queryPostHogAPI<PostHogQueryResponse>('/query/', {
    method: 'POST',
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query,
      },
      name: 'lunary cta location impressions',
    }),
  });

  if (!result || result.error) {
    return null;
  }

  const counts = new Map<string, ImpressionCounts>();

  for (const row of result.results ?? []) {
    const location = stringValue(row[0]) ?? 'unknown';
    const ctaId = stringValue(row[1]) ?? 'unknown';
    counts.set(metricKey(location, ctaId), {
      location,
      cta_id: ctaId,
      total_impressions: Number(row[2] || 0),
      unique_viewers: Number(row[3] || 0),
    });
  }

  return counts;
}

async function loadNeonImpressions(
  startIso: string,
  endIso: string,
): Promise<Map<string, ImpressionCounts>> {
  const result = await sql.query(
    `
      SELECT
        COALESCE(metadata->>'cta_location', 'unknown') AS location,
        COALESCE(metadata->>'cta_id', 'unknown') AS cta_id,
        COUNT(*) AS total_impressions,
        COUNT(DISTINCT COALESCE(user_id::text, anonymous_id)) AS unique_viewers
      FROM conversion_events
      WHERE event_type = 'cta_impression'
        AND created_at >= $1
        AND created_at <= $2
        AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))
      GROUP BY location, cta_id
    `,
    [startIso, endIso, TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT],
  );

  const counts = new Map<string, ImpressionCounts>();

  for (const row of result.rows) {
    const location = String(row.location || 'unknown');
    const ctaId = String(row.cta_id || 'unknown');
    counts.set(metricKey(location, ctaId), {
      location,
      cta_id: ctaId,
      total_impressions: Number(row.total_impressions || 0),
      unique_viewers: Number(row.unique_viewers || 0),
    });
  }

  return counts;
}

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

    const startIso = formatTimestamp(range.start);
    const endIso = formatTimestamp(range.end);
    const endExclusiveIso = new Date(range.end.getTime() + 1).toISOString();

    let impressionSource: ImpressionSource = 'posthog';
    let impressionCounts = await loadPostHogImpressions(
      startIso,
      endExclusiveIso,
    );

    if (!impressionCounts || impressionCounts.size === 0) {
      impressionSource = 'neon_fallback';
      impressionCounts = await loadNeonImpressions(startIso, endIso);
    }

    if (impressionCounts.size === 0) {
      impressionSource = 'none';
    }

    // Query clicks/signups from Neon; high-volume impressions live in PostHog.
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
          clicks.location AS location,
          clicks.cta_id AS cta_id,
          COUNT(*) AS total_clicks,
          COUNT(DISTINCT COALESCE(clicks.user_id::text, clicks.anonymous_id)) AS unique_clickers,
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
        GROUP BY clicks.location, clicks.cta_id
        ORDER BY signups DESC, total_clicks DESC
      `,
      [
        startIso,
        endIso,
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
        hasIdentityLinks,
      ],
    );

    const seenLocationKeys = new Set<string>();
    const locations = results.rows.map((row) => {
      const totalClicks = Number(row.total_clicks || 0);
      const uniqueClickers = Number(row.unique_clickers || 0);
      const signups = Number(row.signups || 0);
      const location = String(row.location || 'unknown');
      const ctaId = String(row.cta_id || 'unknown');
      seenLocationKeys.add(metricKey(location, ctaId));
      const impressions = impressionCounts.get(metricKey(location, ctaId));
      const totalImpressions = impressions?.total_impressions ?? 0;
      const uniqueViewers = impressions?.unique_viewers ?? 0;

      const conversionRate =
        uniqueClickers > 0 ? (signups / uniqueClickers) * 100 : 0;
      const clickThroughRate =
        uniqueViewers > 0 ? (uniqueClickers / uniqueViewers) * 100 : 0;

      // Friendly label for location
      const locationLabel = formatLocationLabel(location);

      return {
        location,
        location_label: locationLabel,
        cta_id: ctaId,
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

    for (const [key, impressions] of impressionCounts.entries()) {
      if (seenLocationKeys.has(key)) continue;

      locations.push({
        location: impressions.location,
        location_label: formatLocationLabel(impressions.location),
        cta_id: impressions.cta_id,
        total_impressions: impressions.total_impressions,
        unique_viewers: impressions.unique_viewers,
        total_clicks: 0,
        unique_clickers: 0,
        signups_7d: 0,
        click_through_rate: 0,
        conversion_rate: 0,
      });
    }

    locations.sort(
      (a, b) =>
        b.signups_7d - a.signups_7d ||
        b.total_clicks - a.total_clicks ||
        b.total_impressions - a.total_impressions,
    );

    const response = NextResponse.json({
      locations,
      source: 'database',
      impression_source: impressionSource,
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
    seo_inline_mid_article: 'Inline (mid-article, scroll)',
    seo_contextual_nudge: 'Full CTA block (post-FAQs)',
    seo_sticky_bottom: 'Sticky bottom bar',
    unknown: 'Unknown',
  };
  return labels[location] || location.replace(/_/g, ' ');
}
