import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import Stripe from 'stripe';
import {
  formatDate,
  formatTimestamp,
  resolveDateRange,
} from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';
const CANCELLED_STATUSES = new Set(['cancelled', 'canceled', 'ended']);
const STRIPE_ACTIVE_STATUSES = new Set(['active', 'trialing', 'past_due']);

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

async function emailHasActiveStripeSubscription(stripe: Stripe, email: string) {
  const customers = await stripe.customers.list({ email, limit: 100 });

  for (const customer of customers.data) {
    if ('deleted' in customer && customer.deleted) {
      continue;
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 100,
    });

    if (
      subscriptions.data.some((subscription) =>
        STRIPE_ACTIVE_STATUSES.has(subscription.status),
      )
    ) {
      return true;
    }
  }

  return false;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);
    const stripeCheckEnabled =
      searchParams.get('stripe') === '1' ||
      searchParams.get('stripe') === 'true';

    // Use only Stripe-backed subscriptions and de-duplicate by email (current status as of range end).
    // If an email has any active Stripe subscription, treat it as active regardless of a later cancelled row.
    const activeEmailsResult = await sql`
      WITH normalized_subs AS (
        SELECT
          s.*,
          COALESCE(NULLIF(TRIM(s.user_email), ''), NULLIF(TRIM(u.email), '')) AS raw_email,
          LOWER(COALESCE(NULLIF(TRIM(s.user_email), ''), NULLIF(TRIM(u.email), ''))) AS email
        FROM subscriptions s
        LEFT JOIN "user" u ON u.id = s.user_id
        WHERE s.stripe_subscription_id IS NOT NULL
      ),
      active_emails AS (
        SELECT DISTINCT email
        FROM normalized_subs
        WHERE email IS NOT NULL
          AND (
            status IN ('active', 'trial', 'past_due') OR
            (current_period_end IS NOT NULL AND current_period_end > NOW()) OR
            (trial_ends_at IS NOT NULL AND trial_ends_at > NOW())
          )
          AND (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT})
      )
      SELECT email
      FROM active_emails
    `;

    const activeEmails = new Set(
      activeEmailsResult.rows
        .map((row) => (row.email as string | null) || null)
        .filter(Boolean) as string[],
    );

    const latestPerEmailResult = await sql`
      WITH normalized_subs AS (
        SELECT
          s.*,
          COALESCE(NULLIF(TRIM(s.user_email), ''), NULLIF(TRIM(u.email), '')) AS raw_email,
          LOWER(COALESCE(NULLIF(TRIM(s.user_email), ''), NULLIF(TRIM(u.email), ''))) AS email
        FROM subscriptions s
        LEFT JOIN "user" u ON u.id = s.user_id
        WHERE s.stripe_subscription_id IS NOT NULL
      ),
      latest_per_email AS (
        SELECT DISTINCT ON (email)
          email,
          raw_email AS user_email,
          status,
          updated_at,
          created_at,
          DATE(updated_at) as updated_date
        FROM normalized_subs
        WHERE email IS NOT NULL
          AND updated_at <= ${formatTimestamp(range.end)}
          AND (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT})
        ORDER BY email, updated_at DESC
      )
      SELECT *
      FROM latest_per_email
    `;

    const latestRows = latestPerEmailResult.rows;

    // Get total subscriptions at START of period for correct churn rate denominator
    // Churn rate = (cancelled_in_period / subscriptions_at_START) * 100
    // NOT (cancelled_in_period / subscriptions_at_END) which would be wrong for growing/declining base
    const subsAtStartResult = await sql`
      WITH normalized_subs AS (
        SELECT
          s.*,
          LOWER(COALESCE(NULLIF(TRIM(s.user_email), ''), NULLIF(TRIM(u.email), ''))) AS email
        FROM subscriptions s
        LEFT JOIN "user" u ON u.id = s.user_id
        WHERE s.stripe_subscription_id IS NOT NULL
      ),
      active_at_start AS (
        SELECT DISTINCT email
        FROM normalized_subs
        WHERE email IS NOT NULL
          AND created_at < ${formatTimestamp(range.start)}
          AND status NOT IN ('cancelled', 'canceled', 'ended')
          AND (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT})
      )
      SELECT COUNT(*) as count
      FROM active_at_start
    `;
    const totalSubscriptionsAtStart = Number(
      subsAtStartResult.rows[0]?.count || 0,
    );

    const candidateStripeEmails = Array.from(
      new Set(
        latestRows
          .filter(
            (row) =>
              row.email &&
              CANCELLED_STATUSES.has(row.status as string) &&
              !activeEmails.has(row.email as string),
          )
          .map((row) => row.email as string),
      ),
    );

    const stripeActiveEmails = new Set<string>();

    if (
      stripeCheckEnabled &&
      process.env.STRIPE_SECRET_KEY &&
      candidateStripeEmails.length > 0
    ) {
      const stripe = getStripe();

      for (const email of candidateStripeEmails) {
        try {
          const isActive = await emailHasActiveStripeSubscription(
            stripe,
            email,
          );
          if (isActive) {
            stripeActiveEmails.add(email);
          }
        } catch (error) {
          console.error(
            '[analytics/subscription-lifecycle] Stripe check failed for',
            email,
            error,
          );
        }
      }
    }

    const normalizedRows = latestRows.map((row) => {
      const email = row.email as string | null;
      const status = row.status as string;
      const updatedAt =
        row.updated_at instanceof Date
          ? row.updated_at
          : new Date(row.updated_at as string);
      const createdAt =
        row.created_at instanceof Date
          ? row.created_at
          : new Date(row.created_at as string);
      const updatedDate =
        row.updated_date instanceof Date
          ? row.updated_date.toISOString().slice(0, 10)
          : typeof row.updated_date === 'string'
            ? row.updated_date.slice(0, 10)
            : formatDate(updatedAt);
      const effectiveStatus =
        email && (activeEmails.has(email) || stripeActiveEmails.has(email))
          ? 'active'
          : status;

      return {
        email,
        userEmail: (row.user_email as string | null) || email,
        status,
        effectiveStatus,
        updatedAt,
        createdAt,
        updatedDate,
      };
    });

    const states = normalizedRows.reduce(
      (acc, row) => {
        const key = row.effectiveStatus || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const churnByDate = new Map<string, number>();
    let durationTotal = 0;
    let durationCount = 0;
    const rangeStartMs = range.start.getTime();

    for (const row of normalizedRows) {
      if (CANCELLED_STATUSES.has(row.effectiveStatus)) {
        if (row.updatedAt.getTime() >= rangeStartMs) {
          churnByDate.set(
            row.updatedDate,
            (churnByDate.get(row.updatedDate) || 0) + 1,
          );
        }

        if (row.updatedAt > row.createdAt) {
          durationTotal +=
            (row.updatedAt.getTime() - row.createdAt.getTime()) / 86400000;
          durationCount += 1;
        }
      }
    }

    const churnTrends = Array.from(churnByDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, churned]) => ({
        date,
        churned,
      }));

    const avgDuration = durationCount > 0 ? durationTotal / durationCount : 0;

    const debugCancelledDetails = normalizedRows
      .filter(
        (row) =>
          CANCELLED_STATUSES.has(row.effectiveStatus) &&
          row.updatedAt.getTime() >= rangeStartMs,
      )
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 50)
      .map((row) => ({
        email: row.userEmail,
        status: row.status,
        effectiveStatus: row.effectiveStatus,
        updatedAt: row.updatedAt.toISOString(),
        activeInDb: row.email ? activeEmails.has(row.email) : false,
        activeInStripe: row.email ? stripeActiveEmails.has(row.email) : false,
      }));

    const debugCancelledEmails = debugCancelledDetails.map((row) => row.email);
    const debugStripeActiveEmails = Array.from(stripeActiveEmails).slice(0, 50);

    // Calculate lifecycle transitions
    const transitionsResult = await sql`
      SELECT 
        ce1.event_type as from_state,
        ce2.event_type as to_state,
        COUNT(*) as count
      FROM conversion_events ce1
      INNER JOIN conversion_events ce2 ON ce1.user_id = ce2.user_id
      WHERE ce1.event_type IN ('trial_started', 'subscription_started', 'subscription_cancelled')
        AND ce2.event_type IN ('trial_converted', 'subscription_started', 'subscription_cancelled', 'subscription_ended')
        AND ce2.created_at > ce1.created_at
        AND ce2.created_at <= ce1.created_at + INTERVAL '90 days'
        AND ce1.created_at >= ${formatTimestamp(range.start)}
        AND ce1.created_at <= ${formatTimestamp(range.end)}
        AND (ce1.user_email IS NULL OR (ce1.user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND ce1.user_email != ${TEST_EMAIL_EXACT}))
        AND EXISTS (
          SELECT 1
          FROM subscriptions s
          WHERE s.user_id = ce1.user_id
            AND s.stripe_subscription_id IS NOT NULL
        )
      GROUP BY ce1.event_type, ce2.event_type
    `;

    const transitions = transitionsResult.rows.map((row) => ({
      from: row.from_state as string,
      to: row.to_state as string,
      count: Number(row.count || 0),
    }));

    // Calculate churn rate (cancellations / total subscriptions at period start)
    // totalSubscriptionsAtStart is queried separately above to get count at range.start, not range.end
    const activeSubscriptions = states.active || 0;
    const cancelledInPeriod = churnTrends.reduce(
      (sum, t) => sum + t.churned,
      0,
    );
    const churnRate =
      totalSubscriptionsAtStart > 0
        ? (cancelledInPeriod / totalSubscriptionsAtStart) * 100
        : 0;

    // Sanity check: churn rate should never exceed 100%
    if (churnRate > 100) {
      console.error('[subscription-lifecycle] Invalid churn rate detected:', {
        churnRate,
        cancelledInPeriod,
        totalSubscriptionsAtStart,
        activeSubscriptions,
      });
    }

    const response = NextResponse.json({
      states,
      churnTrends,
      avgDurationDays: Number(avgDuration.toFixed(1)),
      churnRate: Number(churnRate.toFixed(2)),
      transitions,
      debugCancelledEmails,
      debugCancelledDetails,
      debugStripeActiveEmails,
    });
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}`,
    );
    return response;
  } catch (error) {
    console.error(
      '[analytics/subscription-lifecycle] Failed to load metrics',
      error,
    );
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        states: {},
        churnTrends: [],
        avgDurationDays: 0,
        transitions: [],
      },
      { status: 500 },
    );
  }
}
