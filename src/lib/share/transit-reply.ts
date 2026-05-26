import { kvGet, kvPut } from '@/lib/cloudflare/kv';
import type { BirthChartData } from '../../../utils/astrology/birthChart';
import type {
  ChartReplyAnalysis,
  TransitReplyAnalysis,
  TransitReplyAspect,
  TransitReplyHouseCusp,
} from '@/lib/transit-reply/analysis';

const SHARE_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days

export type ShareTransitReplyPayload = {
  mode?: 'transits' | 'birth-chart';
  chartMeta?: {
    provider?: string | null;
    confidence?: 'high' | 'medium' | 'low';
    houseConfidence?: 'high' | 'medium' | 'low';
    houseSystem?: string | null;
    houseNumberingDirection?: 'clockwise' | 'counterclockwise' | 'unknown';
    birthDate?: string | null;
    birthTime?: string | null;
    birthLocation?: string | null;
  };
  name?: string;
  question?: string;
  sourceUrl?: string;
  birthChart: BirthChartData[];
  houseCusps?: TransitReplyHouseCusp[];
  date: string;
  analysis: TransitReplyAnalysis | ChartReplyAnalysis;
  redditReply: string;
  warnings?: string[];
};

export type ShareTransitReplyRecord = ShareTransitReplyPayload & {
  shareId: string;
  createdAt: string;
};

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

export function createTransitReplyShareId() {
  const uuid =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : secureRandomHex(16);
  return uuid.replace(/-/g, '');
}

export async function createTransitReplyShare(
  payload: ShareTransitReplyPayload,
  shareId = createTransitReplyShareId(),
): Promise<ShareTransitReplyRecord> {
  const record: ShareTransitReplyRecord = {
    shareId,
    createdAt: new Date().toISOString(),
    ...payload,
  };

  const stored = await kvPut(
    `transit-reply:${shareId}`,
    JSON.stringify(record),
    SHARE_TTL_SECONDS,
  );

  if (!stored) {
    throw new Error('Unable to persist transit reply share');
  }

  return record;
}

export async function getTransitReplyShare(
  shareId: string | undefined,
): Promise<ShareTransitReplyRecord | null> {
  if (!shareId) return null;
  try {
    const raw = await kvGet(`transit-reply:${shareId}`);
    if (!raw) return null;
    return JSON.parse(raw) as ShareTransitReplyRecord;
  } catch (error) {
    console.error('[ShareTransitReply] failed to read share record', error);
    return null;
  }
}

export function transitReplyImageUrl(shareId: string, baseUrl: string) {
  return `${baseUrl}/api/og/share/transit-reply?shareId=${encodeURIComponent(
    shareId,
  )}`;
}

export function transitReplyImagePngUrl(shareId: string, baseUrl: string) {
  return `${baseUrl}/api/og/share/transit-reply.png?shareId=${encodeURIComponent(
    shareId,
  )}`;
}

export function primaryTransitLabel(transits: TransitReplyAspect[]) {
  const first = transits[0];
  if (!first) return 'Live transit overlay';
  return `${first.transitPlanet} ${first.aspect.toLowerCase()} natal ${first.natalPlanet}`;
}

export function isTransitReplyAnalysis(
  analysis: ShareTransitReplyPayload['analysis'],
): analysis is TransitReplyAnalysis {
  return 'transits' in analysis && Array.isArray(analysis.transits);
}

export function isChartReplyAnalysis(
  analysis: ShareTransitReplyPayload['analysis'],
): analysis is ChartReplyAnalysis {
  return 'placements' in analysis && Array.isArray(analysis.placements);
}
