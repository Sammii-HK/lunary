import { NextRequest, NextResponse } from 'next/server';
import { kvGet, kvPut } from '@/lib/cloudflare/kv';

const SHARE_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days

export type BigThree = {
  sun?: string;
  moon?: string;
  rising?: string;
};

export type TopAspect = {
  person1Planet: string;
  person2Planet: string;
  aspectType: string;
  isHarmonious: boolean;
};

export type ShareSynastryPayload = {
  userName?: string;
  friendName: string;
  compatibilityScore: number;
  summary: string;
  elementCompatibility?: string;
  modalityCompatibility?: string;
  harmoniousAspects?: number;
  challengingAspects?: number;
  person1BigThree?: BigThree;
  person2BigThree?: BigThree;
  topAspects?: TopAspect[];
  elementBalance?: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  archetype?: string;
  format?: string;
};

export type ShareSynastryRecord = ShareSynastryPayload & {
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
      userName,
      friendName,
      compatibilityScore,
      summary,
      elementCompatibility,
      modalityCompatibility,
      harmoniousAspects,
      challengingAspects,
      person1BigThree,
      person2BigThree,
      topAspects,
      elementBalance,
      archetype,
      format = 'square',
    } = body as ShareSynastryPayload;

    if (!friendName || compatibilityScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required synastry data' },
        { status: 400 },
      );
    }

    const shareId = createShareId();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';
    const shareUrl = `${baseUrl}/share/synastry/${shareId}`;

    const record: ShareSynastryRecord = {
      shareId,
      createdAt: new Date().toISOString(),
      userName,
      friendName,
      compatibilityScore,
      summary,
      elementCompatibility,
      modalityCompatibility,
      harmoniousAspects,
      challengingAspects,
      person1BigThree,
      person2BigThree,
      topAspects,
      elementBalance,
      archetype,
      format,
    };

    const stored = await kvPut(
      `synastry:${shareId}`,
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
    console.error('[ShareSynastry] Failed to create share:', error);
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
    const raw = await kvGet(`synastry:${shareId}`);
    if (!raw) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    const record = JSON.parse(raw) as ShareSynastryRecord;
    return NextResponse.json(record);
  } catch (error) {
    console.error('[ShareSynastry] Failed to retrieve share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
