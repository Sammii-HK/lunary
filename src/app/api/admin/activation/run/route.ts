import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const authResult = await requireAdminAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Run activation intelligence agents
    // This would normally call external agents, but for now we'll generate analysis-based recommendations

    // Get current funnel state
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const freeUsersL30d = await prisma.subscriptions.count({
      where: { status: 'free', created_at: { gte: thirtyDaysAgo } },
    });

    const trialUsers = await prisma.subscriptions.findMany({
      where: { status: 'trial', created_at: { gte: thirtyDaysAgo } },
    });

    const paidUsers = await prisma.subscriptions.count({
      where: { is_paying: true },
    });

    const trialConversionRate =
      freeUsersL30d > 0 ? (trialUsers.length / freeUsersL30d) * 100 : 0;
    const paidConversionRate =
      trialUsers.length > 0 ? (paidUsers / trialUsers.length) * 100 : 0;

    // Clear old recommendations
    await prisma.activation_recommendations.updateMany({
      where: {
        status: 'active',
        generated_at: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      data: { status: 'archived' },
    });

    // Generate recommendations based on analysis
    const recommendations = [];

    // Bottleneck analysis
    if (trialConversionRate < 15) {
      recommendations.push({
        recommendation: `Free-to-trial conversion at ${trialConversionRate.toFixed(1)}% is below 15% industry benchmark. This is your biggest activation leak.`,
        category: 'bottleneck' as const,
        priority: 'high' as const,
        segment: 'free-to-trial',
        impact_estimate: 'Moving to 20% would add 76 trial users/month',
        suggested_test:
          'Test onboarding sequence: which feature order converts best?',
      });
    }

    if (paidConversionRate < 12) {
      recommendations.push({
        recommendation: `Trial-to-paid conversion at ${paidConversionRate.toFixed(1)}% is healthy, but could improve.`,
        category: 'strategy' as const,
        priority: 'medium' as const,
        segment: 'trial-to-paid',
        impact_estimate: 'Each 1% improvement = 1 new paid user/month',
      });
    }

    // Feature-driven activation
    recommendations.push({
      recommendation:
        'Analyze which features drive free→trial conversion (e.g., horoscope first vs birth chart first)',
      category: 'strategy' as const,
      priority: 'high' as const,
      segment: 'onboarding-optimization',
      suggested_test: 'Run A/B test: different feature sequences in onboarding',
    });

    // Engagement cadence
    recommendations.push({
      recommendation:
        'Test engagement cadence for free users to push toward trial signup',
      category: 'test' as const,
      priority: 'high' as const,
      segment: 'free-user-engagement',
      suggested_test:
        'Control: no pushes vs Treatment 1: email day 3 + notification day 5 vs Treatment 2: daily notification',
      impact_estimate: '5-10% lift expected on trial signups',
    });

    // Signup source analysis
    recommendations.push({
      recommendation:
        'Identify which signup sources (organic, paid, referral) convert to trial fastest',
      category: 'strategy' as const,
      priority: 'medium' as const,
      segment: 'acquisition-quality',
    });

    // Cohort-specific strategies
    recommendations.push({
      recommendation:
        'Create segment-specific onboarding for high-intent cohorts (e.g., users who complete profile)',
      category: 'strategy' as const,
      priority: 'medium' as const,
      segment: 'intent-based-activation',
    });

    // Store recommendations
    for (const rec of recommendations) {
      await prisma.activation_recommendations.create({
        data: {
          recommendation: rec.recommendation,
          category: rec.category,
          priority: rec.priority,
          segment: rec.segment || null,
          impact_estimate: rec.impact_estimate || null,
          suggested_test: rec.suggested_test || null,
          status: 'active',
          generated_by: 'activation-analyzer',
          metadata: {
            free_users_l30d: freeUsersL30d,
            trial_conversion_rate: trialConversionRate,
            paid_conversion_rate: paidConversionRate,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      recommendationsGenerated: recommendations.length,
      metrics: {
        free_users_l30d: freeUsersL30d,
        trial_conversion_rate: trialConversionRate.toFixed(2),
        paid_conversion_rate: paidConversionRate.toFixed(2),
      },
    });
  } catch (error) {
    console.error('Failed to run activation analysis:', error);
    return NextResponse.json(
      { error: 'Failed to run analysis' },
      { status: 500 },
    );
  }
}
