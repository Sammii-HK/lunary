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
 * Two entry points, one shared send path:
 *
 *  - GET  — Vercel cron scan. Lists Stripe subscriptions in `past_due` /
 *           `unpaid`, derives the day-offset (1 / 3 / 7) from the failed
 *           invoice's age, de-dupes per failed-payment cycle, and sends the
 *           matching recovery email. This is the self-scheduling path.
 *  - POST — single-subscription send, kept for the Mini-side dunning agent
 *           (coo-scripts), which passes { subscription_id, day_offset }.
 *
 * Auth: CRON_SECRET bearer token, same pattern as the other /api/cron/* GET
 * routes (e.g. trial-reminders, annual-renewal-reminders).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * SAFETY — this route sends NOTHING by default.
 *
 * All real sending is gated behind the DUNNING_DRY_RUN env flag, which
 * DEFAULTS TO DRY-RUN. Only the exact string "false" enables live sends; any
 * other value (including unset, "true", "1", "no") keeps it in dry-run, where
 * it logs what it WOULD send and sends nothing.
 *
 * To take dunning live (Sammii's explicit, deliberate steps — do NOT do these
 * as part of this PR):
 *   1. Set env var  DUNNING_DRY_RUN=false  in the Vercel project.
 *   2. Add a cron entry to vercel.json so Vercel actually fires the GET, e.g.
 *        { "path": "/api/cron/dunning", "schedule": "0 10 * * *" }
 *      This route is intentionally NOT in vercel.json, so it cannot auto-fire
 *      until that entry is added.
 * ─────────────────────────────────────────────────────────────────────────
 */

const ALLOWED_DAY_OFFSETS: PaymentFailedDayOffset[] = [1, 3, 7];

const payloadSchema = z.object({
  subscription_id: z.string().min(3).max(120),
  day_offset: z.union([z.literal(1), z.literal(3), z.literal(7)]),
});

// Stripe subscription statuses that mean "payment has failed and recovery is
// still possible". We treat Stripe as the source of truth so we never email
// someone whose card has already recovered.
const RECOVERABLE_STATUSES: ReadonlyArray<Stripe.Subscription.Status> = [
  'past_due',
  'unpaid',
];

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

/**
 * Dry-run is the default. Live sending requires DUNNING_DRY_RUN to be exactly
 * the string "false". Anything else (unset included) stays in dry-run.
 */
function isDryRun(): boolean {
  return process.env.DUNNING_DRY_RUN !== 'false';
}

/**
 * Map the age (in whole days) of the oldest still-failing invoice to one of
 * the three dunning touchpoints. Below the day-1 threshold we send nothing
 * (Stripe is still on its first automatic retry). We pick the latest threshold
 * the age has crossed so a late cron run still lands on the right email.
 */
function deriveDayOffset(
  daysSinceFailure: number,
): PaymentFailedDayOffset | null {
  if (daysSinceFailure >= 7) return 7;
  if (daysSinceFailure >= 3) return 3;
  if (daysSinceFailure >= 1) return 1;
  return null;
}

/**
 * When did this subscription's payment first start failing? Prefer the
 * invoice's `status_transitions.finalized_at` (when it became payable), then
 * fall back to the invoice `created` timestamp.
 */
function failedAtFromInvoice(invoice: Stripe.Invoice | null): Date | null {
  if (!invoice) return null;
  const finalizedAt = invoice.status_transitions?.finalized_at ?? null;
  const created = invoice.created ?? null;
  const epochSeconds = finalizedAt || created;
  if (!epochSeconds) return null;
  return new Date(epochSeconds * 1000);
}

/**
 * De-dupe key for a single dunning send. Keyed on the failing INVOICE id (not
 * just the subscription) so a brand-new failed-payment cycle — which always
 * produces a new invoice — re-arms the sequence cleanly, while the same
 * (invoice, day-bucket) is never emailed twice. Falls back to the subscription
 * id if no invoice id is available.
 */
function buildNotificationId(
  subscriptionId: string,
  invoiceId: string | null,
  dayOffset: PaymentFailedDayOffset,
): string {
  const cycleKey = invoiceId || subscriptionId;
  return `dunning-${cycleKey}-day${dayOffset}`;
}

/**
 * Has a dunning email with this notification id already been recorded as
 * sent? Reuses the existing analytics_notification_events trail that
 * sendEmail() writes to (notification_type = 'payment_failed_dunning'), so the
 * GET scan and the POST agent path share one de-dupe ledger and never
 * double-send. Fails closed (treat as already-sent) on a tracking error so an
 * outage can never cause a duplicate blast.
 */
async function alreadySent(notificationId: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT 1
      FROM analytics_notification_events
      WHERE notification_type = 'payment_failed_dunning'
      AND notification_id = ${notificationId}
      AND event_type = 'sent'
      LIMIT 1
    `;
    return result.rows.length > 0;
  } catch (error) {
    console.error(
      '[dunning] De-dupe lookup failed, skipping to be safe:',
      error,
    );
    return true;
  }
}

interface DunningTarget {
  subscriptionId: string;
  customerId: string;
  email: string;
  userName: string;
  userId: string | null;
  dayOffset: PaymentFailedDayOffset;
  invoiceId: string | null;
}

interface SendOutcome {
  status: 'sent' | 'dry_run' | 'skipped_duplicate' | 'error';
  subscriptionId: string;
  dayOffset: PaymentFailedDayOffset;
  notificationId: string;
  emailId?: string;
  error?: string;
}

/**
 * Resolve our internal userId for notification tracking. Prefers the Stripe
 * customer metadata, falls back to the local subscriptions table.
 */
async function resolveUserId(
  customer: Stripe.Customer,
  customerId: string,
): Promise<string | null> {
  const fromMetadata =
    (customer.metadata?.userId as string | undefined) || null;
  if (fromMetadata) return fromMetadata;
  try {
    const match = await sql`
      SELECT user_id FROM subscriptions
      WHERE stripe_customer_id = ${customerId}
      LIMIT 1
    `;
    return (match.rows[0]?.user_id as string | undefined) || null;
  } catch (error) {
    console.error('[dunning] Failed to resolve userId:', error);
    return null;
  }
}

/**
 * Build a Stripe billing-portal link so the customer can update their card in
 * one click. Falls back to /pricing if the portal session cannot be created.
 */
async function buildBillingPortalUrl(
  stripe: Stripe,
  customerId: string,
): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: baseUrl,
    });
    return portal.url;
  } catch (portalError) {
    console.error(
      '[dunning] Failed to create billing portal session:',
      portalError,
    );
    return `${baseUrl}/pricing`;
  }
}

/**
 * The single shared send path used by both GET (scan) and POST (agent).
 * Honours the dry-run gate and the per-cycle de-dupe. Sends at most one email.
 */
async function sendDunningEmail(
  stripe: Stripe,
  target: DunningTarget,
): Promise<SendOutcome> {
  const notificationId = buildNotificationId(
    target.subscriptionId,
    target.invoiceId,
    target.dayOffset,
  );

  // De-dupe: at most one email per (failed-payment cycle, day-bucket).
  if (await alreadySent(notificationId)) {
    return {
      status: 'skipped_duplicate',
      subscriptionId: target.subscriptionId,
      dayOffset: target.dayOffset,
      notificationId,
    };
  }

  // SAFETY GATE. In dry-run (the default) we log and send nothing.
  if (isDryRun()) {
    console.log(
      `[dunning][DRY-RUN] WOULD send day-${target.dayOffset} recovery email`,
      {
        subscriptionId: target.subscriptionId,
        dayOffset: target.dayOffset,
        notificationId,
        // Never log the raw email address; presence only, to avoid leaking PII
        // into logs while still confirming a recipient is present.
        recipientPresent: Boolean(target.email),
      },
    );
    return {
      status: 'dry_run',
      subscriptionId: target.subscriptionId,
      dayOffset: target.dayOffset,
      notificationId,
    };
  }

  const billingPortalUrl = await buildBillingPortalUrl(
    stripe,
    target.customerId,
  );

  const { subject, html, text } = await renderPaymentFailedEmail(
    target.dayOffset,
    target.userName,
    billingPortalUrl,
    target.email,
  );

  const result = await sendEmail({
    to: target.email,
    subject,
    html,
    text,
    tracking: {
      userId: target.userId || undefined,
      notificationType: 'payment_failed_dunning',
      notificationId,
      utm: {
        source: 'email',
        medium: 'lifecycle',
        campaign: 'dunning',
        content: `day${target.dayOffset}`,
      },
    },
  });

  return {
    status: 'sent',
    subscriptionId: target.subscriptionId,
    dayOffset: target.dayOffset,
    notificationId,
    emailId:
      'id' in (result as Record<string, unknown>)
        ? (result as { id: string }).id
        : undefined,
  };
}

/**
 * Turn a Stripe subscription in a recoverable state into a DunningTarget,
 * resolving customer, email, day-offset and the failing invoice. Returns null
 * (with a reason logged) when the subscription is not actionable.
 */
async function buildTargetFromSubscription(
  stripe: Stripe,
  subscription: Stripe.Subscription,
): Promise<DunningTarget | null> {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;
  if (!customerId) return null;

  const customer = await stripe.customers.retrieve(customerId);
  if (!customer || customer.deleted) return null;

  const email = customer.email;
  if (!email) return null;

  // Latest invoice carries the failure timing. It may be a string id (not
  // expanded) or the full object depending on how we fetched the sub.
  const latestInvoice = subscription.latest_invoice;
  let invoiceObject: Stripe.Invoice | null = null;
  let invoiceId: string | null = null;
  if (typeof latestInvoice === 'string') {
    invoiceId = latestInvoice;
    try {
      invoiceObject = await stripe.invoices.retrieve(latestInvoice);
    } catch (error) {
      console.error('[dunning] Failed to retrieve latest invoice:', error);
    }
  } else if (latestInvoice) {
    invoiceObject = latestInvoice;
    invoiceId = latestInvoice.id ?? null;
  }

  const failedAt = failedAtFromInvoice(invoiceObject);
  if (!failedAt) return null;

  const daysSinceFailure = Math.floor(
    (Date.now() - failedAt.getTime()) / (1000 * 60 * 60 * 24),
  );
  const dayOffset = deriveDayOffset(daysSinceFailure);
  if (!dayOffset) return null;

  const userId = await resolveUserId(customer, customerId);
  const userName = customer.name || email.split('@')[0] || 'there';

  return {
    subscriptionId: subscription.id,
    customerId,
    email,
    userName,
    userId,
    dayOffset,
    invoiceId,
  };
}

/**
 * GET — Vercel cron scan path. Finds all recoverable subscriptions, derives
 * each one's dunning touchpoint, and sends (or, by default, dry-run-logs) the
 * matching recovery email. Empty case returns cleanly with zero counts.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 },
    );
  }

  const dryRun = isDryRun();
  const outcomes: SendOutcome[] = [];
  const errors: string[] = [];
  let scanned = 0;
  let actionable = 0;

  try {
    // Walk every recoverable status. autoPagingEach handles pagination so a
    // large past_due backlog is fully covered in one run.
    for (const status of RECOVERABLE_STATUSES) {
      for await (const subscription of stripe.subscriptions.list({
        status,
        limit: 100,
        expand: ['data.latest_invoice'],
      })) {
        scanned++;

        // Defence in depth: Stripe should already filter by status, but never
        // dun a subscription that has recovered.
        if (
          !RECOVERABLE_STATUSES.includes(
            subscription.status as Stripe.Subscription.Status,
          )
        ) {
          continue;
        }

        try {
          const target = await buildTargetFromSubscription(
            stripe,
            subscription,
          );
          if (!target) continue;

          // Belt and braces for the day_offset union.
          if (!ALLOWED_DAY_OFFSETS.includes(target.dayOffset)) continue;

          actionable++;
          const outcome = await sendDunningEmail(stripe, target);
          outcomes.push(outcome);
        } catch (error) {
          errors.push(
            `${subscription.id}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          );
        }
      }
    }

    const sent = outcomes.filter((o) => o.status === 'sent').length;
    const wouldSend = outcomes.filter((o) => o.status === 'dry_run').length;
    const skippedDuplicate = outcomes.filter(
      (o) => o.status === 'skipped_duplicate',
    ).length;

    return NextResponse.json({
      success: true,
      dryRun,
      scanned,
      actionable,
      sent,
      wouldSend,
      skippedDuplicate,
      outcomes,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[dunning] GET scan error:', error);
    return NextResponse.json(
      {
        error: 'Failed to run dunning scan',
        details: error instanceof Error ? error.message : 'Unknown error',
        dryRun,
      },
      { status: 500 },
    );
  }
}

/**
 * POST — single-subscription send, kept for the Mini-side dunning agent which
 * passes the subscription id and the day-offset it has already computed. Now
 * routes through the SAME shared send path as GET, so it inherits the dry-run
 * gate and the per-cycle de-dupe.
 */
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
    const subscription = await stripe.subscriptions.retrieve(subscription_id, {
      expand: ['latest_invoice'],
    });

    if (
      !RECOVERABLE_STATUSES.includes(
        subscription.status as Stripe.Subscription.Status,
      )
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

    const latestInvoice = subscription.latest_invoice;
    const invoiceId =
      typeof latestInvoice === 'string'
        ? latestInvoice
        : (latestInvoice?.id ?? null);

    const userId = await resolveUserId(customer, customerId);
    const userName = customer.name || email.split('@')[0] || 'there';

    // The agent tells us which day-offset to send; honour it directly.
    const outcome = await sendDunningEmail(stripe, {
      subscriptionId: subscription_id,
      customerId,
      email,
      userName,
      userId,
      dayOffset: day_offset,
      invoiceId,
    });

    return NextResponse.json({
      ...outcome,
      // Keep the POST response shape backward compatible for the Mini agent.
      sent: outcome.status === 'sent',
      dryRun: isDryRun(),
      subscription_id,
      day_offset,
      notification_id: outcome.notificationId,
      email_id: outcome.emailId,
    });
  } catch (error) {
    console.error('[dunning] POST error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send dunning email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
