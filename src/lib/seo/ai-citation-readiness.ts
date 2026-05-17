import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { CANONICAL_SITE_URL } from '@/lib/seo/discovery';

export type AiCitationMap = {
  name?: string;
  version?: string;
  prioritySurfaces?: AiCitationSurface[];
};

export type AiCitationSurface = {
  topic?: string;
  canonicalUrl?: string;
  supportingUrls?: string[];
  preferredFor?: string[];
  entities?: string[];
};

export type CitationTarget = {
  url: string;
  pathname: string;
  topic: string;
  role: 'canonical' | 'supporting';
};

export type RouteSourceMatch = {
  absolutePath: string;
  relativePath: string;
  pattern: string;
  exactSegments: number;
  dynamicSegments: number;
};

export type SourceReadinessSignals = {
  usesSeoContentTemplate: boolean;
  hasCanonicalSignal: boolean;
  hasDirectAnswerSignal: boolean;
  hasStructuredDataSignal: boolean;
  hasFaqSignal: boolean;
};

export type CitationReadinessResult = CitationTarget & {
  score: number;
  grade: 'excellent' | 'good' | 'needs-work' | 'critical';
  routeSource?: RouteSourceMatch;
  sourceSignals?: SourceReadinessSignals;
  inSitemap: boolean | null;
  protectedSeoPage: boolean;
  issues: string[];
  recommendations: string[];
};

export type CitationReadinessSummary = {
  generatedAt: string;
  source: string;
  targetCount: number;
  averageScore: number;
  excellent: number;
  good: number;
  needsWork: number;
  critical: number;
};

export type CitationReadinessReport = {
  summary: CitationReadinessSummary;
  results: CitationReadinessResult[];
};

type AppPageRoute = {
  absolutePath: string;
  relativePath: string;
  pattern: string;
  segments: string[];
};

const PRIVATE_CITATION_PREFIXES = [
  '/admin',
  '/api',
  '/auth',
  '/checkout',
  '/profile',
  '/shop/success',
];

function normalizePathname(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '');
  return normalized || '/';
}

function isRouteGroup(segment: string) {
  return segment.startsWith('(') && segment.endsWith(')');
}

function isDynamicSegment(segment: string) {
  return segment.startsWith('[') && segment.endsWith(']');
}

function isCatchAllSegment(segment: string) {
  return segment.startsWith('[...') || segment.startsWith('[[...');
}

function walkFiles(dir: string, fileNames: string[], output: string[] = []) {
  if (!existsSync(dir)) return output;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolutePath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(absolutePath, fileNames, output);
      continue;
    }

    if (fileNames.includes(entry.name)) {
      output.push(absolutePath);
    }
  }

  return output;
}

function buildAppPageRoutes(projectRoot: string): AppPageRoute[] {
  const appDir = join(projectRoot, 'src/app');
  return walkFiles(appDir, ['page.tsx', 'page.ts'])
    .filter((absolutePath) => !absolutePath.includes('/(authenticated)/'))
    .map((absolutePath) => {
      const relativePath = relative(projectRoot, absolutePath);
      const routeSegments = relative(appDir, absolutePath)
        .split('/')
        .slice(0, -1)
        .filter((segment) => segment && !isRouteGroup(segment));

      return {
        absolutePath,
        relativePath,
        pattern: `/${routeSegments.join('/')}`.replace(/\/+$/, '') || '/',
        segments: routeSegments,
      };
    });
}

export function loadAiCitationMap(
  projectRoot = process.cwd(),
  relativePath = 'public/ai-citation-map.json',
): AiCitationMap {
  const absolutePath = resolve(projectRoot, relativePath);
  return JSON.parse(readFileSync(absolutePath, 'utf8')) as AiCitationMap;
}

export function extractCitationTargets(map: AiCitationMap): CitationTarget[] {
  const targets = new Map<string, CitationTarget>();

  for (const surface of map.prioritySurfaces || []) {
    const topic = surface.topic || 'Untitled topic';
    const urls = [
      { url: surface.canonicalUrl, role: 'canonical' as const },
      ...(surface.supportingUrls || []).map((url) => ({
        url,
        role: 'supporting' as const,
      })),
    ];

    for (const entry of urls) {
      if (!entry.url) continue;
      const normalized = normalizeLunaryUrl(entry.url);
      if (!normalized) continue;

      if (!targets.has(normalized.url)) {
        targets.set(normalized.url, {
          url: normalized.url,
          pathname: normalized.pathname,
          topic,
          role: entry.role,
        });
      }
    }
  }

  return Array.from(targets.values()).sort((a, b) =>
    a.pathname.localeCompare(b.pathname),
  );
}

export function normalizeLunaryUrl(input: string) {
  try {
    const url = input.startsWith('http')
      ? new URL(input)
      : new URL(input, CANONICAL_SITE_URL);
    const canonicalHost = new URL(CANONICAL_SITE_URL).hostname;

    if (url.hostname !== canonicalHost) {
      return null;
    }

    url.protocol = 'https:';
    url.hash = '';
    url.search = '';
    url.pathname = normalizePathname(url.pathname);

    return {
      url: url.toString(),
      pathname: url.pathname,
    };
  } catch {
    return null;
  }
}

export function resolveRouteSource(
  pathname: string,
  projectRoot = process.cwd(),
): RouteSourceMatch | null {
  const normalizedPath = normalizePathname(pathname);
  const targetSegments =
    normalizedPath === '/' ? [] : normalizedPath.slice(1).split('/');
  const candidates: RouteSourceMatch[] = [];

  for (const route of buildAppPageRoutes(projectRoot)) {
    if (route.segments.length !== targetSegments.length) continue;

    let exactSegments = 0;
    let dynamicSegments = 0;
    let matched = true;

    route.segments.forEach((segment, index) => {
      if (!matched) return;
      if (segment === targetSegments[index]) {
        exactSegments += 1;
        return;
      }

      if (isDynamicSegment(segment) || isCatchAllSegment(segment)) {
        dynamicSegments += 1;
        return;
      }

      matched = false;
    });

    if (!matched) continue;
    candidates.push({
      absolutePath: route.absolutePath,
      relativePath: route.relativePath,
      pattern: route.pattern,
      exactSegments,
      dynamicSegments,
    });
  }

  return (
    candidates.sort((a, b) => {
      if (b.exactSegments !== a.exactSegments) {
        return b.exactSegments - a.exactSegments;
      }

      return a.dynamicSegments - b.dynamicSegments;
    })[0] || null
  );
}

export function analyzeSourceReadiness(
  sourcePath: string,
): SourceReadinessSignals {
  const content = readFileSync(sourcePath, 'utf8');

  return {
    usesSeoContentTemplate: content.includes('SEOContentTemplate'),
    hasCanonicalSignal:
      content.includes('canonicalUrl') ||
      content.includes('alternates') ||
      content.includes('canonical:'),
    hasDirectAnswerSignal:
      content.includes('whatIs=') ||
      content.includes('whatIs={{') ||
      content.includes('tldr=') ||
      content.includes('tldr:') ||
      content.includes('description='),
    hasStructuredDataSignal:
      content.includes('SEOContentTemplate') ||
      content.includes('renderJsonLd') ||
      content.includes('createArticleSchema') ||
      content.includes('createDefinedTermSchema') ||
      content.includes('createFAQPageSchema'),
    hasFaqSignal:
      content.includes('faqs=') ||
      content.includes('faqs:') ||
      content.includes('createFAQPageSchema'),
  };
}

export function isPublicCitationPath(pathname: string) {
  return !PRIVATE_CITATION_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function loadProtectedSeoPaths(projectRoot = process.cwd()) {
  const manifestPath = join(projectRoot, 'data/seo-protected-pages.json');
  if (!existsSync(manifestPath)) return new Set<string>();

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      pages?: Array<{ url?: string; path?: string }>;
    };

    return new Set(
      (manifest.pages || [])
        .map((page) => normalizeLunaryUrl(page.url || page.path || ''))
        .filter((entry): entry is { url: string; pathname: string } =>
          Boolean(entry),
        )
        .map((entry) => entry.pathname),
    );
  } catch {
    return new Set<string>();
  }
}

function gradeForScore(score: number): CitationReadinessResult['grade'] {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 45) return 'needs-work';
  return 'critical';
}

export function scoreCitationTarget(params: {
  target: CitationTarget;
  projectRoot?: string;
  sitemapUrls?: Set<string> | null;
  protectedSeoPaths?: Set<string>;
}): CitationReadinessResult {
  const projectRoot = params.projectRoot || process.cwd();
  const sitemapUrls = params.sitemapUrls ?? null;
  const protectedSeoPaths =
    params.protectedSeoPaths || loadProtectedSeoPaths(projectRoot);
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;

  const normalized = normalizeLunaryUrl(params.target.url);
  if (normalized) {
    score += 10;
  } else {
    issues.push('URL is not a canonical Lunary URL.');
    recommendations.push('Use a https://lunary.app canonical URL.');
  }

  if (isPublicCitationPath(params.target.pathname)) {
    score += 10;
  } else {
    issues.push('URL points at a private or non-citable product surface.');
    recommendations.push(
      'Replace this with a public canonical reference page.',
    );
  }

  const routeSource = resolveRouteSource(params.target.pathname, projectRoot);
  let sourceSignals: SourceReadinessSignals | undefined;
  if (routeSource) {
    score += 15;
    sourceSignals = analyzeSourceReadiness(routeSource.absolutePath);
  } else {
    issues.push('No matching Next.js page source was found.');
    recommendations.push(
      'Create a public page or remove this URL from the citation map.',
    );
  }

  const inSitemap = sitemapUrls
    ? sitemapUrls.has(params.target.url) ||
      sitemapUrls.has(params.target.url.replace(/\/$/, ''))
    : null;
  if (inSitemap) {
    score += 15;
  } else if (inSitemap === false) {
    issues.push('URL was not found in the generated sitemap inventory.');
    recommendations.push(
      'Add this URL to a curated sitemap or explain why it is intentionally off-sitemap.',
    );
  }

  const protectedSeoPage = protectedSeoPaths.has(params.target.pathname);
  if (protectedSeoPage) {
    score += 10;
  } else if (params.target.role === 'canonical') {
    recommendations.push(
      'Add this canonical authority page to data/seo-protected-pages.json.',
    );
  }

  if (sourceSignals?.usesSeoContentTemplate) {
    score += 15;
  } else if (routeSource) {
    issues.push('Page does not appear to use SEOContentTemplate.');
    recommendations.push(
      'Move this page onto SEOContentTemplate or add equivalent answer/schema blocks.',
    );
  }

  if (sourceSignals?.hasCanonicalSignal) {
    score += 10;
  } else if (routeSource) {
    issues.push('Page source does not expose an obvious canonical signal.');
    recommendations.push(
      'Add an explicit canonical URL in metadata or SEOContentTemplate props.',
    );
  }

  if (sourceSignals?.hasDirectAnswerSignal) {
    score += 10;
  } else if (routeSource) {
    issues.push('Page source does not expose an obvious direct answer signal.');
    recommendations.push(
      'Add a concise whatIs or TL;DR answer block near the top of the page.',
    );
  }

  if (sourceSignals?.hasStructuredDataSignal) {
    score += 10;
  } else if (routeSource) {
    issues.push(
      'Page source does not expose an obvious structured data signal.',
    );
    recommendations.push(
      'Add Article, DefinedTerm, FAQ, or Breadcrumb structured data where appropriate.',
    );
  }

  if (sourceSignals?.hasFaqSignal) {
    score += 5;
  } else if (params.target.role === 'canonical') {
    recommendations.push(
      'Consider adding tightly scoped FAQs for long-tail answer extraction.',
    );
  }

  const normalizedScore = Math.min(score, 100);

  return {
    ...params.target,
    score: normalizedScore,
    grade: gradeForScore(normalizedScore),
    routeSource,
    sourceSignals,
    inSitemap,
    protectedSeoPage,
    issues,
    recommendations: Array.from(new Set(recommendations)),
  };
}

export function summarizeCitationReadiness(
  results: CitationReadinessResult[],
  source = 'public/ai-citation-map.json',
): CitationReadinessSummary {
  const averageScore = results.length
    ? Math.round(
        results.reduce((total, result) => total + result.score, 0) /
          results.length,
      )
    : 0;

  return {
    generatedAt: new Date().toISOString(),
    source,
    targetCount: results.length,
    averageScore,
    excellent: results.filter((result) => result.grade === 'excellent').length,
    good: results.filter((result) => result.grade === 'good').length,
    needsWork: results.filter((result) => result.grade === 'needs-work').length,
    critical: results.filter((result) => result.grade === 'critical').length,
  };
}

export function createCitationReadinessReport(params: {
  map: AiCitationMap;
  projectRoot?: string;
  sitemapUrls?: Set<string> | null;
  protectedSeoPaths?: Set<string>;
}) {
  const projectRoot = params.projectRoot || process.cwd();
  const protectedSeoPaths =
    params.protectedSeoPaths || loadProtectedSeoPaths(projectRoot);
  const results = extractCitationTargets(params.map).map((target) =>
    scoreCitationTarget({
      target,
      projectRoot,
      sitemapUrls: params.sitemapUrls,
      protectedSeoPaths,
    }),
  );

  return {
    summary: summarizeCitationReadiness(results),
    results,
  };
}

export function renderCitationReadinessMarkdown(
  report: CitationReadinessReport,
) {
  const lines: string[] = [
    '# AI Citation Readiness',
    '',
    `Generated: ${report.summary.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Targets audited: ${report.summary.targetCount}`,
    `- Average score: ${report.summary.averageScore}/100`,
    `- Excellent: ${report.summary.excellent}`,
    `- Good: ${report.summary.good}`,
    `- Needs work: ${report.summary.needsWork}`,
    `- Critical: ${report.summary.critical}`,
    '',
    '## Priority Fixes',
    '',
  ];

  const needsWork = report.results
    .filter((result) => result.grade !== 'excellent')
    .sort((a, b) => a.score - b.score);

  if (needsWork.length === 0) {
    lines.push('Every mapped target is in excellent shape.');
  } else {
    for (const result of needsWork.slice(0, 15)) {
      lines.push(
        `- ${result.score}/100 ${result.grade}: ${result.pathname} (${result.topic}, ${result.role})`,
      );
      result.issues.slice(0, 3).forEach((issue) => {
        lines.push(`  - Issue: ${issue}`);
      });
      result.recommendations.slice(0, 3).forEach((recommendation) => {
        lines.push(`  - Next: ${recommendation}`);
      });
    }
  }

  lines.push('', '## Full Results', '');
  lines.push(
    '| Score | Grade | Role | Topic | URL | Source | Sitemap | Protected |',
  );
  lines.push('| ---: | --- | --- | --- | --- | --- | --- | --- |');

  for (const result of report.results.sort((a, b) => b.score - a.score)) {
    lines.push(
      `| ${result.score} | ${result.grade} | ${result.role} | ${result.topic} | ${result.url} | ${result.routeSource?.relativePath || 'missing'} | ${result.inSitemap === null ? 'unknown' : result.inSitemap ? 'yes' : 'no'} | ${result.protectedSeoPage ? 'yes' : 'no'} |`,
    );
  }

  return `${lines.join('\n')}\n`;
}
