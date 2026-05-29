import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import { estimateTokenCount } from '@/lib/ai/tokenizer';
import { loadUsage, updateUsage } from '@/lib/ai/usage';
import { resolvePlanId } from '@/lib/ai/plan-resolver';
import { enforceIpRateLimit, enforceUserRateLimit } from '@/lib/ai/rate-limit';
import { DAILY_MESSAGE_LIMITS } from '@/lib/ai/plans';

export const dynamic = 'force-dynamic';

// Cost/abuse guard: mirror the main chat route's input bound. Cap the user
// prompt at 4000 chars (chat uses the same z.string().max(4000)) so a single
// authed or leaked-session request cannot ship an arbitrarily large prompt to
// the paid DeepInfra model. The per-day message COUNT ceiling does not bound
// per-message SIZE, so this is what caps cost-per-call.
const grimoireQuickRequestSchema = z.object({
  message: z.string().max(4000),
});

type GrimoireQuickResponse = {
  bullets: string[];
  tokens?: number;
};

const jsonResponse = (payload: unknown, status = 200, init?: ResponseInit) =>
  NextResponse.json(payload, { status, ...init });

const GRIMOIRE_QUICK_PROMPT = `You are a knowledgeable mystical guide. Answer questions about witchcraft, tarot, astrology, crystals, moon phases, spells, and spiritual practices.

IMPORTANT RULES:
- Respond with EXACTLY 2-3 bullet points
- Each bullet should be one concise sentence
- Be direct and informative, no fluff
- Do not use markdown formatting
- Separate each bullet with a newline
- Start each line with "• "

Example format:
• First key insight about the topic
• Second important point to know
• Third practical tip or connection`;

export async function POST(request: NextRequest) {
  const now = new Date();

  try {
    const parsed = grimoireQuickRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      // Covers both a missing/invalid message and an over-length (> 4000 char)
      // prompt — the latter is the per-call cost bound mirrored from chat.
      return jsonResponse({ error: 'Invalid request body' }, 400);
    }
    const body = parsed.data;

    // Require authentication
    const user = await requireUser(request);

    // Cost/abuse guard: per-IP + per-user rate limiting, mirroring the chat
    // route exactly (same enforceIpRateLimit/enforceUserRateLimit helpers, same
    // windows/limits from PLAN_LIMITS). Applied AFTER requireUser so only
    // authenticated callers reach the paid model, and a tight loop from one
    // session/IP is throttled before it can burst paid DeepInfra calls.
    const ipCheck = enforceIpRateLimit(
      request.headers.get('x-forwarded-for'),
      now.getTime(),
    );
    if (!ipCheck.ok) {
      return jsonResponse(
        { error: ipCheck.reason ?? 'Too many requests' },
        429,
        ipCheck.retryAfter
          ? { headers: { 'Retry-After': ipCheck.retryAfter.toString() } }
          : undefined,
      );
    }

    const userCheck = enforceUserRateLimit(user.id, now.getTime());
    if (!userCheck.ok) {
      return jsonResponse(
        { error: userCheck.reason ?? 'Rate limit exceeded' },
        429,
        userCheck.retryAfter
          ? { headers: { 'Retry-After': userCheck.retryAfter.toString() } }
          : undefined,
      );
    }

    const planId = resolvePlanId(user);
    const dailyLimit = DAILY_MESSAGE_LIMITS[planId];

    // Check usage limits
    const usageSnapshot = await loadUsage({ userId: user.id, planId, now });
    if (usageSnapshot.usedMessages >= dailyLimit) {
      return jsonResponse(
        {
          error:
            'Daily message limit reached. Please try again tomorrow or upgrade your plan.',
          limitExceeded: true,
          used: usageSnapshot.usedMessages,
          limit: dailyLimit,
        },
        429,
      );
    }

    // Call AI - NO RAG retrieval, minimal tokens
    const { generateContent } = await import('@/lib/ai/content-generator');

    const aiResponse = await generateContent({
      systemPrompt: GRIMOIRE_QUICK_PROMPT,
      prompt: body.message,
      maxTokens: 150,
      temperature: 0.7,
    });

    if (!aiResponse.trim()) {
      return jsonResponse(
        {
          error:
            'AI service returned an empty response. Please try again later.',
        },
        503,
      );
    }

    // Parse bullets from response
    const bullets = aiResponse
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('•') || line.startsWith('-'))
      .map((line) => line.replace(/^[•\-]\s*/, '').trim())
      .filter(Boolean);

    // Fallback if parsing fails - split by sentences
    const finalBullets =
      bullets.length >= 2
        ? bullets.slice(0, 3)
        : aiResponse
            .split(/[.!?]/)
            .map((s) => s.trim())
            .filter((s) => s.length > 10)
            .slice(0, 3);

    // Calculate tokens and update usage
    const tokensIn = estimateTokenCount(body.message);
    const tokensOut = estimateTokenCount(aiResponse);

    const usageResult = await updateUsage({
      userId: user.id,
      planId,
      tokensIn,
      tokensOut,
      now,
    });

    if (usageResult.limitExceeded) {
      return jsonResponse({ error: usageResult.message }, 429);
    }

    const response: GrimoireQuickResponse = {
      bullets: finalBullets,
      tokens: tokensOut,
    };

    return jsonResponse(response);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonResponse({ error: 'Unauthorised' }, 401);
    }

    console.error('[Grimoire Quick] Unexpected error', error);
    return jsonResponse(
      {
        error:
          error instanceof Error ? error.message : 'Failed to process request',
      },
      500,
    );
  }
}
