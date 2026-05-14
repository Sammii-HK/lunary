import type { MetadataRoute } from 'next';
import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

import { CANONICAL_SITE_URL } from '@/lib/seo/discovery';

export type SeoProtectedPageSource =
  | 'bing-page'
  | 'bing-ai-citation'
  | 'bing-backlink'
  | 'manual';

export type SeoProtectedPage = {
  url: string;
  path?: string;
  source: SeoProtectedPageSource | string;
  reason?: string;
  clicks?: number;
  impressions?: number;
  backlinks?: number;
};

type SeoProtectedPagesManifest = {
  generatedAt: string | null;
  source: string;
  pages: SeoProtectedPage[];
};

const PROTECTED_PAGES_PATH = resolvePath(
  process.cwd(),
  'data',
  'seo-protected-pages.json',
);

function parseProtectedPagesManifest(): SeoProtectedPagesManifest {
  try {
    const content = readFileSync(PROTECTED_PAGES_PATH, 'utf8');
    const parsed = JSON.parse(content) as Partial<SeoProtectedPagesManifest>;
    return {
      generatedAt: parsed.generatedAt ?? null,
      source: parsed.source ?? 'data/seo-protected-pages.json',
      pages: Array.isArray(parsed.pages) ? parsed.pages : [],
    };
  } catch {
    return {
      generatedAt: null,
      source: 'missing data/seo-protected-pages.json',
      pages: [],
    };
  }
}

export function normalizeProtectedSeoUrl(input: string) {
  if (!input) return null;

  try {
    const url = input.startsWith('http')
      ? new URL(input)
      : new URL(input, CANONICAL_SITE_URL);

    if (url.hostname !== new URL(CANONICAL_SITE_URL).hostname) {
      return null;
    }

    url.hash = '';
    url.search = '';
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    return url.toString();
  } catch {
    return null;
  }
}

export function getSeoProtectedPages() {
  const manifest = parseProtectedPagesManifest();
  const byUrl = new Map<string, SeoProtectedPage>();

  for (const page of manifest.pages) {
    const url = normalizeProtectedSeoUrl(page.url || page.path || '');
    if (!url) continue;

    byUrl.set(url, {
      ...page,
      url,
      path: new URL(url).pathname,
    });
  }

  return Array.from(byUrl.values());
}

export function getSeoProtectedRouteEntries(
  lastModified: Date,
): MetadataRoute.Sitemap {
  return getSeoProtectedPages().map((page) => ({
    url: page.url,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority:
      page.source === 'bing-page' ||
      page.source === 'bing-ai-citation' ||
      page.source === 'bing-backlink'
        ? 0.7
        : 0.6,
  }));
}
