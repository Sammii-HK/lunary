import { NextRequest, NextResponse } from 'next/server';
import { requireGptAuthJson } from '@/lib/gptAuth';
import {
  getGrimoireEntryBySlug,
  resolveGrimoireSlug,
} from '@/lib/grimoire/slug';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type EntryPayload = {
  seed?: string;
  slug?: string;
  q?: string;
};

async function getEntryPayload(request: NextRequest): Promise<EntryPayload> {
  if (request.method !== 'POST') return {};

  try {
    const body = (await request.json()) as EntryPayload;
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
    const payload = await getEntryPayload(request);
    const seedRaw =
      searchParams.get('slug') ??
      searchParams.get('seed') ??
      searchParams.get('q') ??
      payload.slug ??
      payload.seed ??
      payload.q ??
      '';
    const seed = seedRaw.trim();

    const resolution = resolveGrimoireSlug(seed);
    if (!seed || seed.length < 2 || !resolution.slug) {
      return NextResponse.json({
        ok: true,
        resultCount: 0,
        matchType: 'none',
        suggestions: resolution.suggestions ?? [],
      });
    }

    const entry = getGrimoireEntryBySlug(resolution.slug);
    if (!entry) {
      return NextResponse.json({
        ok: true,
        resultCount: 0,
        matchType: 'none',
        suggestions: resolution.suggestions ?? [],
      });
    }

    return NextResponse.json({
      ok: true,
      resultCount: 1,
      matchType: resolution.matchType,
      resolvedSlug: entry.slug,
      entry: {
        slug: entry.slug,
        title: entry.title,
        summary: entry.summary,
        category: entry.category,
        keywords: entry.keywords,
        relatedSlugs: entry.relatedSlugs,
        url: `https://lunary.app/grimoire/${entry.slug}`,
      },
      suggestions: resolution.suggestions ?? [],
    });
  } catch (error) {
    console.error('GPT grimoire/entry error:', error);
    return NextResponse.json({
      ok: false,
      error: 'internal_error',
      message: 'Failed to resolve grimoire entry.',
    });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
