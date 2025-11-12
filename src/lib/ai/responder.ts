import { LunaryContext } from './types';

const PROMPT_TEMPLATE = [
  "I'm here with you beneath tonight's sky.",
  'Your cosmic context is wrapped around this moment.',
  'This is a placeholder response until the model integration is ready.',
];

const summariseContext = (context: LunaryContext): string => {
  const moon = context.moon
    ? `The Moon is in ${context.moon.sign} (${context.moon.phase}).`
    : 'Moon data is not yet available.';
  const tarot = context.tarot.lastReading
    ? `Your latest spread (${context.tarot.lastReading.spread}) includes ${context.tarot.lastReading.cards
        .map((card) => card.name)
        .join(', ')}.`
    : 'No tarot reading on record yet.';
  return `${moon} ${tarot}`;
};

export const generateStubbedReply = (
  context: LunaryContext,
  userMessage: string,
): string => {
  const summary = summariseContext(context);
  const promptLines = PROMPT_TEMPLATE.join(' ');
  return `${promptLines} ${summary} You asked: "${userMessage}". We'll soon weave a bespoke reply using the full model.`;
};
