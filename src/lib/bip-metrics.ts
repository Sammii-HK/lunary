/**
 * Build in Public — Metrics Fetcher
 *
 * Fetches weekly snapshot data from Lunary's admin API for BIP posts.
 * Reads LUNARY_ADMIN_KEY from .env.local, falling back to lunary-mcp/.env.
 */

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Env loading
// ---------------------------------------------------------------------------

function loadEnvFile(filePath: string): Record<string, string> {
  try {
    const content = readFileSync(filePath, 'utf-8');
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

function resolveEnv(): { adminKey: string; baseUrl: string } {
  // Primary: already in process.env (e.g. loaded by dotenv before import)
  let adminKey = process.env.LUNARY_ADMIN_KEY?.trim() ?? '';
  let baseUrl = process.env.LUNARY_API_URL?.trim() ?? '';

  if (!adminKey) {
    // Fallback 1: lunary-mcp/.env (same dir the MCP server uses)
    const mcpEnv = loadEnvFile(resolve(process.cwd(), 'lunary-mcp', '.env'));
    adminKey = mcpEnv.LUNARY_ADMIN_KEY?.trim() ?? '';
    baseUrl = baseUrl || (mcpEnv.LUNARY_API_URL?.trim() ?? '');
  }

  return {
    adminKey,
    baseUrl: baseUrl || 'https://lunary.app',
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WeeklySnapshot {
  mau: number;
  mauDelta: number; // % change vs prior 7-day period
  mrr: number; // in pounds (e.g. 22.50)
  mrrDelta: number; // % change
  impressionsPerDay: number;
  impressionsDelta: number; // % change
  newSignups: number;
  weekLabel: string; // "week of 24 Feb"
}

export interface MilestoneCheck {
  metric: 'mau' | 'mrr' | 'impressionsPerDay';
  threshold: number;
  crossed: boolean;
  alreadyPosted: boolean;
}

// Milestone thresholds
const MILESTONES: Array<{
  metric: 'mau' | 'mrr' | 'impressionsPerDay';
  values: number[];
}> = [
  { metric: 'mau', values: [500, 1000, 2500, 5000] },
  { metric: 'mrr', values: [100, 500, 1000] }, // pounds
  { metric: 'impressionsPerDay', values: [50000, 100000, 250000] },
];

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function fetchAdmin<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const { adminKey, baseUrl } = resolveEnv();
  if (!adminKey)
    throw new Error(
      'LUNARY_ADMIN_KEY not found in .env.local or lunary-mcp/.env',
    );

  const url = new URL(`/api/admin${path}`, baseUrl);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminKey}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Lunary API ${path}: ${res.status} ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Delta calculation
// ---------------------------------------------------------------------------

function pctDelta(current: number, prior: number): number {
  if (prior === 0) return 0;
  if (current === 0) return 0;
  const delta = Math.round(((current - prior) / prior) * 100);
  // If prior value seems like a backfill artifact (current is < 1% of prior), skip
  if (delta < -90) return 0;
  return delta;
}

// ---------------------------------------------------------------------------
// Week label
// ---------------------------------------------------------------------------

function weekLabel(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'short' });
  return `week of ${day} ${month}`;
}

// ---------------------------------------------------------------------------
// Fetch weekly snapshot
// ---------------------------------------------------------------------------

export async function fetchWeeklySnapshot(): Promise<WeeklySnapshot> {
  // Fetch 30 days of dashboard data so we can compare this week vs 7 days prior
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [dashboardData, searchData] = await Promise.all([
    fetchAdmin<{
      summary: { mau: number; mrr: number; totalSignups: number };
      timeseries: Array<{
        date: string;
        mau: number;
        mrr: number;
        signups: number;
      }>;
    }>('/analytics/dashboard', { startDate, endDate }),
    fetchAdmin<{
      success: boolean;
      data: {
        performance: {
          clicks: number;
          impressions: number;
          ctr: number;
          position: number;
        };
      } | null;
    }>('/analytics/search-console', {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      endDate,
    }).catch(() => null),
  ]);

  const ts = dashboardData.timeseries;
  const now = new Date();

  // Current MAU/MRR: from summary (most up-to-date)
  const currentMau = dashboardData.summary.mau;
  const currentMrr = dashboardData.summary.mrr;

  // For week-over-week deltas: find the timeseries entry closest to 7 days ago
  // by matching date string, rather than relying on index (timeseries may have gaps)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const priorEntry =
    ts.find((d) => {
      const rowDate =
        typeof d.date === 'string'
          ? d.date.split('T')[0]
          : String(d.date).split('T')[0];
      return rowDate === sevenDaysAgo;
    }) ?? (ts.length >= 8 ? ts[ts.length - 8] : null);
  const priorMau = priorEntry ? Number(priorEntry.mau || 0) : 0;
  const priorMrr = priorEntry ? Number(priorEntry.mrr || 0) : 0;

  // New signups: sum of the last 7 days
  const thisWeekSlice = ts.slice(-7);
  const newSignups = thisWeekSlice.reduce(
    (sum, d) => sum + Number(d.signups || 0),
    0,
  );

  // Impressions/day from search console (average over 7 days)
  let impressionsPerDay = 0;
  let impressionsDelta = 0;

  if (searchData?.success && searchData.data) {
    const rawImpressions = searchData.data.performance?.impressions;
    const totalImpressions =
      typeof rawImpressions === 'number' && isFinite(rawImpressions)
        ? rawImpressions
        : 0;
    impressionsPerDay = Math.round(totalImpressions / 7);

    if (impressionsPerDay > 0) {
      // Fetch prior 7-day window for comparison
      const priorEnd = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
      const priorStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const priorSearchData = await fetchAdmin<{
        success: boolean;
        data: { performance: { impressions: number } } | null;
      }>('/analytics/search-console', {
        startDate: priorStart.toISOString().split('T')[0],
        endDate: priorEnd.toISOString().split('T')[0],
      }).catch(() => null);

      if (priorSearchData?.success && priorSearchData.data) {
        const priorRaw = priorSearchData.data.performance?.impressions;
        const priorTotal =
          typeof priorRaw === 'number' && isFinite(priorRaw) ? priorRaw : 0;
        const priorImpressionsPerDay = Math.round(priorTotal / 7);
        impressionsDelta = pctDelta(impressionsPerDay, priorImpressionsPerDay);
      }
    }
  }

  return {
    mau: currentMau,
    mauDelta: pctDelta(currentMau, priorMau),
    mrr: currentMrr,
    mrrDelta: pctDelta(currentMrr, priorMrr),
    impressionsPerDay,
    impressionsDelta,
    newSignups,
    weekLabel: weekLabel(now),
  };
}

// ---------------------------------------------------------------------------
// Milestone checks
// ---------------------------------------------------------------------------

export async function checkMilestones(
  snapshot: WeeklySnapshot,
): Promise<MilestoneCheck[]> {
  const stateFile = resolve(
    process.cwd(),
    'public',
    'app-demos',
    'bip',
    '.milestones-posted.json',
  );

  let posted: Record<string, boolean> = {};
  try {
    posted = JSON.parse(readFileSync(stateFile, 'utf-8'));
  } catch {
    // File doesn't exist yet — start fresh
  }

  const results: MilestoneCheck[] = [];

  for (const milestone of MILESTONES) {
    const currentValue = snapshot[milestone.metric];

    for (const threshold of milestone.values) {
      const key = `${milestone.metric}-${threshold}`;
      const crossed = currentValue >= threshold;
      const alreadyPosted = !!posted[key];
      results.push({
        metric: milestone.metric,
        threshold,
        crossed,
        alreadyPosted,
      });
    }
  }

  return results;
}

export async function markMilestonePosted(
  metric: string,
  threshold: number,
): Promise<void> {
  const dir = resolve(process.cwd(), 'public', 'app-demos', 'bip');
  const stateFile = resolve(dir, '.milestones-posted.json');

  mkdirSync(dir, { recursive: true });

  let posted: Record<string, boolean> = {};
  try {
    posted = JSON.parse(readFileSync(stateFile, 'utf-8'));
  } catch {
    // Start fresh
  }

  posted[`${metric}-${threshold}`] = true;
  writeFileSync(stateFile, JSON.stringify(posted, null, 2));
}

// ---------------------------------------------------------------------------
// Daily snapshot
// ---------------------------------------------------------------------------

export interface DailySnapshot {
  mau: number;
  mrr: number;
  newSignupsToday: number;
  impressionsPerDay: number;
  dateLabel: string; // "27 Feb 2026"
}

export async function fetchDailySnapshot(): Promise<DailySnapshot> {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [dashboardData, searchData] = await Promise.all([
    fetchAdmin<{
      summary: { mau: number; mrr: number; totalSignups: number };
      timeseries: Array<{
        date: string;
        mau: number;
        mrr: number;
        signups: number;
      }>;
    }>('/analytics/dashboard', { startDate, endDate }),
    fetchAdmin<{
      success: boolean;
      data: { performance: { impressions: number } } | null;
    }>('/analytics/search-console', { startDate, endDate }).catch(() => null),
  ]);

  // Today's signups: last entry in timeseries
  const ts = dashboardData.timeseries;
  const todayEntry = ts[ts.length - 1];
  const newSignupsToday = todayEntry ? Number(todayEntry.signups || 0) : 0;

  let impressionsPerDay = 0;
  if (searchData?.success && searchData.data) {
    const raw = searchData.data.performance?.impressions;
    const total = typeof raw === 'number' && isFinite(raw) ? raw : 0;
    impressionsPerDay = Math.round(total / 7);
  }

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return {
    mau: dashboardData.summary.mau,
    mrr: dashboardData.summary.mrr,
    newSignupsToday,
    impressionsPerDay,
    dateLabel,
  };
}

// ---------------------------------------------------------------------------
// Day counter state
// ---------------------------------------------------------------------------

interface BipState {
  dayCount: number;
  lastDailyPost: string; // YYYY-MM-DD
}

const BIP_STATE_FILE = resolve(
  process.cwd(),
  'public',
  'app-demos',
  'bip',
  '.bip-state.json',
);

function readBipState(): BipState {
  try {
    return JSON.parse(readFileSync(BIP_STATE_FILE, 'utf-8')) as BipState;
  } catch {
    return { dayCount: 0, lastDailyPost: '' };
  }
}

export function getDayCount(): {
  dayCount: number;
  alreadyPostedToday: boolean;
} {
  const state = readBipState();
  const today = new Date().toISOString().split('T')[0];
  return {
    dayCount: state.dayCount,
    alreadyPostedToday: state.lastDailyPost === today,
  };
}

export function incrementDayCount(): number {
  const dir = resolve(process.cwd(), 'public', 'app-demos', 'bip');
  mkdirSync(dir, { recursive: true });

  const state = readBipState();
  const newCount = state.dayCount + 1;
  const today = new Date().toISOString().split('T')[0];

  writeFileSync(
    BIP_STATE_FILE,
    JSON.stringify({ dayCount: newCount, lastDailyPost: today }, null, 2),
  );
  return newCount;
}
