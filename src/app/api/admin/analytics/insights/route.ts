import { NextRequest, NextResponse } from 'next/server';
import { resolveDateRange, formatDate } from '@/lib/analytics/date-range';
import {
  generateInsights,
  detectTrackingIssues,
  type AnalyticsMetrics,
} from '@/lib/analytics/insights';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    // Use hardcoded env var for base URL (SSRF prevention - never use request headers)
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';

    // Format dates as YYYY-MM-DD for sub-route query params
    const startDate = formatDate(range.start);
    const endDate = formatDate(range.end);
    const dateParams = `start_date=${startDate}&end_date=${endDate}`;

    // Fetch all necessary metrics in parallel
    const [
      activityResponse,
      engagementResponse,
      featureAdoptionResponse,
      cohortRetentionResponse,
      growthResponse,
      revenueResponse,
    ] = await Promise.all([
      fetch(`${baseUrl}/api/admin/analytics/activity?${dateParams}`),
      fetch(`${baseUrl}/api/admin/analytics/engagement?${dateParams}`),
      fetch(`${baseUrl}/api/admin/analytics/feature-adoption?${dateParams}`),
      fetch(
        `${baseUrl}/api/admin/analytics/cohort-retention?start=${startDate}&end=${endDate}`,
      ),
      fetch(`${baseUrl}/api/admin/analytics/growth?${dateParams}`),
      fetch(`${baseUrl}/api/admin/analytics/revenue?${dateParams}`),
    ]);

    // Validate all responses are successful
    const responses = [
      { name: 'activity', response: activityResponse },
      { name: 'engagement', response: engagementResponse },
      { name: 'feature-adoption', response: featureAdoptionResponse },
      { name: 'cohort-retention', response: cohortRetentionResponse },
      { name: 'growth', response: growthResponse },
      { name: 'revenue', response: revenueResponse },
    ];

    for (const { name, response } of responses) {
      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Failed to fetch ${name} analytics: ${response.status} ${response.statusText}. Response: ${text.substring(0, 200)}`,
        );
      }
    }

    const [
      activity,
      engagement,
      featureAdoption,
      cohortRetention,
      growth,
      revenue,
    ] = await Promise.all([
      activityResponse.json(),
      engagementResponse.json(),
      featureAdoptionResponse.json(),
      cohortRetentionResponse.json(),
      growthResponse.json(),
      revenueResponse.json(),
    ]);

    // Transform feature adoption array to lookup map
    const featureAdoptionMap = new Map<string, number>();
    const featureMetricsForTracking: Record<
      string,
      { count: number; adoption: number }
    > = {};

    if (featureAdoption.features && Array.isArray(featureAdoption.features)) {
      for (const feature of featureAdoption.features) {
        const eventType = String(feature.event_type || '');
        const adoptionRate = Number(feature.adoption_rate || 0);
        const users = Number(feature.users || 0);

        featureAdoptionMap.set(eventType, adoptionRate);
        featureMetricsForTracking[eventType] = {
          count: users,
          adoption: adoptionRate,
        };
      }
    }

    // Helper to get adoption rate by event type
    const getAdoption = (eventType: string): number =>
      featureAdoptionMap.get(eventType) || 0;

    // Upstream APIs return percentages (0-100). generateInsights() expects
    // decimals (0-1) and multiplies by 100 for display. Normalize here.
    const pct = (v: number | undefined | null) =>
      Math.min((Number(v) || 0) / 100, 1);

    // Build metrics object for insights generation
    const metrics: AnalyticsMetrics = {
      // Core metrics (counts, not percentages — no conversion needed)
      productMAU: activity.signed_in_product_mau || 0,
      appMAU: activity.app_opened_mau || 0,
      productDAU: activity.signed_in_product_dau || 0,
      productWAU: activity.signed_in_product_wau || 0,

      // Growth
      productMAUGrowth: growth.product_mau_growth_rate || 0,
      signupCount: growth.new_signups || 0,
      activationRate: pct(growth.activation_rate),

      // Retention (APIs return 0-100)
      // If no cohorts are mature enough for D30 data, use -1 sentinel
      // so generateInsights() can distinguish "no data" from "0% retention"
      recentCohortRetention:
        cohortRetention.cohorts?.length > 0
          ? pct(cohortRetention.cohorts[0]?.day_30_retention)
          : -1,
      earlyCohortRetention:
        cohortRetention.cohorts?.length > 0
          ? pct(
              cohortRetention.cohorts[cohortRetention.cohorts.length - 1]
                ?.day_30_retention,
            )
          : -1,
      day30Retention:
        cohortRetention.cohorts?.length > 0
          ? pct(cohortRetention.overall_d30_retention)
          : -1,

      // Engagement (stickiness API returns 0-100)
      avgActiveDays: engagement.avg_active_days_per_week || 0,
      stickiness: pct(engagement.stickiness),
      d1Retention: pct(activity.d1_retention),

      // Feature adoption (API returns 0-100)
      dashboardAdoption: pct(getAdoption('daily_dashboard_viewed')),
      horoscopeAdoption: pct(getAdoption('personalized_horoscope_viewed')),
      tarotAdoption: pct(getAdoption('tarot_drawn')),
      guideAdoption: pct(getAdoption('astral_chat_used')),
      chartAdoption: pct(getAdoption('chart_viewed')),
      ritualAdoption: pct(getAdoption('ritual_started')),

      // Revenue (API returns 0-100)
      mrr: revenue.mrr || 0,
      conversionRate: pct(revenue.free_to_trial_rate),

      // Tracking quality
      trackingIssues: detectTrackingIssues(
        featureMetricsForTracking,
        activity.signed_in_product_mau || 0,
      ),
    };

    // Generate insights
    const insights = generateInsights(metrics);

    const response = NextResponse.json({
      insights,
      metrics,
      range,
    });
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}`,
    );
    return response;
  } catch (error) {
    console.error('[analytics/insights] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
