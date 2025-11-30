import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import {
  formatDate,
  formatTimestamp,
  resolveDateRange,
} from '@/lib/analytics/date-range';
import { getSearchConsoleData } from '@/lib/google/search-console';
import { getPostHogActiveUsers } from '@/lib/posthog-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const endDate = formatDate(range.end);
    const startDate = formatDate(range.start);

    // 1-3. DAU, WAU from PostHog
    const periodDays = Math.ceil(
      (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const prevRangeStart = new Date(range.start);
    prevRangeStart.setDate(prevRangeStart.getDate() - periodDays);
    const prevRangeEnd = new Date(range.end);
    prevRangeEnd.setDate(prevRangeEnd.getDate() - periodDays);

    let dau = 0;
    let weeklyReturning = 0;
    let dauTrend: 'up' | 'down' | 'stable' = 'stable';
    let dauChange = 0;
    let weeklyReturningTrend: 'up' | 'down' | 'stable' = 'stable';
    let weeklyReturningChange = 0;

    try {
      const posthogData = await getPostHogActiveUsers();
      if (posthogData) {
        dau = posthogData.dau;
        weeklyReturning = posthogData.wau;
        dauTrend = 'stable';
        weeklyReturningTrend = 'stable';
      }
    } catch (error) {
      console.warn('[success-metrics] PostHog API error:', error);
    }

    // 4. Conversion Rate - use MAU from PostHog as base
    let freeUsers = 0;
    try {
      const posthogData = await getPostHogActiveUsers();
      freeUsers = posthogData?.mau || 0;
    } catch {
      freeUsers = 0;
    }

    const conversionsResult = await sql`
      SELECT COUNT(*) AS total_conversions
      FROM analytics_conversions
      WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(range.end)}
    `;
    const totalConversions = Number(
      conversionsResult.rows[0]?.total_conversions || 0,
    );
    const conversionRate =
      freeUsers > 0 ? (totalConversions / freeUsers) * 100 : 0;

    // Previous period conversion rate for trend (use same base as current period)
    const prevFreeUsers = freeUsers;

    const prevConversionsResult = await sql`
      SELECT COUNT(*) AS total_conversions
      FROM analytics_conversions
      WHERE created_at BETWEEN ${formatTimestamp(prevRangeStart)} AND ${formatTimestamp(prevRangeEnd)}
    `;
    const prevTotalConversions = Number(
      prevConversionsResult.rows[0]?.total_conversions || 0,
    );
    const prevConversionRate =
      prevFreeUsers > 0 ? (prevTotalConversions / prevFreeUsers) * 100 : 0;
    const conversionTrend =
      conversionRate > prevConversionRate
        ? 'up'
        : conversionRate < prevConversionRate
          ? 'down'
          : 'stable';
    const conversionChange =
      prevConversionRate > 0
        ? ((conversionRate - prevConversionRate) / prevConversionRate) * 100
        : 0;

    // 5. Search Impressions & Clicks (Google Search Console API)
    let searchImpressions = 0;
    let searchClicks = 0;
    let searchCtr = 0;
    let searchTrend: 'up' | 'down' | 'stable' = 'stable';
    let searchChange = 0;

    try {
      const searchConsoleData = await getSearchConsoleData(startDate, endDate);
      searchImpressions = searchConsoleData.totalImpressions;
      searchClicks = searchConsoleData.totalClicks;
      searchCtr = searchConsoleData.averageCtr * 100; // Convert to percentage

      // Previous period for trend
      const prevSearchConsoleData = await getSearchConsoleData(
        formatDate(prevRangeStart),
        formatDate(prevRangeEnd),
      );
      const prevSearchImpressions = prevSearchConsoleData.totalImpressions;
      const prevSearchClicks = prevSearchConsoleData.totalClicks;

      searchTrend =
        searchClicks > prevSearchClicks
          ? 'up'
          : searchClicks < prevSearchClicks
            ? 'down'
            : 'stable';
      searchChange =
        prevSearchClicks > 0
          ? ((searchClicks - prevSearchClicks) / prevSearchClicks) * 100
          : 0;
    } catch (error) {
      // If Search Console API is not configured, use placeholder values
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        '[analytics/success-metrics] Search Console API error:',
        errorMessage,
        error instanceof Error ? error.stack : '',
      );

      // Set a note with the actual error for debugging
      searchImpressions = -1; // Use -1 to indicate error state
    }

    // 6. Monthly Recurring Revenue (MRR) and Active Subscriptions
    // MRR uses actual monthly_amount_due from Stripe (accounts for discounts/coupons)
    // Active subscriptions: status = 'active', 'trial', or 'past_due' (includes coupon/free subscriptions)
    const activeSubscriptionsResult = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status IN ('active', 'trial', 'past_due') AND plan_type != 'free') AS total_active,
        COUNT(*) FILTER (WHERE status IN ('active', 'trial', 'past_due') AND plan_type != 'free' AND is_paying = true) AS paying_count,
        COALESCE(SUM(monthly_amount_due), 0) AS total_mrr
      FROM subscriptions
      WHERE status IN ('active', 'trial', 'past_due')
        AND plan_type IN ('lunary_plus', 'lunary_plus_ai', 'lunary_plus_ai_annual')
    `;

    const totalActiveSubscriptions = Number(
      activeSubscriptionsResult.rows[0]?.total_active || 0,
    );
    const payingSubscriptions = Number(
      activeSubscriptionsResult.rows[0]?.paying_count || 0,
    );
    const mrr = Number(activeSubscriptionsResult.rows[0]?.total_mrr || 0);

    // Previous period MRR - use monthly_amount_due for subscriptions active at end of previous period
    // This is an approximation since we don't have historical snapshots of monthly_amount_due
    const prevActiveSubscriptionsResult = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status IN ('active', 'trial', 'past_due') AND plan_type != 'free') AS total_active,
        COALESCE(SUM(monthly_amount_due), 0) AS total_mrr
      FROM subscriptions
      WHERE status IN ('active', 'trial', 'past_due')
        AND plan_type IN ('lunary_plus', 'lunary_plus_ai', 'lunary_plus_ai_annual')
        AND (
          created_at <= ${formatTimestamp(prevRangeEnd)}
          OR updated_at <= ${formatTimestamp(prevRangeEnd)}
        )
        AND NOT EXISTS (
          SELECT 1 FROM conversion_events ce
          WHERE ce.user_id = subscriptions.user_id
            AND ce.event_type IN ('subscription_cancelled', 'subscription_ended')
            AND ce.created_at <= ${formatTimestamp(prevRangeEnd)}
            AND ce.created_at >= subscriptions.created_at
        )
    `;

    const prevActiveSubscriptions = Number(
      prevActiveSubscriptionsResult.rows[0]?.total_active || 0,
    );
    const prevMrr = Number(
      prevActiveSubscriptionsResult.rows[0]?.total_mrr || 0,
    );

    const mrrTrend = mrr > prevMrr ? 'up' : mrr < prevMrr ? 'down' : 'stable';
    const mrrChange =
      prevMrr > 0 ? ((mrr - prevMrr) / prevMrr) * 100 : mrr > 0 ? 100 : 0;

    // 6b. Annual Recurring Revenue (ARR) - MRR * 12
    const arr = mrr * 12;
    const prevArr = prevMrr * 12;
    const arrTrend = arr > prevArr ? 'up' : arr < prevArr ? 'down' : 'stable';
    const arrChange =
      prevArr > 0 ? ((arr - prevArr) / prevArr) * 100 : arr > 0 ? 100 : 0;

    // 6c. Active Subscriptions (all active subscriptions, including coupon/free ones)
    // This counts all users with active subscriptions regardless of whether they're paying
    const activeSubscriptions = totalActiveSubscriptions;
    const activeSubscriptionsTrend =
      activeSubscriptions > prevActiveSubscriptions
        ? 'up'
        : activeSubscriptions < prevActiveSubscriptions
          ? 'down'
          : 'stable';
    const activeSubscriptionsChange =
      prevActiveSubscriptions > 0
        ? ((activeSubscriptions - prevActiveSubscriptions) /
            prevActiveSubscriptions) *
          100
        : activeSubscriptions > 0
          ? 100
          : 0;

    // 6d. Trial Conversion Rate (trial_started → trial_converted)
    const trialStartedResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM conversion_events
      WHERE event_type = 'trial_started'
        AND created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(range.end)}
    `;
    const trialStarted = Number(trialStartedResult.rows[0]?.count || 0);

    const trialConvertedResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM conversion_events
      WHERE event_type IN ('trial_converted', 'subscription_started')
        AND created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(range.end)}
        AND EXISTS (
          SELECT 1 FROM conversion_events ce2
          WHERE ce2.user_id = conversion_events.user_id
            AND ce2.event_type = 'trial_started'
            AND ce2.created_at < conversion_events.created_at
            AND ce2.created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(range.end)}
        )
    `;
    const trialConverted = Number(trialConvertedResult.rows[0]?.count || 0);
    const trialConversionRate =
      trialStarted > 0 ? (trialConverted / trialStarted) * 100 : 0;

    // Previous period trial conversion rate
    const prevTrialStartedResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM conversion_events
      WHERE event_type = 'trial_started'
        AND created_at BETWEEN ${formatTimestamp(prevRangeStart)} AND ${formatTimestamp(prevRangeEnd)}
    `;
    const prevTrialStarted = Number(prevTrialStartedResult.rows[0]?.count || 0);

    const prevTrialConvertedResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM conversion_events
      WHERE event_type IN ('trial_converted', 'subscription_started')
        AND created_at BETWEEN ${formatTimestamp(prevRangeStart)} AND ${formatTimestamp(prevRangeEnd)}
        AND EXISTS (
          SELECT 1 FROM conversion_events ce2
          WHERE ce2.user_id = conversion_events.user_id
            AND ce2.event_type = 'trial_started'
            AND ce2.created_at < conversion_events.created_at
            AND ce2.created_at BETWEEN ${formatTimestamp(prevRangeStart)} AND ${formatTimestamp(prevRangeEnd)}
        )
    `;
    const prevTrialConverted = Number(
      prevTrialConvertedResult.rows[0]?.count || 0,
    );
    const prevTrialConversionRate =
      prevTrialStarted > 0 ? (prevTrialConverted / prevTrialStarted) * 100 : 0;

    const trialConversionTrend =
      trialConversionRate > prevTrialConversionRate
        ? 'up'
        : trialConversionRate < prevTrialConversionRate
          ? 'down'
          : 'stable';
    const trialConversionChange =
      prevTrialConversionRate > 0
        ? ((trialConversionRate - prevTrialConversionRate) /
            prevTrialConversionRate) *
          100
        : trialConversionRate > 0
          ? 100
          : 0;

    // 7. AI Chat Messages - count total messages from completed sessions
    // Use message_count from sessions that were completed in the date range
    const aiMessagesResult = await sql`
      SELECT
        COALESCE(SUM(message_count), 0) AS total_messages
      FROM analytics_ai_usage
      WHERE completed_at IS NOT NULL
        AND completed_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(range.end)}
        AND message_count > 0
    `;
    const aiMessages = Number(aiMessagesResult.rows[0]?.total_messages || 0);

    // Previous period for trend
    const prevAiMessagesResult = await sql`
      SELECT
        COALESCE(SUM(message_count), 0) AS total_messages
      FROM analytics_ai_usage
      WHERE completed_at IS NOT NULL
        AND completed_at BETWEEN ${formatTimestamp(prevRangeStart)} AND ${formatTimestamp(prevRangeEnd)}
        AND message_count > 0
    `;
    const prevAiMessages = Number(
      prevAiMessagesResult.rows[0]?.total_messages || 0,
    );
    const aiMessagesTrend =
      aiMessages > prevAiMessages
        ? 'up'
        : aiMessages < prevAiMessages
          ? 'down'
          : 'stable';
    const aiMessagesChange =
      prevAiMessages > 0
        ? ((aiMessages - prevAiMessages) / prevAiMessages) * 100
        : 0;

    // 8. Push Notification Subscribers (active subscriptions)
    // Count total active subscribers (current state)
    const substackSubscribersResult = await sql`
      SELECT COUNT(*) AS count
      FROM push_subscriptions
      WHERE is_active = true
    `;
    const substackSubscribers = Number(
      substackSubscribersResult.rows[0]?.count || 0,
    );

    // Previous period for trend - count subscribers that existed at end of previous period
    // This is a proxy: count subscribers created before prevRangeEnd (they likely existed then)
    const prevSubstackSubscribersResult = await sql`
      SELECT COUNT(*) AS count
      FROM push_subscriptions
      WHERE created_at <= ${formatTimestamp(prevRangeEnd)}
    `;
    const prevSubstackSubscribers = Number(
      prevSubstackSubscribersResult.rows[0]?.count || 0,
    );
    const substackTrend =
      substackSubscribers > prevSubstackSubscribers
        ? 'up'
        : substackSubscribers < prevSubstackSubscribers
          ? 'down'
          : 'stable';
    const substackChange =
      prevSubstackSubscribers > 0
        ? ((substackSubscribers - prevSubstackSubscribers) /
            prevSubstackSubscribers) *
          100
        : substackSubscribers > 0
          ? 100
          : 0;

    return NextResponse.json({
      daily_active_users: {
        value: dau,
        trend: dauTrend,
        change: Number(dauChange.toFixed(1)),
        target: null,
      },
      weekly_returning_users: {
        value: weeklyReturning,
        trend: weeklyReturningTrend,
        change: Number(weeklyReturningChange.toFixed(1)),
        target: null,
      },
      conversion_rate: {
        value: Number(conversionRate.toFixed(2)),
        trend: conversionTrend,
        change: Number(conversionChange.toFixed(1)),
        target: { min: 5, max: 10 },
      },
      search_impressions_clicks: {
        impressions: searchImpressions,
        clicks: searchClicks,
        ctr: Number(searchCtr.toFixed(2)),
        trend: searchTrend,
        change: Number(searchChange.toFixed(1)),
        note:
          searchImpressions === -1
            ? 'Google Search Console API error. Check server logs for details.'
            : searchImpressions === 0
              ? 'Google Search Console API not configured. See docs/GOOGLE_SEARCH_CONSOLE_SETUP.md'
              : undefined,
      },
      monthly_recurring_revenue: {
        value: Number(mrr.toFixed(2)),
        trend: mrrTrend,
        change: Number(mrrChange.toFixed(1)),
        target: null,
      },
      annual_recurring_revenue: {
        value: Number(arr.toFixed(2)),
        trend: arrTrend,
        change: Number(arrChange.toFixed(1)),
        target: null,
      },
      active_subscriptions: {
        value: activeSubscriptions,
        trend: activeSubscriptionsTrend,
        change: Number(activeSubscriptionsChange.toFixed(1)),
        target: null,
      },
      trial_conversion_rate: {
        value: Number(trialConversionRate.toFixed(2)),
        trend: trialConversionTrend,
        change: Number(trialConversionChange.toFixed(1)),
        target: { min: 20, max: 40 }, // Target: 20-40% trial conversion
      },
      ai_chat_messages: {
        value: aiMessages,
        trend: aiMessagesTrend,
        change: Number(aiMessagesChange.toFixed(1)),
        target: null,
      },
      substack_subscribers: {
        value: substackSubscribers,
        trend: substackTrend,
        change: Number(substackChange.toFixed(1)),
        target: null,
      },
    });
  } catch (error) {
    console.error('[analytics/success-metrics] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
