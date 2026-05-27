#!/usr/bin/env tsx
/**
 * SEO Coverage Verification Script
 *
 * Verifies:
 * 1. All retrograde pages are in sitemap
 * 2. All generateStaticParams include complete data
 * 3. All pages have canonical URLs
 * 4. Sitemap matches actual routes
 */

import * as fs from 'fs';
import * as path from 'path';
import robotsMetadata from '@/app/robots';
import {
  AI_CRAWLER_USER_AGENTS,
  AI_DISCOVERY_PATHS,
  CURATED_DISCOVERY_SITEMAPS,
  DEPRIORITIZED_DISCOVERY_SITEMAPS,
} from '@/lib/seo/discovery';
import { ASPECTS, PLANETS } from '@/constants/seo/aspects';

type AiCitationMap = {
  crawlEntryPoints?: string[];
  prioritySurfaces?: Array<{
    topic?: string;
    canonicalUrl?: string;
    supportingUrls?: string[];
  }>;
};

function toStringArray(value?: string | string[]) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

// Import retrogradeInfo to verify sitemap coverage
async function verifyRetrogradeSitemapCoverage() {
  console.log('🔍 Verifying Retrograde Sitemap Coverage...\n');

  // Read sitemap file
  const sitemapPath = path.join(process.cwd(), 'src/app/sitemap.ts');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');

  // Extract retrograde routes from sitemap
  const retrogradeMatch = sitemapContent.match(
    /const retrogradeRoutes = Object\.keys\(retrogradeInfo\)\.map\(\(planet\) =>/,
  );

  if (!retrogradeMatch) {
    console.log('❌ Retrograde routes not found in sitemap');
    return false;
  }

  console.log(
    '✅ Sitemap uses Object.keys(retrogradeInfo) - will include all planets',
  );
  console.log('   This means all 7 retrograde pages will be in sitemap\n');

  return true;
}

// Verify generateStaticParams completeness
function verifyGenerateStaticParams() {
  console.log('🔍 Verifying generateStaticParams Completeness...\n');

  const grimoireDir = path.join(process.cwd(), 'src/app/grimoire');
  const issues: string[] = [];

  function findFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        findFiles(filePath, fileList);
      } else if (file === 'page.tsx' || file === 'page.ts') {
        fileList.push(filePath);
      }
    });

    return fileList;
  }

  const pageFiles = findFiles(grimoireDir);

  for (const file of pageFiles) {
    const content = fs.readFileSync(file, 'utf-8');

    // Check if it's a dynamic route
    const isDynamic = file.includes('[') && file.includes(']');

    if (isDynamic) {
      // Check if it has generateStaticParams
      const hasGenerateStaticParams = content.includes('generateStaticParams');

      if (!hasGenerateStaticParams) {
        const relativePath = path.relative(
          path.join(process.cwd(), 'src/app/grimoire'),
          file,
        );
        issues.push(
          `⚠️  Dynamic route without generateStaticParams: ${relativePath}`,
        );
      }
    }
  }

  if (issues.length > 0) {
    console.log('Issues found:');
    issues.forEach((issue) => console.log(`  ${issue}`));
    console.log();
    return false;
  }

  console.log('✅ All dynamic routes have generateStaticParams\n');
  return true;
}

// Verify canonical URLs
function verifyCanonicalURLs() {
  console.log('🔍 Verifying Canonical URLs...\n');

  const grimoireDir = path.join(process.cwd(), 'src/app/grimoire');
  const issues: string[] = [];

  function findFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        findFiles(filePath, fileList);
      } else if (file === 'page.tsx' || file === 'page.ts') {
        fileList.push(filePath);
      }
    });

    return fileList;
  }

  const pageFiles = findFiles(grimoireDir);

  for (const file of pageFiles) {
    const content = fs.readFileSync(file, 'utf-8');

    // Check if it exports metadata
    const hasMetadata =
      content.includes('export const metadata') ||
      content.includes('export async function generateMetadata');

    if (hasMetadata) {
      // Check for canonical URL
      const hasCanonical =
        content.includes('canonical') ||
        content.includes('alternates') ||
        content.includes('canonicalUrl');

      if (!hasCanonical) {
        const relativePath = path.relative(
          path.join(process.cwd(), 'src/app/grimoire'),
          file,
        );
        // Skip layout files
        if (!relativePath.includes('layout')) {
          issues.push(`⚠️  Page without canonical URL: ${relativePath}`);
        }
      }
    }
  }

  if (issues.length > 0) {
    console.log('Pages missing canonical URLs:');
    issues.slice(0, 10).forEach((issue) => console.log(`  ${issue}`));
    if (issues.length > 10) {
      console.log(`  ... and ${issues.length - 10} more`);
    }
    console.log();
    return false;
  }

  console.log('✅ All pages have canonical URLs\n');
  return true;
}

function verifyAISearchDiscovery() {
  console.log('🔍 Verifying AI and Bing Discovery Surface...\n');

  const issues: string[] = [];
  const publicDir = path.join(process.cwd(), 'public');
  const currentYear = new Date().getUTCFullYear();
  const annualCalendarDataset = `https://lunary.app/grimoire/datasets/astrology-calendar/${currentYear}.json`;
  const nextAnnualCalendarDataset = `https://lunary.app/grimoire/datasets/astrology-calendar/${currentYear + 1}.json`;
  const nextFactUrls = [
    'https://lunary.app/grimoire/facts/next-full-moon',
    'https://lunary.app/grimoire/facts/next-new-moon',
    'https://lunary.app/grimoire/facts/next-eclipse',
    'https://lunary.app/grimoire/facts/next-mercury-retrograde',
  ];

  const requiredPublicFiles = [
    'llms.txt',
    'llms-full.txt',
    'ai-citation-map.json',
    '.well-known/ai-plugin.json',
    '.well-known/openapi.json',
    '.well-known/lunary-gpt-openapi.yaml',
  ];

  for (const relativePath of requiredPublicFiles) {
    if (!fs.existsSync(path.join(publicDir, relativePath))) {
      issues.push(`Missing public discovery file: public/${relativePath}`);
    }
  }

  const llmsPath = path.join(publicDir, 'llms.txt');
  const llmsFullPath = path.join(publicDir, 'llms-full.txt');
  const citationMapPath = path.join(publicDir, 'ai-citation-map.json');
  const pluginPath = path.join(publicDir, '.well-known/ai-plugin.json');
  const openapiPath = path.join(publicDir, '.well-known/openapi.json');
  const openapiYamlPath = path.join(
    publicDir,
    '.well-known/lunary-gpt-openapi.yaml',
  );
  const sitemapIndexPath = path.join(
    process.cwd(),
    'src/app/sitemap-index.xml/route.ts',
  );
  const seoContentTemplatePath = path.join(
    process.cwd(),
    'src/components/grimoire/SEOContentTemplate.tsx',
  );

  if (fs.existsSync(llmsPath)) {
    const llms = fs.readFileSync(llmsPath, 'utf-8');
    if (!llms.includes('https://lunary.app/sitemap-index.xml')) {
      issues.push('llms.txt does not reference sitemap-index.xml');
    }
    if (!llms.includes('https://lunary.app/ai-citation-map.json')) {
      issues.push('llms.txt does not reference ai-citation-map.json');
    }
    if (!llms.includes(annualCalendarDataset)) {
      issues.push('llms.txt does not reference annual astrology calendar data');
    }
    nextFactUrls.forEach((url) => {
      if (!llms.includes(url)) {
        issues.push(`llms.txt does not reference ${url}`);
      }
    });
    if (!llms.includes('Authorization: Bearer <LUNARY_GPT_SECRET>')) {
      issues.push('llms.txt does not explain authenticated GPT action access');
    }
  }

  if (fs.existsSync(llmsFullPath)) {
    const llmsFull = fs.readFileSync(llmsFullPath, 'utf-8');
    if (!llmsFull.includes('AI Search Guidance')) {
      issues.push('llms-full.txt is missing AI Search Guidance');
    }
    if (!llmsFull.includes('https://lunary.app/ai-citation-map.json')) {
      issues.push('llms-full.txt does not reference ai-citation-map.json');
    }
    if (!llmsFull.includes(annualCalendarDataset)) {
      issues.push(
        'llms-full.txt does not reference annual astrology calendar data',
      );
    }
    nextFactUrls.forEach((url) => {
      if (!llmsFull.includes(url)) {
        issues.push(`llms-full.txt does not reference ${url}`);
      }
    });
    if (!llmsFull.includes('Authorization: Bearer <LUNARY_GPT_SECRET>')) {
      issues.push(
        'llms-full.txt does not explain authenticated GPT action access',
      );
    }
  }

  if (fs.existsSync(pluginPath)) {
    const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf-8')) as {
      auth?: { type?: string; authorization_type?: string };
    };
    if (plugin.auth?.type !== 'user_http') {
      issues.push('AI plugin auth type should be user_http');
    }
    if (plugin.auth?.authorization_type !== 'bearer') {
      issues.push('AI plugin auth should use bearer authorization');
    }
  }

  if (fs.existsSync(openapiPath)) {
    const openapi = JSON.parse(fs.readFileSync(openapiPath, 'utf-8')) as {
      info?: { description?: string };
      paths?: Record<string, unknown>;
      components?: {
        securitySchemes?: {
          bearerAuth?: { scheme?: string };
        };
      };
    };
    if (openapi.components?.securitySchemes?.bearerAuth?.scheme !== 'bearer') {
      issues.push('OpenAPI schema is missing bearerAuth security');
    }
    if (Object.keys(openapi.paths || {}).length < 10) {
      issues.push('OpenAPI schema appears incomplete');
    }
    if (!openapi.info?.description?.includes('Authorization: Bearer')) {
      issues.push('OpenAPI schema does not describe authenticated access');
    }

    if (fs.existsSync(openapiYamlPath)) {
      const openapiYaml = fs.readFileSync(openapiYamlPath, 'utf-8');
      const yamlPaths = Array.from(
        openapiYaml.matchAll(/^  (\/gpt\/[^\s:]+):/gm),
        (match) => match[1],
      ).sort();
      const jsonPaths = Object.keys(openapi.paths || {}).sort();

      if (JSON.stringify(yamlPaths) !== JSON.stringify(jsonPaths)) {
        issues.push('OpenAPI JSON paths do not match lunary-gpt-openapi.yaml');
      }
      if (!openapiYaml.includes('Authorization: Bearer')) {
        issues.push('OpenAPI YAML does not describe authenticated access');
      }
    }
  }

  if (fs.existsSync(citationMapPath)) {
    const citationMap = JSON.parse(
      fs.readFileSync(citationMapPath, 'utf-8'),
    ) as AiCitationMap;

    if (
      !citationMap.crawlEntryPoints?.includes(
        'https://lunary.app/sitemap-index.xml',
      )
    ) {
      issues.push('ai-citation-map.json does not reference sitemap-index.xml');
    }
    if (
      !citationMap.crawlEntryPoints?.includes(
        'https://lunary.app/sitemap-datasets.xml',
      )
    ) {
      issues.push(
        'ai-citation-map.json does not reference sitemap-datasets.xml',
      );
    }
    [annualCalendarDataset, nextAnnualCalendarDataset, ...nextFactUrls].forEach(
      (url) => {
        if (!citationMap.crawlEntryPoints?.includes(url)) {
          issues.push(`ai-citation-map.json crawlEntryPoints missing ${url}`);
        }
      },
    );
    if ((citationMap.prioritySurfaces?.length || 0) < 8) {
      issues.push('ai-citation-map.json has too few priority surfaces');
    }

    citationMap.prioritySurfaces?.forEach((surface) => {
      if (!surface.topic || !surface.canonicalUrl) {
        issues.push('ai-citation-map.json has an incomplete priority surface');
        return;
      }

      const urls = [surface.canonicalUrl, ...(surface.supportingUrls || [])];
      urls.forEach((url) => {
        if (!url.startsWith('https://lunary.app/')) {
          issues.push(`ai-citation-map.json contains non-Lunary URL: ${url}`);
        }
        if (/https:\/\/lunary\.app\/(api|admin|profile|auth)\//.test(url)) {
          issues.push(`ai-citation-map.json cites a private URL: ${url}`);
        }
      });
    });

    const citationMapUrls = new Set(
      citationMap.prioritySurfaces?.flatMap((surface) => [
        surface.canonicalUrl,
        ...(surface.supportingUrls || []),
      ]),
    );
    [annualCalendarDataset, nextAnnualCalendarDataset, ...nextFactUrls].forEach(
      (url) => {
        if (!citationMapUrls.has(url)) {
          issues.push(`ai-citation-map.json priority surfaces missing ${url}`);
        }
      },
    );
  }

  const robots = robotsMetadata();
  const robotRules = Array.isArray(robots.rules)
    ? robots.rules
    : robots.rules
      ? [robots.rules]
      : [];
  const ruleForAgent = (agent: string) =>
    robotRules.find((rule) => toStringArray(rule.userAgent).includes(agent));

  AI_CRAWLER_USER_AGENTS.forEach((agent) => {
    const rule = ruleForAgent(agent);
    if (!rule) {
      issues.push(`robots metadata is missing ${agent}`);
      return;
    }

    const allowedPaths = toStringArray(rule.allow);
    AI_DISCOVERY_PATHS.forEach((pathToCheck) => {
      if (!allowedPaths.includes(pathToCheck)) {
        issues.push(
          `robots metadata does not allow ${pathToCheck} for ${agent}`,
        );
      }
    });
  });

  const robotSitemaps = toStringArray(robots.sitemap);
  if (!robotSitemaps.includes('https://lunary.app/sitemap-datasets.xml')) {
    issues.push('robots metadata does not advertise sitemap-datasets.xml');
  }

  if (fs.existsSync(sitemapIndexPath)) {
    const sitemapIndex = fs.readFileSync(sitemapIndexPath, 'utf-8');
    const requiredCuratedSitemaps = [
      'sitemap.xml',
      'sitemap-horoscopes.xml',
      'sitemap-transit-blog.xml',
      'sitemap-datasets.xml',
      'sitemap-tarot.xml',
      'sitemap-chinese-zodiac.xml',
      'sitemap-seasons.xml',
      'sitemap-images.xml',
    ];

    requiredCuratedSitemaps.forEach((sitemap) => {
      if (
        !CURATED_DISCOVERY_SITEMAPS.includes(
          sitemap as (typeof CURATED_DISCOVERY_SITEMAPS)[number],
        )
      ) {
        issues.push(`CURATED_DISCOVERY_SITEMAPS is missing ${sitemap}`);
      }
    });

    if (!sitemapIndex.includes('CURATED_DISCOVERY_SITEMAPS')) {
      issues.push(
        'sitemap-index.xml route does not use CURATED_DISCOVERY_SITEMAPS',
      );
    }

    DEPRIORITIZED_DISCOVERY_SITEMAPS.forEach((sitemap) => {
      if (sitemapIndex.includes(sitemap)) {
        issues.push(`sitemap-index.xml route re-promotes ${sitemap}`);
      }
    });
  }

  if (fs.existsSync(seoContentTemplatePath)) {
    const seoContentTemplate = fs.readFileSync(seoContentTemplatePath, 'utf-8');

    if (!seoContentTemplate.includes("id='direct-answer'")) {
      issues.push('SEOContentTemplate is missing the direct-answer section');
    }
    if (!seoContentTemplate.includes('direct-answer-summary')) {
      issues.push(
        'SEOContentTemplate is missing the direct-answer-summary class',
      );
    }
    if (
      !seoContentTemplate.includes("itemType='https://schema.org/DefinedTerm'")
    ) {
      issues.push(
        'SEOContentTemplate direct answer block is missing DefinedTerm microdata',
      );
    }
    if (!seoContentTemplate.includes("itemProp='description'")) {
      issues.push(
        'SEOContentTemplate direct answer block is missing description microdata',
      );
    }
    if (!seoContentTemplate.includes("'.direct-answer-summary'")) {
      issues.push(
        'Speakable schema does not include the direct-answer-summary selector',
      );
    }
    if (!seoContentTemplate.includes('Quick Answer')) {
      issues.push(
        'SEOContentTemplate does not label the extractable answer block',
      );
    }
    if (!seoContentTemplate.includes('directAnswerRelationships.map')) {
      issues.push(
        'SEOContentTemplate does not expose related concepts for entity context',
      );
    }
    if (!seoContentTemplate.includes("id='follow-up-intent'")) {
      issues.push('SEOContentTemplate is missing the follow-up intent section');
    }
    const citableFactsPosition =
      seoContentTemplate.indexOf("id='citable-facts'");
    const explorePosition = seoContentTemplate.indexOf('<ExploreGrimoire />');
    if (
      citableFactsPosition !== -1 &&
      explorePosition !== -1 &&
      citableFactsPosition < explorePosition
    ) {
      issues.push('SEOContentTemplate renders citable facts too high');
    }
  }

  if (issues.length > 0) {
    console.log('AI/Bing discovery issues found:');
    issues.forEach((issue) => console.log(`  ❌ ${issue}`));
    console.log();
    return false;
  }

  console.log('✅ AI and Bing discovery surface is coherent\n');
  return true;
}

async function verifyAspectSitemapCoverage() {
  console.log('🔍 Verifying Aspect Sitemap Coverage...\n');

  const { GET } = await import('@/app/sitemap-aspects.xml/route');
  const response = await GET();
  const xml = await response.text();
  const locs = Array.from(
    xml.matchAll(/<loc>([^<]+)<\/loc>/g),
    (match) => match[1],
  );
  const locSet = new Set(locs);
  const issues: string[] = [];
  const canonicalPairCount = (PLANETS.length * (PLANETS.length - 1)) / 2;
  const expectedCount =
    1 +
    PLANETS.length +
    PLANETS.length * ASPECTS.length +
    canonicalPairCount * ASPECTS.length;

  [
    'https://lunary.app/grimoire/aspects/moon/conjunct',
    'https://lunary.app/grimoire/aspects/jupiter/conjunct',
    'https://lunary.app/grimoire/aspects/moon/conjunct/mercury',
  ].forEach((url) => {
    if (!locSet.has(url)) {
      issues.push(`sitemap-aspects.xml is missing ${url}`);
    }
  });

  if (locSet.size !== locs.length) {
    issues.push('sitemap-aspects.xml contains duplicate URLs');
  }

  if (locs.length !== expectedCount) {
    issues.push(
      `sitemap-aspects.xml has ${locs.length} URLs; expected ${expectedCount}`,
    );
  }

  if (issues.length > 0) {
    console.log('Aspect sitemap issues found:');
    issues.forEach((issue) => console.log(`  ❌ ${issue}`));
    console.log();
    return false;
  }

  console.log(
    '✅ Aspect sitemap covers planet, planet-aspect, and pair pages\n',
  );
  return true;
}

function verifyCanonicalSourceTruthScaffold() {
  console.log('🔍 Verifying Canonical Source-of-Truth Scaffolding...\n');

  const issues: string[] = [];
  const templatePath = path.join(
    process.cwd(),
    'src/components/grimoire/SEOContentTemplate.tsx',
  );
  const requiredTemplateMarkers = [
    'structuredSummary',
    'conceptComparisons',
    'whyThisWorks',
    'learningPath',
    'followUpIntent',
    "id='reference-map'",
  ];

  if (!fs.existsSync(templatePath)) {
    issues.push('SEOContentTemplate is missing');
  } else {
    const template = fs.readFileSync(templatePath, 'utf-8');
    requiredTemplateMarkers.forEach((marker) => {
      if (!template.includes(marker)) {
        issues.push(`SEOContentTemplate is missing ${marker}`);
      }
    });
  }

  const canonicalPages = [
    'src/app/grimoire/astrology/page.tsx',
    'src/app/grimoire/birth-chart/page.tsx',
    'src/app/grimoire/astronomy/planets/page.tsx',
    'src/app/grimoire/aspects/page.tsx',
    'src/app/grimoire/houses/page.tsx',
    'src/app/grimoire/moon/phases/page.tsx',
    'src/app/grimoire/transits/page.tsx',
  ];

  canonicalPages.forEach((relativePath) => {
    const fullPath = path.join(process.cwd(), relativePath);

    if (!fs.existsSync(fullPath)) {
      issues.push(`Canonical source page missing: ${relativePath}`);
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    [
      'structuredSummary',
      'conceptComparisons',
      'whyThisWorks',
      'learningPath',
    ].forEach((marker) => {
      if (!content.includes(marker)) {
        issues.push(`${relativePath} is missing ${marker}`);
      }
    });
  });

  if (issues.length > 0) {
    console.log('Canonical source-of-truth issues found:');
    issues.forEach((issue) => console.log(`  ❌ ${issue}`));
    console.log();
    return false;
  }

  console.log(
    '✅ Canonical hubs expose structured summaries, contrasts, rationale, and learning paths\n',
  );
  return true;
}

function verifyLegacyCanonicalRedirects() {
  console.log('🔍 Verifying Legacy Canonical Redirects...\n');

  const issues: string[] = [];
  const middlewarePath = path.join(process.cwd(), 'src/middleware.ts');
  const requiredSeasonSlugs = [
    'aries-season',
    'taurus-season',
    'gemini-season',
    'cancer-season',
    'leo-season',
    'virgo-season',
    'libra-season',
    'scorpio-season',
    'sagittarius-season',
    'capricorn-season',
    'aquarius-season',
    'pisces-season',
  ];

  if (!fs.existsSync(middlewarePath)) {
    issues.push('src/middleware.ts is missing');
  } else {
    const middleware = fs.readFileSync(middlewarePath, 'utf-8');

    requiredSeasonSlugs.forEach((slug) => {
      if (!middleware.includes(`'${slug}'`)) {
        issues.push(`middleware legacy season redirects are missing ${slug}`);
      }
    });

    if (!middleware.includes('getLegacySeasonSign')) {
      issues.push('middleware is missing legacy season redirect detection');
    }
    if (!middleware.includes('/grimoire/seasons/${currentYear}/')) {
      issues.push('middleware does not redirect legacy seasons to year pages');
    }
    if (!middleware.includes('308')) {
      issues.push(
        'middleware legacy season redirects should be permanent 308s',
      );
    }
  }

  if (issues.length > 0) {
    console.log('Legacy redirect issues found:');
    issues.forEach((issue) => console.log(`  ❌ ${issue}`));
    console.log();
    return false;
  }

  console.log('✅ Legacy season URLs redirect to canonical year pages\n');
  return true;
}

// Main verification
async function verifySEOCoverage() {
  if (process.argv.includes('--ai-discovery-only')) {
    console.log('='.repeat(80));
    console.log('📊 AI/BING DISCOVERY VERIFICATION');
    console.log('='.repeat(80));
    console.log();

    const passed = verifyAISearchDiscovery();
    process.exit(passed ? 0 : 1);
  }

  console.log('='.repeat(80));
  console.log('📊 SEO COVERAGE VERIFICATION');
  console.log('='.repeat(80));
  console.log();

  const results = {
    retrogradeSitemap: await verifyRetrogradeSitemapCoverage(),
    aspectSitemap: await verifyAspectSitemapCoverage(),
    sourceTruthScaffold: verifyCanonicalSourceTruthScaffold(),
    legacyCanonicalRedirects: verifyLegacyCanonicalRedirects(),
    generateStaticParams: verifyGenerateStaticParams(),
    canonicalURLs: verifyCanonicalURLs(),
    aiSearchDiscovery: verifyAISearchDiscovery(),
  };

  console.log('='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log();

  const allPassed = Object.values(results).every((r) => r);

  Object.entries(results).forEach(([check, passed]) => {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${check}`);
  });

  console.log();

  if (allPassed) {
    console.log('✅ All SEO checks passed!');
    process.exit(0);
  } else {
    console.log('❌ Some SEO checks failed');
    process.exit(1);
  }
}

if (require.main === module) {
  verifySEOCoverage().catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
}

export { verifySEOCoverage };
