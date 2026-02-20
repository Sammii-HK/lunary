import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import {
  formatDate,
  formatTimestamp,
  resolveDateRange,
} from '@/lib/analytics/date-range';
import { requireAdminAuth } from '@/lib/admin-auth';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const endDate = formatDate(range.end);
    const startDate = formatDate(range.start);

    const conversionsBySourceResult = await sql`
      SELECT
        metadata->>'utm_source' AS utm_source,
        metadata->>'utm_medium' AS utm_medium,
        metadata->>'utm_campaign' AS utm_campaign,
        COUNT(DISTINCT user_id) AS conversions,
        COUNT(DISTINCT CASE WHEN conversion_type = 'free_to_paid' THEN user_id END) AS free_to_paid,
        COUNT(DISTINCT CASE WHEN conversion_type = 'trial_to_paid' THEN user_id END) AS trial_to_paid
      FROM analytics_conversions
      WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(range.end)}
        AND metadata IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM conversion_events ce
          WHERE ce.user_id = analytics_conversions.user_id
            AND (ce.user_email LIKE ${TEST_EMAIL_PATTERN} OR ce.user_email = ${TEST_EMAIL_EXACT})
        )
      GROUP BY
        metadata->>'utm_source',
        metadata->>'utm_medium',
        metadata->>'utm_campaign'
      ORDER BY conversions DESC
    `;

    const signupsBySourceResult = await sql`
      SELECT
        metadata->>'utm_source' AS utm_source,
        metadata->>'utm_medium' AS utm_medium,
        metadata->>'utm_campaign' AS utm_campaign,
        COUNT(DISTINCT user_id) AS signups
      FROM conversion_events
      WHERE event_type = 'signup'
        AND created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(range.end)}
        AND metadata IS NOT NULL
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      GROUP BY
        metadata->>'utm_source',
        metadata->>'utm_medium',
        metadata->>'utm_campaign'
    `;

    const organicSignupsResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM conversion_events
      WHERE event_type = 'signup'
        AND created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(range.end)}
        AND (
          metadata IS NULL
          OR metadata->>'utm_source' IS NULL
          OR metadata->>'utm_source' = ''
        )
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
    `;

    const organicConversionsResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM analytics_conversions
      WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(range.end)}
        AND (
          metadata IS NULL
          OR metadata->>'utm_source' IS NULL
          OR metadata->>'utm_source' = ''
        )
        AND NOT EXISTS (
          SELECT 1 FROM conversion_events ce
          WHERE ce.user_id = analytics_conversions.user_id
            AND (ce.user_email LIKE ${TEST_EMAIL_PATTERN} OR ce.user_email = ${TEST_EMAIL_EXACT})
        )
    `;

    const conversionsBySource = conversionsBySourceResult.rows.map((row) => ({
      utm_source: row.utm_source || 'unknown',
      utm_medium: row.utm_medium || 'unknown',
      utm_campaign: row.utm_campaign || 'unknown',
      conversions: Number(row.conversions || 0),
      free_to_paid: Number(row.free_to_paid || 0),
      trial_to_paid: Number(row.trial_to_paid || 0),
    }));

    const signupsBySource = signupsBySourceResult.rows.map((row) => ({
      utm_source: row.utm_source || 'unknown',
      utm_medium: row.utm_medium || 'unknown',
      utm_campaign: row.utm_campaign || 'unknown',
      signups: Number(row.signups || 0),
    }));

    const organicSignups = Number(organicSignupsResult.rows[0]?.count || 0);
    const organicConversions = Number(
      organicConversionsResult.rows[0]?.count || 0,
    );

    const sourceMap = new Map<
      string,
      {
        signups: number;
        conversions: number;
        free_to_paid: number;
        trial_to_paid: number;
      }
    >();

    signupsBySource.forEach((item) => {
      const key = `${item.utm_source}|${item.utm_medium}|${item.utm_campaign}`;
      sourceMap.set(key, {
        signups: item.signups,
        conversions: 0,
        free_to_paid: 0,
        trial_to_paid: 0,
      });
    });

    conversionsBySource.forEach((item) => {
      const key = `${item.utm_source}|${item.utm_medium}|${item.utm_campaign}`;
      const existing = sourceMap.get(key);
      if (existing) {
        existing.conversions = item.conversions;
        existing.free_to_paid = item.free_to_paid;
        existing.trial_to_paid = item.trial_to_paid;
      } else {
        sourceMap.set(key, {
          signups: 0,
          conversions: item.conversions,
          free_to_paid: item.free_to_paid,
          trial_to_paid: item.trial_to_paid,
        });
      }
    });

    const sources = Array.from(sourceMap.entries()).map(([key, data]) => {
      const [utm_source, utm_medium, utm_campaign] = key.split('|');
      return {
        utm_source,
        utm_medium,
        utm_campaign,
        signups: data.signups,
        conversions: data.conversions,
        free_to_paid: data.free_to_paid,
        trial_to_paid: data.trial_to_paid,
        conversion_rate:
          data.signups > 0
            ? Number(((data.conversions / data.signups) * 100).toFixed(2))
            : 0,
        cac: 0,
        note: 'CAC requires ad spend data - set manually or integrate with ad platforms',
      };
    });

    sources.push({
      utm_source: 'organic',
      utm_medium: 'organic',
      utm_campaign: 'organic',
      signups: organicSignups,
      conversions: organicConversions,
      free_to_paid: 0,
      trial_to_paid: 0,
      conversion_rate:
        organicSignups > 0
          ? Number(((organicConversions / organicSignups) * 100).toFixed(2))
          : 0,
      cac: 0,
      note: 'Organic traffic has £0 CAC',
    });

    const totalSignups = sources.reduce((sum, s) => sum + s.signups, 0);
    const totalConversions = sources.reduce((sum, s) => sum + s.conversions, 0);
    const overallConversionRate =
      totalSignups > 0
        ? Number(((totalConversions / totalSignups) * 100).toFixed(2))
        : 0;

    return NextResponse.json({
      period: {
        start_date: startDate,
        end_date: endDate,
      },
      summary: {
        total_signups: totalSignups,
        total_conversions: totalConversions,
        overall_conversion_rate: overallConversionRate,
        organic_signups: organicSignups,
        organic_conversions: organicConversions,
        organic_cac: 0,
        note: 'Organic traffic has £0 CAC - this is what investors love!',
      },
      sources: sources.sort((a, b) => b.signups - a.signups),
    });
  } catch (error) {
    console.error('[analytics/cac] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
