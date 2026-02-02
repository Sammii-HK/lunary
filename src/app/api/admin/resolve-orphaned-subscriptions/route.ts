import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function sanitizeForLog(value: unknown): string {
  if (typeof value !== 'string') {
    return String(value);
  }
  // Remove newline and carriage return characters to prevent log injection
  return value.replace(/[\r\n]/g, '');
}

export async function GET(request: NextRequest) {
  try {
    // List all unresolved orphaned subscriptions
    const result = await sql`
      SELECT
        id,
        stripe_subscription_id,
        stripe_customer_id,
        customer_email,
        status,
        plan_type,
        subscription_metadata,
        created_at
      FROM orphaned_subscriptions
      WHERE resolved = FALSE
      ORDER BY created_at DESC
      LIMIT 100
    `;

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      orphanedSubscriptions: result.rows,
    });
  } catch (error) {
    console.error('Error fetching orphaned subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orphaned subscriptions' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, userId, action } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'subscriptionId is required' },
        { status: 400 },
      );
    }

    if (action === 'link' && !userId) {
      return NextResponse.json(
        { error: 'userId is required for link action' },
        { status: 400 },
      );
    }

    const stripe = getStripe();

    if (action === 'link') {
      // Link the orphaned subscription to a user
      const orphaned = await sql`
        SELECT stripe_subscription_id, stripe_customer_id, customer_email, status, plan_type
        FROM orphaned_subscriptions
        WHERE stripe_subscription_id = ${subscriptionId}
        LIMIT 1
      `;

      if (orphaned.rows.length === 0) {
        return NextResponse.json(
          { error: 'Orphaned subscription not found' },
          { status: 404 },
        );
      }

      const sub = orphaned.rows[0];

      // Update Stripe subscription metadata
      await stripe.subscriptions.update(subscriptionId, {
        metadata: { userId },
      });

      // Update Stripe customer metadata
      await stripe.customers.update(sub.stripe_customer_id, {
        metadata: { userId },
      });

      // Insert/update subscriptions table
      const trialEndsAt: Date | null = null; // Will be updated by next webhook
      const currentPeriodEnd: Date | null = null;

      await sql`
        INSERT INTO subscriptions (
          user_id, user_email, status, plan_type,
          stripe_customer_id, stripe_subscription_id,
          trial_ends_at, current_period_end, trial_used
        ) VALUES (
          ${userId}, ${sub.customer_email}, ${sub.status}, ${sub.plan_type},
          ${sub.stripe_customer_id}, ${subscriptionId},
          ${trialEndsAt}, ${currentPeriodEnd}, true
        )
        ON CONFLICT (user_id) DO UPDATE SET
          status = EXCLUDED.status,
          plan_type = EXCLUDED.plan_type,
          stripe_customer_id = EXCLUDED.stripe_customer_id,
          stripe_subscription_id = EXCLUDED.stripe_subscription_id,
          user_email = COALESCE(EXCLUDED.user_email, subscriptions.user_email),
          trial_used = true,
          updated_at = NOW()
      `;

      // Update user_profiles
      await sql`
        INSERT INTO user_profiles (user_id, stripe_customer_id)
        VALUES (${userId}, ${sub.stripe_customer_id})
        ON CONFLICT (user_id) DO UPDATE SET
          stripe_customer_id = EXCLUDED.stripe_customer_id,
          updated_at = NOW()
      `;

      // Mark as resolved
      await sql`
        UPDATE orphaned_subscriptions
        SET resolved = TRUE,
            resolved_user_id = ${userId},
            resolved_at = NOW(),
            resolved_by = 'admin',
            updated_at = NOW()
        WHERE stripe_subscription_id = ${subscriptionId}
      `;

      console.log(
        `✅ Linked orphaned subscription ${sanitizeForLog(subscriptionId)} to user ${sanitizeForLog(userId)}`,
      );

      return NextResponse.json({
        success: true,
        message: `Subscription ${subscriptionId} linked to user ${userId}`,
      });
    } else if (action === 'cancel') {
      // Cancel the orphaned subscription
      await stripe.subscriptions.cancel(subscriptionId);

      await sql`
        UPDATE orphaned_subscriptions
        SET resolved = TRUE,
            status = 'cancelled',
            resolved_at = NOW(),
            resolved_by = 'admin',
            notes = 'Cancelled as duplicate/invalid',
            updated_at = NOW()
        WHERE stripe_subscription_id = ${subscriptionId}
      `;

      console.log(
        `✅ Cancelled orphaned subscription ${sanitizeForLog(subscriptionId)}`,
      );

      return NextResponse.json({
        success: true,
        message: `Subscription ${subscriptionId} cancelled`,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "link" or "cancel"' },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error('Error resolving orphaned subscription:', error);
    return NextResponse.json(
      {
        error: 'Failed to resolve orphaned subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
