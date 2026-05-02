import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { randomInt } from 'crypto';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const PAIR_CODE_LENGTH = 6;
const MAX_CODE_ATTEMPTS = 8;

const pairBodySchema = z
  .object({
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'Code must be exactly 6 digits')
      .optional(),
  })
  .strict();

/**
 * Generate a cryptographically-random 6-digit pairing code, retrying if it
 * collides with another active (un-completed) pairing. We use `randomInt`
 * (CSPRNG) rather than Math.random for sharing-grade unguessability.
 */
async function mintPairingCode(): Promise<string> {
  for (let i = 0; i < MAX_CODE_ATTEMPTS; i += 1) {
    const candidate = randomInt(0, 1_000_000)
      .toString()
      .padStart(PAIR_CODE_LENGTH, '0');
    const existing = await prisma.couple_pairings.findUnique({
      where: { pairingCode: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error('Failed to mint a unique pairing code');
}

/**
 * POST /api/couples/pair
 *
 *   - No body / `{ code: undefined }` → mint a new pairing for the current
 *     user, store as `userAId = me, pairingCode = <6-digits>`. Return code.
 *   - `{ code }` → look up the pending pairing and join it as user B.
 */
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api
      .getSession({ headers: headersList })
      .catch(() => null);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }
    const userId = session.user.id;

    let body: { code?: string } = {};
    try {
      const json = await request.json();
      body = pairBodySchema.parse(json);
    } catch {
      // Empty body or invalid shape — treat as a "mint" request.
      body = {};
    }

    if (!body.code) {
      // Reuse an existing pending pairing if the user already minted one.
      const existing = await prisma.couple_pairings.findFirst({
        where: { userAId: userId, pairedAt: null },
      });
      if (existing && existing.pairingCode) {
        return NextResponse.json({ code: existing.pairingCode });
      }

      const code = await mintPairingCode();
      const pairing = await prisma.couple_pairings.create({
        data: {
          userAId: userId,
          userBId: '', // sentinel — filled when the partner joins
          pairingCode: code,
        },
      });
      return NextResponse.json({ code: pairing.pairingCode });
    }

    // Joining flow.
    const code = body.code;
    const pending = await prisma.couple_pairings.findUnique({
      where: { pairingCode: code },
    });

    if (!pending) {
      return NextResponse.json(
        { error: 'Invalid or expired pairing code' },
        { status: 404 },
      );
    }
    if (pending.pairedAt || pending.userBId) {
      return NextResponse.json(
        { error: 'This pairing is already complete' },
        { status: 409 },
      );
    }
    if (pending.userAId === userId) {
      return NextResponse.json(
        { error: "You can't pair with yourself" },
        { status: 409 },
      );
    }

    const completed = await prisma.couple_pairings.update({
      where: { id: pending.id },
      data: {
        userBId: userId,
        pairedAt: new Date(),
        pairingCode: null,
      },
    });

    // Best-effort fetch partner display name.
    const partner = await prisma.user.findUnique({
      where: { id: completed.userAId },
      select: { name: true },
    });

    return NextResponse.json({
      partnerId: completed.userAId,
      partnerName: partner?.name ?? 'Your partner',
    });
  } catch (error) {
    console.error('[Couples/pair] POST failed:', error);
    return NextResponse.json({ error: 'Failed to pair' }, { status: 500 });
  }
}
