import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import Stripe from 'stripe';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import {
  renderPaymentFailedEmail,
  type PaymentFailedDayOffset,
} from '@/lib/email-components/PaymentFailedEmails';

export const dynamic = 'force-dynamic';

/**
 * Dunning (failed-payment recovery) endpoint.
 *
 * Triggered by the Mini-side dunning-agent (coo-scripts) on an hourly cron.
 * The agent is the scheduler; this endpoint owns rendering, Resend delivery
 * and event tracking (keeping templates + creds where they belong).
 *
 * Request body:
 *   {
 *     "subscription_id": "sub_...",
 *     "day_offset": 1 | 3 | 7
 *   }
 *
 * Auth: CRON_SECRET bearer token, same pattern as other /api/cron/* routes.
 */

const ALLOWED_DAY_OFFSETS: PaymentFailedDayOffset[] = [1, 3, 7];

const payloadSchema = z.object({
  subscription_id: z.string().min(3).max(120),
  day_offset: z.union([z.literal(1), z.literal(3), z.literal(7)]),
});

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-09-30' as Stripe.LatestApiVersion,
    });
  }
  return stripeClient;
}

export async function POST(request: NextRequest) {
  // Auth
  const authHeader = request.headers.get('authorization');
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { subscription_id, day_offset } = parsed.data;

  // Defence in depth, belt and braces for the day_offset union
  if (!ALLOWED_DAY_OFFSETS.includes(day_offset)) {
    return NextResponse.json(
      { error: 'Unsupported day_offset' },
      { status: 400 },
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 },
    );
  }

  try {
    // Load subscription + customer from Stripe. Treat Stripe as the source of
    // truth for whether the account is actually past_due, so we never send a
    // dunning email to someone whose card has already recovered.
    const subscription = await stripe.subscriptions.retrieve(subscription_id);

    if (
      subscription.status !== 'past_due' &&
      subscription.status !== 'unpaid'
    ) {
      return NextResponse.json({
        skipped: true,
        reason: `subscription_status=${subscription.status}`,
        subscription_id,
        day_offset,
      });
    }

    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id;
    if (!customerId) {
      return NextResponse.json(
        { error: 'No customer on subscription' },
        { status: 404 },
      );
    }

    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) {
      return NextResponse.json({ error: 'Customer deleted' }, { status: 404 });
    }

    const email = customer.email;
    if (!email) {
      return NextResponse.json(
        { error: 'No email on customer' },
        { status: 404 },
      );
    }

    const userName = customer.name || email.split('@')[0] || 'there';

    // Resolve our userId for notification tracking
    let userId: string | null =
      (customer.metadata?.userId as string | undefined) || null;
    if (!userId) {
      try {
        const match = await sql`
          SELECT user_id FROM subscriptions
          WHERE stripe_customer_id = ${customerId}
          LIMIT 1
        `;
        userId = (match.rows[0]?.user_id as string | undefined) || null;
      } catch (error) {
        console.error('[dunning] Failed to resolve userId:', error);
      }
    }

    // Billing portal link for card update
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
    let billingPortalUrl = `${baseUrl}/pricing`;
    try {
      const portal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: baseUrl,
      });
      billingPortalUrl = portal.url;
    } catch (portalError) {
      console.error(
        '[dunning] Failed to create billing portal session:',
        portalError,
      );
    }

    const { subject, html, text } = await renderPaymentFailedEmail(
      day_offset,
      userName,
      billingPortalUrl,
      email,
    );

    const notificationId = `dunning-${subscription_id}-day${day_offset}`;

    const result = await sendEmail({
      to: email,
      subject,
      html,
      text,
      tracking: {
        userId: userId || undefined,
        notificationType: 'payment_failed_dunning',
        notificationId,
        utm: {
          source: 'email',
          medium: 'lifecycle',
          campaign: 'dunning',
          content: `day${day_offset}`,
        },
      },
    });

    return NextResponse.json({
      sent: true,
      subscription_id,
      day_offset,
      notification_id: notificationId,
      email_id:
        'id' in (result as Record<string, unknown>)
          ? (result as { id: string }).id
          : undefined,
    });
  } catch (error) {
    console.error('[dunning] Cron error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send dunning email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
