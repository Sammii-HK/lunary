import { tarotCards } from './tarot-cards';
import seed from 'seed-random';

type TarotSuit = 'cups' | 'swords' | 'wands' | 'pentacles';

const tarotSuits = ['cups', 'swords', 'wands', 'pentacles'];
const sanitizeSeedComponent = (value?: string): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.toLowerCase();
};

const normalizeSeedInput = (seedInput: string): string => {
  const trimmed = seedInput?.trim();
  if (!trimmed) return 'tarot-default';

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return trimmed;
};

const buildSeedValue = (
  seedInput: string,
  userName?: string,
  userBirthday?: string,
): string => {
  const parts = [
    normalizeSeedInput(seedInput),
    sanitizeSeedComponent(userName),
    sanitizeSeedComponent(userBirthday),
  ].filter(Boolean) as string[];

  return parts.length > 0 ? parts.join('|') : 'tarot-default';
};

const majorArcana = Object.keys(tarotCards.majorArcana);
const getAllCardNames = () => {
  const minorArcana = tarotSuits.flatMap((suit) =>
    Object.keys(
      tarotCards.minorArcana[suit as keyof typeof tarotCards.minorArcana],
    ),
  );
  return [...majorArcana, ...minorArcana];
};

const allCardNames = getAllCardNames();

type TarotCard = {
  name: string;
  keywords: string[];
  information: string;
};

export const getTarotCard = (
  date: string,
  userName?: string,
  userBirthday?: string,
): TarotCard => {
  const seedValue = buildSeedValue(date, userName, userBirthday);
  const rand = seed(seedValue);
  const number = Math.floor(rand() * allCardNames.length);
  const tarotCard = allCardNames[number];
  const majorArcanaCard =
    tarotCards.majorArcana[tarotCard as keyof typeof tarotCards.majorArcana];
  const cupsCard =
    tarotCards.minorArcana.cups[
      tarotCard as keyof typeof tarotCards.minorArcana.cups
    ];
  const wandsCard =
    tarotCards.minorArcana.wands[
      tarotCard as keyof typeof tarotCards.minorArcana.wands
    ];
  const swordsCard =
    tarotCards.minorArcana.swords[
      tarotCard as keyof typeof tarotCards.minorArcana.swords
    ];
  const pentaclesCard =
    tarotCards.minorArcana.pentacles[
      tarotCard as keyof typeof tarotCards.minorArcana.pentacles
    ];

  return {
    ...(majorArcanaCard as any),
    ...(cupsCard as any),
    ...(wandsCard as any),
    ...(swordsCard as any),
    ...(pentaclesCard as any),
  };
};
