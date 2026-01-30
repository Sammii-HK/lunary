import { NextRequest, NextResponse } from 'next/server';
import { kvGet, kvPut } from '@/lib/cloudflare/kv';

const SHARE_TTL_SECONDS = 60 * 60 * 24; // 24 hours (daily refresh)

export type ShareCosmicStatePayload = {
  name?: string;
  moonPhase: {
    name: string;
    icon: {
      src: string;
      alt: string;
    };
  };
  zodiacSeason: string;
  insight: string;
  transit?: {
    headline: string;
    description: string;
  };
  date: string;
  format?: string;
};

export type ShareCosmicStateRecord = ShareCosmicStatePayload & {
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
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) {
    throw new Error('Secure randomness unavailable');
  }
  const buffer = new Uint8Array(bytes);
  cryptoApi.getRandomValues(buffer);
  return Array.from(buffer, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      moonPhase,
      zodiacSeason,
      insight,
      transit,
      date,
      format = 'square',
    } = body as ShareCosmicStatePayload;

    if (!moonPhase || !zodiacSeason || !insight || !date) {
      return NextResponse.json(
        { error: 'Missing required cosmic state data' },
        { status: 400 },
      );
    }

    const shareId = createShareId();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';
    const shareUrl = `${baseUrl}/share/cosmic-state/${shareId}`;

    const record: ShareCosmicStateRecord = {
      shareId,
      createdAt: new Date().toISOString(),
      name,
      moonPhase,
      zodiacSeason,
      insight,
      transit,
      date,
      format,
    };

    const stored = await kvPut(
      `cosmic-state:${shareId}`,
      JSON.stringify(record),
      SHARE_TTL_SECONDS,
    );

    if (!stored) {
      return NextResponse.json(
        { error: 'Failed to persist share data' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      shareId,
      shareUrl,
    });
  } catch (error) {
    console.error('[ShareCosmicState] Failed to create share:', error);
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
    const raw = await kvGet(`cosmic-state:${shareId}`);
    if (!raw) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    const record = JSON.parse(raw) as ShareCosmicStateRecord;
    return NextResponse.json(record);
  } catch (error) {
    console.error('[ShareCosmicState] Failed to retrieve share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
