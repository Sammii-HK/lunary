import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';
import {
  getTrialDaysFromStripe,
  FREE_TRIAL_DAYS,
} from '../../../../../utils/pricing';
import dayjs from 'dayjs';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planType = 'monthly' } = body;

    const existing = await sql`
      SELECT trial_used FROM subscriptions WHERE user_id = ${user.id} LIMIT 1
    `;
    if (existing.rows[0]?.trial_used) {
      return NextResponse.json(
        { error: 'Trial already used for this account' },
        { status: 403 },
      );
    }

    let trialDays: number;
    try {
      const trialData = await getTrialDaysFromStripe();
      trialDays = planType === 'monthly' ? trialData.monthly : trialData.yearly;
    } catch (error) {
      console.error('Error fetching trial days from Stripe:', error);
      trialDays =
        planType === 'monthly'
          ? FREE_TRIAL_DAYS.monthly
          : FREE_TRIAL_DAYS.yearly;
    }

    const trialEndsAt = dayjs().add(trialDays, 'day').toISOString();

    await sql`
      INSERT INTO subscriptions (
        user_id, user_email, status, plan_type, trial_ends_at, trial_used
      )
      VALUES (
        ${user.id}, ${user.email || null}, 'trial', ${planType}, ${trialEndsAt}, true
      )
      ON CONFLICT (user_id) DO UPDATE SET
        status = 'trial',
        plan_type = EXCLUDED.plan_type,
        trial_ends_at = EXCLUDED.trial_ends_at,
        trial_used = true,
        updated_at = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating trial subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create trial subscription' },
      { status: 500 },
    );
  }
}
