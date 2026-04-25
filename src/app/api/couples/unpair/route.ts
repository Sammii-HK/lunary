import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/couples/unpair
 *
 * Removes the signed-in user's active pairing — including any pending pairing
 * code they minted but no one joined. Idempotent: returns 200 even if there
 * was nothing to delete.
 */
export async function DELETE(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api
      .getSession({ headers: headersList })
      .catch(() => null);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }
    const userId = session.user.id;

    const result = await prisma.couple_pairings.deleteMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    });

    return NextResponse.json({ removed: result.count });
  } catch (error) {
    console.error('[Couples/unpair] DELETE failed:', error);
    return NextResponse.json({ error: 'Failed to unpair' }, { status: 500 });
  }
}
