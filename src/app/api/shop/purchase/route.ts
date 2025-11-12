import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import crypto from 'crypto';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateRandomId(): string {
  return crypto.randomBytes(16).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const body = await request.json();
    const { packId, userId, stripePriceId } = body;

    if (!packId || !stripePriceId) {
      return NextResponse.json(
        { error: 'Missing required fields: packId, stripePriceId' },
        { status: 400 },
      );
    }

    console.log(`🛒 Creating purchase session for pack: ${packId}`);

    // Generate secure download token
    const downloadToken = generateRandomToken();

    // Build base URL from request
    const originFromRequest = new URL(request.url).origin;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || originFromRequest;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', // One-time payment for digital products
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}&download_token=${downloadToken}`,
      cancel_url: `${baseUrl}/shop?cancelled=true`,
      metadata: {
        packId,
        userId: userId || 'anonymous',
        downloadToken,
        purchaseType: 'digital_pack',
      },
      // Enable automatic tax calculation if configured
      automatic_tax: { enabled: false },
      // Collect customer email for receipt
      customer_email: undefined, // Will be collected during checkout
    });

    console.log(`✅ Stripe checkout session created: ${session.id}`);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
      downloadToken, // Store this for later verification
    });
  } catch (error: any) {
    console.error('❌ Failed to create purchase session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create purchase session' },
      { status: 500 },
    );
  }
}

// Handle successful payment completion
export async function GET(request: NextRequest) {
  try {
    const stripe = getStripe();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 },
      );
    }

    console.log(`🔍 Retrieving purchase session: ${sessionId}`);

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 },
      );
    }

    const { packId, userId, downloadToken } = session.metadata || {};

    if (!packId || !downloadToken) {
      return NextResponse.json(
        { error: 'Invalid session metadata' },
        { status: 400 },
      );
    }

    // Get product from Stripe to retrieve Blob URL (SSOT)
    let blobUrl: string | undefined;
    let packName = 'Digital Pack';

    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
      expand: ['data.price.product'],
    });

    if (lineItems.data.length > 0) {
      const price = lineItems.data[0].price;
      if (price && typeof price.product !== 'string') {
        const product = price.product as Stripe.Product;
        packName = product.name;
        // Get Blob URL from product metadata (SSOT)
        blobUrl = product.metadata?.blobUrl;
      }
    }

    // Create purchase record
    const purchase = {
      id: generateRandomId(),
      userId: userId || 'anonymous',
      packId,
      stripeSessionId: sessionId,
      stripePaymentIntentId: (session.payment_intent as Stripe.PaymentIntent)
        ?.id,
      status: 'completed',
      amount: session.amount_total || 0,
      downloadToken,
      downloadCount: 0,
      maxDownloads: 5,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pack: {
        id: packId,
        name: packName,
        downloadUrl: blobUrl, // From Stripe metadata (SSOT)
      },
    };

    // In production, save purchase to database
    console.log(`💾 Purchase completed:`, {
      purchaseId: purchase.id,
      packId,
      amount: session.amount_total,
      customerEmail: session.customer_details?.email,
    });

    return NextResponse.json({
      success: true,
      purchase,
      downloadUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/shop/download/${downloadToken}`,
    });
  } catch (error: any) {
    console.error('❌ Failed to process purchase completion:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process purchase' },
      { status: 500 },
    );
  }
}
