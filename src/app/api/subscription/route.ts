import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT * FROM subscriptions
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ subscription: null });
    }

    const subscription = result.rows[0];
    return NextResponse.json({
      subscription: {
        id: subscription.id,
        userId: subscription.user_id,
        userEmail: subscription.user_email,
        userName: subscription.user_name,
        status: subscription.status,
        planType: subscription.plan_type,
        trialEndsAt: subscription.trial_ends_at,
        stripeCustomerId: subscription.stripe_customer_id,
        stripeSubscriptionId: subscription.stripe_subscription_id,
        currentPeriodEnd: subscription.current_period_end,
        createdAt: subscription.created_at,
        updatedAt: subscription.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 },
    );
  }
}
