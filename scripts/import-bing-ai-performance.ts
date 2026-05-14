import { readFileSync } from 'node:fs';

import { parseBingAiPerformanceCsv } from '../src/lib/bing/ai-performance-import';
import { writeBingAiPerformanceSnapshot } from '../src/lib/bing/ai-performance-output';

const args = process.argv.slice(2);
const csvPath = args.find((arg) => !arg.startsWith('--'));

function getOption(name: string) {
  const prefix = `--${name}=`;
  return args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function numberOption(name: string) {
  const value = getOption(name);
  if (!value) return undefined;
  const parsed = Number(value.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
}

if (!csvPath) {
  console.error(
    'Usage: pnpm tsx scripts/import-bing-ai-performance.ts <export.csv> --total-citations=333 --average-cited-pages=62 --total-clicks=21 --total-impressions=1164',
  );
  process.exit(1);
}

const snapshot = parseBingAiPerformanceCsv(readFileSync(csvPath, 'utf8'), {
  generatedAt: new Date().toISOString(),
  source: `Bing Webmaster Tools AI Performance CSV import from ${csvPath}. The public Bing Webmaster API does not expose AI citation rows yet.`,
  totalCitations: numberOption('total-citations'),
  averageCitedPages: numberOption('average-cited-pages'),
  totalClicks: numberOption('total-clicks'),
  totalImpressions: numberOption('total-impressions'),
  averageCtr: numberOption('average-ctr'),
});

const { outputPath, protectedOutputPath } = writeBingAiPerformanceSnapshot(
  snapshot,
  'scripts/import-bing-ai-performance.ts',
);

console.log(
  `Imported ${snapshot.citedPages.length} Bing AI cited pages into ${outputPath}`,
);
console.log(`Updated protected sitemap pages in ${protectedOutputPath}`);
