import { NextRequest, NextResponse } from 'next/server';
import {
  renderMetricsCard,
  renderMilestoneCard,
  renderFeatureLaunchCard,
} from '@/lib/video/bip-card-renderer';
import * as fs from 'node:fs';
import * as path from 'node:path';

export const dynamic = 'force-dynamic';

/**
 * Test route — renders a BIP card and returns it as a PNG.
 *
 * Usage:
 *   /api/test/bip-card                → metrics card (default)
 *   /api/test/bip-card?type=milestone → milestone card
 *   /api/test/bip-card?type=feature   → feature launch card
 */
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') ?? 'metrics';
  const outPath = path.join('/tmp', `bip-card-preview-${type}.png`);

  try {
    if (type === 'milestone') {
      await renderMilestoneCard(
        {
          metric: 'impressionsPerDay',
          value: 12300,
          threshold: 10000,
          context: 'started at 100/day in November',
          multiplier: '123x in 3 months',
        },
        outPath,
      );
    } else if (type === 'feature') {
      await renderFeatureLaunchCard(
        {
          featureName: 'Cosmic Score',
          tagline: 'Your daily cosmic alignment, scored',
          bullets: ['12 pattern types', 'real-time transits', 'personalised'],
          mau: 241,
          mrr: 22.5,
        },
        outPath,
      );
    } else {
      await renderMetricsCard(
        {
          weekLabel: 'week of 4 Mar',
          mau: 241,
          mauDelta: 5,
          mrr: 22.5,
          mrrDelta: 0,
          impressionsPerDay: 12300,
          impressionsDelta: 123,
          newSignups: 12,
          dau: 27,
        },
        outPath,
      );
    }

    const png = fs.readFileSync(outPath);
    return new NextResponse(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
