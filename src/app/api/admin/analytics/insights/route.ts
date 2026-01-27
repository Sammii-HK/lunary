import { NextRequest, NextResponse } from 'next/server';
import { resolveDateRange } from '@/lib/analytics/date-range';
import {
  generateInsights,
  detectTrackingIssues,
  type AnalyticsMetrics,
} from '@/lib/analytics/insights';

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
      dashboardAdoption: featureAdoption.dashboard?.adoption || 0,
      horoscopeAdoption: featureAdoption.horoscope?.adoption || 0,
      tarotAdoption: featureAdoption.tarot?.adoption || 0,
      guideAdoption: featureAdoption.guide?.adoption || 0,
      chartAdoption: featureAdoption.chart?.adoption || 0,
      ritualAdoption: featureAdoption.ritual?.adoption || 0,

      // Revenue
      mrr: revenue.mrr || 0,
      conversionRate: revenue.free_to_trial_rate || 0,

      // Tracking quality
      trackingIssues: detectTrackingIssues(
        featureAdoption.features || {},
        activity.signed_in_product_mau || 0,
      ),
    };

    // Generate insights
    const insights = generateInsights(metrics);

    return NextResponse.json({
      insights,
      metrics,
      range,
    });
  } catch (error) {
    console.error('[analytics/insights] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
