import { NextRequest, NextResponse } from 'next/server';
import { generateReferralCode, getReferralCode } from '@/lib/referrals';
import { conversionTracking } from '@/lib/analytics';

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

    let code = await getReferralCode(userId);
    if (!code) {
      code = await generateReferralCode(userId);
    }

    return NextResponse.json({ code });
  } catch (error) {
    console.error('Failed to get referral code:', error);
    return NextResponse.json(
      {
        error: 'Failed to get referral code',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }

    const code = await generateReferralCode(userId);

    // Track referral code generation
    conversionTracking.referralCodeGenerated(userId);

    return NextResponse.json({ code });
  } catch (error) {
    console.error('Failed to generate referral code:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate referral code',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
