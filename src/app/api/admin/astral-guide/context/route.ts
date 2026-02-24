import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { requireAdminAuth } from '@/lib/admin-auth';
import { buildAstralContext } from '@/lib/ai/astral-guide';
import { decrypt } from '@/lib/encryption';

const requestSchema = z.object({
  email: z.string().email().optional(),
  userId: z.string().uuid().optional(),
  includePersonalTransits: z.boolean().default(true),
  includePatterns: z.boolean().default(false),
});

export async function POST(request: Request) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { email, userId, includePersonalTransits, includePatterns } =
    parsed.data;

  if (!email && !userId) {
    return NextResponse.json(
      { error: 'email or userId is required' },
      { status: 400 },
    );
  }

  try {
    // Resolve user
    let userRow: { id: string; email: string; name: string | null };
    if (email) {
      const result = await sql`
        SELECT id, email, name FROM "user" WHERE email = ${email} LIMIT 1
      `;
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: `User not found: ${email}` },
          { status: 404 },
        );
      }
      userRow = result.rows[0] as typeof userRow;
    } else {
      const result = await sql`
        SELECT id, email, name FROM "user" WHERE id = ${userId!} LIMIT 1
      `;
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: `User not found: ${userId}` },
          { status: 404 },
        );
      }
      userRow = result.rows[0] as typeof userRow;
    }

    // Fetch birthday
    let birthday: string | undefined;
    try {
      const profileResult = await sql`
        SELECT birthday FROM user_profiles WHERE user_id = ${userRow.id} LIMIT 1
      `;
      if (profileResult.rows.length > 0 && profileResult.rows[0].birthday) {
        birthday = decrypt(profileResult.rows[0].birthday);
      }
    } catch {
      // Birthday may not exist
    }

    const astralContext = await buildAstralContext(
      userRow.id,
      userRow.name ?? undefined,
      birthday,
      new Date(),
      undefined,
      {
        needsPersonalTransits: includePersonalTransits,
        needsNatalPatterns: includePatterns,
        needsPlanetaryReturns: includePatterns,
        needsProgressedChart: false,
        needsEclipses: false,
      },
    );

    return NextResponse.json({
      userId: userRow.id,
      email: userRow.email,
      name: userRow.name,
      birthday: birthday ? 'present' : 'missing',
      astralContext,
    });
  } catch (error) {
    console.error('[admin/astral-guide/context] Error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to build astral context';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
