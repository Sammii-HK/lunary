import { NextRequest, NextResponse } from 'next/server';
import { getUserReferralStats } from '@/lib/referrals';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }

    const stats = await getUserReferralStats(userId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to get referral stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to get referral stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
