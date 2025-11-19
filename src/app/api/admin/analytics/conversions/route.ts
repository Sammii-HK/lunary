import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import {
  formatDate,
  formatTimestamp,
  resolveDateRange,
} from '@/lib/analytics/date-range';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);
    const conversionType = searchParams.get('conversion_type');

    const filterByType = conversionType && conversionType !== 'all';

    const conversionsSummary = filterByType
      ? await sql`
        SELECT
          COUNT(*) AS total_conversions,
          AVG(days_to_convert) AS avg_days_to_convert
        FROM analytics_conversions
        WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
          range.end,
        )}
          AND conversion_type = ${conversionType}
      `
      : await sql`
        SELECT
          COUNT(*) AS total_conversions,
          AVG(days_to_convert) AS avg_days_to_convert
        FROM analytics_conversions
        WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
          range.end,
        )}
      `;

    const totalConversions = Number(
      conversionsSummary.rows[0]?.total_conversions || 0,
    );
    const avgDaysToConvertRaw = Number(
      conversionsSummary.rows[0]?.avg_days_to_convert ?? 0,
    );
    const avgDaysToConvert = Number.isFinite(avgDaysToConvertRaw)
      ? Number(avgDaysToConvertRaw.toFixed(2))
      : 0;

    const trialConversionsResult = await sql`
      SELECT COUNT(*) AS count
      FROM analytics_conversions
      WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
        range.end,
      )}
        AND conversion_type = 'trial_to_paid'
    `;

    const triggerBreakdownResult = filterByType
      ? await sql`
        SELECT
          COALESCE(trigger_feature, 'unknown') AS feature,
          COUNT(*) AS count
        FROM analytics_conversions
        WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
          range.end,
        )}
          AND conversion_type = ${conversionType}
        GROUP BY COALESCE(trigger_feature, 'unknown')
        ORDER BY count DESC
      `
      : await sql`
        SELECT
          COALESCE(trigger_feature, 'unknown') AS feature,
          COUNT(*) AS count
        FROM analytics_conversions
        WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
          range.end,
        )}
        GROUP BY COALESCE(trigger_feature, 'unknown')
        ORDER BY count DESC
      `;

    const triggerBreakdown = triggerBreakdownResult.rows.map((row) => {
      const count = Number(row.count || 0);
      return {
        feature: row.feature as string,
        count,
        percentage:
          totalConversions > 0
            ? Number(((count / totalConversions) * 100).toFixed(2))
            : 0,
      };
    });

    // Count free users from analytics_user_activity
    const freeUsersResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM analytics_user_activity
      WHERE activity_type = 'session'
        AND activity_date BETWEEN ${formatDate(range.start)} AND ${formatDate(range.end)}
    `;

    const trialUsersResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM subscriptions
      WHERE status = 'trial'
        AND updated_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
          range.end,
        )}
    `;

    const paidUsersResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM subscriptions
      WHERE status = 'active'
        AND updated_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
          range.end,
        )}
    `;

    const freeUsers = Number(freeUsersResult.rows[0]?.count || 0);
    const trialUsers = Number(trialUsersResult.rows[0]?.count || 0);
    const paidUsers = Number(paidUsersResult.rows[0]?.count || 0);

    const trialConversions = Number(trialConversionsResult.rows[0]?.count || 0);

    const conversionRate =
      freeUsers > 0
        ? Number(((totalConversions / freeUsers) * 100).toFixed(2))
        : 0;

    const trialConversionRate =
      trialUsers > 0
        ? Number(((trialConversions / trialUsers) * 100).toFixed(2))
        : 0;

    const dropOffPoints = [
      {
        stage: 'free_to_trial',
        drop_off_rate:
          freeUsers > 0
            ? Number((((freeUsers - trialUsers) / freeUsers) * 100).toFixed(2))
            : 0,
      },
      {
        stage: 'trial_to_paid',
        drop_off_rate:
          trialUsers > 0
            ? Number((((trialUsers - paidUsers) / trialUsers) * 100).toFixed(2))
            : 0,
      },
    ];

    return NextResponse.json({
      total_conversions: totalConversions,
      conversion_rate: conversionRate,
      trial_conversion_rate: trialConversionRate,
      avg_days_to_convert: avgDaysToConvert,
      trigger_breakdown: triggerBreakdown,
      funnel: {
        free_users: freeUsers,
        trial_users: trialUsers,
        paid_users: paidUsers,
        drop_off_points: dropOffPoints,
      },
    });
  } catch (error) {
    console.error('[analytics/conversions] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
