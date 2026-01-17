#!/usr/bin/env node
const { execFileSync } = require('node:child_process');
const {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} = require('node:fs');
const { resolve } = require('node:path');

const PROJECT_ROOT = process.cwd();
const TARGET_PATHS = ['src/app', 'src/constants', 'src/lib', 'src/data'];
const OUTPUT_PATH = resolve(PROJECT_ROOT, 'data', 'sitemap-last-modified.json');

/** @type {Record<string, string | null>} */
const existingEntries = existsSync(OUTPUT_PATH)
  ? JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'))
  : {};

const result = { ...existingEntries };
mkdirSync(resolve(PROJECT_ROOT, 'data'), { recursive: true });

/** Run a git command and return trimmed stdout, or null if git fails. */
function runGitCommand(args) {
  try {
    const output = execFileSync('git', args, {
      cwd: PROJECT_ROOT,
      stdio: ['ignore', 'pipe', 'inherit'],
    })
      .toString()
      .trim();

    return output || null;
  } catch {
    return null;
  }
}

const trackedFiles = new Set();

const filesOutput = runGitCommand(['ls-files', ...TARGET_PATHS]);
if (filesOutput) {
  filesOutput.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed) {
      trackedFiles.add(trimmed);
    }
  });
}

for (const target of TARGET_PATHS) {
  trackedFiles.add(target);
}

for (const entry of trackedFiles) {
  const gitDate = runGitCommand(['log', '-1', '--format=%cI', '--', entry]);
  if (gitDate) {
    result[entry] = gitDate;
  } else if (!(entry in result)) {
    result[entry] = null;
  }
}

writeFileSync(OUTPUT_PATH, `${JSON.stringify(result, null, 2)}\n`);
