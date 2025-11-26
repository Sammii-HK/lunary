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

    // Fetch subscription and profile from database
    let subscriptionPlan: string | undefined;
    let dbBirthday: string | undefined;
    try {
      const { sql } = await import('@vercel/postgres');

      // Fetch subscription
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

      // Fetch birthday from accounts table if not in session
      if (!user.birthday && !user.birthDate) {
        try {
          const accountResult = await sql`
            SELECT birthday FROM accounts WHERE id = ${user.id} LIMIT 1
          `;
          if (accountResult.rows.length > 0 && accountResult.rows[0].birthday) {
            dbBirthday = accountResult.rows[0].birthday;
          }
        } catch (accError: any) {
          // Silently ignore if accounts table doesn't exist (42P01)
          if (accError?.code !== '42P01') {
            console.error(
              '[AI Auth] Failed to fetch birthday from accounts',
              accError,
            );
          }
        }
      }
    } catch (error) {
      console.error('[AI Auth] Failed to fetch subscription', error);
    }

    // Try to get birthday from Jazz if still missing
    let jazzBirthday: string | undefined;
    const sessionBirthday = user.birthday ?? user.birthDate ?? dbBirthday;
    if (!sessionBirthday) {
      try {
        const { loadJazzProfile } = await import('../jazz/server');
        const jazzProfile = await loadJazzProfile(user.id);
        jazzBirthday = (jazzProfile as any)?.birthday;
      } catch (error) {
        // Jazz profile fetch is optional, don't fail auth
      }
    }

    const finalBirthday = sessionBirthday ?? jazzBirthday ?? undefined;

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
      birthday: finalBirthday,
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
