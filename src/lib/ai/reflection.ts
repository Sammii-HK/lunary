import dayjs from 'dayjs';

import { LunaryContext } from './types';

const fallbackThemes = [
  'the emotional tone the Moon brings you today',
  'the way today’s tarot archetypes mirror your current feelings',
  'how recent planetary shifts have influenced your boundaries',
  'the balance between rest and momentum under this lunar phase',
  'what your heart needs to feel nourished this evening',
];

const pickTheme = (seed: number) =>
  fallbackThemes[seed % fallbackThemes.length];

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const describeMoon = (context: LunaryContext): string | null => {
  if (!context.moon) return null;
  return `${context.moon.phase.toLowerCase()} in ${context.moon.sign}`;
};

const describeTarot = (context: LunaryContext): string | null => {
  const cards = context.tarot.lastReading?.cards;
  if (!cards || cards.length === 0) return null;
  return cards
    .slice(0, 2)
    .map((card) => card.name)
    .join(' & ');
};

export const buildReflectionPrompt = (
  context: LunaryContext,
  userMessage: string,
): string => {
  const today = dayjs().format('dddd');
  const moon = describeMoon(context);
  const tarot = describeTarot(context);
  const seed = hashString(
    `${context.user.id}:${moon ?? ''}:${tarot ?? ''}:${userMessage}`,
  );

  const theme = pickTheme(seed);
  const promptPieces = [
    moon ? `with the ${moon}` : null,
    tarot ? `alongside ${tarot}` : null,
    `on this ${today.toLowerCase()}`,
  ].filter(Boolean);

  const promptContext =
    promptPieces.length > 0
      ? `${promptPieces.join(' ')}`
      : 'in your own rhythm today';

  return `You could journal on how ${promptContext} is inviting you to explore ${theme}.`;
};
