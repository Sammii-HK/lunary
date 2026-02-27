import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Load env vars from lunary-mcp/.env as fallback when Claude Code
 * doesn't pass them through (stale MCP process, config issue, etc.).
 */
function loadEnvFallback(): Record<string, string> {
  try {
    const dir = dirname(fileURLToPath(import.meta.url));
    const envPath = resolve(dir, '..', '.env');
    const content = readFileSync(envPath, 'utf-8');
    const vars: Record<string, string> = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, '');
      vars[key] = val;
    }
    return vars;
  } catch {
    return {};
  }
}

const fallback = loadEnvFallback();
export const BASE_URL =
  process.env.LUNARY_API_URL || fallback.LUNARY_API_URL || 'https://lunary.app';
export const ADMIN_KEY =
  process.env.LUNARY_ADMIN_KEY || fallback.LUNARY_ADMIN_KEY || '';
export const SPELLCAST_URL =
  process.env.SPELLCAST_API_URL ||
  fallback.SPELLCAST_API_URL ||
  'https://api.spellcast.sammii.dev';
export const SPELLCAST_KEY =
  process.env.SPELLCAST_API_KEY || fallback.SPELLCAST_API_KEY || '';

const keySource = process.env.LUNARY_ADMIN_KEY
  ? 'env'
  : fallback.LUNARY_ADMIN_KEY
    ? '.env file'
    : 'MISSING';
console.error(
  `[lunary-mcp] BASE_URL=${BASE_URL} ADMIN_KEY=${ADMIN_KEY ? ADMIN_KEY.slice(0, 8) + '...(len=' + ADMIN_KEY.length + ')' : 'EMPTY'} (source: ${keySource})`,
);

export async function lunary<T = unknown>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    params?: Record<string, string | undefined>;
  } = {},
): Promise<T> {
  const { method = 'GET', body, params } = options;

  const url = new URL(`/api/admin${path}`, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    }
  }

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ADMIN_KEY}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(
      `[lunary-mcp] FAILED ${method} ${url.toString()} → ${res.status} | key=${ADMIN_KEY ? ADMIN_KEY.slice(0, 8) + '...' : 'EMPTY'}`,
    );
    throw new Error(
      `Lunary API ${method} ${path}: ${res.status} ${text.slice(0, 300)}`,
    );
  }

  return res.json() as Promise<T>;
}
