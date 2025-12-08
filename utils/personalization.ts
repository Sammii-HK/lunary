import seed from 'seed-random';
import dayjs from 'dayjs';
import { zodiacSigns } from './zodiac/zodiac';
import { runesList } from '@/constants/runes';
import type { BirthChartData } from './astrology/birthChart';

export type UserProfileForPersonalization = {
  name?: string;
  birthday?: string; // ISO YYYY-MM-DD
  birthChart?: BirthChartData[] | null;
};

function buildStableUserSeed(user: UserProfileForPersonalization): string {
  const safeName = (user.name || 'seeker').trim().toLowerCase();
  const safeBirthday = (user.birthday || '1970-01-01').trim();
  // Add a couple of stable placements if available to increase uniqueness
  let placements = '';
  if (user.birthChart && user.birthChart.length > 0) {
    const sun = user.birthChart.find((p) => p.body === 'Sun');
    const moon = user.birthChart.find((p) => p.body === 'Moon');
    placements = `${sun?.sign || ''}-${moon?.sign || ''}`;
  }
  return `${safeName}::${safeBirthday}::${placements}`;
}

function createScopedRng(
  user: UserProfileForPersonalization,
  scope: string,
): () => number {
  const base = buildStableUserSeed(user);
  const rng = seed(`${base}::${scope}`);
  return () => rng();
}

export function calculateLifePathNumber(dateIso?: string): number {
  if (!dateIso) return 7; // fallback
  const digits = dateIso
    .replace(/-/g, '')
    .split('')
    .map((d) => parseInt(d, 10));
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && ![11, 22, 33].includes(sum)) {
    sum = sum
      .toString()
      .split('')
      .map((d) => parseInt(d, 10))
      .reduce((a, b) => a + b, 0);
  }
  return sum;
}

// Alias for internal use
const reduceToLifePathNumber = calculateLifePathNumber;

function personalDayNumber(
  birthdayIso?: string,
  date: Date = new Date(),
): number {
  if (!birthdayIso) return 5;
  const birth = dayjs(birthdayIso);
  const current = dayjs(date);
  let sum =
    birth.month() +
    1 +
    birth.date() +
    current.year() +
    (current.month() + 1) +
    current.date();
  while (sum > 9 && ![11, 22, 33].includes(sum)) {
    sum = sum
      .toString()
      .split('')
      .map((d) => parseInt(d, 10))
      .reduce((a, b) => a + b, 0);
  }
  return sum;
}

export function getLuckyNumbers(
  user: UserProfileForPersonalization,
  date: Date = new Date(),
  howMany: number = 3,
): number[] {
  const rng = createScopedRng(
    user,
    `lucky-numbers::${dayjs(date).format('YYYY-MM-DD')}`,
  );
  const baseA = reduceToLifePathNumber(user.birthday);
  const baseB = personalDayNumber(user.birthday, date);
  const picks = new Set<number>([
    normalizeNumber(baseA),
    normalizeNumber(baseB),
  ]);
  while (picks.size < howMany) {
    const n = normalizeNumber(Math.floor(rng() * 99) + 1);
    picks.add(n);
  }
  return Array.from(picks).slice(0, howMany);
}

function normalizeNumber(n: number): number {
  if (n <= 0) return 1;
  if (n > 99) return ((n - 1) % 99) + 1;
  return n;
}

const elementBySign: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> =
  Object.keys(zodiacSigns).reduce(
    (acc, key) => {
      const sign = (zodiacSigns as any)[key];
      acc[sign.name] = sign.element;
      return acc;
    },
    {} as Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'>,
  );

export function getLuckyElement(
  user: UserProfileForPersonalization,
): 'Fire' | 'Earth' | 'Air' | 'Water' {
  // Prefer natal Sun element; fall back to zodiac sign from birthday if not in chart
  let sunSign: string | undefined;
  if (user.birthChart && user.birthChart.length > 0) {
    sunSign = user.birthChart.find((p) => p.body === 'Sun')?.sign;
  }
  // If not found, best-effort estimation: we cannot compute sign from birthday here; leave to caller
  const element = sunSign ? elementBySign[sunSign] : 'Air';
  return element || 'Air';
}

const colorsByElement: Record<'Fire' | 'Earth' | 'Air' | 'Water', string[]> = {
  Fire: ['Gold', 'Scarlet', 'Orange', 'Sunset Yellow'],
  Earth: ['Forest Green', 'Brown', 'Olive', 'Moss'],
  Air: ['Sky Blue', 'White', 'Pale Yellow', 'Silver'],
  Water: ['Teal', 'Indigo', 'Sea Green', 'Pearl'],
};

const weekdayColors = [
  'Gold',
  'Silver',
  'Red',
  'Yellow',
  'Purple',
  'Green',
  'Indigo',
];

export function getLuckyColors(
  user: UserProfileForPersonalization,
  date: Date = new Date(),
  howMany: number = 2,
): string[] {
  const element = getLuckyElement(user);
  const pool = new Set<string>([
    weekdayColors[dayjs(date).day()],
    ...colorsByElement[element],
  ]);
  const rng = createScopedRng(
    user,
    `lucky-colors::${dayjs(date).format('YYYY-MM-DD')}`,
  );
  const poolArr = Array.from(pool);
  const picks: string[] = [];
  while (picks.length < Math.min(howMany, poolArr.length)) {
    const idx = Math.floor(rng() * poolArr.length);
    const candidate = poolArr[idx];
    if (!picks.includes(candidate)) picks.push(candidate);
  }
  return picks;
}

export function getDailyRune(
  user: UserProfileForPersonalization,
  date: Date = new Date(),
): { key: string; name: string } {
  const rng = createScopedRng(
    user,
    `rune::${dayjs(date).format('YYYY-MM-DD')}`,
  );
  const entries = Object.entries(runesList);
  const idx = Math.floor(rng() * entries.length);
  const [key, value] = entries[idx];
  return { key, name: value.name };
}

export function buildUserPersonalization(
  user: UserProfileForPersonalization,
  date: Date = new Date(),
) {
  return {
    numbers: getLuckyNumbers(user, date, 4),
    colors: getLuckyColors(user, date, 2),
    element: getLuckyElement(user),
    rune: getDailyRune(user, date),
  };
}
