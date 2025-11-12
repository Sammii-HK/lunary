import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Helper function to get trial period from Stripe product/price metadata
async function getTrialPeriodForPrice(priceId: string): Promise<number> {
  try {
    const stripe = getStripe();
    // Get the price and its associated product
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product'],
    });

    const product = price.product as Stripe.Product;

    // Check for trial period in product metadata first, then price metadata
    const trialPeriodDays =
      product.metadata?.trial_period_days ||
      price.metadata?.trial_period_days ||
      // Fallback to default values if no metadata is set
      (price.recurring?.interval === 'month' ? '7' : '14');

    return parseInt(trialPeriodDays);
  } catch (error) {
    console.error('Error fetching trial period from Stripe:', error);
    // Fallback to default values in case of error
    return 7; // default monthly trial
  }
}

export async function POST(request: NextRequest) {
  let priceId: string | undefined;
  try {
    const stripe = getStripe();
    const requestBody = await request.json();
    priceId = requestBody.priceId;
    const { customerId } = requestBody;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 },
      );
    }

    // Build base URL from request if env not set
    const originFromRequest = new URL(request.url).origin;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || originFromRequest;

    // Get the price to determine trial period from Stripe
    const price = await stripe.prices.retrieve(priceId);
    const isMonthly = price.recurring?.interval === 'month';

    // Fetch trial period from Stripe product/price metadata
    const trialDays = await getTrialPeriodForPrice(priceId);

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      subscription_data: {
        trial_period_days: trialDays,
        metadata: {
          planType: isMonthly ? 'monthly' : 'yearly',
        },
      },
      metadata: {
        planType: isMonthly ? 'monthly' : 'yearly',
      },
      // Enable promo codes in Stripe Checkout
      allow_promotion_codes: true,
    };

    // Apply promo/discount code if provided
    const { discountCode, promoCode, referralCode } = requestBody;

    // Handle promo codes (Stripe promotion codes)
    if (promoCode) {
      try {
        const promoCodes = await stripe.promotionCodes.list({
          code: promoCode,
          active: true,
        });

        if (promoCodes.data.length > 0) {
          const promoCodeObj = promoCodes.data[0];
          sessionConfig.discounts = [{ promotion_code: promoCodeObj.id }];
          console.log(`✅ Applied promo code: ${promoCode}`);
        } else {
          console.warn(`⚠️ Promo code not found: ${promoCode}`);
        }
      } catch (error) {
        console.error('Failed to apply promo code:', error);
        // Continue without promo code if invalid
      }
    }

    // Handle discount codes (for trial expired users - legacy)
    if (discountCode && !promoCode) {
      try {
        const promotionCodes = await stripe.promotionCodes.list({
          code: discountCode,
          limit: 1,
        });
        if (promotionCodes.data.length > 0) {
          sessionConfig.discounts = [
            { promotion_code: promotionCodes.data[0].id },
          ];
        }
      } catch (error) {
        console.error('Failed to apply discount code:', error);
        // Continue without discount if code is invalid
      }
    }

    // Handle referral code
    if (referralCode) {
      try {
        const { validateReferralCode } = await import('@/lib/referrals');
        const validation = await validateReferralCode(referralCode);
        if (validation.valid) {
          // Store referral code in metadata to process after successful checkout
          sessionConfig.metadata = {
            ...sessionConfig.metadata,
            referralCode,
            referrerUserId: validation.userId || null,
          };
        }
      } catch (error) {
        console.error('Failed to validate referral code:', error);
        // Continue without referral if code is invalid
      }
    }

    // If we have a customer ID, use it
    if (customerId) {
      sessionConfig.customer = customerId;
    }
    // Note: For subscription mode, Stripe automatically creates customers
    // so we don't need to set customer_creation

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      priceId,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    });
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
