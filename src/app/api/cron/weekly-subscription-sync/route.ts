import { NextRequest, NextResponse } from 'next/server';
import { sendDiscordAdminNotification } from '@/lib/discord';
import { runSync } from '../../../../../scripts/weekly-sync-cron';
import { sql } from '@vercel/postgres';

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Cleanup old pending_checkouts records
 * Removes completed/expired records older than 7 days
 */
async function cleanupPendingCheckouts(): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM pending_checkouts
      WHERE (
        status IN ('completed', 'expired', 'cancelled')
        OR expires_at < NOW() - INTERVAL '7 days'
        OR created_at < NOW() - INTERVAL '7 days'
      )
      RETURNING id
    `;
    return result.rowCount || 0;
  } catch (error) {
    console.error('[Cleanup] Failed to cleanup pending_checkouts:', error);
    return 0;
  }
}

/**
 * Cleanup old webhook events
 * Removes completed events older than 30 days
 */
async function cleanupWebhookEvents(): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM stripe_webhook_events
      WHERE processing_status = 'completed'
      AND created_at < NOW() - INTERVAL '30 days'
      RETURNING id
    `;
    return result.rowCount || 0;
  } catch (error) {
    console.error('[Cleanup] Failed to cleanup webhook events:', error);
    return 0;
  }
}

/**
 * Cleanup resolved orphaned subscriptions
 * Removes resolved records older than 30 days
 */
async function cleanupOrphanedSubscriptions(): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM orphaned_subscriptions
      WHERE resolved = TRUE
      AND resolved_at < NOW() - INTERVAL '30 days'
      RETURNING id
    `;
    return result.rowCount || 0;
  } catch (error) {
    console.error('[Cleanup] Failed to cleanup orphaned subscriptions:', error);
    return 0;
  }
}

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

    // Run cleanup tasks first
    console.log('[Weekly Subscription Sync] Running cleanup tasks...');
    const cleanupStats = {
      pendingCheckouts: await cleanupPendingCheckouts(),
      webhookEvents: await cleanupWebhookEvents(),
      orphanedSubscriptions: await cleanupOrphanedSubscriptions(),
    };
    console.log('[Weekly Subscription Sync] Cleanup complete:', cleanupStats);

    // Run the main sync
    const stats = await runSync();

    console.log(
      '[Weekly Subscription Sync] Sync complete, sending notification...',
    );

    // Send Discord notification with results
    const totalCleanup =
      cleanupStats.pendingCheckouts +
      cleanupStats.webhookEvents +
      cleanupStats.orphanedSubscriptions;

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
        {
          name: '🧹 Cleanup',
          value: `${totalCleanup} records`,
          inline: true,
        },
      ],
      priority: stats.errors > 0 ? 'high' : 'normal',
      category: 'analytics',
      dedupeKey: `subscription-sync-${new Date().toISOString().split('T')[0]}`,
    });

    console.log('[Weekly Subscription Sync] Notification sent');

    return NextResponse.json({
      success: true,
      stats,
      cleanup: cleanupStats,
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
