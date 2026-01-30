import { NextRequest, NextResponse } from 'next/server';
import { kvGet, kvPut } from '@/lib/cloudflare/kv';

const SHARE_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export type ShareHoroscopePayload = {
  name?: string;
  sunSign: string;
  headline: string;
  overview: string;
  numerologyNumber?: number;
  transitInfo?: {
    planet: string;
    headline: string;
  };
  date: string;
  format?: string;
};

export type ShareHoroscopeRecord = ShareHoroscopePayload & {
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
      sunSign,
      headline,
      overview,
      numerologyNumber,
      transitInfo,
      date,
      format = 'square',
    } = body as ShareHoroscopePayload;

    if (!sunSign || !headline || !overview || !date) {
      return NextResponse.json(
        { error: 'Missing required horoscope data' },
        { status: 400 },
      );
    }

    const shareId = createShareId();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';
    const shareUrl = `${baseUrl}/share/horoscope/${shareId}`;

    const record: ShareHoroscopeRecord = {
      shareId,
      createdAt: new Date().toISOString(),
      name,
      sunSign,
      headline,
      overview,
      numerologyNumber,
      transitInfo,
      date,
      format,
    };

    const stored = await kvPut(
      `horoscope:${shareId}`,
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
    console.error('[ShareHoroscope] Failed to create share:', error);
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
    const raw = await kvGet(`horoscope:${shareId}`);
    if (!raw) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    const record = JSON.parse(raw) as ShareHoroscopeRecord;
    return NextResponse.json(record);
  } catch (error) {
    console.error('[ShareHoroscope] Failed to retrieve share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
