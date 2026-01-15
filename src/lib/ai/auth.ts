import { NextRequest } from 'next/server';

import { auth } from '@/lib/auth';
import { decrypt } from '@/lib/encryption';
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
  constructor(message = 'Unauthorized') {
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

const isTestMode = (() => {
  if (process.env.VERCEL_ENV === 'production') return false;
  if (process.env.NODE_ENV === 'production') return false;
  if (process.env.NODE_ENV === 'test') return true;
  if (process.env.PLAYWRIGHT_TEST_BASE_URL !== undefined) return true;
  if (process.env.CI === 'true' && process.env.VERCEL_ENV !== 'production') {
    return true;
  }
  return false;
})();

const getTestUser = (request: NextRequest): AuthenticatedUser => {
  const headerUserId = request.headers.get('x-test-user-id');
  const headerEmail = request.headers.get('x-test-user-email');
  const headerPlan = request.headers.get('x-test-plan');
  const headerTimezone = request.headers.get('x-test-timezone');
  const headerLocale = request.headers.get('x-test-locale');
  const headerBirthday = request.headers.get('x-test-birthday');

  const fallbackPlan = normalizePlanType(
    headerPlan || process.env.TEST_PLAN || 'free',
  );

  return {
    id: headerUserId || process.env.TEST_USER_ID || 'test-user',
    email: headerEmail || process.env.TEST_USER_EMAIL || 'test@lunary.local',
    displayName: 'Test User',
    timezone: headerTimezone || DEFAULT_TIMEZONE,
    locale: extractPrimaryLocale(headerLocale || 'en-GB'),
    plan: fallbackPlan && fallbackPlan !== 'free' ? fallbackPlan : undefined,
    birthday: headerBirthday || undefined,
  };
};

export const requireUser = async (
  request: NextRequest,
): Promise<AuthenticatedUser> => {
  try {
    const headers = Object.fromEntries(request.headers.entries());
    const origin = request.headers.get('origin') || new URL(request.url).origin;
    const cookieHeader = request.headers.get('cookie');
    const forceUnauthorized =
      headers['x-test-force-unauth'] === 'true' ||
      headers['x-test-force-unauth'] === '1';

    const sessionResponse = await (auth as any).api.getSession({
      headers,
    });

    // Debug logging to understand session structure
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AI Auth] Session response:', {
        responseType: typeof sessionResponse,
        isNull: sessionResponse === null,
        isUndefined: sessionResponse === undefined,
        keys: sessionResponse ? Object.keys(sessionResponse) : [],
        hasData: !!sessionResponse?.data,
        hasUser: !!sessionResponse?.user,
        hasSession: !!sessionResponse?.session,
        dataKeys: sessionResponse?.data
          ? Object.keys(sessionResponse.data)
          : [],
      });
    }

    const user =
      sessionResponse?.data?.user ??
      sessionResponse?.user ??
      sessionResponse?.session?.user;

    if (!user?.id) {
      if (isTestMode && !forceUnauthorized) {
        return getTestUser(request);
      }

      console.error('[AI Auth] No user found in session', {
        origin,
        hasCookie: !!cookieHeader,
        cookieLength: cookieHeader?.length || 0,
        sessionResponseKeys: Object.keys(sessionResponse || {}),
        sessionData: sessionResponse?.data
          ? Object.keys(sessionResponse.data)
          : null,
        // Add more details about what we received
        rawResponse: sessionResponse
          ? JSON.stringify(sessionResponse).substring(0, 500)
          : 'null',
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

      // Fetch birthday from user_profiles table if not in session
      if (!user.birthday && !user.birthDate) {
        try {
          const profileResult = await sql`
            SELECT birthday FROM user_profiles WHERE user_id = ${user.id} LIMIT 1
          `;
          if (profileResult.rows.length > 0 && profileResult.rows[0].birthday) {
            // Birthday is encrypted in the database - decrypt it
            dbBirthday = decrypt(profileResult.rows[0].birthday);
          }
        } catch (profileError: any) {
          // Silently ignore if user_profiles table doesn't exist (42P01)
          if (profileError?.code !== '42P01') {
            console.error(
              '[AI Auth] Failed to fetch birthday from user_profiles',
              profileError,
            );
          }
        }
      }
    } catch (error) {
      console.error('[AI Auth] Failed to fetch subscription', error);
    }

    const finalBirthday =
      user.birthday ?? user.birthDate ?? dbBirthday ?? undefined;

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
