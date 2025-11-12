import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function getWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET_SHOP;
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const webhookSecret = getWebhookSecret();

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 },
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } else {
        // Parse without verification for development
        event = JSON.parse(body);
      }
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Received shop webhook event:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'invoice.payment_succeeded':
        // For subscription-based products (if added later)
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice,
        );
        break;

      default:
        console.log(`Unhandled shop event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Shop webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('🛒 Checkout completed:', session.id);

  const { packId, userId, downloadToken, purchaseType } =
    session.metadata || {};

  if (purchaseType !== 'digital_pack') {
    console.log('Skipping non-digital-pack checkout');
    return;
  }

  if (!packId || !downloadToken) {
    console.error('Missing required metadata in checkout session');
    return;
  }

  try {
    const stripe = getStripe();
    // Get product from Stripe to retrieve Blob URL (SSOT)
    let blobUrl: string | undefined;
    let packName = 'Digital Pack';

    if (session.line_items) {
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        { expand: ['data.price.product'] },
      );

      if (lineItems.data.length > 0) {
        const price = lineItems.data[0].price;
        if (price && typeof price.product !== 'string') {
          const product = price.product as Stripe.Product;
          packName = product.name;
          // Get Blob URL from product metadata (SSOT)
          blobUrl = product.metadata?.blobUrl;

          console.log('📦 Retrieved pack info from Stripe (SSOT):', {
            productId: product.id,
            packName,
            hasBlobUrl: !!blobUrl,
          });
        }
      }
    }

    // Create purchase record in database
    const purchase = {
      id: generateRandomId(),
      userId: userId || 'anonymous',
      packId,
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
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

    // In production, save to database
    console.log('💾 Purchase record created:', {
      purchaseId: purchase.id,
      packId,
      amount: session.amount_total,
      customerEmail: session.customer_details?.email,
    });

    // Send confirmation email (optional)
    if (session.customer_details?.email) {
      await sendPurchaseConfirmationEmail(
        session.customer_details.email,
        purchase,
      );
    }
  } catch (error) {
    console.error('Failed to process completed checkout:', error);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('💳 Payment succeeded:', paymentIntent.id);

  // Update purchase status if needed
  // This is typically handled in checkout.session.completed
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id);

  // Handle failed payment - maybe send notification
  // Update purchase status to 'failed'
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('📧 Invoice payment succeeded:', invoice.id);

  // Handle subscription renewals if implemented
}

async function sendPurchaseConfirmationEmail(email: string, purchase: any) {
  try {
    // In production, integrate with your email service (Resend, etc.)
    console.log(`📧 Would send confirmation email to: ${email}`);
    console.log('Purchase details:', {
      id: purchase.id,
      amount: purchase.amount,
      downloadToken: purchase.downloadToken,
    });

    // Example email content:
    // - Thank you for your purchase
    // - Download link with token
    // - Purchase details
    // - Support information
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }
}

function generateRandomId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}
