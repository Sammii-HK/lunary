import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { kvGet, kvPut } from '@/lib/cloudflare/kv';
import { appendRef, getShareReferralCode } from '@/lib/share/referral-url';

export const dynamic = 'force-dynamic';

const SHARE_TTL_SECONDS = 60 * 60 * 24; // 24 hours (daily refresh)

const cosmicStateShareSchema = z.object({
  name: z.string().max(64).optional(),
  moonPhase: z.object({
    name: z.string().max(64),
    icon: z.object({
      src: z.string().max(256),
      alt: z.string().max(64),
    }),
  }),
  zodiacSeason: z.string().max(32),
  insight: z.string().max(512),
  transit: z
    .object({
      headline: z.string().max(128),
      description: z.string().max(512),
    })
    .optional(),
  date: z.string().max(32),
  format: z.string().max(16).optional(),
});

export type ShareCosmicStatePayload = z.infer<typeof cosmicStateShareSchema>;

export type ShareCosmicStateRecord = ShareCosmicStatePayload & {
  shareId: string;
  createdAt: string;
  /** Sharer's referral code, captured at share-creation time. */
  referralCode?: string;
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
    const parsed = cosmicStateShareSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid share payload',
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const {
      name,
      moonPhase,
      zodiacSeason,
      insight,
      transit,
      date,
      format = 'square',
    } = parsed.data;

    // Capture the sharer's referral code (if signed in) once, then use it two
    // ways: append it to the returned shareUrl so recipients' signups attribute
    // back and unlock the referral reward, and persist it on the record so the
    // public share page can carry attribution too. Anonymous shares no-op.
    const referralCode = await getShareReferralCode(request.headers);

    const shareId = createShareId();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';
    const shareUrl = appendRef(
      `${baseUrl}/share/cosmic-state/${shareId}`,
      referralCode,
    );

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
      referralCode: referralCode ?? undefined,
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
      success: true,
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
