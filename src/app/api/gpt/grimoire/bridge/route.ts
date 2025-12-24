import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireGptAuth } from '@/lib/gptAuth';
import { resolveGrimoireBridgeWithMeta } from '@/lib/grimoire/bridge-resolver';
import { logDiscordGptEvent } from '@/lib/observability/discord-logger';
import { writeGptBridgeLog } from '@/lib/observability/gpt-bridge-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
};

export async function GET(request: NextRequest) {
  const unauthorized = requireGptAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const requestId = request.headers.get('x-request-id') || randomUUID();
    const seed = searchParams.get('seed')?.trim() || '';
    const typesRaw = searchParams.get('types');
    const limitParam = searchParams.get('limit');
    const limit =
      limitParam && Number.isFinite(Number(limitParam))
        ? Math.min(10, Math.max(1, Number(limitParam)))
        : 5;

    if (!seed || seed.length < 2) {
      return NextResponse.json(
        { error: 'seed is required (min 2 characters)' },
        { status: 400 },
      );
    }

    const typesRequested = typesRaw
      ? typesRaw
          .split(',')
          .map((type) => type.trim().toLowerCase())
          .filter(Boolean)
      : [];

    const { result, meta } = resolveGrimoireBridgeWithMeta({
      seed,
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

    return NextResponse.json(result, { headers: CACHE_HEADERS });
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
    return NextResponse.json(
      { error: 'Failed to bridge grimoire' },
      { status: 500 },
    );
  }
}

// curl -H "Authorization: Bearer $LUNARY_GPT_SECRET" "http://localhost:3000/api/gpt/grimoire/bridge?seed=venus"
// curl -H "Authorization: Bearer $LUNARY_GPT_SECRET" "http://localhost:3000/api/gpt/grimoire/bridge?seed=venus&types=tarot,crystal"
// curl -H "Authorization: Bearer $LUNARY_GPT_SECRET" "http://localhost:3000/api/gpt/grimoire/bridge?seed=amethyst&types=crystal"
