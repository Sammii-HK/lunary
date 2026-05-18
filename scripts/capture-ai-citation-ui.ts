#!/usr/bin/env tsx

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';

import type { CitationFinding, CitationSource } from '@/lib/seo/citation-radar';
import type { CitationRadarPrompt } from '@/lib/seo/citation-radar';

type Args = Map<string, string | boolean>;

type CdpMessage = {
  id?: number;
  sessionId?: string;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { message?: string };
};

type PendingCommand = {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
};

type PerplexityCapture = {
  href: string;
  title: string;
  bodyText: string;
  citationLabels: string[];
  links: Array<{
    text: string;
    href: string;
  }>;
};

const DEFAULT_MANAGER = 'http://127.0.0.1:18080';
const DEFAULT_PROFILE = 'lunary-research';
const DEFAULT_PROMPTS = 'docs/reports/ai-citation-prompts.json';
const DEFAULT_REPORT = 'docs/reports/ai-citation-radar.json';
const DEFAULT_FINDINGS = 'data/ai-citation-radar/findings.json';
const DEFAULT_SCREENSHOT_DIR = 'data/ai-citation-radar/screenshots';

function parseArgs(argv: string[]) {
  const args: Args = new Map();

  for (let index = 0; index < argv.length; index += 1) {
    const part = argv[index];
    if (!part.startsWith('--')) continue;

    const [rawKey, inlineValue] = part.slice(2).split('=');
    if (inlineValue !== undefined) {
      args.set(rawKey, inlineValue);
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args.set(rawKey, true);
      continue;
    }

    args.set(rawKey, next);
    index += 1;
  }

  return args;
}

function stringArg(args: Args, key: string, fallback: string) {
  const value = args.get(key);
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function numberArg(args: Args, key: string, fallback: number) {
  const value = args.get(key);
  if (typeof value !== 'string') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function listArg(args: Args, key: string) {
  const value = args.get(key);
  return typeof value === 'string'
    ? value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
    : [];
}

function clean(value: unknown, limit = 500) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit);
}

function slugify(value: string) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function domainFromUrl(rawUrl: string) {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function readJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function readCloakToken() {
  if (process.env.CLOAK_AUTH_TOKEN) return process.env.CLOAK_AUTH_TOKEN.trim();

  const tokenFile =
    process.env.CLOAK_AUTH_FILE ||
    resolve(homedir(), '.config', 'sammii', 'cloakbrowser-manager.env');
  if (!existsSync(tokenFile)) return '';

  const tokenLine = readFileSync(tokenFile, 'utf8')
    .split(/\r?\n/)
    .find((line) => line.startsWith('AUTH_TOKEN='));
  return tokenLine ? tokenLine.slice('AUTH_TOKEN='.length).trim() : '';
}

async function fetchJson<T>(
  url: string,
  token: string,
  init: RequestInit = {},
) {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(
      `${init.method || 'GET'} ${url} failed: ${response.status}`,
    );
  }

  return (await response.json()) as T;
}

async function resolveProfileId(
  manager: string,
  profile: string,
  token: string,
) {
  const profiles = await fetchJson<
    Array<{ id: string; name: string; status: string }>
  >(`${manager}/api/profiles`, token);
  const current = profiles.find(
    (item) => item.id === profile || item.name === profile,
  );
  if (!current) throw new Error(`Cloak profile not found: ${profile}`);
  if (current.status === 'running') return current.id;

  const launched = await fetchJson<{ profile_id?: string }>(
    `${manager}/api/profiles/${current.id}/launch`,
    token,
    { method: 'POST' },
  );
  return launched.profile_id || current.id;
}

class CdpClient {
  private nextId = 1;
  private pending = new Map<number, PendingCommand>();
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;
    ws.addEventListener('message', (event) => {
      const payload = JSON.parse(String(event.data)) as CdpMessage;
      if (!payload.id) return;

      const pending = this.pending.get(payload.id);
      if (!pending) return;
      this.pending.delete(payload.id);

      if (payload.error) {
        pending.reject(new Error(payload.error.message || 'CDP error'));
      } else {
        pending.resolve(payload.result);
      }
    });
  }

  static async connect(url: string, token: string) {
    const BrowserWebSocket = WebSocket as unknown as new (
      targetUrl: string,
      options?: { headers?: Record<string, string> },
    ) => WebSocket;
    const ws = new BrowserWebSocket(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    await new Promise<void>((resolveOpen, rejectOpen) => {
      const timeout = setTimeout(
        () => rejectOpen(new Error(`Timed out connecting to ${url}`)),
        15000,
      );
      ws.addEventListener('open', () => {
        clearTimeout(timeout);
        resolveOpen();
      });
      ws.addEventListener('error', () => {
        clearTimeout(timeout);
        rejectOpen(new Error(`Failed to connect to ${url}`));
      });
    });

    return new CdpClient(ws);
  }

  send<T = unknown>(
    method: string,
    params: Record<string, unknown> = {},
    sessionId?: string,
  ) {
    const id = this.nextId;
    this.nextId += 1;

    const message = {
      id,
      method,
      params,
      ...(sessionId ? { sessionId } : {}),
    };

    const result = new Promise<T>((resolveCommand, rejectCommand) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        rejectCommand(new Error(`CDP command timed out: ${method}`));
      }, 45000);

      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timeout);
          resolveCommand(value as T);
        },
        reject: (error) => {
          clearTimeout(timeout);
          rejectCommand(error);
        },
      });
    });

    this.ws.send(JSON.stringify(message));
    return result;
  }

  close() {
    this.ws.close();
  }
}

function managerWsUrl(manager: string, profileId: string) {
  return `${manager.replace(/^http/, 'ws')}/api/profiles/${profileId}/cdp`;
}

async function createPage(cdp: CdpClient) {
  const created = await cdp.send<{ targetId: string }>('Target.createTarget', {
    url: 'about:blank',
  });
  const attached = await cdp.send<{ sessionId: string }>(
    'Target.attachToTarget',
    {
      targetId: created.targetId,
      flatten: true,
    },
  );
  await cdp.send('Page.enable', {}, attached.sessionId);
  await cdp.send('Runtime.enable', {}, attached.sessionId);
  return { targetId: created.targetId, sessionId: attached.sessionId };
}

async function evaluate<T>(
  cdp: CdpClient,
  sessionId: string,
  expression: string,
) {
  const response = await cdp.send<{
    result?: { value?: T };
    exceptionDetails?: unknown;
  }>(
    'Runtime.evaluate',
    {
      expression,
      awaitPromise: true,
      returnByValue: true,
    },
    sessionId,
  );

  if (response.exceptionDetails) {
    throw new Error(`Runtime.evaluate failed: ${JSON.stringify(response)}`);
  }

  return response.result?.value as T;
}

function delay(ms: number) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function parsePerplexityLink(
  link: { text: string; href: string },
  index: number,
) {
  const lines = link.text
    .split(/\n+/)
    .map((line) => clean(line, 220))
    .filter(Boolean);
  const urlLineIndex = lines.findIndex((line) => /^https?:\/\//.test(line));
  const title =
    urlLineIndex >= 0
      ? lines[urlLineIndex + 1] || lines[0] || link.href
      : lines[1] || lines[0] || link.href;

  return {
    url: link.href,
    title,
    domain: domainFromUrl(link.href),
    snippet: lines
      .slice(urlLineIndex + 2)
      .join(' ')
      .slice(0, 500),
    position: index + 1,
  } satisfies CitationSource;
}

function isUsefulSource(source: CitationSource) {
  if (!source.url || !source.domain) return false;
  if (source.domain.includes('perplexity.')) return false;
  if (source.url.includes('/hub/legal/')) return false;
  return true;
}

async function capturePerplexity(params: {
  cdp: CdpClient;
  prompt: CitationRadarPrompt;
  waitMs: number;
  screenshotDir: string;
}) {
  const { targetId, sessionId } = await createPage(params.cdp);
  try {
    const searchUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(
      params.prompt.prompt,
    )}`;

    await params.cdp.send('Page.navigate', { url: searchUrl }, sessionId);
    await delay(params.waitMs);

    await evaluate<boolean>(
      params.cdp,
      sessionId,
      `(() => {
        const tab = Array.from(document.querySelectorAll('button,[role="tab"]'))
          .find((node) => (node.textContent || '').trim() === 'Links');
        if (!tab) return false;
        tab.click();
        return true;
      })()`,
    ).catch(() => false);

    await delay(3000);

    const capture = await evaluate<PerplexityCapture>(
      params.cdp,
      sessionId,
      `(() => {
        const clean = (value, limit = 800) => String(value || '')
          .replace(/\\s+/g, ' ')
          .trim()
          .slice(0, limit);
        const links = Array.from(document.querySelectorAll('a[href]'))
          .map((node) => ({
            text: clean(node.innerText || node.textContent || '', 900),
            href: node.href,
          }))
          .filter((item) => item.href && !item.href.includes('perplexity.ai'))
          .slice(0, 20);
        const citationLabels = Array.from(document.querySelectorAll('.citation'))
          .map((node) => clean(node.textContent || '', 120))
          .filter(Boolean);
        return {
          href: location.href,
          title: document.title,
          bodyText: clean(document.body?.innerText || '', 12000),
          citationLabels,
          links,
        };
      })()`,
    );

    mkdirSync(params.screenshotDir, { recursive: true });
    const screenshotPath = resolve(
      params.screenshotDir,
      `${new Date().toISOString().replace(/[:.]/g, '-')}-perplexity-${params.prompt.id}.png`,
    );
    const screenshot = await params.cdp.send<{ data: string }>(
      'Page.captureScreenshot',
      { format: 'png' },
      sessionId,
    );
    writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));

    const citedSources = capture.links
      .map(parsePerplexityLink)
      .filter(isUsefulSource)
      .slice(0, 10);

    return {
      capturedAt: new Date().toISOString(),
      engine: 'perplexity',
      query: params.prompt.prompt,
      promptId: params.prompt.id,
      topic: params.prompt.topic,
      locale: 'en-GB',
      country: 'GB',
      citedSources,
      screenshotPath: screenshotPath.replace(`${process.cwd()}/`, ''),
      notes: `Captured from Perplexity Links tab in the ${DEFAULT_PROFILE} Cloak profile. Result URL: ${capture.href}. Citation labels: ${capture.citationLabels
        .slice(0, 12)
        .join(', ')}`,
    } satisfies CitationFinding;
  } finally {
    await params.cdp
      .send('Target.closeTarget', { targetId })
      .catch(() => undefined);
  }
}

function selectPrompts(params: {
  promptsPath: string;
  reportPath: string;
  promptIds: string[];
  limit: number;
}) {
  const prompts = readJson<CitationRadarPrompt[]>(params.promptsPath, []);
  const byId = new Map(prompts.map((prompt) => [prompt.id, prompt]));

  if (params.promptIds.length > 0) {
    return params.promptIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .slice(0, params.limit) as CitationRadarPrompt[];
  }

  const report = readJson<{
    opportunities?: Array<{ promptId?: string; status?: string }>;
  }>(params.reportPath, {});
  const orderedIds = (report.opportunities || [])
    .filter((item) => item.status !== 'cited' && item.promptId)
    .map((item) => item.promptId as string);

  const ordered = orderedIds
    .map((id) => byId.get(id))
    .filter(Boolean) as CitationRadarPrompt[];
  return (ordered.length ? ordered : prompts).slice(0, params.limit);
}

function mergeFindings(
  existing: CitationFinding[],
  incoming: CitationFinding[],
) {
  const byKey = new Map<string, CitationFinding>();
  for (const finding of existing) {
    byKey.set(
      `${finding.engine}:${finding.promptId || finding.query}`,
      finding,
    );
  }
  for (const finding of incoming) {
    byKey.set(
      `${finding.engine}:${finding.promptId || finding.query}`,
      finding,
    );
  }
  return Array.from(byKey.values()).sort((a, b) =>
    a.capturedAt.localeCompare(b.capturedAt),
  );
}

function writeMergedFindings(path: string, findings: CitationFinding[]) {
  mkdirSync(dirname(path), { recursive: true });
  const existing = readJson<CitationFinding[]>(path, []);
  const merged = mergeFindings(existing, findings);
  writeFileSync(path, `${JSON.stringify(merged, null, 2)}\n`);
  return merged;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const manager = stringArg(args, 'manager', DEFAULT_MANAGER).replace(
    /\/$/,
    '',
  );
  const profile = stringArg(args, 'profile', DEFAULT_PROFILE);
  const engine = stringArg(args, 'engine', 'perplexity');
  const promptsPath = resolve(
    process.cwd(),
    stringArg(args, 'prompts', DEFAULT_PROMPTS),
  );
  const reportPath = resolve(
    process.cwd(),
    stringArg(args, 'report', DEFAULT_REPORT),
  );
  const findingsPath = resolve(
    process.cwd(),
    stringArg(args, 'out', DEFAULT_FINDINGS),
  );
  const screenshotDir = resolve(
    process.cwd(),
    stringArg(args, 'screenshot-dir', DEFAULT_SCREENSHOT_DIR),
  );
  const promptIds = listArg(args, 'prompt-id');
  const limit = numberArg(args, 'limit', promptIds.length || 3);
  const waitMs = numberArg(args, 'wait-ms', 14000);
  const promptTimeoutMs = numberArg(args, 'prompt-timeout-ms', waitMs + 60000);

  if (engine !== 'perplexity') {
    throw new Error('Only --engine perplexity is implemented so far');
  }

  const selectedPrompts = selectPrompts({
    promptsPath,
    reportPath,
    promptIds,
    limit,
  });
  if (selectedPrompts.length === 0) {
    throw new Error('No prompts selected for capture');
  }

  const token = readCloakToken();
  const profileId = await resolveProfileId(manager, profile, token);

  const findings: CitationFinding[] = [];
  const errors: Array<{ promptId: string; query: string; error: string }> = [];
  for (const prompt of selectedPrompts) {
    let cdp: CdpClient | undefined;
    try {
      cdp = await CdpClient.connect(managerWsUrl(manager, profileId), token);
      const finding = await withTimeout(
        capturePerplexity({
          cdp,
          prompt,
          waitMs,
          screenshotDir,
        }),
        promptTimeoutMs,
        `Prompt timed out after ${promptTimeoutMs}ms`,
      );
      findings.push(finding);
      writeMergedFindings(findingsPath, [finding]);
    } catch (error) {
      errors.push({
        promptId: prompt.id,
        query: prompt.prompt,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      cdp?.close();
    }
  }

  const merged = writeMergedFindings(findingsPath, findings);

  console.log(
    JSON.stringify(
      {
        engine,
        profile,
        promptsCaptured: findings.length,
        findingsPath,
        findings: findings.map((finding) => ({
          promptId: finding.promptId,
          query: finding.query,
          sourceCount: finding.citedSources.length,
          topSources: finding.citedSources.slice(0, 5).map((source) => ({
            domain: source.domain,
            url: source.url,
          })),
        })),
        errors,
        totalStoredFindings: merged.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.stack || error.message : String(error),
  );
  process.exit(1);
});
