import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendPushoverNotification } from '../../../../../../utils/notifications/pushNotifications';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const last7Days = await sql`
      SELECT 
        COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN user_id END) as signups,
        COUNT(DISTINCT CASE WHEN event_type = 'trial_started' THEN user_id END) as trials,
        COUNT(DISTINCT CASE WHEN event_type IN ('trial_converted', 'subscription_started') THEN user_id END) as conversions
      FROM conversion_events
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `;

    const last30Days = await sql`
      SELECT 
        COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN user_id END) as signups,
        COUNT(DISTINCT CASE WHEN event_type = 'trial_started' THEN user_id END) as trials,
        COUNT(DISTINCT CASE WHEN event_type IN ('trial_converted', 'subscription_started') THEN user_id END) as conversions
      FROM conversion_events
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `;

    const weekly = last7Days.rows[0];
    const monthly = last30Days.rows[0];

    const weeklySignups = parseInt(weekly?.signups || '0');
    const weeklyTrials = parseInt(weekly?.trials || '0');
    const weeklyConversions = parseInt(weekly?.conversions || '0');
    const monthlySignups = parseInt(monthly?.signups || '0');
    const monthlyTrials = parseInt(monthly?.trials || '0');
    const monthlyConversions = parseInt(monthly?.conversions || '0');

    const monthlySubscriptions = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type IN ('subscription_started', 'trial_converted')
        AND plan_type = 'monthly'
        AND created_at >= NOW() - INTERVAL '30 days'
    `;

    const yearlySubscriptions = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type IN ('subscription_started', 'trial_converted')
        AND plan_type = 'yearly'
        AND created_at >= NOW() - INTERVAL '30 days'
    `;

    const monthlyCount = parseInt(monthlySubscriptions.rows[0]?.count || '0');
    const yearlyCount = parseInt(yearlySubscriptions.rows[0]?.count || '0');
    const mrr = monthlyCount * 4.99 + (yearlyCount * 39.99) / 12;

    const conversionRate =
      monthlySignups > 0 ? (monthlyConversions / monthlySignups) * 100 : 0;
    const trialConversionRate =
      monthlyTrials > 0 ? (monthlyConversions / monthlyTrials) * 100 : 0;

    const title = '📊 Weekly Conversion Digest';
    const message = `This Week:
• ${weeklySignups} signups
• ${weeklyTrials} trials started
• ${weeklyConversions} conversions

Last 30 Days:
• ${monthlySignups} total signups
• ${monthlyTrials} trials
• ${monthlyConversions} conversions
• ${conversionRate.toFixed(1)}% conversion rate
• ${trialConversionRate.toFixed(1)}% trial conversion
• $${mrr.toFixed(2)} MRR`;

    const result = await sendPushoverNotification({
      title,
      message,
      priority: 'normal',
      sound: 'default',
      url:
        process.env.NODE_ENV === 'production'
          ? 'https://lunary.app/admin/analytics'
          : 'http://localhost:3000/admin/analytics',
    });

    return NextResponse.json({
      success: result.success,
      data: {
        weekly: {
          signups: weeklySignups,
          trials: weeklyTrials,
          conversions: weeklyConversions,
        },
        monthly: {
          signups: monthlySignups,
          trials: monthlyTrials,
          conversions: monthlyConversions,
          conversionRate,
          trialConversionRate,
          mrr,
        },
      },
    });
  } catch (error) {
    console.error('Error sending weekly digest:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
