import { NextRequest, NextResponse } from 'next/server';
import {
  buildGlobalCosmicData,
  saveGlobalCosmicData,
} from '@/lib/cosmic-snapshot/global-cache';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    console.log(
      '[update-global-cosmic-data] Starting update at',
      now.toISOString(),
    );

    const globalData = await buildGlobalCosmicData(now);
    await saveGlobalCosmicData(now, globalData);

    console.log(
      '[update-global-cosmic-data] Successfully updated global cosmic data',
    );

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      dataDate: now.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('[update-global-cosmic-data] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update global cosmic data',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
