import { NextRequest, NextResponse } from 'next/server';
import { kvGet, kvPut } from '@/lib/cloudflare/kv';

const SHARE_TTL_SECONDS = 60 * 60 * 24; // 24 hours

interface PlanetPosition {
  sign: string;
  retrograde?: boolean;
}

export type ShareSkyNowPayload = {
  name?: string;
  positions: Record<string, PlanetPosition>;
  retrogradeCount: number;
  date: string;
  format?: string;
};

export type ShareSkyNowRecord = ShareSkyNowPayload & {
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
      positions,
      retrogradeCount,
      date,
      format = 'square',
    } = body as ShareSkyNowPayload;

    if (!positions || !date) {
      return NextResponse.json(
        { error: 'Missing required sky data' },
        { status: 400 },
      );
    }

    const shareId = createShareId();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';
    const shareUrl = `${baseUrl}/share/sky-now/${shareId}`;

    const record: ShareSkyNowRecord = {
      shareId,
      createdAt: new Date().toISOString(),
      name,
      positions,
      retrogradeCount,
      date,
      format,
    };

    const stored = await kvPut(
      `sky-now:${shareId}`,
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
    console.error('[ShareSkyNow] Failed to create share:', error);
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
    const raw = await kvGet(`sky-now:${shareId}`);
    if (!raw) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    const record = JSON.parse(raw) as ShareSkyNowRecord;
    return NextResponse.json(record);
  } catch (error) {
    console.error('[ShareSkyNow] Failed to retrieve share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
