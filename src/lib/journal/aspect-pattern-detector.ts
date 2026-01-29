import type { BirthChartData } from '../../../utils/astrology/birthChart';

export type AspectPattern = {
  type: 'natal_grand_trine' | 'natal_t_square' | 'natal_stellium' | 'natal_yod';
  planets: string[];
  signs?: string[];
  houses?: number[];
  element?: string;
  description: string;
  confidence: number;
};

const MAJOR_BODIES = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
];

const ELEMENT_MAP: Record<string, string> = {
  Aries: 'Fire',
  Leo: 'Fire',
  Sagittarius: 'Fire',
  Taurus: 'Earth',
  Virgo: 'Earth',
  Capricorn: 'Earth',
  Gemini: 'Air',
  Libra: 'Air',
  Aquarius: 'Air',
  Cancer: 'Water',
  Scorpio: 'Water',
  Pisces: 'Water',
};

/**
 * Detect stelliums: 3+ planets in the same sign
 */
function detectStelliums(birthChart: BirthChartData[]): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const majorPlacements = birthChart.filter((p) =>
    MAJOR_BODIES.includes(p.body),
  );

  const bySign: Record<string, BirthChartData[]> = {};
  majorPlacements.forEach((p) => {
    if (!bySign[p.sign]) bySign[p.sign] = [];
    bySign[p.sign].push(p);
  });

  Object.entries(bySign).forEach(([sign, placements]) => {
    if (placements.length >= 3) {
      patterns.push({
        type: 'natal_stellium',
        planets: placements.map((p) => p.body),
        signs: [sign],
        houses: placements.map((p) => p.house || 0).filter((h) => h > 0),
        element: ELEMENT_MAP[sign],
        description: `Stellium in ${sign}: ${placements.map((p) => p.body).join(', ')}`,
        confidence: 0.95,
      });
    }
  });

  return patterns;
}

/**
 * Detect all natal aspect patterns (simplified for Phase 2)
 */
export function detectNatalAspectPatterns(
  birthChart: BirthChartData[],
): AspectPattern[] {
  // Phase 2: Start with stelliums only (most common and easiest to detect)
  // Future phases will add: Grand Trines, T-Squares, Yods
  const patterns = detectStelliums(birthChart);
  return patterns;
}
