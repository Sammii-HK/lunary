import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import {
  generateNewMoonEmailHTML,
  generateNewMoonEmailText,
  generateFullMoonEmailHTML,
  generateFullMoonEmailText,
  MoonEventData,
} from '@/lib/email-templates/moon-events';
import { generateMoonCircle } from '@/lib/moon-circles/generator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';

  if (!isVercelCron) {
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    console.log('🌙 Checking for Moon Event:', dateStr);

    // Generate moon circle data to get moon phase and sign
    const moonCircle = await generateMoonCircle(today);

    if (!moonCircle || (moonCircle.moonPhase !== 'New Moon' && moonCircle.moonPhase !== 'Full Moon')) {
      console.log('📭 No New Moon or Full Moon today');
      return NextResponse.json({
        success: true,
        moonEventSent: false,
        message: 'No New Moon or Full Moon today',
        date: dateStr,
      });
    }

    // Check if we've already sent emails for this moon event
    const eventKey = `moon-event-${moonCircle.moonPhase.toLowerCase().replace(' ', '-')}-${dateStr}`;
    const alreadySent = await sql`
      SELECT id FROM notification_sent_events 
      WHERE date = ${dateStr}::date 
      AND event_key = ${eventKey}
    `;

    if (alreadySent.rows.length > 0) {
      console.log('[moon-events] Already sent today, skipping');
      return NextResponse.json({
        success: true,
        moonEventSent: false,
        message: 'Already sent today',
        date: dateStr,
      });
    }

    // Get all active subscribers who want moon event emails
    const subscriptions = await sql`
      SELECT DISTINCT user_id, user_email, preferences
      FROM push_subscriptions
      WHERE is_active = true
      AND (
        preferences->>'moonEvents' = 'true'
        OR preferences->>'moonEvents' IS NULL
      )
      AND user_email IS NOT NULL
    `;

    if (subscriptions.rows.length === 0) {
      console.log('[moon-events] No subscribers found');
      return NextResponse.json({
        success: true,
        emailsSent: 0,
        message: 'No subscribers for moon events',
      });
    }

    console.log(
      `[moon-events] Sending ${moonCircle.moonPhase} emails to ${subscriptions.rows.length} subscribers`,
    );

    const dateLabel = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(today);

    const moonData: MoonEventData = {
      moonPhase: moonCircle.moonPhase,
      moonSign: moonCircle.moonSign,
      date: today,
      dateLabel,
      intention: moonCircle.intention,
      ritualSuggestion: moonCircle.guidedRitual,
      tarotSuggestion: moonCircle.tarotSpreadSuggestion,
    };

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const sub of subscriptions.rows) {
      try {
        const userId = sub.user_id;
        const userEmail = sub.user_email;
        const preferences = sub.preferences || {};
        const userName = (preferences.name as string) || undefined;

        if (!userEmail || !userId) {
          continue;
        }

        const html =
          moonCircle.moonPhase === 'New Moon'
            ? generateNewMoonEmailHTML(userName || 'there', moonData)
            : generateFullMoonEmailHTML(userName || 'there', moonData);

        const text =
          moonCircle.moonPhase === 'New Moon'
            ? generateNewMoonEmailText(userName || 'there', moonData)
            : generateFullMoonEmailText(userName || 'there', moonData);

        const subject =
          moonCircle.moonPhase === 'New Moon'
            ? `🌑 New Moon in ${moonCircle.moonSign} - Time for New Beginnings`
            : `🌕 Full Moon in ${moonCircle.moonSign} - Time for Release & Manifestation`;

        await sendEmail({
          to: userEmail,
          subject,
          html,
          text,
          tracking: {
            userId,
            notificationType: 'moon_event',
            notificationId: `moon-event-${moonCircle.moonPhase.toLowerCase()}-${dateStr}-${userId}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'moon_events',
              content: moonCircle.moonPhase.toLowerCase().replace(' ', '_'),
            },
          },
        });

        emailsSent++;
      } catch (error) {
        console.error(
          `Failed to send moon event email to ${sub.user_email}:`,
          error,
        );
        emailsFailed++;
      }
    }

    if (emailsSent > 0) {
      await sql`
        INSERT INTO notification_sent_events (date, event_key, event_type, event_name, event_priority, sent_by)
        VALUES (${dateStr}::date, ${eventKey}, 'moon_event', '${moonCircle.moonPhase} in ${moonCircle.moonSign}', 5, 'moon-events')
        ON CONFLICT (date, event_key) DO NOTHING
      `;
    }

    console.log(
      `[moon-events] Completed: ${emailsSent} sent, ${emailsFailed} failed`,
    );

    return NextResponse.json({
      success: true,
      moonEventSent: true,
      moonPhase: moonCircle.moonPhase,
      moonSign: moonCircle.moonSign,
      emailsSent,
      emailsFailed,
      totalSubscribers: subscriptions.rows.length,
      date: dateStr,
    });
  } catch (error) {
    console.error('[moon-events] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send moon event emails',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
