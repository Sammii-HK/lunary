import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  enforceIpRateLimit,
  enforceGlobalDailyCeiling,
} from '@/lib/ai/rate-limit';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Resolve the TRUSTED client IP for rate-limiting on this paid surface.
 *
 * On Vercel, `x-real-ip` is set by the platform edge to the actual connecting
 * IP and cannot be overridden by the client, whereas `x-forwarded-for` may
 * contain attacker-prepended values. We therefore prefer `x-real-ip`, fall
 * back to the first `x-forwarded-for` hop, and finally to a shared 'unknown'
 * bucket so callers that strip IP headers are still throttled together (never
 * silently exempt). This is deliberately NOT keyed on the spoofable
 * X-RC-User-Id header.
 */
const resolveTrustedIp = (request: NextRequest): string => {
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers
    .get('x-forwarded-for')
    ?.split(',')[0]
    ?.trim();
  if (forwarded) return forwarded;
  return 'unknown';
};

const scoreRequestSchema = z.object({
  transcript: z.string().max(8000),
  question: z.string().max(1000),
  category: z.string().max(100).default(''),
  duration: z.number().min(0).default(0),
});

function buildPrompt(
  transcript: string,
  question: string,
  category: string,
): string {
  return `You are an expert interview coach evaluating a candidate's answer to an interview question.

Question: ${question}
Category: ${category}
Answer: ${transcript}

Evaluate the answer and return ONLY valid JSON with exactly this structure:
{
  "answerQuality": <1-5 float>,
  "communication": <1-5 float>,
  "depth": <1-5 float>,
  "structure": <1-5 float>,
  "confidence": <1-5 float>,
  "questionAnswered": <true|false>,
  "whatWasRight": ["<strength>"],
  "betterWording": [{"youSaid": "<phrase>", "better": "<improved phrase>"}],
  "dontForget": ["<key point missed>"],
  "tips": ["<actionable tip>"]
}

Scoring guide (1=poor, 5=excellent):
- answerQuality: overall interview performance
- communication: clarity, pacing, absence of fillers
- depth: specificity, metrics, concrete examples
- structure: logical flow, STAR format for behavioural
- confidence: ownership language, absence of hedging
- whatWasRight: 1-3 genuine strengths
- betterWording: up to 3 specific phrase improvements
- dontForget: up to 3 key points the answer missed
- tips: up to 3 actionable coaching tips

Return ONLY the JSON object. No markdown, no explanation.`;
}

export async function POST(request: NextRequest) {
  const now = Date.now();

  // Require RevenueCat user ID — only premium users should reach this endpoint.
  // NOTE: this header is client-supplied and trivially spoofable, so it is kept
  // as a cheap first gate but is NOT relied upon alone for cost control — the
  // rate limits below are keyed on the trusted IP and a global ceiling.
  // TODO(owner): verify the RevenueCat entitlement server-side (validate the
  // RC user/token against the RevenueCat API) instead of trusting this header.
  // Deliberately NOT built here — it is an owner cost/UX + secrets decision.
  const rcUserId = request.headers.get('X-RC-User-Id');
  if (!rcUserId || rcUserId === 'anonymous') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  // Cost/abuse guard 1: per-IP rate limit keyed on the TRUSTED IP (mirrors the
  // chat route's enforceIpRateLimit, same 10/min window from PLAN_LIMITS). The
  // spoofable X-RC-User-Id header is not trusted for this — see resolveTrustedIp.
  const ipCheck = enforceIpRateLimit(resolveTrustedIp(request), now);
  if (!ipCheck.ok) {
    return NextResponse.json(
      { error: ipCheck.reason ?? 'Too many requests' },
      {
        status: 429,
        headers: ipCheck.retryAfter
          ? { 'Retry-After': ipCheck.retryAfter.toString() }
          : undefined,
      },
    );
  }

  // Cost/abuse guard 2: process-wide global daily ceiling — a hard catastrophic
  // -spend backstop independent of caller identity (the per-IP limit alone does
  // not bound total daily spend across many IPs).
  const globalCheck = enforceGlobalDailyCeiling(undefined, now);
  if (!globalCheck.ok) {
    return NextResponse.json(
      { error: globalCheck.reason ?? 'Daily capacity reached' },
      {
        status: 429,
        headers: globalCheck.retryAfter
          ? { 'Retry-After': globalCheck.retryAfter.toString() }
          : undefined,
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = scoreRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { transcript, question, category } = parsed.data;

  const apiKey = process.env.DEEPINFRA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  try {
    const deepInfraRes = await fetch(
      'https://api.deepinfra.com/v1/openai/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
          messages: [
            {
              role: 'user',
              content: buildPrompt(transcript, question, category),
            },
          ],
          temperature: 0.3,
          max_tokens: 600,
        }),
      },
    );

    if (!deepInfraRes.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
    }

    const completion = (await deepInfraRes.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const raw = completion.choices?.[0]?.message?.content ?? '';

    // Strip markdown fences the model sometimes adds
    const cleaned = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const result = JSON.parse(cleaned);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Scoring failed' }, { status: 500 });
  }
}
