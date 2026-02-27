import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import {
  runStripeFirstPass,
  StripeFirstPassStats,
} from '../../../../../scripts/weekly-sync-cron';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Full Stripe pagination can take a few minutes for large accounts
export const maxDuration = 300;

async function handleSync(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  console.log('[Stripe Sync] Full Stripe-first pass starting...');
  const stats: StripeFirstPassStats = await runStripeFirstPass();
  console.log('[Stripe Sync] Complete:', stats);

  return NextResponse.json({ success: true, stats });
}

// GET — invoked by nightly Vercel cron (x-vercel-cron: 1)
export async function GET(request: NextRequest) {
  try {
    return await handleSync(request);
  } catch (error: any) {
    console.error('[Stripe Sync] Cron run failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500 },
    );
  }
}

// POST — invoked manually from the admin dashboard
export async function POST(request: NextRequest) {
  try {
    return await handleSync(request);
  } catch (error: any) {
    console.error('[Stripe Sync] Manual run failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500 },
    );
  }
}
