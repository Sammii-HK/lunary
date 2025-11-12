import { LunaryContext, TransitRecord } from './types';

export type AssistCommand =
  | { type: 'summarise_week' }
  | { type: 'interpret_tarot' }
  | { type: 'explain_energy' }
  | { type: 'none' };

const weekPhrases = ['summarise my week', 'summary of my week', 'recap my week'];
const tarotPhrases = ['interpret my tarot', 'tarot pull', 'what do my cards mean'];
const energyPhrases = ['explain today', 'today’s energy', "today's energy"];

const normalise = (value: string) => value.trim().toLowerCase();

export const detectAssistCommand = (userMessage: string): AssistCommand => {
  const content = normalise(userMessage);

  if (weekPhrases.some((phrase) => content.includes(phrase))) {
    return { type: 'summarise_week' };
  }

  if (tarotPhrases.some((phrase) => content.includes(phrase))) {
    return { type: 'interpret_tarot' };
  }

  if (energyPhrases.some((phrase) => content.includes(phrase))) {
    return { type: 'explain_energy' };
  }

  return { type: 'none' };
};

const summariseWeek = (context: LunaryContext): string => {
  const moods = context.mood?.last7d ?? [];
  if (moods.length === 0) {
    return 'The past week has been gentle yet shifting; notice how your energy has ebbed and flowed each day.';
  }

  const moodTags = moods.map((entry) => entry.tag);
  const uniqueTags = Array.from(new Set(moodTags));

  return `Your week traced ${uniqueTags.join(', ')} threads. Let those textures guide how you honour yourself this weekend.`;
};

const interpretTarot = (context: LunaryContext): string => {
  const cards = context.tarot.lastReading?.cards;
  if (!cards || cards.length === 0) {
    return 'No tarot spread is on record, yet the deck invites you to pull with intention and ask what wants to be revealed.';
  }

  const description = cards
    .map((card) => `${card.name}${card.reversed ? ' (reversed)' : ''}`)
    .join(', ');

  return `Your recent spread whispers through ${description}. Notice which archetype feels closest to your present heart.`;
};

const describeTransit = (transit: TransitRecord): string => {
  const direction = transit.applying ? 'moving towards exact' : 'softening after exact';
  return `${transit.from} ${transit.aspect.toLowerCase()} ${transit.to} is ${direction}, with strength ${transit.strength.toFixed(
    2,
  )}`;
};

const explainEnergy = (context: LunaryContext): string => {
  const moon = context.moon
    ? `${context.moon.phase.toLowerCase()} in ${context.moon.sign}`
    : null;

  const keyTransit = context.currentTransits[0]
    ? describeTransit(context.currentTransits[0])
    : null;

  const parts = [
    moon ? `The Moon is currently ${moon}` : null,
    keyTransit ? `Key transit: ${keyTransit}` : null,
  ].filter(Boolean);

  if (parts.length === 0) {
    return 'Cosmic weather is calm and asks you to listen inward. Let subtle cues lead the way.';
  }

  return parts.join('. ') + '.';
};

export const runAssistCommand = (
  command: AssistCommand,
  context: LunaryContext,
): string | null => {
  switch (command.type) {
    case 'summarise_week':
      return summariseWeek(context);
    case 'interpret_tarot':
      return interpretTarot(context);
    case 'explain_energy':
      return explainEnergy(context);
    default:
      return null;
  }
};
