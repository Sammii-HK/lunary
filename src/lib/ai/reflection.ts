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
  // Prefer daily/weekly/personal cards over saved reading
  const dailyCard = context.tarot.daily?.name;
  const weeklyCard = context.tarot.weekly?.name;
  const personalCard = context.tarot.personal?.name;

  const cardNames: string[] = [];
  if (dailyCard && dailyCard.trim()) cardNames.push(dailyCard);
  if (weeklyCard && weeklyCard.trim()) cardNames.push(weeklyCard);
  if (personalCard && personalCard.trim() && cardNames.length < 2) {
    cardNames.push(personalCard);
  }

  // Fallback to saved reading if no daily/weekly/personal cards
  if (cardNames.length === 0) {
    const cards = context.tarot.lastReading?.cards;
    if (cards && Array.isArray(cards) && cards.length > 0) {
      const validCards = cards
        .map((card) => card?.name || card?.cardName)
        .filter((name): name is string => !!name && name.trim().length > 0)
        .slice(0, 2);
      cardNames.push(...validCards);
    }
  }

  // Only return if we have valid card names
  return cardNames.length > 0 ? cardNames.slice(0, 2).join(' & ') : null;
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

  // Build prompt pieces more carefully - only include if we have valid data
  const promptPieces: string[] = [];
  if (moon && moon.trim()) {
    promptPieces.push(`with the ${moon}`);
  }
  if (tarot && tarot.trim() && tarot !== ' & ') {
    promptPieces.push(`alongside ${tarot}`);
  }

  // Only add day if we have at least one cosmic element
  if (promptPieces.length > 0) {
    promptPieces.push(`on this ${today.toLowerCase()}`);
  }

  const promptContext =
    promptPieces.length > 0
      ? `${promptPieces.join(' ')}`
      : `in your own rhythm on this ${today.toLowerCase()}`;

  return `You could journal on how ${promptContext} is inviting you to explore ${theme}.`;
};
