import { NextRequest, NextResponse } from 'next/server';
import { sendDailyInsightNotification } from '@/lib/notifications/tiered-service';
import { getGlobalCosmicData } from '@/lib/cosmic-snapshot/global-cache';

export const dynamic = 'force-dynamic';

/**
 * Daily morning notification - sends daily insight notification at 8 AM UTC
 * Rotates between tarot, energy theme, and insight notifications
 */
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

    const todayDate = new Date();
    const today = todayDate.toISOString().split('T')[0];
    const checkTime = new Date().toISOString();

    console.log(
      '🌅 Daily morning notification (insight) started at:',
      checkTime,
    );

    // Send daily insight notification (rotates between tarot, energy theme, and insight)
    let cosmicData = null;
    try {
      cosmicData = await getGlobalCosmicData(todayDate);
    } catch (error) {
      console.error('Failed to fetch cosmic data for insights:', error);
    }

    const insightResult = await sendDailyInsightNotification(cosmicData);

    console.log(
      `✅ Morning daily insight notification: ${insightResult.successful} sent, ${insightResult.failed} failed`,
    );

    // Consider it successful if:
    // 1. There were successful notifications sent, OR
    // 2. There were no errors (even if 0 recipients - that's valid, just means no active subscriptions)
    const isSuccess =
      insightResult.success ||
      insightResult.successful > 0 ||
      (!insightResult.error && insightResult.failed === 0);

    // Log detailed info for debugging
    console.log('📊 Daily insight notification result:', {
      success: insightResult.success,
      successful: insightResult.successful,
      failed: insightResult.failed,
      totalRecipients: insightResult.totalRecipients,
      error: insightResult.error,
      isSuccess,
    });

    return NextResponse.json({
      success: isSuccess,
      notificationsSent: insightResult.successful,
      failed: insightResult.failed,
      result: {
        successful: insightResult.successful,
        failed: insightResult.failed,
        recipientCount: insightResult.totalRecipients || 0,
        failureDetails: insightResult.failureDetails || undefined,
      },
      date: today,
      checkTime,
      message:
        insightResult.totalRecipients === 0 && !insightResult.error
          ? 'No active subscriptions found (this is normal if no users have active push subscriptions)'
          : insightResult.error
            ? `Error: ${insightResult.error}`
            : insightResult.failed > 0
              ? `${insightResult.failed} notification(s) failed. Check failureDetails for more info.`
              : undefined,
    });
  } catch (error) {
    console.error('❌ Daily morning notification failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        checkTime: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
