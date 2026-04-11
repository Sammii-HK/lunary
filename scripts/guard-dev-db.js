#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Refuses to start the dev server when POSTGRES_URL points at prod.
 *
 * Context: .env.local is a toggle in this repo. .env has the dev branch
 * (ep-curly-wildflower), .env.local has prod (ep-dawn-field). Next.js loads
 * .env.local after .env so whenever the prod line is uncommented in
 * .env.local the dev server silently talks to prod. This guard prevents
 * the "I forgot to comment it out" failure mode.
 *
 * Escape hatch: set ALLOW_PROD_DB=1 to deliberately run dev against prod.
 */

const fs = require('fs');
const path = require('path');

const PROD_HOST_MARKERS = ['ep-dawn-field'];

// Load .env.local manually since we run before Next.js.
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const result = {};
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

// Next.js precedence: .env.local overrides .env
const envVars = {
  ...parseEnvFile(envPath),
  ...parseEnvFile(envLocalPath),
};

const postgresUrl = process.env.POSTGRES_URL || envVars.POSTGRES_URL || '';

const pointingAtProd = PROD_HOST_MARKERS.some((marker) =>
  postgresUrl.includes(marker),
);

if (pointingAtProd && process.env.ALLOW_PROD_DB !== '1') {
  const BOLD = '\x1b[1m';
  const RED = '\x1b[31m';
  const YELLOW = '\x1b[33m';
  const DIM = '\x1b[2m';
  const RESET = '\x1b[0m';

  console.error('');
  console.error(
    `${BOLD}${RED}🚨 BLOCKED: POSTGRES_URL points at PRODUCTION${RESET}`,
  );
  console.error('');
  console.error(
    `${YELLOW}Your .env.local POSTGRES_URL contains an ep-dawn-field host (prod).${RESET}`,
  );
  console.error(
    `${YELLOW}The dev server would talk directly to production, which is almost${RESET}`,
  );
  console.error(
    `${YELLOW}never what you want — even for read-only browsing.${RESET}`,
  );
  console.error('');
  console.error(`${BOLD}To fix:${RESET}`);
  console.error(
    `  1. Open .env.local and comment out the POSTGRES_URL line (prod).`,
  );
  console.error(
    `  2. The dev branch URL in .env (ep-curly-wildflower) will then take over.`,
  );
  console.error(`  3. Re-run ${BOLD}pnpm dev${RESET}.`);
  console.error('');
  console.error(
    `${DIM}If you genuinely need to run dev against prod, prefix with${RESET}`,
  );
  console.error(`${DIM}  ALLOW_PROD_DB=1 pnpm dev${RESET}`);
  console.error('');
  process.exit(1);
}

if (pointingAtProd) {
  const BOLD = '\x1b[1m';
  const RED = '\x1b[31m';
  const RESET = '\x1b[0m';
  console.warn('');
  console.warn(
    `${BOLD}${RED}⚠️  ALLOW_PROD_DB=1 set — dev server talking to PRODUCTION.${RESET}`,
  );
  console.warn('');
}
