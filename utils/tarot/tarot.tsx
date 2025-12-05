import { tarotCards } from './tarot-cards';

type TarotSuit = 'cups' | 'swords' | 'wands' | 'pentacles';

const tarotSuits = ['cups', 'swords', 'wands', 'pentacles'];

/**
 * djb2 hash - excellent distribution, cross-browser consistent
 * Bitwise ops work on 32-bit integers consistently across all JS engines
 */
const hashString = (str: string): number => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
};

const sanitizeSeedComponent = (value?: string): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.toLowerCase();
};

const normalizeSeedInput = (seedInput: string): string => {
  const trimmed = seedInput?.trim();
  if (!trimmed) return 'tarot-default';

  // Don't try to parse strings with prefixes like "daily-" or "weekly-"
  // Chrome's Date parser is more lenient and might parse these incorrectly
  if (trimmed.includes('-') && /^[a-z]+-/i.test(trimmed)) {
    return trimmed; // Keep prefix intact
  }

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

const majorArcana = Object.keys(tarotCards.majorArcana).sort();
const getAllCardNames = () => {
  const minorArcana = tarotSuits.flatMap((suit) =>
    Object.keys(
      tarotCards.minorArcana[suit as keyof typeof tarotCards.minorArcana],
    ).sort(),
  );
  return [...majorArcana, ...minorArcana].sort();
};

// Sort to guarantee consistent ordering across all browsers
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
  const hash = hashString(seedValue);
  const number = hash % allCardNames.length;
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
