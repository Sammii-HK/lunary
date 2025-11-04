import { NextRequest, NextResponse } from 'next/server';
import { MoonPackGenerator } from '../../../../../scripts/generate-moon-packs';
import {
  sendAdminNotification,
  NotificationTemplates,
} from '../../../../../utils/notifications/pushNotifications';

export const runtime = 'nodejs';

/**
 * Automated Moon Pack Generation Endpoint
 *
 * This endpoint is designed to be called by cron jobs to automatically
 * generate moon phase packs on a schedule.
 *
 * Query parameters:
 * - type: monthly|quarterly|yearly|all (default: all)
 * - dry-run: true|false (default: false)
 *
 * Expected to be called:
 * - Weekly for monthly packs
 * - Monthly for quarterly packs
 * - Monthly (July+) for yearly packs
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is being called by an authorized source
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type =
      (searchParams.get('type') as
        | 'monthly'
        | 'quarterly'
        | 'yearly'
        | 'all') || 'all';
    const dryRun = searchParams.get('dry-run') === 'true';

    console.log(
      `🌙 Cron job triggered: Moon pack generation (${type})${dryRun ? ' [DRY RUN]' : ''}`,
    );

    const generator = new MoonPackGenerator(dryRun);

    // Run the generation
    await generator.generatePacks(type);
    await generator.cleanup();

    const createdPacks = generator.getCreatedPacks();

    console.log(
      `✅ Cron job completed successfully. Created ${createdPacks.length} packs`,
    );

    // Send notifications for created packs
    if (createdPacks.length > 0 && !dryRun) {
      console.log(
        `📱 Sending notifications for ${createdPacks.length} created packs`,
      );
      for (const pack of createdPacks) {
        try {
          await sendAdminNotification(
            NotificationTemplates.packCreated(pack.name, pack.sku, {
              amount: pack.price,
            }),
          );
          console.log(`✅ Notification sent for pack: ${pack.name}`);
        } catch (error) {
          console.error(
            `❌ Failed to send notification for pack ${pack.name}:`,
            error,
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Moon pack generation completed (${type})`,
      timestamp: new Date().toISOString(),
      dryRun,
      packsCreated: createdPacks.length,
      packs: createdPacks,
    });
  } catch (error: any) {
    console.error('❌ Cron job failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Moon pack generation failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * Health check endpoint for monitoring
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    status: 'healthy',
    service: 'moon-pack-generator',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
}
