import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

const MAX_LOGS = 200;
const FETCH_LIMIT = 500;

function parseDays(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 7;
  if (parsed <= 0) return 7;
  return Math.min(30, Math.max(1, parsed));
}

function parseTypes(value: string | null) {
  return value
    ? value
        .split(',')
        .map((type) => type.trim().toLowerCase())
        .filter(Boolean)
    : [];
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const days = parseDays(searchParams.get('days'));
    const level = (searchParams.get('level') || '').toLowerCase();
    const seed = (searchParams.get('seed') || '').trim().toLowerCase();
    const typesFilter = parseTypes(searchParams.get('types'));

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const conditions: Prisma.Sql[] = [
      Prisma.sql`created_at >= ${since}`,
      Prisma.sql`route = 'gpt_grimoire_bridge'`,
    ];

    if (level && level !== 'all') {
      conditions.push(Prisma.sql`level = ${level}`);
    }

    if (seed) {
      conditions.push(Prisma.sql`seed_normalized ILIKE ${`%${seed}%`}`);
    }

    const whereClause = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;

    type RawLogRow = {
      id: string;
      created_at: Date;
      level: string;
      seed_normalized: string;
      seed_raw: string;
      types_requested: unknown;
      limit: number;
      result_count: number;
      curated_count: number;
      alias_hit: boolean;
      search_count: number;
      top_slugs: unknown;
      timing_ms: number;
      message: string;
    };

    const logs = await prisma.$queryRaw<RawLogRow[]>(Prisma.sql`
      SELECT
        id,
        created_at,
        level,
        seed_normalized,
        seed_raw,
        types_requested,
        "limit",
        result_count,
        curated_count,
        alias_hit,
        search_count,
        top_slugs,
        timing_ms,
        message
      FROM gpt_bridge_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${FETCH_LIMIT}
    `);

    const filtered = logs.filter((log) => {
      if (typesFilter.length === 0) return true;
      const raw = log.types_requested;
      const types = Array.isArray(raw)
        ? (raw as string[])
        : typeof raw === 'string'
          ? (JSON.parse(raw) as string[])
          : [];
      return typesFilter.every((type) =>
        types.map((entry) => entry.toLowerCase()).includes(type),
      );
    });

    const sliced = filtered.slice(0, MAX_LOGS);

    const total = sliced.length;
    const warnCount = sliced.filter((log) => log.result_count === 0).length;
    const avgTimingMs =
      total > 0
        ? Math.round(
            sliced.reduce((sum, log) => sum + log.timing_ms, 0) / total,
          )
        : 0;

    const responseLogs = sliced.map((log) => {
      const typesRaw = log.types_requested;
      const topSlugsRaw = log.top_slugs;
      const typesRequested = Array.isArray(typesRaw)
        ? (typesRaw as string[])
        : typeof typesRaw === 'string'
          ? (JSON.parse(typesRaw) as string[])
          : [];
      const topSlugs = Array.isArray(topSlugsRaw)
        ? (topSlugsRaw as string[])
        : typeof topSlugsRaw === 'string'
          ? (JSON.parse(topSlugsRaw) as string[])
          : [];

      return {
        id: log.id,
        createdAt: log.created_at.toISOString(),
        level: log.level,
        seedNormalized: log.seed_normalized,
        seedRaw: log.seed_raw,
        typesRequested,
        limit: log.limit,
        resultCount: log.result_count,
        curatedCount: log.curated_count,
        aliasHit: log.alias_hit,
        searchCount: log.search_count,
        topSlugs,
        timingMs: log.timing_ms,
        message: log.message,
      };
    });

    return NextResponse.json({
      logs: responseLogs,
      stats: {
        total,
        warnRate: total > 0 ? warnCount / total : 0,
        avgTimingMs,
      },
      filters: { days, level: level || 'all', seed, types: typesFilter },
    });
  } catch (error) {
    console.error('[admin/gpt-bridge/logs] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load GPT bridge logs' },
      { status: 500 },
    );
  }
}
