import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { requireAdminAuth } from '@/lib/admin-auth';
import { type AuthenticatedUser } from '@/lib/ai/auth';
import { buildLunaryContext } from '@/lib/ai/context';
import { composeAssistantReply } from '@/lib/ai/responder';
import { resolvePlanId } from '@/lib/ai/plan-resolver';
import { CONTEXT_RULES, MEMORY_SNIPPET_LIMITS } from '@/lib/ai/plans';
import { appendToThread } from '@/lib/ai/threads';
import { estimateTokenCount } from '@/lib/ai/tokenizer';
import { updateUsage } from '@/lib/ai/usage';
import { captureMemory, getMemorySnippets } from '@/lib/ai/memory';
import { saveConversationSnippet } from '@/lib/ai/tool-adapters';
import { buildPromptSections } from '@/lib/ai/prompt';
import {
  retrieveGrimoireContext,
  isAstralQuery,
  buildAstralContext,
  ASTRAL_GUIDE_PROMPT,
} from '@/lib/ai/astral-guide';
import { analyzeContextNeeds } from '@/lib/ai/context-optimizer';
import { decrypt } from '@/lib/encryption';
import { normalizePlanType } from '@/utils/pricing';

const requestSchema = z.object({
  message: z.string().min(1).max(5000),
  email: z.string().email().optional(),
  userId: z.string().uuid().optional(),
  threadId: z.string().uuid().optional(),
  mode: z.string().max(50).optional(),
});

/**
 * Resolve a user from admin params (email or userId).
 * Returns an AuthenticatedUser-shaped object with plan + birthday.
 */
async function resolveUser(
  email?: string,
  userId?: string,
): Promise<AuthenticatedUser> {
  let userRow: { id: string; email: string; name: string | null };

  if (email) {
    const result = await sql`
      SELECT id, email, name FROM "user" WHERE email = ${email} LIMIT 1
    `;
    if (result.rows.length === 0) throw new Error(`User not found: ${email}`);
    userRow = result.rows[0] as typeof userRow;
  } else if (userId) {
    const result = await sql`
      SELECT id, email, name FROM "user" WHERE id = ${userId} LIMIT 1
    `;
    if (result.rows.length === 0) throw new Error(`User not found: ${userId}`);
    userRow = result.rows[0] as typeof userRow;
  } else {
    throw new Error('email or userId is required');
  }

  // Fetch subscription
  let plan: string | undefined;
  const subResult = await sql`
    SELECT plan_type, status FROM subscriptions
    WHERE user_id = ${userRow.id}
    ORDER BY created_at DESC LIMIT 1
  `;
  if (subResult.rows.length > 0) {
    const sub = subResult.rows[0];
    if (
      sub.status === 'active' ||
      sub.status === 'trial' ||
      sub.status === 'trialing'
    ) {
      plan = normalizePlanType(sub.plan_type);
    }
  }

  // Fetch birthday
  let birthday: string | undefined;
  try {
    const profileResult = await sql`
      SELECT birthday FROM user_profiles WHERE user_id = ${userRow.id} LIMIT 1
    `;
    if (profileResult.rows.length > 0 && profileResult.rows[0].birthday) {
      birthday = decrypt(profileResult.rows[0].birthday);
    }
  } catch {
    // Birthday may not exist or decrypt may fail
  }

  return {
    id: userRow.id,
    email: userRow.email,
    displayName: userRow.name ?? undefined,
    timezone: 'Europe/London',
    locale: 'en-GB',
    plan,
    birthday,
  };
}

export async function POST(request: Request) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { message: userMessage, email, userId, threadId, mode } = parsed.data;

  try {
    const user = await resolveUser(email, userId);
    const planId = resolvePlanId(user);
    const now = new Date();

    // Detect astral mode
    const useAstralContext = isAstralQuery(userMessage) || mode === 'astral';
    const aiMode = mode?.trim() || (useAstralContext ? 'astral' : 'general');

    // Memory
    const memorySnippetLimit = MEMORY_SNIPPET_LIMITS[planId] ?? 0;
    const memorySnippets = getMemorySnippets(user.id, memorySnippetLimit);

    // Build context
    const { historyLimit, includeMood } =
      CONTEXT_RULES[planId] ?? CONTEXT_RULES.free;

    let context: any;
    if (useAstralContext) {
      const contextNeeds = analyzeContextNeeds(userMessage);
      const astralContext = await buildAstralContext(
        user.id,
        user.displayName,
        user.birthday,
        now,
        userMessage,
        {
          needsPersonalTransits: contextNeeds.needsPersonalTransits,
          needsNatalPatterns: contextNeeds.needsNatalPatterns,
          needsPlanetaryReturns: contextNeeds.needsPlanetaryReturns,
          needsProgressedChart: contextNeeds.needsProgressedChart,
          needsEclipses: contextNeeds.needsEclipses,
        },
      );

      const lunaryResult = await buildLunaryContext({
        userId: user.id,
        tz: user.timezone ?? 'Europe/London',
        locale: user.locale ?? 'en-GB',
        displayName: user.displayName,
        userBirthday: user.birthday,
        historyLimit: 0,
        includeMood: true,
        planId,
        now,
        useCache: false,
      });

      context = { ...lunaryResult.context, ...astralContext };
    } else {
      const lunaryResult = await buildLunaryContext({
        userId: user.id,
        tz: user.timezone ?? 'Europe/London',
        locale: user.locale ?? 'en-GB',
        displayName: user.displayName,
        userBirthday: user.birthday,
        historyLimit,
        includeMood,
        planId,
        now,
        useCache: false,
      });
      context = lunaryResult.context;
    }

    // Grimoire RAG
    let grimoireData:
      | {
          semanticContext?: string;
          sources?: Array<{ title: string; slug: string; category: string }>;
        }
      | undefined;

    try {
      const { context: semanticContext, sources } =
        await retrieveGrimoireContext(userMessage, 3);
      if (semanticContext && sources.length > 0) {
        grimoireData = {
          semanticContext,
          sources: sources.map((s) => ({
            title: s.title,
            slug: s.slug,
            category: s.category,
          })),
        };
      }
    } catch {
      // Grimoire retrieval is non-critical
    }

    // Build prompt and compose reply
    const promptSections = buildPromptSections({
      context,
      memorySnippets,
      userMessage,
      grimoireData,
      systemPromptOverride: useAstralContext ? ASTRAL_GUIDE_PROMPT : undefined,
    });

    const composed = await composeAssistantReply({
      context,
      userMessage,
      memorySnippets,
      threadId,
      promptSectionsOverride: promptSections,
    });

    const assistantContent = composed.message;
    const tokensIn = estimateTokenCount(userMessage);
    const tokensOut = estimateTokenCount(assistantContent);

    // Track usage
    await updateUsage({ userId: user.id, planId, tokensIn, tokensOut, now });

    // Save to thread
    const timestamp = now.toISOString();
    const { thread } = await appendToThread({
      userId: user.id,
      threadId,
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

    // Capture memory
    await captureMemory({
      userId: user.id,
      planId,
      messages: thread.messages,
      usageCount: 0,
      saveSnippet: async ({ userId: id, snippet }) => {
        await saveConversationSnippet(id, snippet);
        return { ok: true };
      },
      snippetLimit: memorySnippetLimit,
    });

    return NextResponse.json({
      threadId: thread.id,
      response: {
        role: 'assistant',
        content: assistantContent,
      },
      meta: {
        planId,
        mode: aiMode,
        tokensIn,
        tokensOut,
      },
    });
  } catch (error) {
    console.error('[admin/astral-guide/chat] Error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to process chat';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
