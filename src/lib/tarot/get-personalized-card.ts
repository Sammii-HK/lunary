/**
 * Get Personalized Tarot Card
 *
 * Keeps the Astral Guide's daily card aligned with the dashboard/widget card.
 */

import type { BirthChartPlacement } from '@/context/UserContext';
import { tarotCards } from '../../../utils/tarot/tarot-cards';

type LegacyTarotCard = {
  name: string;
  keywords: string[];
  information: string;
};

type TarotSuit = 'cups' | 'swords' | 'wands' | 'pentacles';

const tarotSuits: TarotSuit[] = ['cups', 'swords', 'wands', 'pentacles'];
const legacyCardNames = [
  ...Object.keys(tarotCards.majorArcana).sort(),
  ...tarotSuits.flatMap((suit) =>
    Object.keys(tarotCards.minorArcana[suit]).sort(),
  ),
].sort();

const SEED_WIDTH = 256;
const SEED_CHUNKS = 6;
const SEED_DIGITS = 52;
const SEED_START_DENOM = Math.pow(SEED_WIDTH, SEED_CHUNKS);
const SEED_SIGNIFICANCE = Math.pow(2, SEED_DIGITS);
const SEED_OVERFLOW = SEED_SIGNIFICANCE * 2;
const SEED_MASK = SEED_WIDTH - 1;

function normalizeDateString(currentDate: string): string {
  return currentDate?.slice(0, 10) || new Date().toISOString().slice(0, 10);
}

function sanitizeSeedComponent(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.toLowerCase() : undefined;
}

function normalizeSeedInput(seedInput: string): string {
  const trimmed = seedInput?.trim();
  if (!trimmed) return 'tarot-default';

  if (trimmed.includes('-') && /^[a-z]+-/i.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime())
    ? trimmed
    : parsed.toISOString().split('T')[0];
}

function buildSeedValue(
  seedInput: string,
  userName?: string,
  userBirthday?: string,
): string {
  const parts = [
    normalizeSeedInput(seedInput),
    sanitizeSeedComponent(userName),
    sanitizeSeedComponent(userBirthday),
  ].filter(Boolean) as string[];

  return parts.length > 0 ? parts.join('|') : 'tarot-default';
}

function seedToKey(seed: string): number[] {
  const key: number[] = [];
  let smear = 0;

  for (let j = 0; j < seed.length; j += 1) {
    key[SEED_MASK & j] =
      SEED_MASK &
      ((smear ^= (key[SEED_MASK & j] || 0) * 19) + seed.charCodeAt(j));
  }

  return key;
}

function seededRandom(seed: string): number {
  const key = seedToKey(seed);
  const s: number[] = [];
  let i = 0;
  let j = 0;

  if (key.length === 0) key.push(0);

  while (i < SEED_WIDTH) s[i] = i++;

  for (i = 0; i < SEED_WIDTH; i += 1) {
    const t = s[i];
    j = SEED_MASK & (j + key[i % key.length] + t);
    s[i] = s[j];
    s[j] = t;
  }

  i = 0;
  j = 0;

  const generate = (count: number) => {
    let r = 0;
    while (count > 0) {
      count -= 1;
      const t = s[(i = SEED_MASK & (i + 1))];
      j = SEED_MASK & (j + t);
      s[i] = s[j];
      s[j] = t;
      r = r * SEED_WIDTH + s[SEED_MASK & (s[i] + s[j])];
    }
    return r;
  };

  generate(SEED_WIDTH);

  let n = generate(SEED_CHUNKS);
  let d = SEED_START_DENOM;
  let x = 0;

  while (n < SEED_SIGNIFICANCE) {
    n = (n + x) * SEED_WIDTH;
    d *= SEED_WIDTH;
    x = generate(1);
  }

  while (n >= SEED_OVERFLOW) {
    n /= 2;
    d /= 2;
    x >>>= 1;
  }

  return (n + x) / d;
}

function getLegacyDailyTarotCard(
  date: string,
  userName?: string,
  userBirthday?: string,
): LegacyTarotCard {
  const seedValue = buildSeedValue(date, userName, userBirthday);
  const tarotCard =
    legacyCardNames[
      Math.floor(seededRandom(seedValue) * legacyCardNames.length)
    ];

  return {
    ...(tarotCards.majorArcana[
      tarotCard as keyof typeof tarotCards.majorArcana
    ] as any),
    ...(tarotCards.minorArcana.cups[
      tarotCard as keyof typeof tarotCards.minorArcana.cups
    ] as any),
    ...(tarotCards.minorArcana.wands[
      tarotCard as keyof typeof tarotCards.minorArcana.wands
    ] as any),
    ...(tarotCards.minorArcana.swords[
      tarotCard as keyof typeof tarotCards.minorArcana.swords
    ] as any),
    ...(tarotCards.minorArcana.pentacles[
      tarotCard as keyof typeof tarotCards.minorArcana.pentacles
    ] as any),
  };
}

/**
 * Get personalized daily tarot card
 *
 * The dashboard, widget sync, cron, and Astral Guide must use the same seed.
 * Birth-chart and moon arguments stay in the signature for existing callers,
 * but today's actual user-facing card is keyed by local date + profile.
 */
export function getPersonalizedTarotCard(
  currentDate: string,
  _birthChart: BirthChartPlacement[] | undefined,
  _moonSign: string | undefined,
  _moonPhase: string | undefined,
  _moonIllumination: number,
  userName?: string,
  userBirthday?: string,
): LegacyTarotCard | any {
  const dateStr = normalizeDateString(currentDate);
  return getLegacyDailyTarotCard(`daily-${dateStr}`, userName, userBirthday);
}
