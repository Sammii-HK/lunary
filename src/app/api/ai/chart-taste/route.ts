import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateText } from 'ai';

import { getDeepInfraModel } from '@/lib/ai/content-generator';
import {
  ASTRAL_GUIDE_PUBLIC_TASTE_PROMPT,
  formatTastePlacements,
} from '@/lib/ai/astral-guide';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { estimateTokenCount } from '@/lib/ai/tokenizer';
import { captureAIGeneration, captureEvent } from '@/lib/posthog-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Anonymous, capped "ask about your chart" taste endpoint.
 *
 * This is the public funnel surface for the chart-aware Astral Guide. It reuses
 * the SAME hosted DeepInfra Llama-3.3-70B engine and the SAME anti-fabrication
 * system prompt as the authenticated chat, but with hard guardrails for a
 * logged-out visitor:
 *  - No auth required (capped taste, not the full product).
 *  - No DB reads/writes, no threads, no memory, no usage rows.
 *  - Grounding is ONLY the placements the visitor just generated client-side on
 *    the free chart, formatted verbatim — the model cannot reach any other data.
 *  - IP rate-limited AND capped to a small number of questions per IP per day,
 *    enforced server-side so the client cap cannot be bypassed.
 *
 * COST-SAFETY (this endpoint is unauthenticated AND DeepInfra-billed, so call
 * VOLUME is the only real abuse lever):
 *  - Kill switch: `CHART_TASTE_ENABLED` must be "true" or the endpoint returns
 *    503 before any model call. Default OFF, so a fresh deploy cannot bill until
 *    Sammii flips it on (same gating discipline as dunning).
 *  - Trusted IP: per-IP buckets key on the Vercel-set `request.ip` (or the LAST
 *    x-forwarded-for hop, which the platform appends), NEVER the client's
 *    spoofable first XFF hop, so per-IP caps cannot be reset with a forged header.
 *  - Global ceiling: a per-minute AND per-day global cap (across all IPs) bounds
 *    total DeepInfra spend even under distributed or header-spoofed abuse.
 *  - Input bound: total grounding + message characters are hard-capped so a
 *    single call cannot inflate token cost.
 *
 * INTERIM LIMITER NOTE: there is no shared store (KV/Upstash/Redis) in the repo,
 * so the global counters here are per serverless instance (in-memory `Map`).
 * That bounds the per-lambda blast radius but is multiplied by warm-instance
 * count under real concurrency. A shared-store (or DB-backed) global counter is
 * the required fast-follow BEFORE `CHART_TASTE_ENABLED` is flipped on to serve at
 * scale. Until then the kill switch (default OFF) is the hard backstop, and the
 * middleware origin check (src/middleware.ts) blocks the trivial direct-curl
 * storm at the edge. Tracked as the broader limiter refactor (NICE 7 / shared
 * `getClientIp()` + `withAiBudget()` helper) in the round-2 security audit.
 *
 * The authenticated `/api/ai/chat` route is intentionally left untouched.
 */

const PLACEMENT_BODIES = new Set([
  'Sun',
  'Moon',
  'Ascendant',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Midheaven',
  'Uranus',
  'Neptune',
  'Pluto',
  'Chiron',
  'North Node',
  'South Node',
]);

const placementSchema = z.object({
  body: z.string().trim().min(1).max(40),
  sign: z.string().trim().min(1).max(20),
  degree: z.string().trim().max(20).nullable().optional(),
  house: z.number().int().min(1).max(12).nullable().optional(),
});

const requestSchema = z.object({
  message: z.string().trim().min(1).max(500),
  placements: z.array(placementSchema).min(1).max(20),
  source: z.string().trim().max(120).optional(),
});

/** Free questions per IP per rolling 24h window for the anonymous taste. */
const QUESTIONS_PER_IP_PER_DAY = 3;
/** Burst guard: no more than this many requests per IP per minute. */
const REQUESTS_PER_IP_PER_MINUTE = 6;

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

const SURFACE = 'public-chart-taste';

/**
 * Reads a positive integer env override, falling back to a default. Guards
 * against blanks / non-numeric / <=0 values so a typo cannot widen the cap.
 */
function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Kill switch. The billed endpoint stays dark unless explicitly enabled, so a
 * fresh deploy cannot incur DeepInfra cost until Sammii flips it on. Default OFF.
 */
function isEnabled(): boolean {
  return process.env.CHART_TASTE_ENABLED === 'true';
}

/**
 * Global ceiling across ALL IPs, independent of the per-IP caps, so a spoof
 * storm (unique XFF per request) still hits a wall. Env-tunable; conservative
 * defaults. NOTE: in-memory and therefore per serverless instance — see the
 * INTERIM LIMITER NOTE above. A shared-store global counter is the fast-follow.
 */
const GLOBAL_PER_MINUTE = envInt('CHART_TASTE_GLOBAL_RPM', 30);
const GLOBAL_PER_DAY = envInt('CHART_TASTE_GLOBAL_RPD', 500);

/**
 * Hard ceiling on the total characters fed to the model (grounding + message)
 * so a single call cannot inflate token cost beyond the schema's per-field
 * caps. Defensive: the Zod schema already bounds each field, this bounds the sum.
 */
const MAX_PROMPT_INPUT_CHARS = envInt('CHART_TASTE_MAX_INPUT_CHARS', 4000);

/**
 * Derive the client IP from a Vercel-trusted source, NOT the raw client-supplied
 * `x-forwarded-for` first hop (which is attacker-controlled and would let each
 * forged value open a fresh rate-limit bucket). `request.ip` is set by the
 * platform; if absent we fall back to the LAST XFF hop — the one Vercel appends
 * (the true edge IP) — never the first. Mirrors persona/profile/route.ts.
 */
function resolveIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  const lastHop = xff
    ? xff
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
        .pop()
    : null;
  return (request as { ip?: string }).ip || lastHop || 'unknown';
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();

  // Kill switch: refuse before any work or model call. Default OFF so the billed
  // endpoint cannot incur DeepInfra cost until it is deliberately enabled. The
  // widget surfaces this `error` as a gentle "the guide is resting" state.
  if (!isEnabled()) {
    return NextResponse.json(
      { error: 'The guide is resting right now. Please try again shortly.' },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { message, placements, source } = parsed.data;

  // Only allow recognised chart bodies through to the prompt. Anything else is
  // dropped, so user-supplied free text cannot smuggle fabricated placements in.
  const safePlacements = placements.filter((p) => PLACEMENT_BODIES.has(p.body));
  if (safePlacements.length === 0) {
    return NextResponse.json(
      { error: 'No valid chart placements provided.' },
      { status: 400 },
    );
  }

  const ip = resolveIp(request);

  // GLOBAL ceiling FIRST (across all IPs), independent of the per-IP caps. Even
  // if an attacker spoofs a unique IP per request to defeat the per-IP buckets,
  // total DeepInfra spend is bounded by these. Both a per-minute burst wall and a
  // per-day total. Checked before the per-IP caps so a spoof storm trips here.
  const globalMinute = checkRateLimit(
    'chart-taste:global:minute',
    GLOBAL_PER_MINUTE,
    MINUTE_MS,
  );
  const globalDay = globalMinute.allowed
    ? checkRateLimit('chart-taste:global:day', GLOBAL_PER_DAY, DAY_MS)
    : { allowed: false, retryAfterMs: globalMinute.retryAfterMs };
  if (!globalMinute.allowed || !globalDay.allowed) {
    const retryAfterMs = globalMinute.allowed
      ? globalDay.retryAfterMs
      : globalMinute.retryAfterMs;
    return NextResponse.json(
      { error: 'The guide is busy right now. Please try again shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(retryAfterMs / 1000).toString(),
        },
      },
    );
  }

  // Burst guard (per minute) then the daily question cap. Both are enforced
  // server-side so the client-side cap cannot be circumvented.
  const burst = checkRateLimit(
    `chart-taste:burst:${ip}`,
    REQUESTS_PER_IP_PER_MINUTE,
    MINUTE_MS,
  );
  if (!burst.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(burst.retryAfterMs / 1000).toString(),
        },
      },
    );
  }

  const daily = checkRateLimit(
    `chart-taste:daily:${ip}`,
    QUESTIONS_PER_IP_PER_DAY,
    DAY_MS,
  );
  if (!daily.allowed) {
    return NextResponse.json(
      {
        error:
          'You have used your free chart questions for now. Create a free account to keep asking.',
        capReached: true,
        limit: QUESTIONS_PER_IP_PER_DAY,
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(daily.retryAfterMs / 1000).toString(),
        },
      },
    );
  }

  const grounding = formatTastePlacements(safePlacements);

  // Defensive input ceiling: the Zod schema bounds each field, this bounds the
  // SUM of everything we feed the model so a single call cannot inflate cost.
  if (grounding.length + message.length > MAX_PROMPT_INPUT_CHARS) {
    return NextResponse.json(
      { error: 'That question is a little too long. Please shorten it.' },
      { status: 413 },
    );
  }

  try {
    const result = await generateText({
      model: getDeepInfraModel(),
      system: `${ASTRAL_GUIDE_PUBLIC_TASTE_PROMPT}\n\n${grounding}`,
      messages: [{ role: 'user', content: message }],
      maxOutputTokens: 320,
      temperature: 0.85,
    });

    const answer = result.text?.trim() ?? '';
    if (!answer) {
      return NextResponse.json(
        { error: 'The guide is resting. Please try again in a moment.' },
        { status: 503 },
      );
    }

    const tokensIn = estimateTokenCount(`${grounding}\n${message}`);
    const tokensOut = estimateTokenCount(answer);

    // Telemetry only — no DB rows for anonymous visitors. Source-labelled so the
    // public taste -> signup funnel is measurable from day one.
    const distinctId = `anon-${SURFACE}`;
    captureAIGeneration({
      distinctId,
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      provider: 'deepinfra',
      inputTokens: tokensIn,
      outputTokens: tokensOut,
      latencyMs: Date.now() - startedAt,
      success: true,
    });
    captureEvent(distinctId, 'public_chart_taste_answered', {
      surface: SURFACE,
      source: source ?? 'free_chart',
      placement_count: safePlacements.length,
    });

    return NextResponse.json({
      answer,
      surface: SURFACE,
      provenance: safePlacements.map((p) => ({
        body: p.body,
        sign: p.sign,
        degree: p.degree ?? null,
        house: p.house ?? null,
      })),
    });
  } catch (error) {
    console.error('[chart-taste] generation failed');
    if (error instanceof Error) console.error(error.message);
    return NextResponse.json(
      { error: 'The guide is unavailable right now. Please try again later.' },
      { status: 503 },
    );
  }
}
