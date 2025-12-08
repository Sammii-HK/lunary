import { NextRequest, NextResponse } from 'next/server';
import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import { estimateTokenCount } from '@/lib/ai/tokenizer';
import { loadUsage, updateUsage } from '@/lib/ai/usage';
import { resolvePlanId } from '@/lib/ai/plan-resolver';
import { DAILY_MESSAGE_LIMITS } from '@/lib/ai/plans';

type GrimoireQuickRequest = {
  message: string;
};

type GrimoireQuickResponse = {
  bullets: string[];
  tokens?: number;
};

const jsonResponse = (payload: unknown, status = 200) =>
  NextResponse.json(payload, { status });

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
    const body = (await request.json()) as GrimoireQuickRequest;

    if (!body?.message || typeof body.message !== 'string') {
      return jsonResponse({ error: 'Message is required.' }, 400);
    }

    // Require authentication
    const user = await requireUser(request);
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

    // Check if OpenAI is configured
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return jsonResponse(
        {
          error:
            'AI service is temporarily unavailable. Please try again later.',
        },
        503,
      );
    }

    // Call OpenAI - NO RAG retrieval, minimal tokens
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: GRIMOIRE_QUICK_PROMPT },
        { role: 'user', content: body.message },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || '';

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
