import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ ok: true }); // Silently ignore unsigned-in users
    }

    await sql`
      UPDATE subscriptions
      SET last_pricing_viewed_at = NOW()
      WHERE user_id = ${session.user.id}
      AND status = 'free'
    `;

    return NextResponse.json({ ok: true });
  } catch {
    // Non-critical tracking, don't fail
    return NextResponse.json({ ok: true });
  }
}
