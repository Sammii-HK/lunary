import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { requireUser } from '@/lib/ai/auth';
import { getOneTimePriceId } from '../../../../../utils/stripe-prices';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let stripeClient: Stripe | null = null;

function getStripeClient() {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeClient = new Stripe(secretKey);
  }
  return stripeClient;
}

const checkoutSchema = z.object({
  report_type: z.enum(['weekly', 'monthly', 'custom']).default('monthly'),
  date_range: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .optional(),
  email: z.string().email().optional(),
});

/**
 * POST /api/cosmic-report/checkout
 *
 * Buy-once door for the personalised Cosmic Report. This is the lower-commitment
 * paid path that sits alongside the 7-day Pro trial (which keeps the report as a
 * recurring perk). It does NOT gate any existing free feature — the free birth
 * chart stays free and free/Plus users still see the teaser preview.
 *
 * One-time (mode: 'payment') checkout, reusing the same Stripe rails as the
 * /shop digital packs. The buyer's userId + report parameters travel in
 * checkout metadata so the shop webhook can generate THEIR personalised report
 * and email the on-demand PDF link after payment completes.
 */
export async function POST(request: NextRequest) {
  let user;
  try {
    user = await requireUser(request);
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          'Please sign in so we can build the report from your birth chart.',
        requiresAuth: true,
      },
      { status: 401 },
    );
  }

  // No invented live price ids: the one-time price is created by Sammii in
  // Stripe and supplied via env. Until then, fail loudly rather than charge the
  // wrong product.
  const priceId = getOneTimePriceId('cosmic_report');
  if (!priceId) {
    console.error(
      '[cosmic-report/checkout] STRIPE_PRICE_COSMIC_REPORT is not configured',
    );
    return NextResponse.json(
      {
        success: false,
        message: 'One-time report purchase is not available yet.',
        notConfigured: true,
      },
      { status: 503 },
    );
  }

  let parsed: z.infer<typeof checkoutSchema>;
  try {
    const body = await request.json().catch(() => ({}));
    parsed = checkoutSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload', issues: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const buyerEmail = parsed.email || user.email || undefined;

  try {
    const session = await getStripeClient().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      ...(buyerEmail ? { customer_email: buyerEmail } : {}),
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/cosmic-report-generator?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cosmic-report-generator?purchase=cancelled`,
      client_reference_id: user.id,
      metadata: {
        purchaseType: 'cosmic_report',
        userId: user.id,
        reportType: parsed.report_type,
        rangeStart: parsed.date_range?.start ?? '',
        rangeEnd: parsed.date_range?.end ?? '',
        deliveryEmail: buyerEmail ?? '',
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error('[cosmic-report/checkout] Failed to create session:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to start checkout' },
      { status: 500 },
    );
  }
}
