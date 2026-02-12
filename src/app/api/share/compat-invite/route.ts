import { NextRequest, NextResponse } from 'next/server';
import { kvGet, kvPut } from '@/lib/cloudflare/kv';

const SHARE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type ShareCompatInvitePayload = {
  inviterName: string;
  inviterSign: string;
  inviterBigThree?: { sun: string; moon: string; rising: string };
  inviteCode?: string;
  referralCode?: string;
  format?: string;
};

export type ShareCompatInviteRecord = ShareCompatInvitePayload & {
  shareId: string;
  createdAt: string;
};

function createShareId() {
  const uuid =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : secureRandomHex(16);
  return uuid.replace(/-/g, '');
}

function secureRandomHex(bytes: number) {
  const buffer = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(buffer);
  return Array.from(buffer, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ShareCompatInvitePayload;
    const { inviterName, inviterSign } = body;

    if (!inviterName || !inviterSign) {
      return NextResponse.json(
        { error: 'Missing required invite data' },
        { status: 400 },
      );
    }

    const shareId = createShareId();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';
    const shareUrl = `${baseUrl}/compatibility/${body.inviteCode || shareId}`;

    const record: ShareCompatInviteRecord = {
      shareId,
      createdAt: new Date().toISOString(),
      inviterName,
      inviterSign,
      inviterBigThree: body.inviterBigThree,
      inviteCode: body.inviteCode,
      referralCode: body.referralCode,
      format: body.format || 'square',
    };

    const stored = await kvPut(
      `compat-invite:${shareId}`,
      JSON.stringify(record),
      SHARE_TTL_SECONDS,
    );

    if (!stored) {
      return NextResponse.json(
        { error: 'Failed to persist share data' },
        { status: 500 },
      );
    }

    return NextResponse.json({ shareId, shareUrl });
  } catch (error) {
    console.error('[ShareCompatInvite] Failed to create share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shareId = searchParams.get('shareId');

  if (!shareId) {
    return NextResponse.json({ error: 'Missing shareId' }, { status: 400 });
  }

  try {
    const raw = await kvGet(`compat-invite:${shareId}`);
    if (!raw) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    const record = JSON.parse(raw) as ShareCompatInviteRecord;
    return NextResponse.json(record);
  } catch (error) {
    console.error('[ShareCompatInvite] Failed to retrieve share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
