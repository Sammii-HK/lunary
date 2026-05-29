/**
 * GET   /api/me/handle  → { handle: string | null, isPublic: boolean }
 * POST  /api/me/handle  body: { handle: string } → claims a handle (PRIVATE).
 * PATCH /api/me/handle  body: { isPublic: boolean } → sets profile visibility.
 *
 * Validation rules:
 *   - lowercase a-z, 0-9, hyphen only
 *   - 3-30 chars
 *   - must not collide (409)
 *   - must not be reserved (409)
 *
 * Auth: required for all verbs (session via better-auth).
 *
 * Privacy: claiming a handle does NOT publish anything. The public
 * `/me/{handle}` page only renders once the user gives explicit consent via
 * PATCH (`profile_is_public = true`). New profiles default to private.
 *
 * Abuse: POST and PATCH are rate limited per-user and per-IP to blunt handle
 * enumeration (probing 409-taken vs 200) and churn-squatting.
 *
 * TODO(onboarding): surface the "claim your handle" CTA at the end of
 * onboarding (right after birth-chart save) — POST here from the onboarding
 * completion screen. The CTA must keep the profile private until the user
 * explicitly opts in to a public page. Don't edit onboarding from this PR.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/get-user-session';
import { checkRateLimit } from '@/lib/api/rate-limit';

export const dynamic = 'force-dynamic';

const TEN_MINUTES_MS = 10 * 60 * 1000;
// Per-account: blunts churn-squatting + repeated re-claims.
const CLAIM_PER_USER = 5;
// Per-IP: blunts the enumeration oracle across throwaway accounts.
const CLAIM_PER_IP = 12;

/**
 * Trusted client IP. On Vercel `request.ip` (and the appended last hop of
 * `x-forwarded-for`) are platform-set and cannot be forged by the client.
 * NEVER trust the FIRST `x-forwarded-for` hop — that is whatever the client
 * sent and is the rate-limit-bypass vector (security round-2 BLOCKER 1).
 */
function resolveClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  const lastHop = xff ? xff.split(',').pop()?.trim() : null;
  return (request as { ip?: string }).ip || lastHop || 'unknown';
}

const HANDLE_SCHEMA = z
  .string()
  .min(3, 'Handle must be at least 3 characters')
  .max(30, 'Handle must be at most 30 characters')
  .regex(
    /^[a-z0-9-]+$/,
    'Handle can only contain lowercase letters, numbers, and hyphens',
  )
  // Disallow leading/trailing hyphens for cleaner URLs
  .refine((v) => !v.startsWith('-') && !v.endsWith('-'), {
    message: 'Handle cannot start or end with a hyphen',
  });

// Reserved handles. Blocks route collisions, brand/role impersonation, and
// official-looking squats. Expanded in security round-2 (SHOULD-FIX 4).
const RESERVED = new Set([
  // Core routes / app surfaces
  'admin',
  'administrator',
  'api',
  'app',
  'auth',
  'login',
  'logout',
  'signin',
  'signup',
  'register',
  'me',
  'profile',
  'settings',
  'account',
  'dashboard',
  'explore',
  'shop',
  'store',
  'blog',
  'about',
  'contact',
  'privacy',
  'terms',
  'legal',
  'cookies',
  'developers',
  'docs',
  'status',
  'www',
  'mail',
  'email',
  'ftp',
  'cdn',
  'static',
  'assets',
  'img',
  'images',
  'media',
  'static-assets',
  // Roles / authority — impersonation surface
  'official',
  'staff',
  'team',
  'mod',
  'mods',
  'moderator',
  'moderators',
  'security',
  'abuse',
  'trust',
  'safety',
  // Money / support — phishing surface
  'billing',
  'pay',
  'payment',
  'payments',
  'invoice',
  'invoices',
  'refund',
  'refunds',
  'support',
  'help',
  'helpdesk',
  'sales',
  'contactus',
  // Brand
  'lunary',
  'lunaryapp',
  'lunaryhq',
  'lunary-official',
  // System / sentinel values
  'system',
  'root',
  'superuser',
  'sysadmin',
  'null',
  'undefined',
  'none',
  'true',
  'false',
  'test',
  'tests',
]);

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const result = await sql<{
      public_handle: string | null;
      profile_is_public: boolean | null;
    }>`
      SELECT public_handle, profile_is_public FROM "user" WHERE id = ${user.id} LIMIT 1
    `;
    return NextResponse.json({
      handle: result.rows[0]?.public_handle ?? null,
      isPublic: result.rows[0]?.profile_is_public ?? false,
    });
  } catch (error) {
    console.error('[me/handle] GET failed', {
      message: (error as Error)?.message?.slice(0, 200) ?? 'unknown',
    });
    return NextResponse.json(
      { error: 'Failed to load handle' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit BEFORE any DB read so a probe cannot use the 409/200 signal
    // as a cheap handle-existence oracle, and cannot churn-squat handles.
    const ip = resolveClientIp(request);
    const perUser = checkRateLimit(
      `me-handle:user:${user.id}`,
      CLAIM_PER_USER,
      TEN_MINUTES_MS,
    );
    const perIp = checkRateLimit(
      `me-handle:ip:${ip}`,
      CLAIM_PER_IP,
      TEN_MINUTES_MS,
    );
    if (!perUser.allowed || !perIp.allowed) {
      const retryAfterMs = Math.max(perUser.retryAfterMs, perIp.retryAfterMs);
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
        },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      handle?: unknown;
    };

    const raw =
      typeof body.handle === 'string' ? body.handle.toLowerCase().trim() : '';
    const parsed = HANDLE_SCHEMA.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? 'Invalid handle',
          field: 'handle',
        },
        { status: 400 },
      );
    }

    const handle = parsed.data;
    if (RESERVED.has(handle)) {
      return NextResponse.json(
        { error: 'That handle is reserved', field: 'handle' },
        { status: 409 },
      );
    }

    // Collision check — exclude the user's own current handle (idempotent).
    const collision = await sql<{ id: string }>`
      SELECT id FROM "user"
      WHERE public_handle = ${handle}
        AND id != ${user.id}
      LIMIT 1
    `;
    if (collision.rows.length > 0) {
      return NextResponse.json(
        { error: 'That handle is already taken', field: 'handle' },
        { status: 409 },
      );
    }

    // Claim the handle only. Visibility is NOT touched here — the profile
    // stays private (profile_is_public defaults to false) until the user
    // explicitly opts in via PATCH. Claiming never publishes chart data.
    await sql`
      UPDATE "user"
      SET public_handle = ${handle}
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ handle });
  } catch (error) {
    // Postgres unique-violation race — translate to 409.
    const code = (error as { code?: string })?.code;
    if (code === '23505') {
      return NextResponse.json(
        { error: 'That handle is already taken', field: 'handle' },
        { status: 409 },
      );
    }
    console.error('[me/handle] POST failed', {
      message: (error as Error)?.message?.slice(0, 200) ?? 'unknown',
    });
    return NextResponse.json(
      { error: 'Failed to claim handle' },
      { status: 500 },
    );
  }
}

/**
 * Toggle the public visibility of the cosmic-identity profile. This is the
 * explicit-consent step: only when the user sets `isPublic: true` does the
 * `/me/{handle}` page become reachable and indexable. Requires a claimed
 * handle first.
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = resolveClientIp(request);
    const perUser = checkRateLimit(
      `me-handle:visibility:user:${user.id}`,
      CLAIM_PER_USER,
      TEN_MINUTES_MS,
    );
    const perIp = checkRateLimit(
      `me-handle:visibility:ip:${ip}`,
      CLAIM_PER_IP,
      TEN_MINUTES_MS,
    );
    if (!perUser.allowed || !perIp.allowed) {
      const retryAfterMs = Math.max(perUser.retryAfterMs, perIp.retryAfterMs);
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
        },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      isPublic?: unknown;
    };
    if (typeof body.isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'isPublic must be a boolean', field: 'isPublic' },
        { status: 400 },
      );
    }
    const isPublic = body.isPublic;

    // Can only go public with a claimed handle (there is nothing to publish at).
    if (isPublic) {
      const current = await sql<{ public_handle: string | null }>`
        SELECT public_handle FROM "user" WHERE id = ${user.id} LIMIT 1
      `;
      if (!current.rows[0]?.public_handle) {
        return NextResponse.json(
          { error: 'Claim a handle before making your profile public' },
          { status: 409 },
        );
      }
    }

    await sql`
      UPDATE "user"
      SET profile_is_public = ${isPublic}
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ isPublic });
  } catch (error) {
    console.error('[me/handle] PATCH failed', {
      message: (error as Error)?.message?.slice(0, 200) ?? 'unknown',
    });
    return NextResponse.json(
      { error: 'Failed to update visibility' },
      { status: 500 },
    );
  }
}
