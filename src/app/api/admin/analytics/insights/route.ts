import { NextRequest, NextResponse } from 'next/server';
import { resolveDateRange } from '@/lib/analytics/date-range';
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

    // Fetch all necessary metrics in parallel
    const [
      activityResponse,
      engagementResponse,
      featureAdoptionResponse,
      cohortRetentionResponse,
      growthResponse,
      revenueResponse,
    ] = await Promise.all([
      fetch(
        `${request.nextUrl.origin}/api/admin/analytics/activity?start=${range.start}&end=${range.end}`,
      ),
      fetch(
        `${request.nextUrl.origin}/api/admin/analytics/engagement?start=${range.start}&end=${range.end}`,
      ),
      fetch(
        `${request.nextUrl.origin}/api/admin/analytics/feature-adoption?start=${range.start}&end=${range.end}`,
      ),
      fetch(
        `${request.nextUrl.origin}/api/admin/analytics/cohort-retention?start=${range.start}&end=${range.end}`,
      ),
      fetch(
        `${request.nextUrl.origin}/api/admin/analytics/growth?start=${range.start}&end=${range.end}`,
      ),
      fetch(
        `${request.nextUrl.origin}/api/admin/analytics/revenue?start=${range.start}&end=${range.end}`,
      ),
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

    // Build metrics object for insights generation
    const metrics: AnalyticsMetrics = {
      // Core metrics
      productMAU: activity.signed_in_product_mau || 0,
      appMAU: activity.app_opened_mau || 0,
      productDAU: activity.signed_in_product_dau || 0,
      productWAU: activity.signed_in_product_wau || 0,

      // Growth
      productMAUGrowth: growth.product_mau_growth_rate || 0,
      signupCount: growth.new_signups || 0,
      activationRate: growth.activation_rate || 0,

      // Retention
      recentCohortRetention:
        cohortRetention.cohorts?.[0]?.day_30_retention || 0,
      earlyCohortRetention:
        cohortRetention.cohorts?.[cohortRetention.cohorts.length - 1]
          ?.day_30_retention || 0,
      day30Retention: cohortRetention.overall_d30_retention || 0,

      // Engagement
      avgActiveDays: engagement.avg_active_days_per_week || 0,
      stickiness: engagement.stickiness || 0,

      // Feature adoption (Product MAU as denominator)
      dashboardAdoption: getAdoption('daily_dashboard_viewed'),
      horoscopeAdoption: getAdoption('personalized_horoscope_viewed'),
      tarotAdoption: getAdoption('tarot_drawn'),
      guideAdoption: getAdoption('astral_chat_used'),
      chartAdoption: getAdoption('chart_viewed'),
      ritualAdoption: getAdoption('ritual_started'),

      // Revenue
      mrr: revenue.mrr || 0,
      conversionRate: revenue.free_to_trial_rate || 0,

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
