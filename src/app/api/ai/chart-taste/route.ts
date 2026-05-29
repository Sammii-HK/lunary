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

function resolveIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();

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
