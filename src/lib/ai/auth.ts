import { NextRequest } from 'next/server';

import { auth } from '@/lib/auth';

export type AuthenticatedUser = {
  id: string;
  email?: string;
  displayName?: string;
  timezone?: string;
  locale?: string;
  plan?: string;
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
    const sessionResponse = await (auth as any).api.getSession({
      headers: Object.fromEntries(request.headers.entries()),
    });

    const user =
      sessionResponse?.data?.user ??
      sessionResponse?.user ??
      sessionResponse?.session?.user;

    if (!user?.id) {
      throw new UnauthorizedError();
    }

    return {
      id: user.id,
      email: user.email ?? undefined,
      displayName: user.name ?? user.displayName ?? undefined,
      timezone: user.tz ?? user.timezone ?? DEFAULT_TIMEZONE,
      locale: extractPrimaryLocale(user.locale ?? user.language ?? 'en-GB'),
      plan: user.aiPlan ?? user.plan ?? undefined,
    };
  } catch (error) {
    console.error('[AI Auth] Failed to resolve session', error);
    throw new UnauthorizedError();
  }
};
