import { detectAssistCommand, runAssistCommand } from './assist';
import { buildReflectionPrompt } from './reflection';
import { buildPromptSections } from './prompt';
import { LunaryContext } from './types';

const describeMoon = (context: LunaryContext): string | null => {
  if (!context.moon) return null;
  return `The Moon drifts through ${context.moon.sign} in a ${context.moon.phase.toLowerCase()} glow`;
};

const describeTarot = (context: LunaryContext): string | null => {
  const reading = context.tarot.lastReading;
  if (!reading || reading.cards.length === 0) return null;
  const cards = reading.cards.map((card) => card.name).join(', ');
  return `Your latest spread (${reading.spread}) is singing through ${cards}`;
};

const describeTransits = (context: LunaryContext): string | null => {
  if (context.currentTransits.length === 0) return null;
  const { from, aspect, to } = context.currentTransits[0];
  return `${from} ${aspect.toLowerCase()} ${to} is colouring today’s atmosphere`;
};

const weaveCosmicParagraph = (context: LunaryContext): string => {
  const pieces = [
    describeMoon(context),
    describeTarot(context),
    describeTransits(context),
  ].filter(Boolean);

  if (pieces.length === 0) {
    return "Let's move gently with today’s sky; it’s a soft invitation to listen inward.";
  }

  return `${pieces.join('. ')}. Breathe into what that awakens for you.`;
};

type ComposeReplyParams = {
  context: LunaryContext;
  userMessage: string;
  memorySnippets?: string[];
  threadId?: string | null;
  promptSectionsOverride?: ReturnType<typeof buildPromptSections>;
};

export type ComposedReply = {
  message: string;
  assistSnippet?: string | null;
  reflection: string;
  promptSections: ReturnType<typeof buildPromptSections>;
};

export const composeAssistantReply = async ({
  context,
  userMessage,
  memorySnippets = [],
  threadId,
  promptSectionsOverride,
}: ComposeReplyParams): Promise<ComposedReply> => {
  const promptSections =
    promptSectionsOverride ||
    buildPromptSections({
      context,
      memorySnippets,
      userMessage,
    });

  const assistCommand = detectAssistCommand(userMessage);
  const assistSnippet = runAssistCommand(assistCommand, context);
  const reflection = buildReflectionPrompt(context, userMessage);

  // Don't include generic cosmic paragraph - let AI generate personalized response
  const cosmicParagraph = null;

  // Call AI for personalized response
  try {
    const { generateText } = await import('ai');
    const { getDeepInfraModel } = await import('@/lib/ai/content-generator');

    const chatMessages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }> = [
      {
        role: 'system',
        content: promptSections.system,
      },
    ];

    if (promptSections.memory) {
      chatMessages.push({
        role: 'system',
        content: promptSections.memory,
      });
    }

    chatMessages.push({
      role: 'system',
      content: promptSections.context,
    });

    // Don't include conversation history to avoid repetition - each response should be fresh
    // The current user message is enough context

    chatMessages.push({
      role: 'user',
      content: userMessage,
    });

    // Include recent conversation history from thread for personalized context
    if (threadId) {
      try {
        const { loadThreadFromDatabase } = await import('./threads');
        const thread = await loadThreadFromDatabase(threadId);
        if (thread && thread.messages.length > 0) {
          // Get last 3 exchanges (6 messages: 3 user + 3 assistant)
          // Clean assistant messages to remove any reflection prompts that might have been appended
          const recentMessages = thread.messages
            .slice(-6)
            .map((msg) => {
              let content = msg.content;
              // Clean reflection prompts from assistant messages in history
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

          if (recentMessages.length > 0) {
            // Insert history before the current user message
            chatMessages.splice(
              chatMessages.length - 1,
              0,
              ...(recentMessages as Array<{
                role: 'user' | 'assistant';
                content: string;
              }>),
            );
          }
        }
      } catch (error) {
        console.error('[AI Responder] Failed to load thread history:', error);
        // Continue without history if loading fails
      }
    }

    // Determine max_tokens based on content type
    const lowerMessage = userMessage.toLowerCase();
    const isWeeklyOverview =
      lowerMessage.includes('weekly overview') ||
      lowerMessage.includes('summarise my week');
    const isRitualRequest =
      lowerMessage.includes('ritual') &&
      (lowerMessage.includes('moon') || lowerMessage.includes('tonight'));
    const isJournalEntry =
      lowerMessage.includes('journal entry') ||
      lowerMessage.includes('format as journal');
    const isSpreadInterpretation =
      lowerMessage.includes('interpret my spread') ||
      lowerMessage.includes('latest spread') ||
      lowerMessage.includes('spread interpretation') ||
      lowerMessage.includes('interpretation of my latest tarot');
    const isTarotPatterns =
      lowerMessage.includes('tarot patterns') ||
      lowerMessage.includes('daily tarot pulls') ||
      lowerMessage.includes('patterns in my');

    let maxTokens = 400; // Default for quick questions
    if (isWeeklyOverview) {
      maxTokens = 1200; // Longer for comprehensive weekly overviews
    } else if (isSpreadInterpretation) {
      maxTokens = 250; // Short and focused for spread interpretations
    } else if (isTarotPatterns) {
      maxTokens = 200; // Brief pattern analysis
    } else if (isRitualRequest || isJournalEntry) {
      maxTokens = 500; // Medium length for rituals and journal entries
    }

    // Separate system messages from conversation messages for AI SDK
    const systemParts = chatMessages
      .filter((m) => m.role === 'system')
      .map((m) => m.content);
    const conversationMessages = chatMessages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const result = await generateText({
      model: getDeepInfraModel(),
      system: systemParts.join('\n\n'),
      messages: conversationMessages,
      maxOutputTokens: maxTokens,
      temperature: 0.9,
    });

    const aiResponse = result.text || '';

    if (!aiResponse || aiResponse.trim().length === 0) {
      throw new Error(
        'AI service returned an empty response. Please try again later.',
      );
    }

    // Clean up AI response - the AI should never include journal/reflection prompts
    // but we clean them just in case (they're sent separately as a different event)
    // This is a safety net - the system prompt should prevent this
    const cleanedResponse = aiResponse.replace(/\n\n+/g, '\n\n').trim();

    // Only include AI response - assistSnippet and reflection are returned separately
    // Don't include them in message content to avoid duplication
    return {
      message: cleanedResponse,
      assistSnippet: assistSnippet ?? null,
      reflection,
      promptSections,
    };
  } catch (error) {
    console.error('[AI Responder] AI generation error:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'AI service is temporarily unavailable. Please try again later.';
    throw new Error(errorMessage);
  }
};
