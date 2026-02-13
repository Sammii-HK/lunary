import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserReferralStats, generateReferralCode } from '@/lib/referrals';
import { sql } from '@vercel/postgres';
import {
  getCurrentTier,
  getNextTier,
  REFERRAL_TIERS,
} from '@/utils/referrals/reward-tiers';

/**
 * GET /api/referrals
 * Auth required. Get user's referral stats + tier progress.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const stats = await getUserReferralStats(session.user.id);

    // Count activated referrals specifically
    const activatedResult = await sql`
      SELECT COUNT(*)::int AS count
      FROM user_referrals
      WHERE referrer_user_id = ${session.user.id} AND activated = true
    `;

    const activatedCount = activatedResult.rows[0]?.count ?? 0;

    const currentTier = getCurrentTier(activatedCount);
    const nextTier = getNextTier(activatedCount);

    return NextResponse.json({
      ...stats,
      activatedReferrals: activatedCount,
      currentTier: currentTier
        ? {
            threshold: currentTier.threshold,
            label: currentTier.label,
            description: currentTier.description,
          }
        : null,
      nextTier: nextTier
        ? {
            threshold: nextTier.threshold,
            label: nextTier.label,
            description: nextTier.description,
            progress: activatedCount,
          }
        : null,
      tiers: REFERRAL_TIERS.map((t) => ({
        threshold: t.threshold,
        label: t.label,
        description: t.description,
        reached: activatedCount >= t.threshold,
      })),
    });
  } catch (error) {
    console.error('[Referrals] GET failed:', error);
    return NextResponse.json(
      { error: 'Failed to load referral stats' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/referrals
 * Auth required. Generate/get referral code.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const code = await generateReferralCode(session.user.id);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

    return NextResponse.json({
      code,
      shareUrl: `${baseUrl}/signup?ref=${code}`,
    });
  } catch (error) {
    console.error('[Referrals] POST failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate referral code' },
      { status: 500 },
    );
  }
}
