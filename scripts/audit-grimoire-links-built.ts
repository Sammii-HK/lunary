#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';

const AUTHORIZED_PREFIXES = ['/grimoire', '/api/og/grimoire'];
const manifestPath = path.join(
  process.cwd(),
  '.next',
  'server',
  'app-paths-manifest.json',
);

if (!fs.existsSync(manifestPath)) {
  console.error(
    'app-paths-manifest.json not found. Run `pnpm build` before the built-link audit.',
  );
  process.exit(1);
}

const LINK_PATTERNS = [
  /href\s*=\s*['"`]([^'"`]*\/grimoire\/[^'"`]+)['"`]/g,
  /url\s*:\s*['"`]([^'"`]*\/grimoire\/[^'"`]+)['"`]/g,
  /href\s*=\s*\{`([^`]*\/grimoire\/[^`]+)`\}/g,
];

function escapeSegment(segment: string) {
  return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function routeToRegex(route: string) {
  let cleaned = route.replace(/\/page$/, '').replace(/\/route$/, '');
  const segments = cleaned.split('/').filter(Boolean);

  if (segments.length === 0) {
    return /^\/$/;
  }

  const regexParts = segments.map((segment) => {
    if (segment.startsWith('[...')) {
      return '/.+';
    }
    if (segment.startsWith('[')) {
      return '/[^/]+';
    }
    return '/' + escapeSegment(segment);
  });

  return new RegExp(`^${regexParts.join('')}/?$`);
}

function normalizeLink(link: string) {
  const withoutHash = link.split('#')[0].split('?')[0];
  const trimmed = withoutHash.replace(/\/$/, '') || '/';
  return trimmed.replace(/^https?:\/\/[^/]+/, '');
}

function extractLinksFromFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const links: Array<{ url: string; file: string; line: number }> = [];

  for (let idx = 0; idx < lines.length; idx += 1) {
    const line = lines[idx];
    for (const pattern of LINK_PATTERNS) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        links.push({
          url: match[1],
          file: filePath,
          line: idx + 1,
        });
      }
    }
  }

  return links;
}

function findFiles(
  dir: string,
  pattern: RegExp,
  list: string[] = [],
): string[] {
  if (!fs.existsSync(dir)) return list;
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findFiles(fullPath, pattern, list);
    } else if (pattern.test(entry)) {
      list.push(fullPath);
    }
  }
  return list;
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const manifestRoutes = Object.keys(manifest).filter((route) =>
  AUTHORIZED_PREFIXES.some((prefix) => route.startsWith(prefix)),
);
const routeRegexes = manifestRoutes.map(routeToRegex);

const searchDirs = ['src/app', 'src/components', 'src/lib', 'src/constants'];
const sourceFiles = searchDirs.flatMap((dir) =>
  findFiles(path.join(process.cwd(), dir), /\.tsx?$/),
);

const allLinks = sourceFiles
  .flatMap(extractLinksFromFile)
  .filter((link) => !link.url.includes('${'));

const brokenLinks = allLinks.filter((link) => {
  const normalized = normalizeLink(link.url);
  return !routeRegexes.some((regex) => regex.test(normalized));
});

console.log(`Built grimoire routes checked: ${manifestRoutes.length}`);
console.log(`Links inspected: ${allLinks.length}`);

if (brokenLinks.length === 0) {
  console.log('✅ All static grimoire links resolve to built routes.');
  process.exit(0);
}

console.error('❌ Broken grimoire links (compiled routes missing):');
for (const link of brokenLinks) {
  console.error(
    `  ${link.url} → ${link.file}:${link.line} (normalized: ${normalizeLink(
      link.url,
    )})`,
  );
}

process.exit(1);
