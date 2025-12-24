type LogLevel = 'info' | 'warn' | 'error';

type GptLogTopResult = {
  type: string;
  slug: string;
  score?: number;
  reason?: string;
};

type GptLogSourceBreakdown = {
  curatedCount: number;
  aliasHit: boolean;
  searchCount: number;
};

export type GptDiscordLogPayload = {
  level: LogLevel;
  message: string;
  routeName: string;
  requestId: string;
  normalizedSeed?: string;
  typesRequested?: string[];
  limit?: number;
  resultCount?: number;
  topResults?: GptLogTopResult[];
  sourceBreakdown?: GptLogSourceBreakdown;
  timingMs?: number;
  cache?: 'hit' | 'miss' | 'unknown';
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
  context?: Record<string, unknown>;
};

const DEFAULT_SAMPLE_RATE = 0.15;
const DEDUPE_WINDOW_MS = 60_000;
const MAX_STACK_LINES = 10;

const RECENT_LOGS = new Map<string, number>();

const LEVEL_COLORS: Record<LogLevel, number> = {
  info: 0x3498db,
  warn: 0xf1c40f,
  error: 0xe74c3c,
};

const SENSITIVE_KEYS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'token',
  'access_token',
  'refresh_token',
  'ip',
  'user-agent',
  'useragent',
]);

export function shouldSample(
  level: LogLevel,
  rate: number,
  rand: () => number = Math.random,
) {
  if (level !== 'info') return true;
  if (rate <= 0) return false;
  if (rate >= 1) return true;
  return rand() < rate;
}

export function resetDiscordDedupe() {
  RECENT_LOGS.clear();
}

export function isDuplicateLog(key: string, now = Date.now()) {
  const lastSeen = RECENT_LOGS.get(key);
  if (lastSeen && now - lastSeen < DEDUPE_WINDOW_MS) {
    return true;
  }
  RECENT_LOGS.set(key, now);

  if (RECENT_LOGS.size > 200) {
    for (const [entryKey, timestamp] of RECENT_LOGS.entries()) {
      if (now - timestamp > DEDUPE_WINDOW_MS) {
        RECENT_LOGS.delete(entryKey);
      }
    }
  }

  return false;
}

export function sanitizeContext(context?: Record<string, unknown>) {
  if (!context) return undefined;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    const normalized = key.toLowerCase();
    if (SENSITIVE_KEYS.has(normalized)) continue;
    sanitized[key] = value;
  }
  return sanitized;
}

function parseSampleRate(value?: string | null) {
  if (!value) return DEFAULT_SAMPLE_RATE;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_SAMPLE_RATE;
  return Math.min(1, Math.max(0, parsed));
}

function truncate(value: string, max = 300) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 3)}...`;
}

function buildDedupeKey(payload: GptDiscordLogPayload) {
  const types = payload.typesRequested?.join(',') ?? '';
  const errorKey = payload.error
    ? `${payload.error.name ?? ''}:${payload.error.message ?? ''}`
    : '';
  return [
    payload.level,
    payload.routeName,
    payload.message,
    payload.normalizedSeed ?? '',
    types,
    payload.resultCount ?? '',
    errorKey,
  ].join('|');
}

function formatTopResults(results?: GptLogTopResult[]) {
  if (!results || results.length === 0) return 'None';
  return results
    .slice(0, 3)
    .map((result) => {
      const score =
        typeof result.score === 'number' ? ` (${result.score})` : '';
      return `${result.type}:${result.slug}${score}`;
    })
    .join('\n');
}

function formatReasons(results?: GptLogTopResult[]) {
  if (!results || results.length === 0) return 'None';
  const reasons = results
    .map((result) => result.reason)
    .filter(Boolean) as string[];
  if (reasons.length === 0) return 'None';
  const unique = Array.from(new Set(reasons));
  return truncate(unique.join(' | '), 200);
}

function formatError(error?: GptDiscordLogPayload['error']) {
  if (!error) return undefined;
  const lines = (error.stack || '').split('\n').slice(0, MAX_STACK_LINES);
  const stack = lines.length > 0 ? `\n${lines.join('\n')}` : '';
  return truncate(
    `${error.name ?? 'Error'}: ${error.message ?? 'Unknown error'}${stack}`,
    900,
  );
}

export async function logDiscordGptEvent(payload: GptDiscordLogPayload) {
  try {
    const webhook = process.env.DISCORD_GPT_LOG_WEBHOOK;
    if (!webhook) return;

    const sampleRate = parseSampleRate(process.env.DISCORD_GPT_LOG_SAMPLE_RATE);
    if (!shouldSample(payload.level, sampleRate)) return;

    const dedupeKey = buildDedupeKey(payload);
    if (isDuplicateLog(dedupeKey)) return;

    const sanitizedContext = sanitizeContext(payload.context);
    const types = payload.typesRequested?.join(', ') || 'All';
    const errorDetails = formatError(payload.error);

    const fields = [
      { name: 'Seed', value: payload.normalizedSeed || 'N/A', inline: true },
      { name: 'Types', value: types, inline: true },
      {
        name: 'Results',
        value:
          typeof payload.resultCount === 'number'
            ? String(payload.resultCount)
            : 'N/A',
        inline: true,
      },
      { name: 'Top Results', value: formatTopResults(payload.topResults) },
      { name: 'Reason Highlights', value: formatReasons(payload.topResults) },
      {
        name: 'Timing',
        value:
          typeof payload.timingMs === 'number'
            ? `${payload.timingMs}ms`
            : 'N/A',
        inline: true,
      },
      {
        name: 'Source',
        value: payload.sourceBreakdown
          ? `curated:${payload.sourceBreakdown.curatedCount} | alias:${payload.sourceBreakdown.aliasHit ? 'yes' : 'no'} | search:${payload.sourceBreakdown.searchCount}`
          : 'N/A',
        inline: true,
      },
      {
        name: 'Cache',
        value: payload.cache ?? 'unknown',
        inline: true,
      },
      { name: 'Request ID', value: payload.requestId, inline: true },
    ];

    if (errorDetails) {
      fields.push({ name: 'Error', value: errorDetails });
    }

    if (sanitizedContext && Object.keys(sanitizedContext).length > 0) {
      fields.push({
        name: 'Context',
        value: truncate(JSON.stringify(sanitizedContext), 400),
      });
    }

    const body = {
      embeds: [
        {
          title: 'Lunary GPT: Grimoire Bridge',
          color: LEVEL_COLORS[payload.level],
          description: truncate(payload.message, 250),
          fields,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);
  } catch {
    // Fail silently to avoid impacting API responses.
  }
}
