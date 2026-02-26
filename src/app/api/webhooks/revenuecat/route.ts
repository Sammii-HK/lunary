import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// RevenueCat event types that affect subscription status
// https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
const ACTIVATING_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'PRODUCT_CHANGE',
  'TRANSFER',
]);

const DEACTIVATING_EVENTS = new Set([
  'CANCELLATION',
  'EXPIRATION',
  'BILLING_ISSUE',
]);

// Maps RevenueCat product IDs to Lunary plan_type values
const PRODUCT_TO_PLAN: Record<string, string> = {
  'app.lunary.plus.monthly': 'lunary_plus',
  'app.lunary.plus.annual': 'lunary_plus_annual',
  'app.lunary.pro.monthly': 'lunary_plus_ai',
  'app.lunary.pro.annual': 'lunary_plus_ai_annual',
};

function getWebhookSecret(): string {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!secret) throw new Error('REVENUECAT_WEBHOOK_SECRET is not set');
  return secret;
}

export async function POST(req: NextRequest) {
  // RevenueCat passes the secret as a Bearer token in the Authorization header
  const authHeader = req.headers.get('authorization');
  const expectedSecret = getWebhookSecret();

  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const event = body.event as Record<string, unknown> | undefined;
  if (!event) {
    return NextResponse.json({ error: 'Missing event' }, { status: 400 });
  }

  const eventType = event.type as string;
  // app_user_id is set to the Lunary user ID when the user logs in (see identifyIAPUser)
  const userId = event.app_user_id as string;
  const productId = event.product_id as string | undefined;
  const originalTransactionId = event.original_transaction_id as
    | string
    | undefined;
  const expirationAtMs = event.expiration_at_ms as number | undefined;

  if (!userId) {
    // Anonymous purchase — can't link to a user, log and return OK
    const safeEventType = String(eventType ?? '').replace(
      /[\r\n\x00-\x1F\x7F]/g,
      '',
    );
    console.warn('[RC webhook] Missing app_user_id on event:', safeEventType);
    return NextResponse.json({ received: true });
  }

  try {
    if (ACTIVATING_EVENTS.has(eventType)) {
      const planType =
        (productId && PRODUCT_TO_PLAN[productId]) || 'lunary_plus_ai';
      const currentPeriodEnd = expirationAtMs ? new Date(expirationAtMs) : null;

      await prisma.subscriptions.upsert({
        where: { user_id: userId },
        update: {
          status: 'active',
          plan_type: planType,
          subscription_source: 'apple',
          apple_original_transaction_id: originalTransactionId ?? undefined,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: false,
          is_paying: true,
          updated_at: new Date(),
        },
        create: {
          user_id: userId,
          status: 'active',
          plan_type: planType,
          subscription_source: 'apple',
          apple_original_transaction_id: originalTransactionId ?? undefined,
          current_period_end: currentPeriodEnd,
          is_paying: true,
          cancel_at_period_end: false,
        },
      });
    } else if (DEACTIVATING_EVENTS.has(eventType)) {
      const isCancellation = eventType === 'CANCELLATION';
      const expiresAt = expirationAtMs ? new Date(expirationAtMs) : null;

      await prisma.subscriptions.updateMany({
        where: { user_id: userId },
        data: {
          // For cancellations with future expiry, keep active until period ends
          status:
            isCancellation && expiresAt && expiresAt > new Date()
              ? 'active'
              : 'cancelled',
          cancel_at_period_end: isCancellation ? true : false,
          is_paying: false,
          updated_at: new Date(),
        },
      });
    }
    // Other event types (TRANSFER, PRODUCT_CHANGE handled via ACTIVATING_EVENTS above)

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[RC webhook] Database error:', err);
    // Return 500 so RevenueCat retries
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
