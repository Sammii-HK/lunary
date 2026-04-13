import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { STRIPE_PRICE_MAPPING } from '@utils/stripe-prices';

export const dynamic = 'force-dynamic';

const API_TIER_PLAN_IDS: Record<string, keyof typeof STRIPE_PRICE_MAPPING> = {
  starter: 'api_starter',
  developer: 'api_developer',
  business: 'api_business',
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { tier } = await request.json();

    if (!tier || !API_TIER_PLAN_IDS[tier]) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be: starter, developer, or business' },
        { status: 400 },
      );
    }

    const planId = API_TIER_PLAN_IDS[tier];
    const priceData = STRIPE_PRICE_MAPPING[planId];
    const priceId = priceData?.USD?.priceId;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not configured for this tier' },
        { status: 500 },
      );
    }

    // Redirect to the existing checkout flow
    const origin = new URL(request.url).origin;
    const checkoutResponse = await fetch(
      `${origin}/api/stripe/create-checkout-session`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: session.user.id,
          userEmail: session.user.email,
        }),
      },
    );

    const checkoutData = await checkoutResponse.json();

    if (checkoutData.url) {
      return NextResponse.json({ url: checkoutData.url });
    }

    if (checkoutData.portalUrl) {
      return NextResponse.json({ url: checkoutData.portalUrl });
    }

    return NextResponse.json(checkoutData, { status: checkoutResponse.status });
  } catch (error) {
    console.error('API upgrade error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
