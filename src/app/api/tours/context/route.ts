import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getUserTourContext } from '@/lib/feature-tours/tour-helpers';
import { normalizePlanType } from '../../../../../utils/pricing';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get plan from session user data
    const rawPlan = (session.user as any).subscriptionPlan || 'free';
    const planKey = normalizePlanType(rawPlan);

    // Fetch real usage counts in parallel
    const [chatResult, tarotResult, subscriptionResult] = await Promise.all([
      // Today's chat message count from ai_usage
      sql`
        SELECT COALESCE(count, 0)::int AS chat_count
        FROM ai_usage
        WHERE user_id = ${userId}
          AND day::date = CURRENT_DATE
      `.catch(() => ({ rows: [{ chat_count: 0 }] })),

      // This month's tarot readings
      sql`
        SELECT COUNT(*)::int AS tarot_count
        FROM tarot_readings
        WHERE user_id = ${userId}
          AND created_at >= date_trunc('month', NOW())
      `.catch(() => ({ rows: [{ tarot_count: 0 }] })),

      // User account creation date (for daysActive)
      sql`
        SELECT created_at FROM subscriptions WHERE user_id = ${userId}
      `.catch(() => ({ rows: [] })),
    ]);

    const chatCount = Number(chatResult.rows[0]?.chat_count ?? 0);
    const tarotCount = Number(tarotResult.rows[0]?.tarot_count ?? 0);

    const createdAt = subscriptionResult.rows[0]?.created_at;
    const daysActive = createdAt
      ? Math.floor(
          (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0;

    const context = await getUserTourContext(
      userId,
      planKey,
      chatCount,
      tarotCount,
      0, // journalCount — no dedicated table; not used by current tour triggers
      daysActive,
    );

    return NextResponse.json(context);
  } catch (error) {
    console.error('Error fetching tour context:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
