import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { kvGet, kvPut } from '@/lib/cloudflare/kv';
import { sql } from '@vercel/postgres';
import { getReferralCode, generateReferralCode } from '@/lib/referrals';

const INVITE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function createInviteCode() {
  const uuid =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : secureRandomHex(8);
  return uuid.replace(/-/g, '').slice(0, 12);
}

function secureRandomHex(bytes: number) {
  const buffer = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(buffer);
  return Array.from(buffer, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

export interface CompatInviteData {
  inviterId: string;
  inviterName: string;
  inviterSign: string;
  inviterChart?: Record<string, unknown>;
  referralCode: string;
  createdAt: string;
}

/**
 * POST /api/compatibility/invite
 * Auth required. Generate a compatibility invite.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    // Get user profile
    const profileResult = await sql`
      SELECT name, sun_sign FROM user_profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    const profile = profileResult.rows[0];
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found. Please set up your profile first.' },
        { status: 400 },
      );
    }

    // Get or generate referral code
    let referralCode = await getReferralCode(userId);
    if (!referralCode) {
      referralCode = await generateReferralCode(userId);
    }

    // Get birth chart data (for synastry)
    const chartResult = await sql`
      SELECT chart_data FROM birth_charts
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const inviteCode = createInviteCode();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

    const inviteData: CompatInviteData = {
      inviterId: userId,
      inviterName: profile.name || 'Cosmic Explorer',
      inviterSign: profile.sun_sign || 'Unknown',
      inviterChart: chartResult.rows[0]?.chart_data || undefined,
      referralCode,
      createdAt: new Date().toISOString(),
    };

    const stored = await kvPut(
      `compat-invite:${inviteCode}`,
      JSON.stringify(inviteData),
      INVITE_TTL_SECONDS,
    );

    if (!stored) {
      return NextResponse.json(
        { error: 'Failed to create invite' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      inviteCode,
      inviteUrl: `${baseUrl}/compatibility/${inviteCode}`,
      inviterName: inviteData.inviterName,
      inviterSign: inviteData.inviterSign,
    });
  } catch (error) {
    console.error('[Compatibility/invite] POST failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/compatibility/invite?code=xxx
 * Public. Retrieve invite data (for the compatibility page).
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing invite code' }, { status: 400 });
  }

  try {
    const raw = await kvGet(`compat-invite:${code}`);
    if (!raw) {
      return NextResponse.json(
        { error: 'Invite not found or expired' },
        { status: 404 },
      );
    }

    const data = JSON.parse(raw) as CompatInviteData;

    // Return public-safe data (no chart details)
    return NextResponse.json({
      inviterName: data.inviterName,
      inviterSign: data.inviterSign,
      referralCode: data.referralCode,
    });
  } catch (error) {
    console.error('[Compatibility/invite] GET failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
