import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🗑️ Processing scheduled account deletions...');

    // Find all pending deletions that are past their scheduled date
    const pendingDeletions = await sql`
      SELECT * FROM deletion_requests
      WHERE status = 'pending'
        AND scheduled_for <= NOW()
    `;

    const results = {
      processed: 0,
      errors: 0,
      details: [] as { userId: string; success: boolean; error?: string }[],
    };

    for (const deletion of pendingDeletions.rows) {
      try {
        const userId = deletion.user_id;

        // 1. Cancel any active Stripe subscriptions
        const subscription = await sql`
          SELECT stripe_subscription_id, stripe_customer_id
          FROM subscriptions WHERE user_id = ${userId}
        `;

        if (subscription.rows[0]?.stripe_subscription_id) {
          try {
            await stripe.subscriptions.cancel(
              subscription.rows[0].stripe_subscription_id,
            );
          } catch (stripeError) {
            console.log('Subscription already cancelled or not found');
          }
        }

        // 2. Delete user data from all tables
        await sql`DELETE FROM push_subscriptions WHERE user_id = ${userId}`;
        await sql`DELETE FROM tarot_readings WHERE user_id = ${userId}`;
        await sql`DELETE FROM user_sessions WHERE user_id = ${userId}`;
        await sql`DELETE FROM ai_threads WHERE user_id = ${userId}`;
        await sql`DELETE FROM ai_usage WHERE user_id = ${userId}`;
        await sql`DELETE FROM user_profiles WHERE user_id = ${userId}`;
        await sql`DELETE FROM shop_purchases WHERE user_id = ${userId}`;
        await sql`DELETE FROM user_notes WHERE user_id = ${userId}`;
        await sql`DELETE FROM user_streaks WHERE user_id = ${userId}`;
        await sql`DELETE FROM api_keys WHERE user_id = ${userId}`;
        await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;
        await sql`DELETE FROM conversion_events WHERE user_id = ${userId}`;
        await sql`DELETE FROM journal_patterns WHERE user_id = ${userId}`;
        await sql`DELETE FROM email_events WHERE user_id = ${userId}`;
        await sql`DELETE FROM refund_requests WHERE user_id = ${userId}`;

        // 3. Delete from Better Auth tables (accounts table)
        await sql`DELETE FROM "account" WHERE "userId" = ${userId}`;
        await sql`DELETE FROM "session" WHERE "userId" = ${userId}`;
        await sql`DELETE FROM "user" WHERE id = ${userId}`;

        // 4. Mark deletion as processed
        await sql`
          UPDATE deletion_requests
          SET status = 'completed', processed_at = NOW()
          WHERE id = ${deletion.id}
        `;

        results.processed++;
        results.details.push({ userId, success: true });

        console.log(`✅ Deleted account: ${userId}`);
      } catch (error) {
        console.error(
          `❌ Failed to delete account ${deletion.user_id}:`,
          error,
        );
        results.errors++;
        results.details.push({
          userId: deletion.user_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(
      `🗑️ Deletion processing complete: ${results.processed} processed, ${results.errors} errors`,
    );

    return NextResponse.json({
      success: true,
      processed: results.processed,
      errors: results.errors,
      details: results.details,
    });
  } catch (error) {
    console.error('Deletion cron error:', error);
    return NextResponse.json(
      { error: 'Failed to process deletions' },
      { status: 500 },
    );
  }
}
