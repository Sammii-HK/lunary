import { NextRequest, NextResponse } from 'next/server';
import { sendDiscordAdminNotification } from '@/lib/discord';
import {
  buildFxDriftReport,
  DEFAULT_FX_URL,
  REVIEW_THRESHOLD,
  UPDATE_THRESHOLD,
} from '../../../../../utils/fx-drift';
import { resolveFxDriftUpdates } from '../../../../../utils/fx-drift-resolve';

function shouldRunThisMonth(cadenceMonths: number, now: Date): boolean {
  if (!Number.isFinite(cadenceMonths) || cadenceMonths <= 0) {
    return false;
  }
  if (cadenceMonths === 6) {
    return [0, 6].includes(now.getUTCMonth());
  }
  if (cadenceMonths === 3) {
    return [0, 3, 6, 9].includes(now.getUTCMonth());
  }
  return now.getUTCMonth() % cadenceMonths === 0;
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
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

    const cadenceMonths = Number(process.env.FX_DRIFT_CADENCE_MONTHS || '3');
    const now = new Date();

    if (!shouldRunThisMonth(cadenceMonths, now)) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: `Cadence ${cadenceMonths} months; not scheduled this month`,
      });
    }

    const autoApply = process.env.FX_DRIFT_AUTO_APPLY === 'true';
    const { results } = await buildFxDriftReport();
    const flagged = results.filter(
      (result) => result.driftPercent >= REVIEW_THRESHOLD,
    );
    const updates = flagged.filter(
      (result) => result.driftPercent >= UPDATE_THRESHOLD,
    );

    let appliedUpdatesCount = 0;
    let appliedUpdatesDetails: string[] = [];
    if (autoApply && updates.length > 0) {
      const resolveResult = await resolveFxDriftUpdates({
        apply: true,
        updateMap: false,
        updateThreshold: UPDATE_THRESHOLD,
      });
      appliedUpdatesCount = resolveResult.updates.length;
      appliedUpdatesDetails = resolveResult.updates
        .slice(0, 10)
        .map(
          (update) =>
            `${update.planId} ${update.currency} ${update.fromAmount}→${update.toAmount}`,
        );
    }

    const fields = flagged.slice(0, 15).map((result) => ({
      name: `${result.planId} • ${result.currency} (${result.interval || 'n/a'})`,
      value: [
        `Stored: ${result.storedAmount}`,
        `Anchor: ${result.anchor}`,
        `Drift: ${formatPercent(result.driftPercent)}`,
      ].join(' | '),
      inline: false,
    }));

    await sendDiscordAdminNotification({
      title: autoApply ? 'FX Drift Review (Auto-Apply)' : 'FX Drift Review',
      message: `FX drift check completed. Flagged: ${flagged.length} / ${results.length}. Updates recommended: ${updates.length}. Applied: ${appliedUpdatesCount}.`,
      fields,
      priority: flagged.length > 0 ? 'normal' : 'low',
      category: 'analytics',
      dedupeKey: `fx-drift-${now.getUTCFullYear()}-${now.getUTCMonth() + 1}`,
      url: process.env.FX_RATE_API_URL || DEFAULT_FX_URL,
    });

    return NextResponse.json({
      success: true,
      checked: results.length,
      flagged: flagged.length,
      updates: updates.length,
      applied: appliedUpdatesCount,
      appliedDetails: appliedUpdatesDetails,
    });
  } catch (error) {
    console.error('[fx-drift] Cron failed:', error);

    try {
      await sendDiscordAdminNotification({
        title: 'FX Drift Check Failed',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        priority: 'high',
        category: 'urgent',
      });
    } catch (discordError) {
      console.error('[fx-drift] Discord notification failed:', discordError);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
