import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type GptBridgeLogInput = {
  route: string;
  seedRaw: string;
  seedNormalized: string;
  typesRequested: string[];
  limit: number;
  resultCount: number;
  curatedCount: number;
  aliasHit: boolean;
  searchCount: number;
  topSlugs: string[];
  timingMs: number;
  cacheStatus?: 'hit' | 'miss' | null;
  level: 'info' | 'warn' | 'error';
  message: string;
  errorName?: string | null;
  errorMessage?: string | null;
};

const DEFAULT_SAMPLE_RATE = 0.15;

function parseSampleRate(value?: string | null) {
  if (!value) return DEFAULT_SAMPLE_RATE;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_SAMPLE_RATE;
  return Math.min(1, Math.max(0, parsed));
}

function shouldWrite(level: GptBridgeLogInput['level'], sampleRate: number) {
  if (level !== 'info') return true;
  if (sampleRate <= 0) return false;
  if (sampleRate >= 1) return true;
  return Math.random() < sampleRate;
}

export async function writeGptBridgeLog(data: GptBridgeLogInput) {
  try {
    const sampleRate = parseSampleRate(process.env.DISCORD_GPT_LOG_SAMPLE_RATE);
    if (!shouldWrite(data.level, sampleRate)) return;

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO gpt_bridge_logs (
        route,
        seed_raw,
        seed_normalized,
        types_requested,
        "limit",
        result_count,
        curated_count,
        alias_hit,
        search_count,
        top_slugs,
        timing_ms,
        cache_status,
        level,
        message,
        error_name,
        error_message
      ) VALUES (
        ${data.route},
        ${data.seedRaw},
        ${data.seedNormalized},
        ${JSON.stringify(data.typesRequested)}::jsonb,
        ${data.limit},
        ${data.resultCount},
        ${data.curatedCount},
        ${data.aliasHit},
        ${data.searchCount},
        ${JSON.stringify(data.topSlugs)}::jsonb,
        ${data.timingMs},
        ${data.cacheStatus ?? null},
        ${data.level},
        ${data.message},
        ${data.errorName ?? null},
        ${data.errorMessage ?? null}
      )
    `);
  } catch {
    // Best-effort logging only.
  }
}
