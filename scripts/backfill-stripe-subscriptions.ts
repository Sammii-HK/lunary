import Stripe from 'stripe';
import dotenv from 'dotenv';
import { sql } from '@vercel/postgres';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const ALLOWED_STATUSES = new Set(['active', 'trialing', 'past_due']);
const SUBSCRIPTION_COLUMNS = [
  'user_id',
  'user_email',
  'status',
  'plan_type',
  'stripe_customer_id',
  'stripe_subscription_id',
  'trial_ends_at',
  'current_period_end',
  'has_discount',
  'discount_percent',
  'monthly_amount_due',
  'coupon_id',
  'promo_code',
  'discount_ends_at',
  'trial_used',
];
const UPDATE_CHECK_COLUMNS = [
  'user_id',
  'stripe_customer_id',
  'stripe_subscription_id',
  'plan_type',
  'status',
];

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function mapStripeStatus(status: string): string {
  switch (status) {
    case 'trialing':
      return 'trial';
    case 'active':
      return 'active';
    case 'canceled':
      return 'cancelled';
    case 'past_due':
      return 'past_due';
    default:
      return 'free';
  }
}

function getPlanTypeFromSubscription(
  subscription: Stripe.Subscription,
): string {
  if (subscription.metadata?.plan_id) {
    return subscription.metadata.plan_id;
  }

  const price = subscription.items.data[0]?.price;
  if (price?.metadata?.plan_id) {
    return price.metadata.plan_id;
  }

  if (price?.id) {
    const { getPlanIdFromPriceId } = require('../utils/pricing');
    const planId = getPlanIdFromPriceId(price.id);
    if (planId) {
      return planId;
    }
  }

  const interval = price?.recurring?.interval;
  if (interval === 'year') return 'lunary_plus_ai_annual';
  if (interval === 'month') return 'lunary_plus';

  return 'free';
}

function extractDiscountInfo(subscription: Stripe.Subscription) {
  const discounts = subscription.discounts || [];
  if (discounts.length === 0) {
    const price = subscription.items.data[0]?.price;
    const unitAmount = (price?.unit_amount || 0) / 100;
    const interval = price?.recurring?.interval;
    return {
      hasDiscount: false,
      discountPercent: 0,
      monthlyAmountDue: interval === 'year' ? unitAmount / 12 : unitAmount,
      couponId: null,
      discountEndsAt: null,
    };
  }

  const discount = discounts[0];
  if (typeof discount === 'string' || !discount?.coupon) {
    return {
      hasDiscount: false,
      discountPercent: 0,
      monthlyAmountDue: 0,
      couponId: null,
      discountEndsAt: null,
    };
  }

  const price = subscription.items.data[0]?.price;
  const unitAmount = (price?.unit_amount || 0) / 100;
  const interval = price?.recurring?.interval;
  let monthlyAmount = interval === 'year' ? unitAmount / 12 : unitAmount;

  if (discount.coupon.percent_off) {
    monthlyAmount *= 1 - discount.coupon.percent_off / 100;
  } else if (discount.coupon.amount_off) {
    monthlyAmount = Math.max(
      0,
      monthlyAmount - discount.coupon.amount_off / 100,
    );
  }

  let discountEndsAt = discount.end
    ? new Date(discount.end * 1000).toISOString()
    : null;
  if (
    !discountEndsAt &&
    discount.coupon.duration === 'repeating' &&
    discount.coupon.duration_in_months
  ) {
    const startTimestamp = discount.start || subscription.start_date;
    if (startTimestamp) {
      const endDate = new Date(startTimestamp * 1000);
      endDate.setUTCMonth(
        endDate.getUTCMonth() + discount.coupon.duration_in_months,
      );
      discountEndsAt = endDate.toISOString();
    }
  }

  return {
    hasDiscount: true,
    discountPercent: discount.coupon.percent_off || null,
    monthlyAmountDue: monthlyAmount,
    couponId: discount.coupon.id || null,
    discountEndsAt,
  };
}

async function resolveUserId(
  customer: Stripe.Customer,
  subscription: Stripe.Subscription,
) {
  const metadataUserId =
    subscription.metadata?.userId ||
    (customer.metadata as Record<string, string> | undefined)?.userId;
  if (metadataUserId) return metadataUserId;

  const customerId = customer.id;
  const subscriptionId = subscription.id;

  try {
    const subscriptionMatch = await sql`
      SELECT user_id FROM subscriptions
      WHERE stripe_subscription_id = ${subscriptionId}
      LIMIT 1
    `;
    if (subscriptionMatch.rows[0]?.user_id) {
      return subscriptionMatch.rows[0].user_id;
    }
  } catch (error) {
    console.error('Failed to match user by subscription id:', error);
  }

  try {
    const customerMatch = await sql`
      SELECT user_id FROM subscriptions
      WHERE stripe_customer_id = ${customerId}
      LIMIT 1
    `;
    if (customerMatch.rows[0]?.user_id) {
      return customerMatch.rows[0].user_id;
    }
  } catch (error) {
    console.error('Failed to match user by customer id:', error);
  }

  if (customer.email) {
    try {
      const emailMatch = await sql`
        SELECT user_id FROM subscriptions
        WHERE LOWER(user_email) = LOWER(${customer.email})
        LIMIT 1
      `;
      if (emailMatch.rows[0]?.user_id) {
        return emailMatch.rows[0].user_id;
      }
    } catch (error) {
      console.error('Failed to match user by subscription email:', error);
    }

    try {
      const userMatch = await sql`
        SELECT id FROM "user"
        WHERE LOWER(email) = LOWER(${customer.email})
        LIMIT 1
      `;
      if (userMatch.rows[0]?.id) {
        return userMatch.rows[0].id as string;
      }
    } catch (error) {
      console.error('Failed to match user by auth email:', error);
    }
  }

  return null;
}

async function getSubscriptionColumns() {
  const result = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'subscriptions'
  `;
  return new Set(result.rows.map((row) => row.column_name as string));
}

function normalizeValue(value: unknown) {
  if (value === undefined || value === null) return null;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function valuesEqual(a: unknown, b: unknown) {
  const normalizedA = normalizeValue(a);
  const normalizedB = normalizeValue(b);
  if (normalizedA === null && normalizedB === null) return true;
  return String(normalizedA) === String(normalizedB);
}

async function getExistingSubscription(userId: string, columns: string[]) {
  if (columns.length === 0) return null;
  const query = `
    SELECT ${columns.join(', ')}
    FROM subscriptions
    WHERE user_id = $1
    LIMIT 1
  `;
  const result = await sql.query(query, [userId]);
  return result.rows[0] || null;
}

function needsUpdate(
  existing: Record<string, unknown> | null,
  payload: Record<string, unknown>,
  columns: string[],
) {
  if (!existing) return true;
  for (const column of columns) {
    if (!valuesEqual(existing[column], payload[column])) {
      return true;
    }
  }
  return false;
}

// Status rank: lower number = higher priority
const STATUS_RANK: Record<string, number> = {
  active: 1,
  trialing: 2,
  past_due: 3,
};

interface Candidate {
  subscription: Stripe.Subscription;
  customer: Stripe.Customer;
  payload: Record<string, unknown>;
}

function pickBestCandidate(candidates: Candidate[]): Candidate {
  return candidates.slice().sort((a, b) => {
    const rankA = STATUS_RANK[a.subscription.status] ?? 99;
    const rankB = STATUS_RANK[b.subscription.status] ?? 99;
    if (rankA !== rankB) return rankA - rankB;
    // Same status — prefer higher monthly amount (non-discounted users > discounted)
    const amountA = (a.payload.monthly_amount_due as number) ?? 0;
    const amountB = (b.payload.monthly_amount_due as number) ?? 0;
    if (amountA !== amountB) return amountB - amountA;
    // Fallback: newer subscription wins
    return (b.subscription.created ?? 0) - (a.subscription.created ?? 0);
  })[0];
}

function buildSubscriptionUpsert(
  existingColumns: Set<string>,
  data: Record<string, unknown>,
) {
  const insertColumns = SUBSCRIPTION_COLUMNS.filter((column) =>
    existingColumns.has(column),
  );
  const insertValues = insertColumns.map((column) => data[column]);
  const placeholders = insertColumns.map((_, index) => `$${index + 1}`);
  const updateClauses: string[] = [];

  for (const column of insertColumns) {
    if (column === 'user_id') continue;
    if (column === 'user_email') {
      updateClauses.push(
        `user_email = COALESCE(EXCLUDED.user_email, subscriptions.user_email)`,
      );
      continue;
    }
    updateClauses.push(`${column} = EXCLUDED.${column}`);
  }

  if (existingColumns.has('updated_at')) {
    updateClauses.push('updated_at = NOW()');
  }

  const query = `
    INSERT INTO subscriptions (${insertColumns.join(', ')})
    VALUES (${placeholders.join(', ')})
    ON CONFLICT (user_id) DO UPDATE SET ${updateClauses.join(', ')}
  `;

  return { query, values: insertValues };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('--preview');
  // --force bypasses the change-detection check and always upserts every row.
  // This ensures fields like monthly_amount_due that aren't in UPDATE_CHECK_COLUMNS
  // still get written on every run.
  const force = args.includes('--force');
  const limitArg = args.find((arg) => arg.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : null;

  const stripe = getStripe();
  const subscriptionColumns = await getSubscriptionColumns();
  let startingAfter: string | undefined;
  let processed = 0;
  let updated = 0;
  let unchanged = 0;
  let skipped = 0;
  let unresolved = 0;

  if (force) {
    console.log(
      '⚡ --force mode: change detection bypassed, all rows will be upserted',
    );
  }
  console.log('🔄 Backfilling Stripe subscriptions...');

  // Pass 1: collect all active/trialing/past_due candidates per user.
  // We do NOT write anything yet — we need all candidates before picking the best.
  const candidatesByUser = new Map<string, Candidate[]>();

  while (true) {
    const response = await stripe.subscriptions.list({
      status: 'all',
      limit: 100,
      expand: ['data.discounts'],
      starting_after: startingAfter,
    });

    if (response.data.length === 0) {
      break;
    }

    for (const subscription of response.data) {
      processed += 1;
      if (limit && processed > limit) {
        break;
      }

      if (!ALLOWED_STATUSES.has(subscription.status)) {
        skipped += 1;
        continue;
      }

      const customerId = subscription.customer as string;
      let customer: Stripe.Customer | null = null;

      try {
        const fetched = await stripe.customers.retrieve(customerId);
        if (!('deleted' in fetched)) {
          customer = fetched;
        }
      } catch (error) {
        console.error(`Failed to load customer ${customerId}:`, error);
      }

      if (!customer) {
        unresolved += 1;
        continue;
      }

      const userId = await resolveUserId(customer, subscription);
      if (!userId) {
        unresolved += 1;
        console.warn(
          `⚠️  Missing userId for customer ${customer.id} (${customer.email || 'no email'})`,
        );
        continue;
      }

      const status = mapStripeStatus(subscription.status);
      const planType = getPlanTypeFromSubscription(subscription);
      const discountInfo = extractDiscountInfo(subscription);
      const promoCodeRaw =
        subscription.metadata?.promoCode || subscription.metadata?.discountCode;
      const promoCode =
        typeof promoCodeRaw === 'string' && promoCodeRaw.trim().length > 0
          ? promoCodeRaw.trim().toUpperCase()
          : null;
      const trialEndsAt = subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null;
      const currentPeriodEnd = (subscription as any).current_period_end
        ? new Date(
            (subscription as any).current_period_end * 1000,
          ).toISOString()
        : null;

      const payload: Record<string, unknown> = {
        user_id: userId,
        user_email: customer.email,
        status,
        plan_type: planType,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        trial_ends_at: trialEndsAt,
        current_period_end: currentPeriodEnd,
        has_discount: discountInfo.hasDiscount,
        discount_percent: discountInfo.discountPercent || null,
        monthly_amount_due: discountInfo.monthlyAmountDue ?? null,
        coupon_id: discountInfo.couponId || null,
        promo_code: promoCode,
        discount_ends_at: discountInfo.discountEndsAt || null,
        trial_used: true,
      };

      const existing = candidatesByUser.get(userId) ?? [];
      existing.push({ subscription, customer, payload });
      candidatesByUser.set(userId, existing);
    }

    if (limit && processed >= limit) {
      break;
    }

    startingAfter = response.data[response.data.length - 1]?.id;
  }

  // Warn about users with multiple active subs so we have visibility
  for (const [userId, candidates] of candidatesByUser) {
    if (candidates.length > 1) {
      const ids = candidates.map((c) => c.subscription.id).join(', ');
      console.warn(
        `⚠️  Multiple active subs for ${userId}: [${ids}] — picking best`,
      );
    }
  }

  // Pass 2: for each user, pick the best candidate and write it
  const updateCheckColumns = UPDATE_CHECK_COLUMNS.filter((column) =>
    subscriptionColumns.has(column),
  );

  for (const [userId, candidates] of candidatesByUser) {
    const { subscription, customer, payload } = pickBestCandidate(candidates);
    const status = payload.status as string;
    const planType = payload.plan_type as string;

    const existingRow = await getExistingSubscription(
      userId,
      updateCheckColumns,
    );
    const shouldUpdate =
      force || needsUpdate(existingRow, payload, updateCheckColumns);

    if (dryRun) {
      if (shouldUpdate) {
        console.log(
          `🧪 ${userId} -> ${subscription.id} (${status}, ${planType})`,
        );
      } else {
        unchanged += 1;
      }
    } else {
      if (shouldUpdate) {
        const { query, values } = buildSubscriptionUpsert(
          subscriptionColumns,
          payload,
        );
        await sql.query(query, values);
      } else {
        unchanged += 1;
      }

      await sql`
        INSERT INTO user_profiles (user_id, stripe_customer_id)
        VALUES (${userId}, ${customer.id})
        ON CONFLICT (user_id) DO UPDATE SET
          stripe_customer_id = EXCLUDED.stripe_customer_id,
          updated_at = NOW()
      `;

      if (!customer.metadata?.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...(customer.metadata || {}), userId },
        });
      }

      if (!subscription.metadata?.userId) {
        await stripe.subscriptions.update(subscription.id, {
          metadata: { ...(subscription.metadata || {}), userId },
        });
      }
    }

    if (shouldUpdate) {
      updated += 1;
    }
  }

  console.log('✅ Backfill complete');
  console.log(`Processed: ${processed}`);
  console.log(`Updated: ${updated}`);
  console.log(`Unchanged: ${unchanged}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Unresolved: ${unresolved}`);

  if (dryRun) {
    console.log('Preview mode enabled; no updates applied.');
  }
}

main().catch((error) => {
  console.error('Failed to backfill Stripe subscriptions:', error);
  process.exit(1);
});
