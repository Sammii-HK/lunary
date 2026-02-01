import { NextRequest, NextResponse } from 'next/server';
import { sendDiscordAdminNotification } from '@/lib/discord';
import { runSync } from '../../../../../scripts/weekly-sync-cron';

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Weekly Subscription Sync
 * Runs Sunday 02:00 UTC via Vercel cron
 * Syncs database with Stripe and sends Discord notification
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron request
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

    console.log('[Weekly Subscription Sync] Starting sync...');

    const stats = await runSync();

    console.log(
      '[Weekly Subscription Sync] Sync complete, sending notification...',
    );

    // Send Discord notification with results
    await sendDiscordAdminNotification({
      title: '✅ Weekly Subscription Sync Complete',
      message: `Successfully synced ${stats.total} users with Stripe`,
      fields: [
        { name: '📝 Updated', value: stats.updated.toString(), inline: true },
        {
          name: '❌ Cancelled',
          value: stats.cancelled.toString(),
          inline: true,
        },
        {
          name: '🗑️ Invalid Customers',
          value: stats.invalidCustomers.toString(),
          inline: true,
        },
        {
          name: '✅ No Change',
          value: stats.noChange.toString(),
          inline: true,
        },
        { name: '⚠️ Errors', value: stats.errors.toString(), inline: true },
        { name: '📊 Total', value: stats.total.toString(), inline: true },
      ],
      priority: stats.errors > 0 ? 'high' : 'normal',
      category: 'analytics',
      dedupeKey: `subscription-sync-${new Date().toISOString().split('T')[0]}`,
    });

    console.log('[Weekly Subscription Sync] Notification sent');

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('[Weekly Subscription Sync] Sync failed:', error);

    try {
      await sendDiscordAdminNotification({
        title: '❌ Weekly Subscription Sync Failed',
        message: `Error: ${error.message || 'Unknown error'}`,
        priority: 'high',
        category: 'urgent',
      });
    } catch (discordError) {
      console.error(
        '[Weekly Subscription Sync] Failed to send error notification:',
        discordError,
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}
