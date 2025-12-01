import { BirthChartSnapshot, BirthChartPlacement } from './types';

const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

function getSignIndex(sign: string): number {
  const normalised = sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
  const index = ZODIAC_SIGNS.indexOf(normalised);
  return index >= 0 ? index : 0;
}

export type TransitHousePosition = {
  planet: string;
  sign: string;
  natalHouse: number;
  meaning: string;
};

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'self, identity, appearance',
  2: 'money, values, possessions',
  3: 'communication, siblings, short trips',
  4: 'home, family, roots',
  5: 'creativity, romance, children',
  6: 'health, daily work, routines',
  7: 'partnerships, relationships, contracts',
  8: 'transformation, shared resources, intimacy',
  9: 'philosophy, higher learning, travel',
  10: 'career, reputation, public life',
  11: 'friends, groups, hopes',
  12: 'spirituality, hidden matters, solitude',
};

export function calculateTransitHouses(
  birthChart: BirthChartSnapshot | null,
  planetaryPositions: Record<string, { sign: string; degree?: number }>,
): TransitHousePosition[] {
  if (!birthChart || !birthChart.placements) {
    return [];
  }

  const ascendant = birthChart.placements.find(
    (p) =>
      p.planet === 'Ascendant' || p.planet === 'Rising' || p.planet === 'ASC',
  );

  if (!ascendant || !ascendant.sign) {
    return [];
  }

  const ascendantSignIndex = getSignIndex(ascendant.sign);

  const transitHouses: TransitHousePosition[] = [];

  const relevantPlanets = [
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
  ];

  for (const planet of relevantPlanets) {
    const position = planetaryPositions[planet];
    if (!position || !position.sign) continue;

    const transitSignIndex = getSignIndex(position.sign);
    let houseNumber = ((transitSignIndex - ascendantSignIndex + 12) % 12) + 1;

    transitHouses.push({
      planet,
      sign: position.sign,
      natalHouse: houseNumber,
      meaning: HOUSE_MEANINGS[houseNumber] || '',
    });
  }

  return transitHouses;
}

export function formatTransitHousesForPrompt(
  transitHouses: TransitHousePosition[],
): string {
  if (transitHouses.length === 0) {
    return '';
  }

  const formatted = transitHouses
    .map(
      (t) =>
        `${t.planet} in ${t.sign} (transiting H${t.natalHouse}: ${t.meaning})`,
    )
    .join(', ');

  return `TRANSIT HOUSES: ${formatted}`;
}
