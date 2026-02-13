import { NextRequest, NextResponse } from 'next/server';
import { kvGet, kvPut } from '@/lib/cloudflare/kv';

const SHARE_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days

export type ShareStreakPayload = {
  streakDays: number;
  totalReadings: number;
  totalEntries: number;
  totalRituals: number;
  skillLevels?: Array<{ tree: string; level: number }>;
  userName?: string;
  format?: string;
};

export type ShareStreakRecord = ShareStreakPayload & {
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
    const body = (await request.json()) as ShareStreakPayload;
    const { streakDays, totalReadings, totalEntries, totalRituals } = body;

    if (streakDays === undefined || streakDays < 1) {
      return NextResponse.json(
        { error: 'Missing required streak data' },
        { status: 400 },
      );
    }

    const shareId = createShareId();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';
    const shareUrl = `${baseUrl}/share/streak/${shareId}`;

    const record: ShareStreakRecord = {
      shareId,
      createdAt: new Date().toISOString(),
      streakDays,
      totalReadings: totalReadings || 0,
      totalEntries: totalEntries || 0,
      totalRituals: totalRituals || 0,
      skillLevels: body.skillLevels,
      userName: body.userName,
      format: body.format || 'square',
    };

    const stored = await kvPut(
      `streak:${shareId}`,
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
    console.error('[ShareStreak] Failed to create share:', error);
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
    const raw = await kvGet(`streak:${shareId}`);
    if (!raw) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    const record = JSON.parse(raw) as ShareStreakRecord;
    return NextResponse.json(record);
  } catch (error) {
    console.error('[ShareStreak] Failed to retrieve share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
