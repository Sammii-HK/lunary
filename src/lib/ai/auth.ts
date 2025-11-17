import { NextRequest } from 'next/server';

import { auth } from '@/lib/auth';
import { normalizePlanType } from '../../../utils/pricing';

export type AuthenticatedUser = {
  id: string;
  email?: string;
  displayName?: string;
  timezone?: string;
  locale?: string;
  plan?: string;
  birthday?: string;
};

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorised') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

const extractPrimaryLocale = (locale?: string | null): string => {
  if (!locale) {
    return 'en-GB';
  }
  return locale.replace('_', '-');
};

const DEFAULT_TIMEZONE = 'Europe/London';

export const requireUser = async (
  request: NextRequest,
): Promise<AuthenticatedUser> => {
  try {
    const headers = Object.fromEntries(request.headers.entries());
    const origin = request.headers.get('origin') || new URL(request.url).origin;
    const cookieHeader = request.headers.get('cookie');

    const sessionResponse = await (auth as any).api.getSession({
      headers,
    });

    const user =
      sessionResponse?.data?.user ??
      sessionResponse?.user ??
      sessionResponse?.session?.user;

    if (!user?.id) {
      console.error('[AI Auth] No user found in session', {
        origin,
        hasCookie: !!cookieHeader,
        cookieLength: cookieHeader?.length || 0,
        sessionResponseKeys: Object.keys(sessionResponse || {}),
        sessionData: sessionResponse?.data
          ? Object.keys(sessionResponse.data)
          : null,
      });
      throw new UnauthorizedError();
    }

    const sessionPlanCandidates = [
      (user as any)?.subscription?.plan,
      (user as any)?.plan,
      (user as any)?.planName,
      (user as any)?.aiPlan,
    ].filter(Boolean) as string[];
    const normalizedSessionPlan = normalizePlanType(sessionPlanCandidates[0]);

    // Fetch subscription from database to get accurate plan
    let subscriptionPlan: string | undefined;
    try {
      const { sql } = await import('@vercel/postgres');
      const subscriptionResult = await sql`
        SELECT plan_type, status
        FROM subscriptions
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (subscriptionResult.rows.length > 0) {
        const sub = subscriptionResult.rows[0];
        if (
          sub.status === 'active' ||
          sub.status === 'trial' ||
          sub.status === 'trialing'
        ) {
          subscriptionPlan = sub.plan_type || undefined;
        }
      }
    } catch (error) {
      console.error('[AI Auth] Failed to fetch subscription', error);
    }

    return {
      id: user.id,
      email: user.email ?? undefined,
      displayName: user.name ?? user.displayName ?? undefined,
      timezone: user.tz ?? user.timezone ?? DEFAULT_TIMEZONE,
      locale: extractPrimaryLocale(user.locale ?? user.language ?? 'en-GB'),
      plan:
        (normalizedSessionPlan && normalizedSessionPlan !== 'free'
          ? normalizedSessionPlan
          : undefined) ||
        normalizePlanType(subscriptionPlan) ||
        undefined,
      birthday: user.birthday ?? user.birthDate ?? undefined,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    console.error('[AI Auth] Failed to resolve session', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      origin: request.headers.get('origin'),
      hasCookie: !!request.headers.get('cookie'),
    });
    throw new UnauthorizedError();
  }
};
