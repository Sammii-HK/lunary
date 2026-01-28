/**
 * Auto-generate actionable insights from analytics metrics
 */

export type InsightType = 'positive' | 'warning' | 'critical' | 'info';
export type InsightCategory =
  | 'retention'
  | 'product'
  | 'growth'
  | 'engagement'
  | 'revenue'
  | 'quality';
export type InsightPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Insight {
  type: InsightType;
  category: InsightCategory;
  message: string;
  priority: InsightPriority;
  action?: string;
  metric?: {
    label: string;
    value: string | number;
  };
}

export interface AnalyticsMetrics {
  // Core metrics
  productMAU: number;
  appMAU: number;
  productDAU: number;
  productWAU: number;

  // Growth
  productMAUGrowth: number; // % change
  signupCount: number;
  activationRate: number; // 0-1

  // Retention
  recentCohortRetention: number; // 0-1
  earlyCohortRetention: number; // 0-1
  day30Retention: number; // 0-1

  // Engagement
  avgActiveDays: number; // days per week
  stickiness: number; // DAU/MAU ratio

  // Feature adoption (0-1, can be >1 for Product MAU)
  dashboardAdoption: number;
  horoscopeAdoption: number;
  tarotAdoption: number;
  guideAdoption: number;
  chartAdoption: number;
  ritualAdoption: number;

  // Revenue
  mrr: number;
  conversionRate: number; // free to trial, 0-1

  // Tracking quality
  trackingIssues: Array<{
    event: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

/**
 * Generate actionable insights from analytics metrics
 */
export function generateInsights(metrics: AnalyticsMetrics): Insight[] {
  const insights: Insight[] = [];

  // Retention improvements
  if (
    metrics.recentCohortRetention > 0.5 &&
    metrics.earlyCohortRetention < 0.2 &&
    metrics.recentCohortRetention > metrics.earlyCohortRetention * 3
  ) {
    insights.push({
      type: 'positive',
      category: 'retention',
      message: `Recent cohorts showing ${Math.round(metrics.recentCohortRetention / Math.max(metrics.earlyCohortRetention, 0.01))}x better D30 retention. Something changed in product - investigate what improved!`,
      priority: 'high',
      action: 'Document what changed and double down',
      metric: {
        label: 'Recent cohort D30 retention',
        value: `${(metrics.recentCohortRetention * 100).toFixed(1)}%`,
      },
    });
  }

  // Low retention warning
  if (metrics.day30Retention < 0.15 && metrics.productMAU > 50) {
    insights.push({
      type: 'warning',
      category: 'retention',
      message: `D30 retention is only ${(metrics.day30Retention * 100).toFixed(1)}%. Most users don't stick around after first use.`,
      priority: 'high',
      action: 'Add onboarding flow and engagement hooks',
      metric: {
        label: 'D30 Retention',
        value: `${(metrics.day30Retention * 100).toFixed(1)}%`,
      },
    });
  }

  // Low feature adoption - Guide chat
  if (metrics.guideAdoption < 0.15 && metrics.productMAU > 20) {
    insights.push({
      type: 'critical',
      category: 'product',
      message: `Guide chat is your best feature but only ${(metrics.guideAdoption * 100).toFixed(1)}% of users discover it. Add prominent discovery prompts.`,
      priority: 'urgent',
      action: 'Add feature tour + dashboard prompts',
      metric: {
        label: 'Guide adoption',
        value: `${(metrics.guideAdoption * 100).toFixed(1)}%`,
      },
    });
  }

  // Broken features
  if (metrics.ritualAdoption === 0 && metrics.productMAU > 20) {
    insights.push({
      type: 'critical',
      category: 'quality',
      message:
        'Rituals feature has 0% adoption - either tracking is broken or feature is invisible to users.',
      priority: 'urgent',
      action: 'Investigate tracking code + UX visibility',
      metric: {
        label: 'Ritual adoption',
        value: '0%',
      },
    });
  }

  // High horoscope adoption
  if (metrics.horoscopeAdoption > 0.6) {
    insights.push({
      type: 'positive',
      category: 'product',
      message: `Horoscopes are your hook feature with ${(metrics.horoscopeAdoption * 100).toFixed(0)}% adoption. Optimize this funnel and use it to drive other features.`,
      priority: 'medium',
      action: 'Add cross-feature prompts from horoscope',
      metric: {
        label: 'Horoscope adoption',
        value: `${(metrics.horoscopeAdoption * 100).toFixed(0)}%`,
      },
    });
  }

  // Low stickiness
  if (metrics.stickiness < 0.15 && metrics.productMAU > 20) {
    insights.push({
      type: 'warning',
      category: 'engagement',
      message: `Stickiness is ${(metrics.stickiness * 100).toFixed(1)}% (DAU/MAU). Users only check in ~${(metrics.avgActiveDays || metrics.stickiness * 30).toFixed(1)} days/month. Need more engagement triggers.`,
      priority: 'high',
      action: 'Add daily notifications + email reminders',
      metric: {
        label: 'Stickiness',
        value: `${(metrics.stickiness * 100).toFixed(1)}%`,
      },
    });
  }

  // Strong activation
  if (metrics.activationRate > 0.5) {
    insights.push({
      type: 'positive',
      category: 'growth',
      message: `${(metrics.activationRate * 100).toFixed(0)}% of signups activate within 24h. Your onboarding is working - now focus on retention.`,
      priority: 'low',
      metric: {
        label: 'Activation rate',
        value: `${(metrics.activationRate * 100).toFixed(0)}%`,
      },
    });
  }

  // Low activation
  if (metrics.activationRate < 0.3 && metrics.signupCount > 50) {
    insights.push({
      type: 'warning',
      category: 'growth',
      message: `Only ${(metrics.activationRate * 100).toFixed(0)}% of new signups activate. Many users sign up but never engage with features.`,
      priority: 'high',
      action: 'Improve onboarding flow + email nurture',
      metric: {
        label: 'Activation rate',
        value: `${(metrics.activationRate * 100).toFixed(0)}%`,
      },
    });
  }

  // Low dashboard adoption (multi-entry architecture insight)
  if (
    metrics.dashboardAdoption < 0.25 &&
    metrics.horoscopeAdoption > 0.5 &&
    metrics.productMAU > 50
  ) {
    insights.push({
      type: 'info',
      category: 'product',
      message: `Only ${(metrics.dashboardAdoption * 100).toFixed(0)}% view dashboard. Users enter via email links and bookmarks - this is normal for multi-entry products.`,
      priority: 'low',
      action: 'Track entry points to optimize direct-to-feature flows',
    });
  }

  // Tracking quality issues
  metrics.trackingIssues.forEach((issue) => {
    if (issue.severity === 'high') {
      insights.push({
        type: 'critical',
        category: 'quality',
        message: `Tracking issue detected: ${issue.event} - ${issue.issue}`,
        priority: 'urgent',
        action: 'Fix tracking implementation',
      });
    } else if (issue.severity === 'medium') {
      insights.push({
        type: 'warning',
        category: 'quality',
        message: `Tracking warning: ${issue.event} - ${issue.issue}`,
        priority: 'medium',
        action: 'Investigate and fix if needed',
      });
    }
  });

  // Revenue milestone
  if (metrics.mrr >= 1000 && metrics.mrr < 2000) {
    insights.push({
      type: 'positive',
      category: 'revenue',
      message: `You're at $${metrics.mrr.toLocaleString()} MRR. Focus on retention to hit $2k milestone.`,
      priority: 'low',
    });
  }

  // Low conversion rate
  if (metrics.conversionRate < 0.1 && metrics.signupCount > 100) {
    insights.push({
      type: 'warning',
      category: 'revenue',
      message: `Free-to-trial conversion is ${(metrics.conversionRate * 100).toFixed(1)}%. Value prop may not be clear or paywall timing is off.`,
      priority: 'high',
      action: 'A/B test paywall timing + messaging',
      metric: {
        label: 'Free to trial rate',
        value: `${(metrics.conversionRate * 100).toFixed(1)}%`,
      },
    });
  }

  // Sort by priority
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  insights.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  );

  return insights;
}

/**
 * Detect tracking quality issues from metrics
 */
export function detectTrackingIssues(
  featureMetrics: Record<string, { count: number; adoption: number }>,
  productMAU: number,
): Array<{
  event: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
}> {
  const issues: Array<{
    event: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }> = [];

  // Check for identical counts (likely dual-event bug)
  const counts = Object.entries(featureMetrics).map(([event, data]) => ({
    event,
    count: data.count,
  }));
  for (let i = 0; i < counts.length; i++) {
    for (let j = i + 1; j < counts.length; j++) {
      if (
        counts[i].count === counts[j].count &&
        counts[i].count > 10 &&
        counts[i].event.includes('horoscope') &&
        counts[j].event.includes('horoscope')
      ) {
        issues.push({
          event: `${counts[i].event} + ${counts[j].event}`,
          issue: `Identical counts (${counts[i].count}) suggest dual-event bug`,
          severity: 'medium',
        });
      }
    }
  }

  // Check for zero adoption on features that should exist
  const criticalFeatures = ['ritual_started', 'chart_viewed'];
  criticalFeatures.forEach((event) => {
    const metric = featureMetrics[event];
    if (metric && metric.count === 0 && productMAU > 20) {
      issues.push({
        event,
        issue: '0 events recorded - tracking likely broken',
        severity: 'high',
      });
    }
  });

  return issues;
}
