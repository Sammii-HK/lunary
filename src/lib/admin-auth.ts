import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Shared admin authentication helper.
 *
 * Checks in order:
 * 1. Vercel Cron header (x-vercel-cron === '1') — infrastructure calls
 * 2. Bearer token matching CRON_SECRET — cron / scheduled jobs
 * 3. Bearer token matching ADMIN_API_KEY — MCP / programmatic access
 * 4. Session + admin email — browser / dashboard access
 *
 * Returns `{ ok: true }` on success, or a 401/403 NextResponse on failure.
 */
export async function requireAdminAuth(
  request: Request,
): Promise<{ ok: true } | NextResponse> {
  // 1. Vercel Cron infrastructure header
  if (request.headers.get('x-vercel-cron') === '1') {
    return { ok: true };
  }

  // 2. Bearer token (CRON_SECRET or ADMIN_API_KEY)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const adminApiKey = process.env.ADMIN_API_KEY;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return { ok: true };
  }

  if (adminApiKey && authHeader === `Bearer ${adminApiKey}`) {
    return { ok: true };
  }

  // 3. Session + admin email whitelist
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userEmail = session?.user?.email?.toLowerCase();

    if (userEmail) {
      const adminEmails = (
        process.env.ADMIN_EMAILS ||
        process.env.ADMIN_EMAIL ||
        process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
        process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
        ''
      )
        .split(',')
        .map((email: string) => email.trim().toLowerCase())
        .filter(Boolean);

      if (adminEmails.includes(userEmail)) {
        return { ok: true };
      }

      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } catch {
    // Session check failed — fall through to 401
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
