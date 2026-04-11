import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * @deprecated BIP crons have moved to Spellcast.
 * Weekly: spellcast/apps/api/src/app/api/cron/bip-weekly/route.ts
 * Milestones: spellcast/apps/api/src/app/api/cron/bip-milestone-check/route.ts
 *
 * This route is kept as a no-op to avoid 404s if Vercel cron fires before
 * the config update deploys.
 */
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'BIP crons have moved to Spellcast',
  });
}
