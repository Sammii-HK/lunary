import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/* -------------------------------------------------------------------------- */
/* POST – Create Stripe Checkout session                                       */
/* -------------------------------------------------------------------------- */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packId, stripePriceId } = body;

    if (!packId || !stripePriceId) {
      return NextResponse.json(
        { error: 'Missing packId or stripePriceId' },
        { status: 400 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const downloadToken = crypto.randomUUID().replace(/-/g, '');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      allow_promotion_codes: true,

      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],

      success_url: `${baseUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/shop`,

      metadata: {
        purchaseType: 'digital_pack',
        packId,
        downloadToken,
        userId: 'anonymous',
      },
    });

    return NextResponse.json({
      checkoutUrl: session.url,
    });
  } catch (err: any) {
    console.error('❌ Failed to create checkout session:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}

/* -------------------------------------------------------------------------- */
/* GET – Fetch completed purchase by session_id                                */
/* -------------------------------------------------------------------------- */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id' },
        { status: 400 },
      );
    }

    const result = await sql`
      SELECT
        id,
        pack_id,
        amount,
        currency,
        download_token,
        blob_url,
        status
      FROM shop_purchases
      WHERE stripe_session_id = ${sessionId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const row = result.rows[0];

    if (!row) {
      return NextResponse.json(
        {
          error: 'Purchase not found yet. Webhook may still be processing.',
        },
        { status: 404 },
      );
    }

    if (row.status !== 'completed') {
      return NextResponse.json(
        { error: `Purchase status is ${row.status}` },
        { status: 409 },
      );
    }

    return NextResponse.json({
      purchase: {
        id: row.id,
        packId: row.pack_id,
        amount: row.amount,
        currency: row.currency,
        downloadToken: row.download_token,
      },
      downloadUrl: `/api/shop/download/${row.download_token}`,
    });
  } catch (err) {
    console.error('❌ Failed to fetch purchase:', err);
    return NextResponse.json(
      { error: 'Failed to fetch purchase details' },
      { status: 500 },
    );
  }
}
