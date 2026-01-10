import { kvGet, kvPut } from '@/lib/cloudflare/kv';
import type { BirthChartData } from '../../../utils/astrology/birthChart';

const SHARE_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days

export type ShareBirthChartPayload = {
  name?: string;
  date?: string;
  sun?: string;
  moon?: string;
  rising?: string;
  element?: string;
  modality?: string;
  insight?: string;
  keywords?: string[];
  placements: BirthChartData[];
};

export type ShareBirthChartRecord = ShareBirthChartPayload & {
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

function createShareId() {
  const uuid =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : secureRandomHex(16);
  return uuid.replace(/-/g, '');
}

export async function createBirthChartShare(
  payload: ShareBirthChartPayload,
): Promise<ShareBirthChartRecord> {
  const shareId = createShareId();
  const record: ShareBirthChartRecord = {
    shareId,
    createdAt: new Date().toISOString(),
    ...payload,
  };
  const stored = await kvPut(
    shareId,
    JSON.stringify(record),
    SHARE_TTL_SECONDS,
  );
  if (!stored) {
    throw new Error('Unable to persist share data');
  }
  return record;
}

export async function getBirthChartShare(
  shareId: string | undefined,
): Promise<ShareBirthChartRecord | null> {
  if (!shareId) return null;
  try {
    const raw = await kvGet(shareId);
    if (!raw) return null;
    const record = JSON.parse(raw) as ShareBirthChartRecord;
    return record;
  } catch (error) {
    console.error('[ShareBirthChart] failed to read share record', error);
    return null;
  }
}
