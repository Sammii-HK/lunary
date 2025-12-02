import { NextRequest, NextResponse } from 'next/server';
import {
  sendWeekAheadNotification,
  sendWeeklyTarotNotification,
  sendCosmicResetNotification,
} from '@/lib/notifications/tiered-service';
import { getGlobalCosmicData } from '@/lib/cosmic-snapshot/global-cache';

type WeeklyNotificationType = 'week_ahead' | 'weekly_tarot' | 'cosmic_reset';

function getNotificationTypeForDay(
  dayOfWeek: number,
): WeeklyNotificationType | null {
  switch (dayOfWeek) {
    case 1:
      return 'week_ahead';
    case 5:
      return 'weekly_tarot';
    case 0:
      return 'cosmic_reset';
    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    if (!isVercelCron) {
      if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { searchParams } = new URL(request.url);
    const forceType = searchParams.get('type') as WeeklyNotificationType | null;

    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const dateStr = now.toISOString().split('T')[0];

    const notificationType = forceType || getNotificationTypeForDay(dayOfWeek);

    if (!notificationType) {
      console.log(
        `📅 Weekly notification skipped - not a scheduled day (day: ${dayOfWeek})`,
      );
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: `Not a scheduled day for weekly notifications (current day: ${dayOfWeek})`,
        scheduledDays: 'Monday (1), Friday (5), Sunday (0)',
      });
    }

    console.log(
      `📅 Weekly ${notificationType} notification started for:`,
      dateStr,
    );

    let cosmicData = null;
    try {
      cosmicData = await getGlobalCosmicData(now);
    } catch (error) {
      console.error('Failed to fetch cosmic data:', error);
    }

    let result;
    switch (notificationType) {
      case 'week_ahead':
        result = await sendWeekAheadNotification(cosmicData);
        break;
      case 'weekly_tarot':
        result = await sendWeeklyTarotNotification(cosmicData);
        break;
      case 'cosmic_reset':
        result = await sendCosmicResetNotification(cosmicData);
        break;
    }

    console.log(
      `✅ Weekly ${notificationType} notification completed: ${result.successful} sent (${result.paidRecipients} paid, ${result.freeRecipients} free)`,
    );

    return NextResponse.json({
      success: result.success,
      date: dateStr,
      notificationType,
      dayOfWeek,
      totalRecipients: result.totalRecipients,
      freeRecipients: result.freeRecipients,
      paidRecipients: result.paidRecipients,
      successful: result.successful,
      failed: result.failed,
      eventKey: result.eventKey,
    });
  } catch (error) {
    console.error('❌ Weekly notification failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
