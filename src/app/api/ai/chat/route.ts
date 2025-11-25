import { NextRequest, NextResponse } from 'next/server';

import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import { buildLunaryContext } from '@/lib/ai/context';
import { composeAssistantReply } from '@/lib/ai/responder';
import { enforceIpRateLimit, enforceUserRateLimit } from '@/lib/ai/rate-limit';
import { resolvePlanId } from '@/lib/ai/plan-resolver';
import {
  AI_LIMIT_REACHED_MESSAGE,
  CONTEXT_RULES,
  MEMORY_SNIPPET_LIMITS,
  DAILY_MESSAGE_LIMITS,
} from '@/lib/ai/plans';
import { appendToThread } from '@/lib/ai/threads';
import { estimateTokenCount } from '@/lib/ai/tokenizer';
import { loadUsage, updateUsage } from '@/lib/ai/usage';
import { captureMemory, getMemorySnippets } from '@/lib/ai/memory';
import { saveConversationSnippet } from '@/lib/ai/tool-adapters';
import { createAssistantStream } from '@/lib/ai/streaming';
import { detectAssistCommand, runAssistCommand } from '@/lib/ai/assist';
import { buildReflectionPrompt } from '@/lib/ai/reflection';
import { buildPromptSections } from '@/lib/ai/prompt';
import {
  getWeeklyRitualUsage,
  incrementWeeklyRitualUsage,
  isRitualRequest,
} from '@/lib/ai/weekly-ritual-usage';
import { recordAiInteraction } from '@/lib/analytics/tracking';

type ChatRequest = {
  message?: string;
  messages?: Array<{ role: string; content: string }>;
  threadId?: string;
  mode?: string;
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

    // Support both formats: direct message or AI SDK messages array
    let userMessage: string;
    if (body.message && typeof body.message === 'string') {
      userMessage = body.message;
    } else if (body.messages && Array.isArray(body.messages)) {
      const lastUserMsg = [...body.messages]
        .reverse()
        .find((m) => m.role === 'user');
      if (!lastUserMsg?.content) {
        return jsonResponse({ error: 'No user message found.' }, 400);
      }
      userMessage = lastUserMsg.content;
    } else {
      return jsonResponse({ error: 'Message is required.' }, 400);
    }

    const user = await requireUser(request);
    const planId = resolvePlanId(user);
    const assistCommand = detectAssistCommand(userMessage);
    const aiMode =
      typeof body.mode === 'string' && body.mode.trim().length > 0
        ? body.mode.trim()
        : (assistCommand.type ?? 'general');

    // Use userMessage throughout instead of userMessage
    const memorySnippetLimit = MEMORY_SNIPPET_LIMITS[planId] ?? 0;
    const memorySnippets = getMemorySnippets(user.id, memorySnippetLimit);

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
      return jsonResponse(
        {
          error: AI_LIMIT_REACHED_MESSAGE,
          message: AI_LIMIT_REACHED_MESSAGE,
          limitExceeded: true,
          used: usageSnapshot.usedMessages,
          limit: dailyLimit,
        },
        429,
      );
    }

    if (planId === 'free' && isRitualRequest(userMessage)) {
      const weeklyUsage = await getWeeklyRitualUsage(user.id, now);
      if (weeklyUsage.used >= weeklyUsage.limit) {
        return jsonResponse(
          {
            error:
              "You've used your free weekly AI ritual/reading. Upgrade to Lunary+ AI for unlimited access.",
            message:
              "You've used your free weekly AI ritual/reading. Upgrade to Lunary+ AI for unlimited access.",
            limitExceeded: true,
            used: weeklyUsage.used,
            limit: weeklyUsage.limit,
            upgradeUrl: '/pricing',
          },
          429,
        );
      }
    }

    const { historyLimit, includeMood } =
      CONTEXT_RULES[planId] ?? CONTEXT_RULES.free;

    // Disable cache for chat to ensure fresh, comprehensive context
    // Cached snapshots may be stale and missing recent tarot readings or updates
    const { context, dailyHighlight } = await buildLunaryContext({
      userId: user.id,
      tz: user.timezone ?? 'Europe/London',
      locale: user.locale ?? 'en-GB',
      displayName: user.displayName,
      userBirthday: user.birthday,
      historyLimit,
      includeMood,
      planId,
      now,
      useCache: false, // Always build fresh context for chat
    });

    // Detect if user is asking about a specific tarot card and fetch grimoire data
    let grimoireData:
      | {
          tarotCards?: Array<{
            name: string;
            keywords: string[];
            information: string;
          }>;
          rituals?: Array<{ title: string; description: string }>;
        }
      | undefined;

    const tarotCardMatch = userMessage.match(
      /tarot card ["']([^"']+)["']|tarot card (\w+(?:\s+\w+)*)/i,
    );
    if (tarotCardMatch) {
      const cardName = tarotCardMatch[1] || tarotCardMatch[2];
      if (cardName) {
        try {
          const { getTarotCardByName } = await import(
            '@/utils/tarot/getCardByName'
          );
          const cardData = getTarotCardByName(cardName);
          if (cardData) {
            grimoireData = {
              tarotCards: [cardData],
            };
          }
        } catch (error) {
          console.error('[Chat] Failed to fetch tarot card data:', error);
        }
      }
    }

    if (assistCommand.type && assistCommand.type !== 'none') {
      const assistSnippet = runAssistCommand(assistCommand, context);
      const reflection = buildReflectionPrompt(context, userMessage);
      const promptSections = buildPromptSections({
        context,
        memorySnippets,
        userMessage: userMessage,
      });

      // Only save assistSnippet to thread - reflection is sent separately and should NOT be in message content
      const assistantContent = assistSnippet || '';

      const tokensIn = estimateTokenCount(userMessage);
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

      if (planId === 'free' && isRitualRequest(userMessage)) {
        await incrementWeeklyRitualUsage(user.id, now);
      }

      const timestamp = now.toISOString();
      const { thread } = await appendToThread({
        userId: user.id,
        threadId: body.threadId,
        userMessage: {
          role: 'user',
          content: userMessage,
          ts: timestamp,
          tokens: tokensIn,
        },
        assistantMessage: {
          role: 'assistant',
          content: assistantContent,
          ts: timestamp,
          tokens: tokensOut,
        },
        titleHint: userMessage,
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
        snippetLimit: memorySnippetLimit,
      });

      const updatedMemorySnippets =
        memorySnippetLimit > 0
          ? getMemorySnippets(user.id, memorySnippetLimit)
          : memorySnippets;

      const metaPayload = {
        threadId: thread.id,
        response: {
          role: 'assistant',
          tokens: tokensOut,
        },
        planId,
        usage: {
          used: usageResult.usage.usedMessages,
          limit: usageResult.dailyLimit,
          tokensIn: usageResult.usage.tokensIn,
          tokensOut: usageResult.usage.tokensOut,
        },
        dailyHighlight,
        memories: updatedMemorySnippets,
      };

      await recordAiInteraction({
        userId: user.id,
        mode: aiMode,
        tokensIn,
        tokensOut,
        metadata: {
          thread_id: thread.id,
          assist: assistCommand.type ?? undefined,
        },
      });

      const wantsStream =
        request.headers.get('accept')?.includes('text/event-stream') ||
        request.nextUrl.searchParams.get('stream') === '1';

      if (wantsStream) {
        const stream = createAssistantStream({
          composed: {
            message: assistantContent,
            assistSnippet: assistSnippet ?? null,
            reflection,
            promptSections,
          },
          meta: {
            ...metaPayload,
            memories: updatedMemorySnippets,
          },
        });

        return new Response(stream, {
          status: 200,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
          },
        });
      }

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
          assist: assistSnippet,
          reflection,
          memories: updatedMemorySnippets,
        },
      });
    }

    // Build prompt sections with grimoire data if available
    const promptSections = buildPromptSections({
      context,
      memorySnippets,
      userMessage: userMessage,
      grimoireData,
    });

    let composed;
    try {
      composed = await composeAssistantReply({
        context,
        userMessage: userMessage,
        memorySnippets,
        threadId: body.threadId,
        promptSectionsOverride: promptSections,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'AI service is temporarily unavailable. Please try again later.';
      console.error('[AI Chat] Failed to compose reply:', error);
      return jsonResponse(
        {
          error: errorMessage,
          message:
            "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        },
        503,
      );
    }

    const assistantContent = composed.message;
    const tokensIn = estimateTokenCount(userMessage);
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

    if (planId === 'free' && isRitualRequest(userMessage)) {
      await incrementWeeklyRitualUsage(user.id, now);
    }

    const timestamp = now.toISOString();
    const { thread } = await appendToThread({
      userId: user.id,
      threadId: body.threadId,
      userMessage: {
        role: 'user',
        content: userMessage,
        ts: timestamp,
        tokens: tokensIn,
      },
      assistantMessage: {
        role: 'assistant',
        content: assistantContent,
        ts: timestamp,
        tokens: tokensOut,
      },
      titleHint: userMessage,
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
      snippetLimit: memorySnippetLimit,
    });

    const updatedMemorySnippets =
      memorySnippetLimit > 0
        ? getMemorySnippets(user.id, memorySnippetLimit)
        : memorySnippets;

    const metaPayload = {
      threadId: thread.id,
      response: {
        role: 'assistant',
        tokens: tokensOut,
      },
      planId,
      usage: {
        used: usageResult.usage.usedMessages,
        limit: usageResult.dailyLimit,
        tokensIn: usageResult.usage.tokensIn,
        tokensOut: usageResult.usage.tokensOut,
      },
      dailyHighlight,
      memories: updatedMemorySnippets,
    };

    await recordAiInteraction({
      userId: user.id,
      mode: aiMode,
      tokensIn,
      tokensOut,
      metadata: {
        thread_id: thread.id,
        assist: composed.assistSnippet ? 'assist' : undefined,
      },
    });

    const wantsStream =
      request.headers.get('accept')?.includes('text/event-stream') ||
      request.nextUrl.searchParams.get('stream') === '1';

    if (wantsStream) {
      const stream = createAssistantStream({
        composed,
        meta: metaPayload,
      });

      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

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
        reflection: composed.reflection,
        memories: updatedMemorySnippets,
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
