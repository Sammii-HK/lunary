import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireGptAuthJson } from '@/lib/gptAuth';
import { resolveGrimoireBridgeWithMeta } from '@/lib/grimoire/bridge-resolver';
import {
  getGrimoireEntryBySlug,
  resolveGrimoireSlug,
} from '@/lib/grimoire/slug';
import { logDiscordGptEvent } from '@/lib/observability/discord-logger';
import { writeGptBridgeLog } from '@/lib/observability/gpt-bridge-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
};

type BridgePayload = {
  seed?: string;
  slug?: string;
  q?: string;
  types?: string;
  limit?: number;
};

async function getBridgePayload(request: NextRequest): Promise<BridgePayload> {
  if (request.method !== 'POST') return {};

  try {
    const body = (await request.json()) as BridgePayload;
    return body ?? {};
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  const unauthorized = requireGptAuthJson(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const requestId = request.headers.get('x-request-id') || randomUUID();
    const payload = await getBridgePayload(request);
    const seedRaw =
      searchParams.get('seed') ??
      searchParams.get('slug') ??
      searchParams.get('q') ??
      payload.seed ??
      payload.slug ??
      payload.q ??
      '';
    const seed = seedRaw.trim();
    const typesRaw = searchParams.get('types') ?? payload.types;
    const limitParam =
      searchParams.get('limit') ?? payload.limit?.toString() ?? null;
    const limit =
      limitParam && Number.isFinite(Number(limitParam))
        ? Math.min(10, Math.max(1, Number(limitParam)))
        : 5;

    const resolution = resolveGrimoireSlug(seed);

    if (!seed || seed.length < 2 || !resolution.slug) {
      return NextResponse.json({
        ok: true,
        seed,
        typesRequested: [],
        resultCount: 0,
        matchType: 'none',
        suggestions: resolution.suggestions ?? [],
        links: [],
        ctaUrl: 'https://lunary.app/grimoire/search?from=gpt_grimoire_bridge',
        ctaText: 'Explore the complete Lunary Grimoire',
        source: 'Lunary.app - Digital Grimoire with 500+ pages',
      });
    }

    const typesRequested = typesRaw
      ? typesRaw
          .split(',')
          .map((type) => type.trim().toLowerCase())
          .filter(Boolean)
      : [];

    const resolvedEntry = getGrimoireEntryBySlug(resolution.slug);
    const bridgeSeed = resolvedEntry?.title ?? seed;

    const { result, meta } = resolveGrimoireBridgeWithMeta({
      seed: bridgeSeed,
      types: typesRequested,
      limit,
    });

    const level = result.resultCount === 0 ? 'warn' : 'info';
    const message =
      result.resultCount === 0
        ? 'No grimoire bridge results'
        : 'Grimoire bridge resolved';

    void writeGptBridgeLog({
      route: 'gpt_grimoire_bridge',
      seedRaw: seed,
      seedNormalized: result.seed,
      typesRequested: result.typesRequested,
      limit,
      resultCount: result.resultCount,
      curatedCount: meta.sourceBreakdown.curatedCount,
      aliasHit: meta.sourceBreakdown.aliasHit,
      searchCount: meta.sourceBreakdown.searchCount,
      topSlugs: result.links.slice(0, 3).map((link) => link.slug),
      timingMs: meta.timingMs,
      cacheStatus: null,
      level,
      message,
    });

    void logDiscordGptEvent({
      level,
      message,
      routeName: 'gpt_grimoire_bridge',
      requestId,
      normalizedSeed: result.seed,
      typesRequested: result.typesRequested,
      limit,
      resultCount: result.resultCount,
      topResults: meta.topResults,
      sourceBreakdown: meta.sourceBreakdown,
      timingMs: meta.timingMs,
      cache: 'miss',
    });

    return NextResponse.json(
      {
        ...result,
        ok: true,
        matchType: resolution.matchType,
        resolvedSlug: resolution.slug,
        suggestions: resolution.suggestions ?? [],
      },
      { headers: CACHE_HEADERS },
    );
  } catch (error) {
    console.error('GPT grimoire/bridge error:', error);
    const requestId = request.headers.get('x-request-id') || randomUUID();
    const err = error as Error;
    const { searchParams } = new URL(request.url);
    const seedRaw = searchParams.get('seed')?.trim() || '';
    const typesRaw = searchParams.get('types') || '';
    const limitParam = searchParams.get('limit');
    const parsedLimit =
      limitParam && Number.isFinite(Number(limitParam))
        ? Math.min(10, Math.max(1, Number(limitParam)))
        : 5;
    const parsedTypes = typesRaw
      ? typesRaw
          .split(',')
          .map((type) => type.trim().toLowerCase())
          .filter(Boolean)
      : [];

    void writeGptBridgeLog({
      route: 'gpt_grimoire_bridge',
      seedRaw,
      seedNormalized: seedRaw.toLowerCase(),
      typesRequested: parsedTypes,
      limit: parsedLimit,
      resultCount: 0,
      curatedCount: 0,
      aliasHit: false,
      searchCount: 0,
      topSlugs: [],
      timingMs: 0,
      cacheStatus: null,
      level: 'error',
      message: 'Failed to bridge grimoire',
      errorName: err.name,
      errorMessage: err.message,
    });
    void logDiscordGptEvent({
      level: 'error',
      message: 'Failed to bridge grimoire',
      routeName: 'gpt_grimoire_bridge',
      requestId,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      cache: 'miss',
    });
    return NextResponse.json({
      ok: false,
      error: 'internal_error',
      message: 'Failed to bridge grimoire.',
    });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}

// curl -H "Authorization: Bearer $LUNARY_GPT_SECRET" "http://localhost:3000/api/gpt/grimoire/bridge?seed=venus"
// curl -H "Authorization: Bearer $LUNARY_GPT_SECRET" "http://localhost:3000/api/gpt/grimoire/bridge?seed=venus&types=tarot,crystal"
// curl -H "Authorization: Bearer $LUNARY_GPT_SECRET" "http://localhost:3000/api/gpt/grimoire/bridge?seed=amethyst&types=crystal"
