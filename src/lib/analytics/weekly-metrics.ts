import { sql } from '@vercel/postgres';
import { formatTimestamp } from '@/lib/analytics/date-range';
import { getPostHogServer, queryPostHogAPI } from '@/lib/posthog-server';
import {
  startOfWeek,
  endOfWeek,
  format,
  getISOWeek,
  getISOWeekYear,
} from 'date-fns';

const TIMEZONE = 'Europe/London';

/**
 * Helper to build IN clause for arrays in @vercel/postgres
 * Since template literals don't support arrays, we use unnest with array literal
 */
function buildArrayInClause(column: string, values: string[]): string {
  if (values.length === 0) return 'FALSE';
  const arrayLiteral = `{${values.map((v) => `"${v.replace(/"/g, '\\"')}"`).join(',')}}`;
  return `${column} = ANY(SELECT unnest(${arrayLiteral}::text[]))`;
}

/**
 * Convert a date to a specific timezone (returns date string in that timezone)
 */
function toTimezone(date: Date, timezone: string): Date {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find((p) => p.type === 'year')!.value);
  const month = parseInt(parts.find((p) => p.type === 'month')!.value) - 1;
  const day = parseInt(parts.find((p) => p.type === 'day')!.value);
  const hour = parseInt(parts.find((p) => p.type === 'hour')!.value);
  const minute = parseInt(parts.find((p) => p.type === 'minute')!.value);
  const second = parseInt(parts.find((p) => p.type === 'second')!.value);

  return new Date(Date.UTC(year, month, day, hour, minute, second));
}

/**
 * Get week boundaries for a given date in Europe/London timezone
 * Week starts Monday 00:00:00 and ends Sunday 23:59:59
 */
export function getWeekBoundaries(date: Date): {
  weekStart: Date;
  weekEnd: Date;
} {
  // Convert to London timezone
  const londonDate = toTimezone(date, TIMEZONE);

  // Get Monday 00:00:00 of the week
  const weekStartLondon = startOfWeek(londonDate, { weekStartsOn: 1 });
  weekStartLondon.setUTCHours(0, 0, 0, 0);

  // Get Sunday 23:59:59.999 of the week
  const weekEndLondon = endOfWeek(londonDate, { weekStartsOn: 1 });
  weekEndLondon.setUTCHours(23, 59, 59, 999);

  return { weekStart: weekStartLondon, weekEnd: weekEndLondon };
}

/**
 * Get ISO week string (e.g., "2025-W51")
 */
export function getISOWeekString(date: Date): string {
  const londonDate = toTimezone(date, TIMEZONE);
  const year = getISOWeekYear(londonDate);
  const week = getISOWeek(londonDate);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * Format date as YYYY-MM-DD in London timezone
 */
export function formatDateLondon(date: Date): string {
  const londonDate = toTimezone(date, TIMEZONE);
  return format(londonDate, 'yyyy-MM-dd');
}

export interface WeeklyMetrics {
  // Week info
  weekStart: Date;
  weekEnd: Date;
  isoWeek: string;
  weekStartDate: string; // YYYY-MM-DD
  weekEndDate: string; // YYYY-MM-DD

  // Acquisition
  newUsers: number;
  newTrials: number;
  newPayingSubscribers: number;

  // Activation
  activatedUsers: number;
  activationRate: number;

  // Engagement
  wau: number;
  avgSessionsPerActiveUser: number;
  avgEventsPerActiveUser: number;
  topFeaturesByUsers: Array<{ feature: string; distinctUsers: number }>;

  // Retention
  w1Retention: number | null;
  w4Retention: number | null;

  // Revenue
  grossRevenueWeek: number;
  netRevenueWeek: number | null;
  mrrEndOfWeek: number;
  arrRunRateEndOfWeek: number;
  arpuWeek: number;

  // Subscriptions
  activeSubscribersEndOfWeek: number;
  activeSubscribersStartOfWeek: number;
  churnedSubscribersWeek: number;
  churnRateWeek: number;
  trialToPaidConversionRateWeek: number;

  // Quality
  dataCompletenessScore: number;
  notes: string;
}

export interface FunnelMetrics {
  weekStartDate: string;
  visitOrAppOpen: number;
  signup: number;
  activation: number;
  paywallView: number;
  trialStart: number;
  subscriptionStart: number;
  conversionVisitToSignup: number;
  conversionSignupToActivation: number;
  conversionActivationToTrial: number;
  conversionTrialToPaid: number;
}

export interface FeatureUsageWeekly {
  weekStartDate: string;
  featureName: string;
  distinctUsers: number;
  totalEvents: number;
}

/**
 * Calculate weekly metrics for a given week
 */
export async function calculateWeeklyMetrics(
  weekStart: Date,
  weekEnd: Date,
): Promise<WeeklyMetrics> {
  const weekStartFormatted = formatTimestamp(weekStart);
  const weekEndFormatted = formatTimestamp(weekEnd);
  const weekStartDate = formatDateLondon(weekStart);
  const weekEndDate = formatDateLondon(weekEnd);
  const isoWeek = getISOWeekString(weekStart);

  // Calculate all metrics in parallel
  const [
    acquisition,
    activation,
    engagement,
    retention,
    revenue,
    subscriptions,
    featureUsage,
  ] = await Promise.all([
    calculateAcquisition(weekStartFormatted, weekEndFormatted),
    calculateActivation(weekStartFormatted, weekEndFormatted),
    calculateEngagement(weekStartFormatted, weekEndFormatted),
    calculateRetention(weekStart, weekEnd),
    calculateRevenue(weekStartFormatted, weekEndFormatted, weekEnd),
    calculateSubscriptions(
      weekStartFormatted,
      weekEndFormatted,
      weekStart,
      weekEnd,
    ),
    calculateFeatureUsage(weekStartFormatted, weekEndFormatted),
  ]);

  // Calculate data completeness score
  const dataCompletenessScore = calculateDataCompleteness({
    acquisition,
    activation,
    engagement,
    retention,
    revenue,
    subscriptions,
  });

  // Calculate ARPU
  const arpuWeek =
    engagement.wau > 0 ? revenue.grossRevenueWeek / engagement.wau : 0;

  return {
    weekStart,
    weekEnd,
    isoWeek,
    weekStartDate,
    weekEndDate,
    newUsers: acquisition.newUsers,
    newTrials: acquisition.newTrials,
    newPayingSubscribers: acquisition.newPayingSubscribers,
    activatedUsers: activation.activatedUsers,
    activationRate: activation.activationRate,
    wau: engagement.wau,
    avgSessionsPerActiveUser: engagement.avgSessionsPerActiveUser,
    avgEventsPerActiveUser: engagement.avgEventsPerActiveUser,
    topFeaturesByUsers: featureUsage.topFeatures,
    w1Retention: retention.w1Retention,
    w4Retention: retention.w4Retention,
    grossRevenueWeek: revenue.grossRevenueWeek,
    netRevenueWeek: revenue.netRevenueWeek,
    mrrEndOfWeek: revenue.mrrEndOfWeek,
    arrRunRateEndOfWeek: revenue.mrrEndOfWeek * 12,
    arpuWeek,
    activeSubscribersEndOfWeek: subscriptions.activeSubscribersEndOfWeek,
    activeSubscribersStartOfWeek: subscriptions.activeSubscribersStartOfWeek,
    churnedSubscribersWeek: subscriptions.churnedSubscribersWeek,
    churnRateWeek: subscriptions.churnRateWeek,
    trialToPaidConversionRateWeek: subscriptions.trialToPaidConversionRateWeek,
    dataCompletenessScore,
    notes: '',
  };
}

/**
 * Calculate acquisition metrics
 */
async function calculateAcquisition(
  weekStart: string,
  weekEnd: string,
): Promise<{
  newUsers: number;
  newTrials: number;
  newPayingSubscribers: number;
}> {
  const [newUsersResult, newTrialsResult, newPayingResult] = await Promise.all([
    sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type = 'signup'
        AND created_at >= ${weekStart}
        AND created_at <= ${weekEnd}
    `,
    sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type = 'trial_started'
        AND created_at >= ${weekStart}
        AND created_at <= ${weekEnd}
    `,
    sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type IN ('trial_converted', 'subscription_started')
        AND created_at >= ${weekStart}
        AND created_at <= ${weekEnd}
    `,
  ]);

  return {
    newUsers: parseInt(newUsersResult.rows[0]?.count || '0'),
    newTrials: parseInt(newTrialsResult.rows[0]?.count || '0'),
    newPayingSubscribers: parseInt(newPayingResult.rows[0]?.count || '0'),
  };
}

/**
 * Calculate activation metrics
 * User is "activated" if they complete any activation event within 24h of signup
 */
async function calculateActivation(
  weekStart: string,
  weekEnd: string,
): Promise<{
  activatedUsers: number;
  activationRate: number;
}> {
  // Get new users this week
  const newUsersResult = await sql`
    SELECT DISTINCT user_id, created_at as signup_at
    FROM conversion_events
    WHERE event_type = 'signup'
      AND created_at >= ${weekStart}
      AND created_at <= ${weekEnd}
  `;

  const newUsers = newUsersResult.rows || [];
  if (newUsers.length === 0) {
    return { activatedUsers: 0, activationRate: 0 };
  }

  // Check which users activated within 24h
  // Activation events: user completes a meaningful action within 24h of signup
  const activationEvents = [
    'tarot_viewed',
    'personalized_tarot_viewed',
    'birth_chart_viewed',
    'horoscope_viewed',
    'personalized_horoscope_viewed',
    'cosmic_pulse_opened',
  ];
  let activatedCount = 0;

  for (const user of newUsers) {
    const signupAt = new Date(user.signup_at);
    const activationDeadline = new Date(
      signupAt.getTime() + 24 * 60 * 60 * 1000,
    );

    // Build OR conditions for activation events
    const eventConditions = activationEvents
      .map((e, i) =>
        i === 0 ? `event_type = $${i + 2}` : ` OR event_type = $${i + 2}`,
      )
      .join('');

    const activated = await sql.query(
      `SELECT COUNT(*) as count
       FROM conversion_events
       WHERE user_id = $1
         AND (${eventConditions})
         AND created_at >= $${activationEvents.length + 2}
         AND created_at <= $${activationEvents.length + 3}`,
      [
        user.user_id,
        ...activationEvents,
        formatTimestamp(signupAt),
        formatTimestamp(activationDeadline),
      ],
    );

    if (parseInt(activated.rows[0]?.count || '0') > 0) {
      activatedCount++;
    }
  }

  const activationRate =
    newUsers.length > 0 ? (activatedCount / newUsers.length) * 100 : 0;

  return {
    activatedUsers: activatedCount,
    activationRate,
  };
}

/**
 * Calculate engagement metrics (WAU, sessions, events)
 */
async function calculateEngagement(
  weekStart: string,
  weekEnd: string,
): Promise<{
  wau: number;
  avgSessionsPerActiveUser: number;
  avgEventsPerActiveUser: number;
}> {
  // Meaningful events for WAU (using actual event types from conversion_events)
  const meaningfulEvents = [
    'tarot_viewed',
    'personalized_tarot_viewed',
    'birth_chart_viewed',
    'horoscope_viewed',
    'personalized_horoscope_viewed',
    'cosmic_pulse_opened',
    'moon_circle_opened',
    'weekly_report_opened',
    'pricing_page_viewed',
    'trial_started',
    'trial_converted',
    'subscription_started',
  ];

  // Get WAU from PostHog
  const posthog = getPostHogServer();
  let wau = 0;
  let totalSessions = 0;
  let totalEvents = 0;

  if (posthog) {
    try {
      // Query PostHog for WAU
      const wauResult = await queryPostHogAPI<{
        results: Array<Array<number>>;
      }>('/query/', {
        method: 'POST',
        body: JSON.stringify({
          query: {
            kind: 'HogQLQuery',
            query: `SELECT count(DISTINCT person_id) FROM events WHERE event IN (${meaningfulEvents.map((e) => `'${e}'`).join(', ')}) AND timestamp >= '${weekStart}' AND timestamp <= '${weekEnd}'`,
          },
        }),
      });

      wau = wauResult?.results?.[0]?.[0] || 0;

      // Get total sessions
      const sessionsResult = await queryPostHogAPI<{
        results: Array<Array<number>>;
      }>('/query/', {
        method: 'POST',
        body: JSON.stringify({
          query: {
            kind: 'HogQLQuery',
            query: `SELECT count(DISTINCT session_id) FROM events WHERE event IN (${meaningfulEvents.map((e) => `'${e}'`).join(', ')}) AND timestamp >= '${weekStart}' AND timestamp <= '${weekEnd}'`,
          },
        }),
      });

      totalSessions = sessionsResult?.results?.[0]?.[0] || 0;

      // Get total events
      const eventsResult = await queryPostHogAPI<{
        results: Array<Array<number>>;
      }>('/query/', {
        method: 'POST',
        body: JSON.stringify({
          query: {
            kind: 'HogQLQuery',
            query: `SELECT count(*) FROM events WHERE event IN (${meaningfulEvents.map((e) => `'${e}'`).join(', ')}) AND timestamp >= '${weekStart}' AND timestamp <= '${weekEnd}'`,
          },
        }),
      });

      totalEvents = eventsResult?.results?.[0]?.[0] || 0;
    } catch (error) {
      console.error('[Weekly Metrics] PostHog query failed:', error);
    }
  }

  // Fallback to conversion_events if PostHog fails
  if (wau === 0) {
    const wauResult = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE ${buildArrayInClause('event_type', meaningfulEvents) as any}
        AND created_at >= ${weekStart}
        AND created_at <= ${weekEnd}
    `;
    wau = parseInt(wauResult.rows[0]?.count || '0');
  }

  const avgSessionsPerActiveUser = wau > 0 ? totalSessions / wau : 0;
  const avgEventsPerActiveUser = wau > 0 ? totalEvents / wau : 0;

  return {
    wau,
    avgSessionsPerActiveUser,
    avgEventsPerActiveUser,
  };
}

/**
 * Calculate retention metrics
 */
async function calculateRetention(
  weekStart: Date,
  weekEnd: Date,
): Promise<{
  w1Retention: number | null;
  w4Retention: number | null;
}> {
  // Get new users in this week
  const newUsersResult = await sql`
    SELECT DISTINCT user_id
    FROM conversion_events
    WHERE event_type = 'signup'
      AND created_at >= ${formatTimestamp(weekStart)}
      AND created_at <= ${formatTimestamp(weekEnd)}
  `;

  const newUserIds = newUsersResult.rows.map((r) => r.user_id).filter(Boolean);
  if (newUserIds.length === 0) {
    return { w1Retention: null, w4Retention: null };
  }

  // Calculate W1 retention (active in following week)
  const nextWeekStart = new Date(weekEnd.getTime() + 1);
  const nextWeekEnd = new Date(
    nextWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000,
  );

  const meaningfulEvents = [
    'app_open',
    'tarot_pull',
    'grimoire_save',
    'ritual_view',
    'moon_phase_view',
  ];

  const w1ActiveResult = await sql`
    SELECT COUNT(DISTINCT user_id) as count
    FROM conversion_events
    WHERE ${buildArrayInClause('user_id', newUserIds) as any}
      AND ${buildArrayInClause('event_type', meaningfulEvents) as any}
      AND created_at >= ${formatTimestamp(nextWeekStart)}
      AND created_at <= ${formatTimestamp(nextWeekEnd)}
  `;

  const w1Active = parseInt(w1ActiveResult.rows[0]?.count || '0');
  const w1Retention =
    newUserIds.length > 0 ? (w1Active / newUserIds.length) * 100 : null;

  // W4 retention (if we have enough data)
  const w4WeekStart = new Date(weekEnd.getTime() + 1);
  const w4WeekEnd = new Date(w4WeekStart.getTime() + 28 * 24 * 60 * 60 * 1000);

  const w4ActiveResult = await sql`
    SELECT COUNT(DISTINCT user_id) as count
    FROM conversion_events
    WHERE ${buildArrayInClause('user_id', newUserIds) as any}
      AND ${buildArrayInClause('event_type', meaningfulEvents) as any}
      AND created_at >= ${formatTimestamp(w4WeekStart)}
      AND created_at <= ${formatTimestamp(w4WeekEnd)}
  `;

  const w4Active = parseInt(w4ActiveResult.rows[0]?.count || '0');
  const w4Retention =
    newUserIds.length > 0 ? (w4Active / newUserIds.length) * 100 : null;

  return { w1Retention, w4Retention };
}

/**
 * Calculate revenue metrics
 */
async function calculateRevenue(
  weekStart: string,
  weekEnd: string,
  weekEndDate: Date,
): Promise<{
  grossRevenueWeek: number;
  netRevenueWeek: number | null;
  mrrEndOfWeek: number;
}> {
  // Gross revenue: sum of subscription payments in week
  // This is approximate - we'd need Stripe webhook data for exact amounts
  // For now, use monthly_amount_due from subscriptions that started this week
  const revenueResult = await sql`
    SELECT COALESCE(SUM(monthly_amount_due), 0) as total
    FROM subscriptions
    WHERE status IN ('active', 'trial', 'past_due')
      AND created_at >= ${weekStart}
      AND created_at <= ${weekEnd}
      AND monthly_amount_due > 0
  `;

  const grossRevenueWeek = parseFloat(revenueResult.rows[0]?.total || '0');

  // MRR at end of week: sum of monthly_amount_due for all active subscriptions
  const mrrResult = await sql`
    SELECT COALESCE(SUM(monthly_amount_due), 0) as total
    FROM subscriptions
    WHERE status IN ('active', 'trial', 'past_due')
      AND plan_type IN ('lunary_plus', 'lunary_plus_ai', 'lunary_plus_ai_annual')
      AND (created_at <= ${formatTimestamp(weekEndDate)} OR updated_at <= ${formatTimestamp(weekEndDate)})
      AND NOT EXISTS (
        SELECT 1 FROM conversion_events ce
        WHERE ce.user_id = subscriptions.user_id
          AND ce.event_type IN ('subscription_cancelled', 'subscription_ended')
          AND ce.created_at <= ${formatTimestamp(weekEndDate)}
          AND ce.created_at >= subscriptions.created_at
      )
  `;

  const mrrEndOfWeek = parseFloat(mrrResult.rows[0]?.total || '0');

  // Net revenue (after fees) - would need Stripe transaction data
  // For now, leave as null
  const netRevenueWeek = null;

  return {
    grossRevenueWeek,
    netRevenueWeek,
    mrrEndOfWeek,
  };
}

/**
 * Calculate subscription metrics
 */
async function calculateSubscriptions(
  weekStart: string,
  weekEnd: string,
  weekStartDate: Date,
  weekEndDate: Date,
): Promise<{
  activeSubscribersEndOfWeek: number;
  activeSubscribersStartOfWeek: number;
  churnedSubscribersWeek: number;
  churnRateWeek: number;
  trialToPaidConversionRateWeek: number;
}> {
  // Active subscribers at end of week
  const activeEndResult = await sql`
    SELECT COUNT(DISTINCT user_id) as count
    FROM subscriptions
    WHERE status IN ('active', 'trial', 'past_due')
      AND plan_type != 'free'
      AND (created_at <= ${formatTimestamp(weekEndDate)} OR updated_at <= ${formatTimestamp(weekEndDate)})
      AND NOT EXISTS (
        SELECT 1 FROM conversion_events ce
        WHERE ce.user_id = subscriptions.user_id
          AND ce.event_type IN ('subscription_cancelled', 'subscription_ended')
          AND ce.created_at <= ${formatTimestamp(weekEndDate)}
          AND ce.created_at >= subscriptions.created_at
      )
  `;

  const activeSubscribersEndOfWeek = parseInt(
    activeEndResult.rows[0]?.count || '0',
  );

  // Active subscribers at start of week
  const activeStartResult = await sql`
    SELECT COUNT(DISTINCT user_id) as count
    FROM subscriptions
    WHERE status IN ('active', 'trial', 'past_due')
      AND plan_type != 'free'
      AND (created_at <= ${formatTimestamp(weekStartDate)} OR updated_at <= ${formatTimestamp(weekStartDate)})
      AND NOT EXISTS (
        SELECT 1 FROM conversion_events ce
        WHERE ce.user_id = subscriptions.user_id
          AND ce.event_type IN ('subscription_cancelled', 'subscription_ended')
          AND ce.created_at <= ${formatTimestamp(weekStartDate)}
          AND ce.created_at >= subscriptions.created_at
      )
  `;

  const activeSubscribersStartOfWeek = parseInt(
    activeStartResult.rows[0]?.count || '0',
  );

  // Churned subscribers this week
  const churnedResult = await sql`
    SELECT COUNT(DISTINCT user_id) as count
    FROM conversion_events
    WHERE event_type IN ('subscription_cancelled', 'subscription_ended')
      AND created_at >= ${weekStart}
      AND created_at <= ${weekEnd}
  `;

  const churnedSubscribersWeek = parseInt(churnedResult.rows[0]?.count || '0');

  const churnRateWeek =
    activeSubscribersStartOfWeek > 0
      ? (churnedSubscribersWeek / activeSubscribersStartOfWeek) * 100
      : 0;

  // Trial to paid conversion rate
  const trialsResult = await sql`
    SELECT COUNT(DISTINCT user_id) as count
    FROM conversion_events
    WHERE event_type = 'trial_started'
      AND created_at >= ${weekStart}
      AND created_at <= ${weekEnd}
  `;

  const conversionsResult = await sql`
    SELECT COUNT(DISTINCT user_id) as count
    FROM conversion_events
    WHERE event_type IN ('trial_converted', 'subscription_started')
      AND created_at >= ${weekStart}
      AND created_at <= ${weekEnd}
  `;

  const trials = parseInt(trialsResult.rows[0]?.count || '0');
  const conversions = parseInt(conversionsResult.rows[0]?.count || '0');

  const trialToPaidConversionRateWeek =
    trials > 0 ? (conversions / trials) * 100 : 0;

  return {
    activeSubscribersEndOfWeek,
    activeSubscribersStartOfWeek,
    churnedSubscribersWeek,
    churnRateWeek,
    trialToPaidConversionRateWeek,
  };
}

/**
 * Calculate feature usage metrics
 */
async function calculateFeatureUsage(
  weekStart: string,
  weekEnd: string,
): Promise<{
  topFeatures: Array<{ feature: string; distinctUsers: number }>;
}> {
  // Feature events mapped to actual event types (grouped by feature)
  const featureEvents = [
    { events: ['tarot_viewed', 'personalized_tarot_viewed'], feature: 'Tarot' },
    { events: ['birth_chart_viewed'], feature: 'Birth Chart' },
    {
      events: ['horoscope_viewed', 'personalized_horoscope_viewed'],
      feature: 'Horoscope',
    },
    { events: ['cosmic_pulse_opened'], feature: 'Cosmic Pulse' },
    { events: ['moon_circle_opened'], feature: 'Moon Circle' },
  ];

  const featureUsage = await Promise.all(
    featureEvents.map(async ({ events, feature }) => {
      const result = await sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE ${buildArrayInClause('event_type', events) as any}
          AND created_at >= ${weekStart}
          AND created_at <= ${weekEnd}
      `;
      return {
        feature,
        distinctUsers: parseInt(result.rows[0]?.count || '0'),
      };
    }),
  );

  // Sort by distinct users and return top 5
  const topFeatures = featureUsage
    .sort((a, b) => b.distinctUsers - a.distinctUsers)
    .slice(0, 5);

  return { topFeatures };
}

/**
 * Calculate data completeness score (0-100)
 */
function calculateDataCompleteness(data: {
  acquisition: any;
  activation: any;
  engagement: any;
  retention: any;
  revenue: any;
  subscriptions: any;
}): number {
  let score = 100;
  let deductions = 0;

  // Check if key metrics are available
  if (data.engagement.wau === 0 && data.acquisition.newUsers > 0) {
    deductions += 10; // Missing engagement data
  }

  if (
    data.revenue.mrrEndOfWeek === 0 &&
    data.subscriptions.activeSubscribersEndOfWeek > 0
  ) {
    deductions += 10; // Missing revenue data
  }

  if (data.retention.w1Retention === null) {
    deductions += 5; // Missing retention data
  }

  score = Math.max(0, score - deductions);
  return score;
}

/**
 * Calculate funnel metrics for a week
 */
export async function calculateFunnelMetrics(
  weekStart: Date,
  weekEnd: Date,
): Promise<FunnelMetrics> {
  const weekStartFormatted = formatTimestamp(weekStart);
  const weekEndFormatted = formatTimestamp(weekEnd);
  const weekStartDate = formatDateLondon(weekStart);

  // Get funnel step counts
  const [
    visitResult,
    signupResult,
    activationResult,
    paywallResult,
    trialResult,
    subResult,
  ] = await Promise.all([
    // Visit or app open - approximate from PostHog or conversion_events
    // Visit or app open - approximate from any conversion event
    sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE created_at >= ${weekStartFormatted}
          AND created_at <= ${weekEndFormatted}
      `,
    sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE event_type = 'signup'
          AND created_at >= ${weekStartFormatted}
          AND created_at <= ${weekEndFormatted}
      `,
    sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE event_type IN ('tarot_viewed', 'personalized_tarot_viewed', 'birth_chart_viewed', 'horoscope_viewed', 'personalized_horoscope_viewed', 'cosmic_pulse_opened')
          AND created_at >= ${weekStartFormatted}
          AND created_at <= ${weekEndFormatted}
      `,
    sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE event_type = 'pricing_page_viewed'
          AND created_at >= ${weekStartFormatted}
          AND created_at <= ${weekEndFormatted}
      `,
    sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE event_type = 'trial_started'
          AND created_at >= ${weekStartFormatted}
          AND created_at <= ${weekEndFormatted}
      `,
    sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE event_type IN ('trial_converted', 'subscription_started')
          AND created_at >= ${weekStartFormatted}
          AND created_at <= ${weekEndFormatted}
      `,
  ]);

  const visitOrAppOpen = parseInt(visitResult.rows[0]?.count || '0');
  const signup = parseInt(signupResult.rows[0]?.count || '0');
  const activation = parseInt(activationResult.rows[0]?.count || '0');
  const paywallView = parseInt(paywallResult.rows[0]?.count || '0');
  const trialStart = parseInt(trialResult.rows[0]?.count || '0');
  const subscriptionStart = parseInt(subResult.rows[0]?.count || '0');

  // Calculate conversion rates
  const conversionVisitToSignup =
    visitOrAppOpen > 0 ? (signup / visitOrAppOpen) * 100 : 0;
  const conversionSignupToActivation =
    signup > 0 ? (activation / signup) * 100 : 0;
  const conversionActivationToTrial =
    activation > 0 ? (trialStart / activation) * 100 : 0;
  const conversionTrialToPaid =
    trialStart > 0 ? (subscriptionStart / trialStart) * 100 : 0;

  return {
    weekStartDate,
    visitOrAppOpen,
    signup,
    activation,
    paywallView,
    trialStart,
    subscriptionStart,
    conversionVisitToSignup,
    conversionSignupToActivation,
    conversionActivationToTrial,
    conversionTrialToPaid,
  };
}

/**
 * Calculate feature usage for a week
 */
export async function calculateFeatureUsageWeekly(
  weekStart: Date,
  weekEnd: Date,
): Promise<FeatureUsageWeekly[]> {
  const weekStartFormatted = formatTimestamp(weekStart);
  const weekEndFormatted = formatTimestamp(weekEnd);
  const weekStartDate = formatDateLondon(weekStart);

  // Feature events mapped to actual event types (grouped by feature)
  const featureEvents = [
    { events: ['tarot_viewed', 'personalized_tarot_viewed'], feature: 'Tarot' },
    { events: ['birth_chart_viewed'], feature: 'Birth Chart' },
    {
      events: ['horoscope_viewed', 'personalized_horoscope_viewed'],
      feature: 'Horoscope',
    },
    { events: ['cosmic_pulse_opened'], feature: 'Cosmic Pulse' },
    { events: ['moon_circle_opened'], feature: 'Moon Circle' },
    { events: ['weekly_report_opened'], feature: 'Weekly Report' },
  ];

  const results = await Promise.all(
    featureEvents.map(async ({ events, feature }) => {
      const [usersResult, eventsResult] = await Promise.all([
        sql`
          SELECT COUNT(DISTINCT user_id) as count
          FROM conversion_events
          WHERE ${buildArrayInClause('event_type', events) as any}
            AND created_at >= ${weekStartFormatted}
            AND created_at <= ${weekEndFormatted}
        `,
        sql`
          SELECT COUNT(*) as count
          FROM conversion_events
          WHERE ${buildArrayInClause('event_type', events) as any}
            AND created_at >= ${weekStartFormatted}
            AND created_at <= ${weekEndFormatted}
        `,
      ]);

      return {
        weekStartDate,
        featureName: feature,
        distinctUsers: parseInt(usersResult.rows[0]?.count || '0'),
        totalEvents: parseInt(eventsResult.rows[0]?.count || '0'),
      };
    }),
  );

  return results;
}
