import type { GlobalCosmicData } from '@/lib/cosmic-snapshot/global-cache';

export interface CosmicScoreCategories {
  communication: number;
  creativity: number;
  love: number;
  career: number;
  rest: number;
}

export interface CosmicScoreResult {
  overall: number;
  categories: CosmicScoreCategories;
  bestWindowDescription: string;
  dominantEnergy: string;
  headline: string;
}

type BirthChart = Array<{
  body: string;
  sign: string;
  degree?: number;
  house?: number;
}>;

const SIGNS = [
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
] as const;

const SIGN_INDEX: Record<string, number> = {};
SIGNS.forEach((s, i) => {
  SIGN_INDEX[s] = i;
});

/** Simple seeded hash for deterministic variety per date */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function signDistance(a: string, b: string): number {
  const ia = SIGN_INDEX[a];
  const ib = SIGN_INDEX[b];
  if (ia === undefined || ib === undefined) return -1;
  const d = (ib - ia + 12) % 12;
  return d;
}

/** Returns a harmony value based on the angular relationship between two signs. */
function signAspectHarmony(signA: string, signB: string): number {
  const d = signDistance(signA, signB);
  if (d === -1) return 0;
  // conjunction (0) = +3, sextile (2) = +2, trine (4) = +4, square (3) = -2, opposition (6) = -1
  const harmonies: Record<number, number> = {
    0: 3,
    1: 0,
    2: 2,
    3: -2,
    4: 4,
    5: -1,
    6: -1,
    7: -1,
    8: 4,
    9: -2,
    10: 2,
    11: 0,
  };
  return harmonies[d] ?? 0;
}

/** Category weights per planet transit */
const PLANET_CATEGORY_WEIGHTS: Record<
  string,
  Partial<Record<keyof CosmicScoreCategories, number>>
> = {
  Mercury: { communication: 3, creativity: 1, career: 1 },
  Venus: { love: 3, creativity: 2, rest: 1 },
  Mars: { career: 3, creativity: 1 },
  Jupiter: { career: 2, creativity: 2, love: 1 },
  Saturn: { career: 2, rest: -1 },
  Moon: { rest: 2, love: 2, creativity: 1 },
  Sun: { career: 2, creativity: 2 },
  Uranus: { creativity: 2, communication: 1 },
  Neptune: { rest: 2, creativity: 2 },
  Pluto: { career: 1 },
};

const MOON_PHASE_MODIFIERS: Record<string, Partial<CosmicScoreCategories>> = {
  'New Moon': { rest: 3, creativity: 1 },
  'Waxing Crescent': { creativity: 2, career: 1 },
  'First Quarter': { career: 3, communication: 1 },
  'Waxing Gibbous': { career: 2, creativity: 2 },
  'Full Moon': { love: 3, creativity: 2 },
  'Waning Gibbous': { rest: 2, communication: 1 },
  'Last Quarter': { rest: 3 },
  'Waning Crescent': { rest: 4, love: 1 },
};

const RETROGRADE_PENALTY: Record<string, Partial<CosmicScoreCategories>> = {
  Mercury: { communication: -3, career: -1 },
  Venus: { love: -2, creativity: -1 },
  Mars: { career: -2 },
  Jupiter: { career: -1 },
  Saturn: { career: -1 },
};

const BEST_WINDOW_MAP: Record<keyof CosmicScoreCategories, string> = {
  communication: 'conversations and sharing ideas',
  creativity: 'creative expression and artistic work',
  love: 'nurturing relationships and connection',
  career: 'tackling ambitious goals and professional work',
  rest: 'self-care, meditation, and recharging',
};

const ENERGY_LABELS: Record<keyof CosmicScoreCategories, string> = {
  communication: 'Communicative',
  creativity: 'Creative',
  love: 'Heart-centered',
  career: 'Ambitious',
  rest: 'Restorative',
};

function getHeadline(
  overall: number,
  dominant: keyof CosmicScoreCategories,
  dateHash: number,
): string {
  const headlines: Record<keyof CosmicScoreCategories, string[]> = {
    communication: [
      'Your words carry extra weight today',
      'Clear channels open for dialogue',
      'Speak your truth with cosmic backing',
    ],
    creativity: [
      'Inspiration flows freely today',
      'The muse is on your side',
      'Your creative vision sharpens',
    ],
    love: [
      'Heart connections deepen today',
      'Love energy surrounds you',
      'The cosmos favors tenderness',
    ],
    career: [
      'Momentum builds in your favor',
      'Ambition meets opportunity today',
      'The stars support bold moves',
    ],
    rest: [
      'Honor the call to slow down',
      'Stillness holds quiet power today',
      'Rest is productive today',
    ],
  };

  if (overall >= 80) {
    return 'A powerfully aligned day awaits';
  }
  if (overall <= 25) {
    return 'Gentle energy — take it slow today';
  }

  const options = headlines[dominant];
  return options[dateHash % options.length];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate a daily cosmic score based on global cosmic data and a user's birth chart.
 * Deterministic for the same date + birth chart combination.
 */
export function calculateCosmicScore(
  globalCosmicData: GlobalCosmicData,
  birthChart: BirthChart,
  date: Date,
): CosmicScoreResult {
  const dateStr = date.toISOString().split('T')[0];

  // Build natal map: body -> sign
  const natal: Record<string, string> = {};
  for (const placement of birthChart) {
    if (placement.body && placement.sign) {
      natal[placement.body] = placement.sign;
    }
  }

  const categories: CosmicScoreCategories = {
    communication: 10,
    creativity: 10,
    love: 10,
    career: 10,
    rest: 10,
  };

  // 1. Personal transit aspects: compare current positions to natal positions
  if (globalCosmicData.planetaryPositions) {
    for (const [planet, pos] of Object.entries(
      globalCosmicData.planetaryPositions,
    )) {
      const natalSign = natal[planet];
      if (!natalSign) continue;

      const harmony = signAspectHarmony(natalSign, pos.sign);
      const weights = PLANET_CATEGORY_WEIGHTS[planet] ?? {};

      for (const [cat, weight] of Object.entries(weights)) {
        const key = cat as keyof CosmicScoreCategories;
        // harmony ranges from -2 to +4, weight from -1 to +3
        categories[key] += Math.round(harmony * (weight / 3));
      }

      // Cross-planet aspects: check transiting planet vs natal Sun/Moon/Ascendant
      const keyBodies = ['Sun', 'Moon', 'Ascendant'];
      for (const body of keyBodies) {
        if (body === planet) continue;
        const natalBodySign = natal[body];
        if (!natalBodySign) continue;

        const crossHarmony = signAspectHarmony(natalBodySign, pos.sign);
        if (crossHarmony !== 0) {
          for (const [cat, weight] of Object.entries(weights)) {
            const key = cat as keyof CosmicScoreCategories;
            categories[key] += Math.round((crossHarmony * weight) / 6);
          }
        }
      }
    }
  }

  // 2. Moon phase affinity
  const moonPhaseName = globalCosmicData.moonPhase?.name ?? '';
  const phaseModifiers = MOON_PHASE_MODIFIERS[moonPhaseName];
  if (phaseModifiers) {
    for (const [cat, mod] of Object.entries(phaseModifiers)) {
      categories[cat as keyof CosmicScoreCategories] += mod;
    }
  }

  // 3. Retrograde effects
  if (globalCosmicData.planetaryPositions) {
    for (const [planet, pos] of Object.entries(
      globalCosmicData.planetaryPositions,
    )) {
      if (pos.retrograde) {
        const penalty = RETROGRADE_PENALTY[planet];
        if (penalty) {
          for (const [cat, mod] of Object.entries(penalty)) {
            categories[cat as keyof CosmicScoreCategories] += mod;
          }
        }
      }
    }
  }

  // 4. Add deterministic date-based variety (±2 per category)
  const dateHash = simpleHash(dateStr + JSON.stringify(natal));
  const catKeys = Object.keys(categories) as (keyof CosmicScoreCategories)[];
  for (let i = 0; i < catKeys.length; i++) {
    const variety =
      (simpleHash(`${dateStr}-${catKeys[i]}-${natal.Sun ?? ''}`) % 5) - 2;
    categories[catKeys[i]] += variety;
  }

  // 5. Clamp each category to 0-20
  for (const key of catKeys) {
    categories[key] = clamp(Math.round(categories[key]), 0, 20);
  }

  // 6. Overall score (sum of categories, 0-100)
  const overall = clamp(
    catKeys.reduce((sum, k) => sum + categories[k], 0),
    1,
    100,
  );

  // 7. Dominant energy = highest category
  let dominantKey: keyof CosmicScoreCategories = 'creativity';
  let dominantValue = -1;
  for (const key of catKeys) {
    if (categories[key] > dominantValue) {
      dominantValue = categories[key];
      dominantKey = key;
    }
  }

  const dominantEnergy = ENERGY_LABELS[dominantKey];
  const bestWindowDescription = BEST_WINDOW_MAP[dominantKey];
  const headline = getHeadline(overall, dominantKey, dateHash);

  return {
    overall,
    categories,
    bestWindowDescription,
    dominantEnergy,
    headline,
  };
}
