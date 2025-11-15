import { detectAssistCommand, runAssistCommand } from './assist';
import { buildReflectionPrompt } from './reflection';
import { buildPromptSections, SYSTEM_PROMPT } from './prompt';
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
}: ComposeReplyParams): Promise<ComposedReply> => {
  const promptSections = buildPromptSections({
    context,
    memorySnippets,
    userMessage,
  });

  const assistCommand = detectAssistCommand(userMessage);
  const assistSnippet = runAssistCommand(assistCommand, context);
  const reflection = buildReflectionPrompt(context, userMessage);

  // Don't include generic cosmic paragraph - let AI generate personalized response
  const cosmicParagraph = null;

  // Check if OpenAI is configured
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'AI service is temporarily unavailable. Please try again later.',
    );
  }

  // Call OpenAI for personalized response
  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey });

    const messages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }> = [
      {
        role: 'system',
        content: promptSections.system,
      },
    ];

    if (promptSections.memory) {
      messages.push({
        role: 'system',
        content: promptSections.memory,
      });
    }

    messages.push({
      role: 'system',
      content: promptSections.context,
    });

    // Don't include conversation history to avoid repetition - each response should be fresh
    // The current user message is enough context

    messages.push({
      role: 'user',
      content: userMessage,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 250, // Reduced for shorter, more concise responses
      temperature: 0.9,
    });

    const aiResponse = completion.choices[0]?.message?.content || '';

    if (!aiResponse || aiResponse.trim().length === 0) {
      throw new Error(
        'AI service returned an empty response. Please try again later.',
      );
    }

    // Clean up AI response - remove any journal prompts it might have added
    const cleanedResponse = aiResponse
      .replace(/You could journal on.*?\./gi, '')
      .replace(/\n\n+/g, '\n\n')
      .trim();

    // Only include AI response and assist/reflection - no generic cosmic paragraph
    // Only add reflection if it's meaningful (has moon or tarot context)
    const responseParts = [
      cleanedResponse,
      assistSnippet,
      reflection &&
      (context.moon || context.tarot.daily || context.tarot.lastReading)
        ? reflection
        : null,
    ].filter(Boolean);

    return {
      message: responseParts.join('\n\n'),
      assistSnippet: assistSnippet ?? null,
      reflection,
      promptSections,
    };
  } catch (error) {
    console.error('[AI Responder] OpenAI error:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'AI service is temporarily unavailable. Please try again later.';
    throw new Error(errorMessage);
  }
};
