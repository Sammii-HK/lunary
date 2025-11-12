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
};

export type ComposedReply = {
  message: string;
  assistSnippet?: string | null;
  reflection: string;
  promptSections: ReturnType<typeof buildPromptSections>;
};

export const composeAssistantReply = ({
  context,
  userMessage,
  memorySnippets = [],
}: ComposeReplyParams): ComposedReply => {
  const promptSections = buildPromptSections({
    context,
    memorySnippets,
    userMessage,
  });

  const assistCommand = detectAssistCommand(userMessage);
  const assistSnippet = runAssistCommand(assistCommand, context);
  const reflection = buildReflectionPrompt(context, userMessage);

  const cosmicParagraph = weaveCosmicParagraph(context);

  const responseParts = [cosmicParagraph, assistSnippet, reflection].filter(
    Boolean,
  );

  return {
    message: responseParts.join('\n\n'),
    assistSnippet: assistSnippet ?? null,
    reflection,
    promptSections,
  };
};
