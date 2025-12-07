import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

function generateId(): string {
  return `ref_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    const { reason } = await request.json();

    // Check for existing pending refund request
    const existingRequest = await sql`
      SELECT id FROM refund_requests 
      WHERE user_id = ${userId} AND status = 'pending'
      LIMIT 1
    `;

    if (existingRequest.rows.length > 0) {
      return NextResponse.json(
        { error: 'You already have a pending refund request' },
        { status: 400 },
      );
    }

    // Get subscription info
    const subscription = await sql`
      SELECT * FROM subscriptions 
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    const sub = subscription.rows[0];

    if (!sub || sub.status === 'free' || !sub.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 },
      );
    }

    // Get Stripe subscription to check eligibility
    let stripeSubscription: Stripe.Subscription | null = null;
    let eligible = false;
    let eligibilityReason = '';
    let amountCents = 0;

    try {
      stripeSubscription = await stripe.subscriptions.retrieve(
        sub.stripe_subscription_id,
      );

      const subscriptionStart = new Date(
        (stripeSubscription as any).current_period_start * 1000,
      );
      const now = new Date();
      const daysSinceStart = Math.floor(
        (now.getTime() - subscriptionStart.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Determine plan type from interval
      const interval = stripeSubscription.items.data[0]?.price?.recurring
        ?.interval as string;
      const isMonthly = interval === 'month';
      const isAnnual = interval === 'year';

      // Check eligibility based on plan type
      if (isMonthly && daysSinceStart <= 7) {
        eligible = true;
        eligibilityReason =
          'Within 7-day refund window for monthly subscription';
        amountCents = stripeSubscription.items.data[0]?.price?.unit_amount || 0;
      } else if (isAnnual && daysSinceStart <= 30) {
        eligible = true;
        // Prorated refund for annual
        const daysInPeriod = 365;
        const unusedDays = daysInPeriod - daysSinceStart;
        const totalAmount =
          stripeSubscription.items.data[0]?.price?.unit_amount || 0;
        amountCents = Math.floor((unusedDays / daysInPeriod) * totalAmount);
        eligibilityReason = `Prorated refund for ${unusedDays} unused days of annual subscription`;
      } else {
        eligibilityReason = isMonthly
          ? 'Monthly subscription refund window (7 days) has passed'
          : 'Annual subscription refund window (30 days) has passed';
      }
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      eligibilityReason =
        'Unable to verify subscription status - our team will review manually';
    }

    // Create refund request
    const requestId = generateId();
    await sql`
      INSERT INTO refund_requests (
        id, user_id, user_email, stripe_subscription_id, stripe_customer_id,
        plan_type, subscription_start, amount_cents, reason, status,
        eligible, eligibility_reason
      ) VALUES (
        ${requestId},
        ${userId},
        ${userEmail},
        ${sub.stripe_subscription_id},
        ${sub.stripe_customer_id},
        ${sub.plan_type},
        ${(stripeSubscription as any)?.current_period_start ? new Date((stripeSubscription as any).current_period_start * 1000).toISOString() : null},
        ${amountCents},
        ${reason || null},
        'pending',
        ${eligible},
        ${eligibilityReason}
      )
    `;

    // If eligible, auto-process the refund
    if (eligible && stripeSubscription) {
      try {
        // Get the latest invoice for this subscription
        const invoices = await stripe.invoices.list({
          subscription: sub.stripe_subscription_id,
          limit: 1,
        });

        const invoice = invoices.data[0] as any;
        if (invoices.data.length > 0 && invoice?.payment_intent) {
          const refund = await stripe.refunds.create({
            payment_intent: invoice.payment_intent as string,
            amount: amountCents,
            reason: 'requested_by_customer',
          });

          // Cancel the subscription
          await stripe.subscriptions.cancel(sub.stripe_subscription_id);

          // Update refund request as processed
          await sql`
            UPDATE refund_requests
            SET status = 'approved', processed_at = NOW(), refund_id = ${refund.id}
            WHERE id = ${requestId}
          `;

          // Update subscription status
          await sql`
            UPDATE subscriptions
            SET status = 'cancelled', updated_at = NOW()
            WHERE user_id = ${userId}
          `;

          return NextResponse.json({
            success: true,
            message: 'Refund processed successfully',
            refundAmount: amountCents / 100,
            status: 'approved',
          });
        }
      } catch (refundError) {
        console.error('Auto-refund failed:', refundError);
        // Fall through to manual review
      }
    }

    return NextResponse.json({
      success: true,
      message: eligible
        ? 'Refund request submitted for processing'
        : 'Refund request submitted for review',
      eligible,
      eligibilityReason,
      status: 'pending',
    });
  } catch (error) {
    console.error('Refund request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit refund request' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await sql`
      SELECT id, status, eligible, eligibility_reason, amount_cents, created_at, processed_at
      FROM refund_requests
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ requests: requests.rows });
  } catch (error) {
    console.error('Get refund requests error:', error);
    return NextResponse.json(
      { error: 'Failed to get refund requests' },
      { status: 500 },
    );
  }
}
