import { NextRequest, NextResponse } from 'next/server';
import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import {
  buildAstralContext,
  ASTRAL_GUIDE_PROMPT,
  type AstralContext,
} from '@/lib/ai/astral-guide';
import { estimateTokenCount } from '@/lib/ai/tokenizer';
import { loadUsage, updateUsage } from '@/lib/ai/usage';
import { resolvePlanId } from '@/lib/ai/plan-resolver';
import { DAILY_MESSAGE_LIMITS } from '@/lib/ai/plans';

type AstralGuideRequest = {
  message: string;
};

const jsonResponse = (payload: unknown, status = 200, init?: ResponseInit) =>
  NextResponse.json(payload, {
    status,
    ...init,
  });

/**
 * Formats the astral context into a prompt-friendly string
 */
function formatAstralContext(context: AstralContext): string {
  const parts: string[] = [];

  // User info
  if (context.user.name) {
    parts.push(`User: ${context.user.name}`);
  }
  parts.push(`Sun: ${context.user.sun}, Moon: ${context.user.moon}`);
  if (context.user.rising) {
    parts.push(`Rising: ${context.user.rising}`);
  }

  // Natal summary
  parts.push(`\nNatal Chart:\n${context.natalSummary}`);

  // Current transits
  parts.push(`\nCurrent Transits:\n${context.currentTransits}`);

  // Today's tarot
  parts.push(`\nToday's Tarot:\n${context.todaysTarot}`);

  // Moon phase
  parts.push(`\nMoon Phase:\n${context.moonPhase}`);

  // Journal summaries
  if (context.journalSummaries.length > 0) {
    parts.push(`\nRecent Journal Entries:`);
    context.journalSummaries.forEach((entry) => {
      parts.push(`- ${entry.date}: ${entry.summary}`);
    });
  }

  // Mood tags
  if (context.moodTags.length > 0) {
    parts.push(`\nRecent Moods: ${context.moodTags.join(', ')}`);
  }

  return parts.join('\n');
}

/**
 * Creates a streaming response for the astral guide
 */
function createAstralGuideStream(
  context: AstralContext,
  userMessage: string,
  responseText: string,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Send context metadata
        controller.enqueue(
          encoder.encode(
            `event: context\ndata: ${JSON.stringify({ context })}\n\n`,
          ),
        );

        // Stream the response text in chunks
        const paragraphs = responseText.split('\n\n');
        for (const paragraph of paragraphs) {
          if (paragraph.trim()) {
            controller.enqueue(
              encoder.encode(
                `event: message\ndata: ${JSON.stringify({ text: paragraph })}\n\n`,
              ),
            );
          }
        }

        // Send completion
        controller.enqueue(encoder.encode(`event: done\ndata: null\n\n`));
        controller.close();
      } catch (error) {
        console.error('[Astral Guide Stream] Error:', error);
        controller.error(error);
      }
    },
  });
}

export async function POST(request: NextRequest) {
  const now = new Date();

  try {
    const body = (await request.json()) as AstralGuideRequest;

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

    // Build astral context
    const astralContext = await buildAstralContext(
      user.id,
      user.displayName,
      user.birthday,
      now,
    );

    // Format context for prompt
    const contextString = formatAstralContext(astralContext);

    // Check if OpenAI is configured
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return jsonResponse(
        {
          error: 'AI service is temporarily unavailable. Please try again later.',
        },
        503,
      );
    }

    // Call OpenAI with astral guide persona
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey });

    const messages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }> = [
      {
        role: 'system',
        content: ASTRAL_GUIDE_PROMPT,
      },
      {
        role: 'system',
        content: `Astral Context:\n${contextString}`,
      },
      {
        role: 'user',
        content: body.message,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 600,
      temperature: 0.85, // Slightly mystical but grounded
      stream: false, // We'll handle streaming ourselves for better control
    });

    const aiResponse = completion.choices[0]?.message?.content || '';

    if (!aiResponse || aiResponse.trim().length === 0) {
      return jsonResponse(
        {
          error: 'AI service returned an empty response. Please try again later.',
        },
        503,
      );
    }

    // Calculate tokens and update usage
    const tokensIn = estimateTokenCount(body.message + contextString);
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

    // Check if client wants streaming
    const wantsStream =
      request.headers.get('accept')?.includes('text/event-stream') ||
      request.nextUrl.searchParams.get('stream') === '1';

    if (wantsStream) {
      const stream = createAstralGuideStream(
        astralContext,
        body.message,
        aiResponse,
      );

      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    // Return JSON response
    return jsonResponse({
      response: {
        role: 'assistant',
        content: aiResponse,
        tokens: tokensOut,
      },
      context: astralContext,
      usage: {
        used: usageResult.usage.usedMessages,
        limit: usageResult.dailyLimit,
        tokensIn: usageResult.usage.tokensIn,
        tokensOut: usageResult.usage.tokensOut,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonResponse({ error: 'Unauthorised' }, 401);
    }

    console.error('[AI Astral Guide] Unexpected error', error);
    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to process astral guide request',
      },
      500,
    );
  }
}
