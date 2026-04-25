/**
 * GET  /api/me/handle  → { handle: string | null }
 * POST /api/me/handle  body: { handle: string } → claims a handle.
 *
 * Validation rules:
 *   - lowercase a-z, 0-9, hyphen only
 *   - 3-30 chars
 *   - must not collide (409)
 *
 * Auth: required for both verbs (session via better-auth).
 *
 * TODO(onboarding): surface the "claim your handle" CTA at the end of
 * onboarding (right after birth-chart save) — POST here from the
 * onboarding completion screen and route the user to `/me/{handle}`
 * with a confetti share-prompt. Don't edit onboarding from this PR.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/get-user-session';

export const dynamic = 'force-dynamic';

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

const RESERVED = new Set([
  'admin',
  'api',
  'auth',
  'login',
  'logout',
  'signup',
  'me',
  'support',
  'help',
  'about',
  'privacy',
  'terms',
  'lunary',
  'system',
  'root',
  'undefined',
  'null',
]);

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const result = await sql<{ public_handle: string | null }>`
      SELECT public_handle FROM "user" WHERE id = ${user.id} LIMIT 1
    `;
    return NextResponse.json({
      handle: result.rows[0]?.public_handle ?? null,
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
