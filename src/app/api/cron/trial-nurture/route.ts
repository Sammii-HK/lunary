import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import {
  generateTrialDay2EmailHTML,
  generateTrialDay2EmailText,
  generateTrialDay3EmailHTML,
  generateTrialDay3EmailText,
  generateTrialDay5EmailHTML,
  generateTrialDay5EmailText,
} from '@/lib/email-templates/trial-nurture';
import { generateTrialExpiredEmailHTML, generateTrialExpiredEmailText } from '@/lib/email-templates/trial-expired';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate dates for each email in the sequence
    const day2Date = new Date(today);
    day2Date.setDate(day2Date.getDate() - 2);
    
    const day3Date = new Date(today);
    day3Date.setDate(day3Date.getDate() - 3);
    
    const day5Date = new Date(today);
    day5Date.setDate(day5Date.getDate() - 5);
    
    const day7Date = new Date(today);
    day7Date.setDate(day7Date.getDate() - 7);

    let sentDay2 = 0;
    let sentDay3 = 0;
    let sentDay5 = 0;
    let sentDay7 = 0;
    const errors: string[] = [];

    // Day 2: Birth Chart Reveals
    const day2Trials = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email as email,
        s.user_name as name,
        s.trial_ends_at,
        s.created_at as trial_started_at
      FROM subscriptions s
      WHERE s.status = 'trial'
      AND s.trial_ends_at IS NOT NULL
      AND DATE(s.created_at) = ${day2Date.toISOString().split('T')[0]}
      AND (s.trial_nurture_day2_sent = false OR s.trial_nurture_day2_sent IS NULL)
      AND s.user_email IS NOT NULL
    `;

    for (const user of day2Trials.rows) {
      try {
        const trialEnd = new Date(user.trial_ends_at);
        const daysRemaining = Math.ceil(
          (trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );

        const html = generateTrialDay2EmailHTML(
          user.name || 'there',
          daysRemaining,
        );
        const text = generateTrialDay2EmailText(
          user.name || 'there',
          daysRemaining,
        );

        await sendEmail({
          to: user.email,
          subject: '🌟 Your Birth Chart Reveals...',
          html,
          text,
          tracking: {
            userId: user.user_id,
            notificationType: 'trial_nurture',
            notificationId: `trial-nurture-day2-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'trial_nurture',
              content: 'day2',
            },
          },
        });

        await sql`
          UPDATE subscriptions
          SET trial_nurture_day2_sent = true
          WHERE user_id = ${user.user_id}
          AND status = 'trial'
        `;

        sentDay2++;
      } catch (error) {
        errors.push(
          `Failed to send Day 2 email to ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // Day 3: Daily Guidance Personalized
    const day3Trials = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email as email,
        s.user_name as name,
        s.trial_ends_at,
        s.created_at as trial_started_at
      FROM subscriptions s
      WHERE s.status = 'trial'
      AND s.trial_ends_at IS NOT NULL
      AND DATE(s.created_at) = ${day3Date.toISOString().split('T')[0]}
      AND (s.trial_nurture_day3_sent = false OR s.trial_nurture_day3_sent IS NULL)
      AND s.user_email IS NOT NULL
    `;

    for (const user of day3Trials.rows) {
      try {
        const trialEnd = new Date(user.trial_ends_at);
        const daysRemaining = Math.ceil(
          (trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );

        const html = generateTrialDay3EmailHTML(
          user.name || 'there',
          daysRemaining,
        );
        const text = generateTrialDay3EmailText(
          user.name || 'there',
          daysRemaining,
        );

        await sendEmail({
          to: user.email,
          subject: '🔮 Your Daily Guidance is Personalised',
          html,
          text,
          tracking: {
            userId: user.user_id,
            notificationType: 'trial_nurture',
            notificationId: `trial-nurture-day3-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'trial_nurture',
              content: 'day3',
            },
          },
        });

        await sql`
          UPDATE subscriptions
          SET trial_nurture_day3_sent = true
          WHERE user_id = ${user.user_id}
          AND status = 'trial'
        `;

        sentDay3++;
      } catch (error) {
        errors.push(
          `Failed to send Day 3 email to ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // Day 5: 2 Days Left
    const day5Trials = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email as email,
        s.user_name as name,
        s.trial_ends_at,
        s.created_at as trial_started_at
      FROM subscriptions s
      WHERE s.status = 'trial'
      AND s.trial_ends_at IS NOT NULL
      AND DATE(s.created_at) = ${day5Date.toISOString().split('T')[0]}
      AND (s.trial_nurture_day5_sent = false OR s.trial_nurture_day5_sent IS NULL)
      AND s.user_email IS NOT NULL
    `;

    for (const user of day5Trials.rows) {
      try {
        const trialEnd = new Date(user.trial_ends_at);
        const daysRemaining = Math.ceil(
          (trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );

        const html = generateTrialDay5EmailHTML(
          user.name || 'there',
          daysRemaining,
        );
        const text = generateTrialDay5EmailText(
          user.name || 'there',
          daysRemaining,
        );

        await sendEmail({
          to: user.email,
          subject: '⏰ 2 Days Left—Here\'s What You\'ll Miss',
          html,
          text,
          tracking: {
            userId: user.user_id,
            notificationType: 'trial_nurture',
            notificationId: `trial-nurture-day5-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'trial_nurture',
              content: 'day5',
            },
          },
        });

        await sql`
          UPDATE subscriptions
          SET trial_nurture_day5_sent = true
          WHERE user_id = ${user.user_id}
          AND status = 'trial'
        `;

        sentDay5++;
      } catch (error) {
        errors.push(
          `Failed to send Day 5 email to ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // Day 7: Trial Ended
    const day7Trials = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email as email,
        s.user_name as name,
        s.trial_ends_at,
        s.created_at as trial_started_at
      FROM subscriptions s
      WHERE s.status = 'trial'
      AND s.trial_ends_at IS NOT NULL
      AND DATE(s.trial_ends_at) <= ${today.toISOString().split('T')[0]}
      AND DATE(s.created_at) = ${day7Date.toISOString().split('T')[0]}
      AND (s.trial_nurture_day7_sent = false OR s.trial_nurture_day7_sent IS NULL)
      AND s.user_email IS NOT NULL
    `;

    for (const user of day7Trials.rows) {
      try {
        // Calculate missed insights (approximate)
        const missedInsights = 7; // Daily insights over 7 days

        const html = generateTrialExpiredEmailHTML(
          user.name || 'there',
          missedInsights,
        );
        const text = generateTrialExpiredEmailText(
          user.name || 'there',
          missedInsights,
        );

        await sendEmail({
          to: user.email,
          subject: '🌙 Your Trial Ended',
          html,
          text,
          tracking: {
            userId: user.user_id,
            notificationType: 'trial_nurture',
            notificationId: `trial-nurture-day7-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'trial_nurture',
              content: 'day7',
            },
          },
        });

        await sql`
          UPDATE subscriptions
          SET trial_nurture_day7_sent = true
          WHERE user_id = ${user.user_id}
          AND status = 'trial'
        `;

        sentDay7++;
      } catch (error) {
        errors.push(
          `Failed to send Day 7 email to ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return NextResponse.json({
      success: true,
      sent: {
        day2: sentDay2,
        day3: sentDay3,
        day5: sentDay5,
        day7: sentDay7,
        total: sentDay2 + sentDay3 + sentDay5 + sentDay7,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Trial nurture cron error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send trial nurture emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
