import { NextRequest, NextResponse } from 'next/server';
import { sendDailyInsightNotification } from '@/lib/notifications/tiered-service';
import { getGlobalCosmicData } from '@/lib/cosmic-snapshot/global-cache';

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

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    console.log('🌙 Daily Insight Notification started for:', dateStr);

    let cosmicData = null;
    try {
      cosmicData = await getGlobalCosmicData(now);
    } catch (error) {
      console.error('Failed to fetch cosmic data:', error);
    }

    const result = await sendDailyInsightNotification(cosmicData);

    console.log(
      `✅ Daily Insight Notification completed: ${result.successful} sent (${result.paidRecipients} paid, ${result.freeRecipients} free)`,
    );

    return NextResponse.json({
      success: result.success,
      date: dateStr,
      totalRecipients: result.totalRecipients,
      freeRecipients: result.freeRecipients,
      paidRecipients: result.paidRecipients,
      successful: result.successful,
      failed: result.failed,
      eventKey: result.eventKey,
    });
  } catch (error) {
    console.error('❌ Daily Insight Notification failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
