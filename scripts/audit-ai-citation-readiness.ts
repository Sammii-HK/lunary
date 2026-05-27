#!/usr/bin/env tsx

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import generateSitemap from '@/app/sitemap';
import { GET as generateDatasetSitemap } from '@/app/sitemap-datasets.xml/route';
import {
  createCitationReadinessReport,
  loadAiCitationMap,
  renderCitationReadinessMarkdown,
} from '@/lib/seo/ai-citation-readiness';

function parseArgs(argv: string[]) {
  const args = new Map<string, string | boolean>();

  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    if (!part.startsWith('--')) continue;

    const [rawKey, inlineValue] = part.slice(2).split('=');
    if (inlineValue !== undefined) {
      args.set(rawKey, inlineValue);
      continue;
    }

    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args.set(rawKey, true);
      continue;
    }

    args.set(rawKey, next);
    i += 1;
  }

  return args;
}

async function loadSitemapUrls(skipSitemap: boolean) {
  if (skipSitemap) return null;

  try {
    const sitemapEntries = await generateSitemap();
    const urls = new Set(
      sitemapEntries
        .map((entry) => entry.url)
        .filter((url): url is string => Boolean(url)),
    );

    try {
      const datasetSitemapResponse = await generateDatasetSitemap();
      const datasetSitemapXml = await datasetSitemapResponse.text();
      const datasetUrls = datasetSitemapXml.matchAll(/<loc>(.*?)<\/loc>/g);

      for (const match of datasetUrls) {
        if (match[1]) urls.add(match[1]);
      }
    } catch (error) {
      console.warn(
        `[ai-citation-readiness] Dataset sitemap generation skipped: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return urls;
  } catch (error) {
    console.warn(
      `[ai-citation-readiness] Sitemap generation skipped: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return null;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = process.cwd();
  const mapPath = String(args.get('map') || 'public/ai-citation-map.json');
  const outDir = String(args.get('out-dir') || 'docs/reports');
  const skipSitemap = Boolean(args.get('skip-sitemap'));
  const failBelow = Number(args.get('fail-below') || 0);

  const map = loadAiCitationMap(projectRoot, mapPath);
  const sitemapUrls = await loadSitemapUrls(skipSitemap);
  const report = createCitationReadinessReport({
    map,
    projectRoot,
    sitemapUrls,
  });

  const resolvedOutDir = resolve(projectRoot, outDir);
  mkdirSync(resolvedOutDir, { recursive: true });

  const jsonPath = resolve(resolvedOutDir, 'ai-citation-readiness.json');
  const markdownPath = resolve(resolvedOutDir, 'ai-citation-readiness.md');

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(markdownPath, renderCitationReadinessMarkdown(report));

  console.log(
    JSON.stringify(
      {
        summary: report.summary,
        outputs: {
          json: jsonPath,
          markdown: markdownPath,
        },
      },
      null,
      2,
    ),
  );

  if (failBelow > 0 && report.summary.averageScore < failBelow) {
    console.error(
      `Average AI citation readiness ${report.summary.averageScore} is below ${failBelow}.`,
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.stack || error.message : String(error),
  );
  process.exit(1);
});
