import { NextRequest, NextResponse } from 'next/server';
import { processReferralCode } from '@/lib/referrals';

export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json();

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Code and user ID are required' },
        { status: 400 },
      );
    }

    const result = await processReferralCode(code, userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to use referral code' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      referrerUserId: result.referrerUserId,
    });
  } catch (error) {
    console.error('Failed to use referral code:', error);
    return NextResponse.json(
      {
        error: 'Failed to use referral code',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
