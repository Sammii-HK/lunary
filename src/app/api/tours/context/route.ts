import { NextResponse } from 'next/server';
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

    // Get plan from session user data
    const rawPlan = (session.user as any).subscriptionPlan || 'free';
    const planKey = normalizePlanType(rawPlan);

    // Basic context with minimal data
    const context = await getUserTourContext(
      session.user.id,
      planKey,
      0, // chatCount
      0, // tarotCount
      0, // journalCount
      0, // daysActive
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
