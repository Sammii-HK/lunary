import {
  streamText,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { detectAssistCommand, runAssistCommand } from './assist';
import { buildReflectionPrompt } from './reflection';
import { buildPromptSections } from './prompt';
import { LunaryContext, AiPlanId } from './types';
import { appendToThread } from './threads';
import { estimateTokenCount } from './tokenizer';
import { updateUsage } from './usage';
import { captureMemory, getMemorySnippets } from './memory';
import { saveConversationSnippet } from './tool-adapters';
import { recordAiInteraction } from '@/lib/analytics/tracking';
import { captureAIGeneration } from '@/lib/posthog-server';
import {
  extractPersonalFacts,
  saveUserMemory,
  loadUserMemory,
  formatUserMemoryForContext,
} from './user-memory';
import {
  extractMomentsFromMessages,
  saveExtractedMoments,
} from '@/lib/journal/extract-moments';

type StreamChatParams = {
  userId: string;
  context: LunaryContext;
  userMessage: string;
  memorySnippets?: string[];
  threadId?: string | null;
  planId: AiPlanId;
  memorySnippetLimit: number;
  dailyHighlight?: unknown;
  grimoireData?: {
    tarotCards?: Array<{
      name: string;
      keywords: string[];
      information: string;
    }>;
    rituals?: Array<{ title: string; description: string }>;
  };
  aiMode: string;
  now: Date;
};

export const createStreamingChatResponse = async ({
  userId,
  context,
  userMessage,
  memorySnippets = [],
  threadId,
  planId,
  memorySnippetLimit,
  dailyHighlight,
  grimoireData,
  aiMode,
  now,
}: StreamChatParams): Promise<Response> => {
  // Load user's personal memory (encrypted facts)
  const userMemoryFacts = await loadUserMemory(userId, 15).catch(() => []);
  const userMemoryContext = formatUserMemoryForContext(userMemoryFacts);

  const promptSections = buildPromptSections({
    context,
    memorySnippets,
    userMessage,
    grimoireData,
  });

  const assistCommand = detectAssistCommand(userMessage);
  const assistSnippet = runAssistCommand(assistCommand, context);
  const reflection = buildReflectionPrompt(context, userMessage);

  const systemPrompt = [
    promptSections.system,
    promptSections.memory ? promptSections.memory : '',
    userMemoryContext, // Include personal facts the AI knows about the user
    promptSections.context,
  ]
    .filter(Boolean)
    .join('\n\n');

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  if (threadId) {
    try {
      const { loadThreadFromDatabase } = await import('./threads');
      const thread = await loadThreadFromDatabase(threadId);
      if (thread && thread.messages.length > 0) {
        const history = thread.messages
          .slice(-6)
          .map((msg) => {
            let content = msg.content;
            if (msg.role === 'assistant') {
              content = content
                .replace(/You could journal on.*?\./gi, '')
                .replace(/You could journal on.*$/gim, '')
                .replace(/You could journal.*?\./gi, '')
                .replace(/You could journal.*$/gim, '')
                .replace(/is inviting you to explore.*?\./gi, '')
                .replace(/inviting you to explore.*$/gim, '')
                .replace(/inviting you.*?\./gi, '')
                .replace(/inviting you.*$/gim, '')
                .replace(/on this \w+day.*$/gim, '')
                .trim();
            }
            return {
              role: (msg.role === 'user' ? 'user' : 'assistant') as
                | 'user'
                | 'assistant',
              content,
            };
          })
          .filter((msg) => msg.content.trim().length > 0);
        messages.push(...history);
      }
    } catch (error) {
      console.error('[AI Stream] Failed to load thread history:', error);
    }
  }

  messages.push({ role: 'user', content: userMessage });

  const isWeeklyOverview =
    userMessage.toLowerCase().includes('weekly overview') ||
    userMessage.toLowerCase().includes('summarise my week');
  const isRitualReq =
    userMessage.toLowerCase().includes('ritual') &&
    (userMessage.toLowerCase().includes('moon') ||
      userMessage.toLowerCase().includes('tonight'));
  const isJournalEntry =
    userMessage.toLowerCase().includes('journal entry') ||
    userMessage.toLowerCase().includes('format as journal');

  let maxTokens = 400;
  if (isWeeklyOverview) {
    maxTokens = 1200;
  } else if (isRitualReq || isJournalEntry) {
    maxTokens = 500;
  }

  const tokensIn = estimateTokenCount(userMessage);
  const startTime = Date.now();

  // Create UI message stream for v6 SDK
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const result = streamText({
        model: openai('gpt-4o-mini'),
        system: systemPrompt,
        messages,
        maxOutputTokens: maxTokens,
        temperature: 0.9,
      });

      // Merge the text stream into the UI message stream
      writer.merge(result.toUIMessageStream());

      // Wait for completion and process metadata
      const text = await result.text;
      const aiUsage = await result.usage;

      try {
        const tokensOut = aiUsage?.outputTokens || estimateTokenCount(text);

        const usageResult = await updateUsage({
          userId,
          planId,
          tokensIn,
          tokensOut,
          now,
        });

        const timestamp = now.toISOString();
        const { thread } = await appendToThread({
          userId,
          threadId: threadId || undefined,
          userMessage: {
            role: 'user',
            content: userMessage,
            ts: timestamp,
            tokens: tokensIn,
          },
          assistantMessage: {
            role: 'assistant',
            content: text,
            ts: timestamp,
            tokens: tokensOut,
          },
          titleHint: userMessage,
        });

        await captureMemory({
          userId,
          planId,
          messages: thread.messages,
          usageCount: usageResult.usage.usedMessages,
          saveSnippet: async ({ userId: id, snippet }) => {
            await saveConversationSnippet(id, snippet);
            return { ok: true };
          },
          snippetLimit: memorySnippetLimit,
        });

        // Extract and save personal facts from this conversation (encrypted)
        const userMsgs = thread.messages
          .filter((m) => m.role === 'user')
          .map((m) => m.content);
        const extractedFacts = extractPersonalFacts(userMsgs);
        if (extractedFacts.length > 0) {
          await saveUserMemory(userId, extractedFacts, thread.id).catch(
            (error) => {
              console.error('[AI Stream] Failed to save user memory:', error);
            },
          );
        }

        // Extract journal-worthy moments and save to Book of Shadows
        const messagesForJournal = thread.messages.map((m) => ({
          role: m.role,
          content: m.content,
          ts: m.ts,
          id: `${thread.id}-${m.ts}`,
        }));
        const journalMoments = extractMomentsFromMessages(messagesForJournal);
        if (journalMoments.length > 0) {
          const cosmicContext = {
            moonPhase: context.moon?.phase,
            transitHighlight: context.currentTransits[0]
              ? `${context.currentTransits[0].from} ${context.currentTransits[0].aspect} ${context.currentTransits[0].to}`
              : undefined,
          };
          await saveExtractedMoments(
            userId,
            journalMoments,
            cosmicContext,
          ).catch((error) => {
            console.error('[AI Stream] Failed to save journal moments:', error);
          });
        }

        const updatedMemorySnippets =
          memorySnippetLimit > 0
            ? getMemorySnippets(userId, memorySnippetLimit)
            : memorySnippets;

        // Write metadata as a data part (v6 pattern)
        writer.write({
          type: 'data-metadata',
          data: {
            type: 'metadata',
            threadId: thread.id,
            planId,
            usage: {
              used: usageResult.usage.usedMessages,
              limit: usageResult.dailyLimit,
              tokensIn: usageResult.usage.tokensIn,
              tokensOut: usageResult.usage.tokensOut,
            },
            dailyHighlight: dailyHighlight ?? null,
            assistSnippet: assistSnippet ?? null,
            reflection,
            memories: updatedMemorySnippets,
          },
        } as any);

        await recordAiInteraction({
          userId,
          mode: aiMode,
          tokensIn,
          tokensOut,
          metadata: {
            thread_id: thread.id,
            assist: assistCommand.type ?? undefined,
          },
        });

        captureAIGeneration({
          distinctId: userId,
          model: 'gpt-4o-mini',
          provider: 'openai',
          inputTokens: aiUsage?.inputTokens || tokensIn,
          outputTokens: aiUsage?.outputTokens || tokensOut,
          latencyMs: Date.now() - startTime,
          traceId: thread.id,
          success: true,
        });
      } catch (error) {
        console.error('[AI Stream] Error processing metadata:', error);
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
};
