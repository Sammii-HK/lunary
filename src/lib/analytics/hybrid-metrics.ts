/**
 * Hybrid metrics query helper
 * Fetches from daily_metrics for historical data, live queries for today
 */

import { sql } from '@vercel/postgres';

export interface HybridMetricsOptions {
  startDate: Date;
  endDate: Date;
}

export interface DailyMetric {
  date: string;
  dau: number;
  wau: number;
  mau: number;
  signedInProductDau: number;
  signedInProductWau: number;
  signedInProductMau: number;
  appOpenedMau: number;
  newSignups: number;
  activatedUsers: number;
  activationRate: number;
  mrr: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  newConversions: number;
  stickiness: number;
  avgActiveDaysPerWeek: number;
  dashboardAdoption: number;
  horoscopeAdoption: number;
  tarotAdoption: number;
  chartAdoption: number;
  guideAdoption: number;
  ritualAdoption: number;
  isLive?: boolean;
}

/**
 * Get metrics for a date range using hybrid approach
 * - Historical: from daily_metrics table (fast)
 * - Today: returns null (caller should do live query)
 */
export async function getHybridMetrics(
  options: HybridMetricsOptions,
): Promise<DailyMetric[]> {
  const { startDate, endDate } = options;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // If entire range is historical, just query daily_metrics
  if (endDate < today) {
    const result = await sql.query(
      `SELECT
        metric_date as date,
        dau,
        wau,
        mau,
        signed_in_product_dau as "signedInProductDau",
        signed_in_product_wau as "signedInProductWau",
        signed_in_product_mau as "signedInProductMau",
        app_opened_mau as "appOpenedMau",
        new_signups as "newSignups",
        activated_users as "activatedUsers",
        activation_rate as "activationRate",
        mrr,
        active_subscriptions as "activeSubscriptions",
        trial_subscriptions as "trialSubscriptions",
        new_conversions as "newConversions",
        stickiness,
        avg_active_days_per_week as "avgActiveDaysPerWeek",
        dashboard_adoption as "dashboardAdoption",
        horoscope_adoption as "horoscopeAdoption",
        tarot_adoption as "tarotAdoption",
        chart_adoption as "chartAdoption",
        guide_adoption as "guideAdoption",
        ritual_adoption as "ritualAdoption"
      FROM daily_metrics
      WHERE metric_date >= $1 AND metric_date <= $2
      ORDER BY metric_date ASC`,
      [
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
      ],
    );

    return result.rows.map((row: any) => ({
      date: row.date,
      dau: Number(row.dau || 0),
      wau: Number(row.wau || 0),
      mau: Number(row.mau || 0),
      signedInProductDau: Number(row.signedInProductDau || 0),
      signedInProductWau: Number(row.signedInProductWau || 0),
      signedInProductMau: Number(row.signedInProductMau || 0),
      appOpenedMau: Number(row.appOpenedMau || 0),
      newSignups: Number(row.newSignups || 0),
      activatedUsers: Number(row.activatedUsers || 0),
      activationRate: Number(row.activationRate || 0),
      mrr: Number(row.mrr || 0),
      activeSubscriptions: Number(row.activeSubscriptions || 0),
      trialSubscriptions: Number(row.trialSubscriptions || 0),
      newConversions: Number(row.newConversions || 0),
      stickiness: Number(row.stickiness || 0),
      avgActiveDaysPerWeek: Number(row.avgActiveDaysPerWeek || 0),
      dashboardAdoption: Number(row.dashboardAdoption || 0),
      horoscopeAdoption: Number(row.horoscopeAdoption || 0),
      tarotAdoption: Number(row.tarotAdoption || 0),
      chartAdoption: Number(row.chartAdoption || 0),
      guideAdoption: Number(row.guideAdoption || 0),
      ritualAdoption: Number(row.ritualAdoption || 0),
      isLive: false,
    }));
  }

  // Range includes today - get historical from daily_metrics
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  if (startDate <= yesterday) {
    const result = await sql.query(
      `SELECT
        metric_date as date,
        dau, wau, mau,
        signed_in_product_dau as "signedInProductDau",
        signed_in_product_wau as "signedInProductWau",
        signed_in_product_mau as "signedInProductMau",
        app_opened_mau as "appOpenedMau",
        new_signups as "newSignups",
        activated_users as "activatedUsers",
        activation_rate as "activationRate",
        mrr,
        active_subscriptions as "activeSubscriptions",
        trial_subscriptions as "trialSubscriptions",
        new_conversions as "newConversions",
        stickiness,
        avg_active_days_per_week as "avgActiveDaysPerWeek",
        dashboard_adoption as "dashboardAdoption",
        horoscope_adoption as "horoscopeAdoption",
        tarot_adoption as "tarotAdoption",
        chart_adoption as "chartAdoption",
        guide_adoption as "guideAdoption",
        ritual_adoption as "ritualAdoption"
      FROM daily_metrics
      WHERE metric_date >= $1 AND metric_date <= $2
      ORDER BY metric_date ASC`,
      [
        startDate.toISOString().split('T')[0],
        yesterday.toISOString().split('T')[0],
      ],
    );

    return result.rows.map((row: any) => ({
      date: row.date,
      dau: Number(row.dau || 0),
      wau: Number(row.wau || 0),
      mau: Number(row.mau || 0),
      signedInProductDau: Number(row.signedInProductDau || 0),
      signedInProductWau: Number(row.signedInProductWau || 0),
      signedInProductMau: Number(row.signedInProductMau || 0),
      appOpenedMau: Number(row.appOpenedMau || 0),
      newSignups: Number(row.newSignups || 0),
      activatedUsers: Number(row.activatedUsers || 0),
      activationRate: Number(row.activationRate || 0),
      mrr: Number(row.mrr || 0),
      activeSubscriptions: Number(row.activeSubscriptions || 0),
      trialSubscriptions: Number(row.trialSubscriptions || 0),
      newConversions: Number(row.newConversions || 0),
      stickiness: Number(row.stickiness || 0),
      avgActiveDaysPerWeek: Number(row.avgActiveDaysPerWeek || 0),
      dashboardAdoption: Number(row.dashboardAdoption || 0),
      horoscopeAdoption: Number(row.horoscopeAdoption || 0),
      tarotAdoption: Number(row.tarotAdoption || 0),
      chartAdoption: Number(row.chartAdoption || 0),
      guideAdoption: Number(row.guideAdoption || 0),
      ritualAdoption: Number(row.ritualAdoption || 0),
      isLive: false,
    }));
  }

  // Only querying today - return empty (caller will do live query)
  return [];
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setUTCHours(0, 0, 0, 0);
  return checkDate.getTime() === today.getTime();
}

/**
 * Check if date range includes today
 */
export function includesToday(endDate: Date): boolean {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setUTCHours(0, 0, 0, 0);
  return end.getTime() >= today.getTime();
}
