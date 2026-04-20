#!/usr/bin/env tsx
/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const TARGET_DIRS = ['src', 'scripts'];
const FILE_EXTENSIONS = new Set(['.ts', '.tsx', '.json', '.md']);
const SKIP_DIRS = new Set(['node_modules', '.next', '.git']);

const SIGN_RULERS: Record<string, Set<string>> = {
  aries: new Set(['mars']),
  taurus: new Set(['venus']),
  gemini: new Set(['mercury']),
  cancer: new Set(['moon']),
  leo: new Set(['sun']),
  virgo: new Set(['mercury']),
  libra: new Set(['venus']),
  scorpio: new Set(['mars', 'pluto']),
  sagittarius: new Set(['jupiter']),
  capricorn: new Set(['saturn']),
  aquarius: new Set(['saturn', 'uranus']),
  pisces: new Set(['jupiter', 'neptune']),
};

const SIGN_PATTERN =
  'aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces';
const PLANET_PATTERN =
  'sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto';

const CLAIM_PATTERNS = [
  new RegExp(
    `\\b(?<sign>${SIGN_PATTERN})\\b[^\\n.]{0,120}?\\b(?:is|are)\\s+ruled\\s+by\\s+(?<planet>${PLANET_PATTERN})\\b`,
    'gi',
  ),
  new RegExp(
    `\\b(?<planet>${PLANET_PATTERN})\\b[^\\n.]{0,120}?\\brules?\\s+(?<sign>${SIGN_PATTERN})\\b`,
    'gi',
  ),
];

type Finding = {
  file: string;
  line: number;
  fragment: string;
  message: string;
};

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }
    if (FILE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function lineNumberAt(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

function scanFile(filePath: string): Finding[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const findings: Finding[] = [];

  for (const pattern of CLAIM_PATTERNS) {
    for (const match of content.matchAll(pattern)) {
      const sign = match.groups?.sign?.toLowerCase();
      const planet = match.groups?.planet?.toLowerCase();
      if (!sign || !planet) continue;
      if (SIGN_RULERS[sign]?.has(planet)) continue;

      findings.push({
        file: path.relative(ROOT, filePath),
        line: lineNumberAt(content, match.index || 0),
        fragment: match[0].replace(/\s+/g, ' ').trim(),
        message: `${planet} is not a valid ruler for ${sign}`,
      });
    }
  }

  return findings;
}

function main() {
  const files = TARGET_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)));
  const findings = files.flatMap(scanFile);

  if (findings.length === 0) {
    console.log('Rulership validation passed.');
    return;
  }

  console.error('Invalid zodiac rulership claims found:\n');
  for (const finding of findings) {
    console.error(
      `${finding.file}:${finding.line} ${finding.message}\n  ${finding.fragment}\n`,
    );
  }
  process.exit(1);
}

main();
