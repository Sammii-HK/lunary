import { NextRequest, NextResponse } from 'next/server';

import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import { buildLunaryContext } from '@/lib/ai/context';
import { composeAssistantReply } from '@/lib/ai/responder';
import { enforceIpRateLimit, enforceUserRateLimit } from '@/lib/ai/rate-limit';
import { resolvePlanId } from '@/lib/ai/plan-resolver';
import { AI_LIMIT_REACHED_MESSAGE, DAILY_MESSAGE_LIMITS } from '@/lib/ai/plans';
import { appendToThread } from '@/lib/ai/threads';
import { estimateTokenCount } from '@/lib/ai/tokenizer';
import { loadUsage, updateUsage } from '@/lib/ai/usage';
import { captureMemory } from '@/lib/ai/memory';
import { saveConversationSnippet } from '@/lib/ai/tool-adapters';

type ChatRequest = {
  message: string;
  threadId?: string;
};

const jsonResponse = (payload: unknown, status = 200, init?: ResponseInit) =>
  NextResponse.json(payload, {
    status,
    ...init,
  });

export async function POST(request: NextRequest) {
  const now = new Date();

  try {
    const body = (await request.json()) as ChatRequest;

    if (!body?.message || typeof body.message !== 'string') {
      return jsonResponse({ error: 'Message is required.' }, 400);
    }

    const user = await requireUser(request);
    const planId = resolvePlanId(user);

    const ipCheck = enforceIpRateLimit(
      request.headers.get('x-forwarded-for'),
      now.getTime(),
    );
    if (!ipCheck.ok) {
      return jsonResponse(
        {
          error: ipCheck.reason ?? 'Too many requests',
        },
        429,
        ipCheck.retryAfter
          ? {
              headers: {
                'Retry-After': ipCheck.retryAfter.toString(),
              },
            }
          : undefined,
      );
    }

    const userCheck = enforceUserRateLimit(user.id, now.getTime());
    if (!userCheck.ok) {
      return jsonResponse(
        {
          error: userCheck.reason ?? 'Rate limit exceeded',
        },
        429,
        userCheck.retryAfter
          ? {
              headers: {
                'Retry-After': userCheck.retryAfter.toString(),
              },
            }
          : undefined,
      );
    }

    const usageSnapshot = await loadUsage({ userId: user.id, planId, now });
    const dailyLimit = DAILY_MESSAGE_LIMITS[planId];

    if (usageSnapshot.usedMessages >= dailyLimit) {
      return jsonResponse({ error: AI_LIMIT_REACHED_MESSAGE }, 429);
    }

    const { context, dailyHighlight } = await buildLunaryContext({
      userId: user.id,
      tz: user.timezone ?? 'Europe/London',
      locale: user.locale ?? 'en-GB',
      displayName: user.displayName,
      now,
    });

    const composed = composeAssistantReply({
      context,
      userMessage: body.message,
      memorySnippets: [],
    });

    const assistantContent = composed.message;
    const tokensIn = estimateTokenCount(body.message);
    const tokensOut = estimateTokenCount(assistantContent);

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

    const timestamp = now.toISOString();
    const { thread } = await appendToThread({
      userId: user.id,
      threadId: body.threadId,
      userMessage: {
        role: 'user',
        content: body.message,
        ts: timestamp,
        tokens: tokensIn,
      },
      assistantMessage: {
        role: 'assistant',
        content: assistantContent,
        ts: timestamp,
        tokens: tokensOut,
      },
      titleHint: body.message,
    });

    await captureMemory({
      userId: user.id,
      planId,
      messages: thread.messages,
      usageCount: usageResult.usage.usedMessages,
      saveSnippet: async ({ userId: id, snippet }) => {
        await saveConversationSnippet(id, snippet);
        return { ok: true };
      },
    });

    return jsonResponse({
      threadId: thread.id,
      response: {
        role: 'assistant',
        content: assistantContent,
        tokens: tokensOut,
      },
      meta: {
        planId,
        usage: {
          used: usageResult.usage.usedMessages,
          limit: usageResult.dailyLimit,
          tokensIn: usageResult.usage.tokensIn,
          tokensOut: usageResult.usage.tokensOut,
        },
        dailyHighlight,
        promptSections: composed.promptSections,
        assist: composed.assistSnippet,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonResponse({ error: 'Unauthorised' }, 401);
    }

    console.error('[AI Chat] Unexpected error', error);
    return jsonResponse({ error: 'Failed to process chat request' }, 500);
  }
}
