import { BirthChartData } from '../astrology/birthChart';

// Lightweight personalized crystal index (~11KB) with all 109 crystals
import crystalIndex from '@/data/crystal-personalized.json';

type CrystalEntry = {
  n: string; // name
  s: string; // sunSigns (encoded)
  m: string; // moonSigns (encoded)
  a: string; // aspects (planet codes)
  p: string; // properties (encoded)
  c: string; // chakra (encoded)
  i: string; // intention snippet
};

const index = crystalIndex as CrystalEntry[];

// Decode mappings
const zodiacDecode: Record<string, string> = {
  AR: 'Aries',
  TA: 'Taurus',
  GE: 'Gemini',
  CA: 'Cancer',
  LE: 'Leo',
  VI: 'Virgo',
  LI: 'Libra',
  SC: 'Scorpio',
  SA: 'Sagittarius',
  CP: 'Capricorn',
  AQ: 'Aquarius',
  PI: 'Pisces',
  '*': 'All Signs',
};

const chakraDecode: Record<string, string> = {
  RT: 'Root',
  SC: 'Sacral',
  SP: 'Solar Plexus',
  HT: 'Heart',
  TH: 'Throat',
  TE: 'Third Eye',
  CR: 'Crown',
  '*': 'All Chakras',
};

const propDecode: Record<string, string> = {
  INT: 'intuition',
  SPG: 'spiritual growth',
  LOV: 'love',
  EMH: 'emotional healing',
  PRO: 'protection',
  GRD: 'grounding',
  CLR: 'clarity',
  ABD: 'abundance',
  MAN: 'manifestation',
  TRN: 'transformation',
  CRG: 'courage',
  CRE: 'creativity',
  WIS: 'wisdom',
  HEA: 'healing',
  COM: 'communication',
  PEA: 'peace',
  BAL: 'balance',
  ENG: 'energy',
  VIT: 'vitality',
  STR: 'strength',
  CAL: 'calming',
  FOC: 'focus',
  LCK: 'luck',
  TRU: 'truth',
  PAS: 'passion',
  CNF: 'confidence',
  PSP: 'prosperity',
  MAG: 'magic',
  AMP: 'amplification',
  HAR: 'harmony',
  GRO: 'growth',
  FEM: 'feminine energy',
};

const decodeList = (codes: string, map: Record<string, string>): string[] =>
  codes ? codes.split(',').map((c) => map[c] || c) : [];

// Export Crystal type for compatibility
export type Crystal = {
  name: string;
  properties: string[];
  sunSigns: string[];
  moonSigns: string[];
  aspects: string[];
  chakra: string;
  intention: string;
  description: string;
  element: string;
  color: string[];
};

// Convert index entry to full Crystal object
const toFullCrystal = (entry: CrystalEntry): Crystal => ({
  name: entry.n,
  properties: decodeList(entry.p, propDecode),
  sunSigns: decodeList(entry.s, zodiacDecode),
  moonSigns: decodeList(entry.m, zodiacDecode),
  aspects: entry.a.split(',').filter(Boolean),
  chakra: chakraDecode[entry.c] || 'Crown',
  intention: entry.i,
  description: `${entry.n} supports ${decodeList(entry.p, propDecode).join(' and ')}`,
  element: 'Mixed', // Simplified
  color: [],
});

// Export crystalDatabase for backwards compatibility (all 109 crystals!)
export const crystalDatabase: Crystal[] = index.map(toFullCrystal);

// Get daily influences based on today's date
export const getDailyInfluences = (
  today: Date,
  userBirthday?: string,
): {
  dayEnergy: string;
  weekEnergy: string;
  monthEnergy: string;
  birthdayBoost: boolean;
} => {
  const dayOfWeek = today.getDay();
  const dayOfMonth = today.getDate();
  const month = today.getMonth();

  const dayEnergies = [
    'intuition',
    'action',
    'communication',
    'expansion',
    'discipline',
    'harmony',
    'reflection',
  ];
  const weekEnergies = ['grounding', 'creativity', 'growth', 'transformation'];
  const monthEnergies = [
    'new beginnings',
    'building',
    'expression',
    'nurturing',
    'leadership',
    'refinement',
    'partnership',
    'intensity',
    'exploration',
    'achievement',
    'innovation',
    'transcendence',
  ];

  let birthdayBoost = false;
  if (userBirthday) {
    const birthday = new Date(userBirthday);
    birthdayBoost =
      birthday.getMonth() === month && birthday.getDate() === dayOfMonth;
  }

  return {
    dayEnergy: dayEnergies[dayOfWeek],
    weekEnergy: weekEnergies[Math.floor(dayOfMonth / 7) % 4],
    monthEnergy: monthEnergies[month],
    birthdayBoost,
  };
};

interface Aspect {
  type: string;
  transitPlanet: string;
  natalPlanet: string;
  orb: number;
}

export const calculateKeyAspects = (
  birthChart: BirthChartData[],
  currentTransits: any[],
): Aspect[] => {
  const aspects: Aspect[] = [];

  for (const transit of currentTransits) {
    for (const natal of birthChart) {
      const transitLong = transit.eclipticLongitude ?? 0;
      const natalLong = natal.eclipticLongitude ?? 0;
      const diff = Math.abs(transitLong - natalLong);

      if (diff <= 10 || Math.abs(diff - 360) <= 10) {
        aspects.push({
          type: 'conjunction',
          transitPlanet: transit.body,
          natalPlanet: natal.body,
          orb: Math.min(diff, Math.abs(diff - 360)),
        });
      } else if (Math.abs(diff - 180) <= 8) {
        aspects.push({
          type: 'opposition',
          transitPlanet: transit.body,
          natalPlanet: natal.body,
          orb: Math.abs(diff - 180),
        });
      } else if (Math.abs(diff - 120) <= 8) {
        aspects.push({
          type: 'trine',
          transitPlanet: transit.body,
          natalPlanet: natal.body,
          orb: Math.abs(diff - 120),
        });
      } else if (Math.abs(diff - 90) <= 8) {
        aspects.push({
          type: 'square',
          transitPlanet: transit.body,
          natalPlanet: natal.body,
          orb: Math.abs(diff - 90),
        });
      }
    }
  }

  return aspects.sort((a, b) => a.orb - b.orb);
};

export const calculateCrystalRecommendation = (
  birthChart: BirthChartData[],
  currentTransits: any[],
  today: Date,
  userBirthday?: string,
): { crystal: Crystal; reasons: string[] } => {
  const scores: Record<string, { score: number; reasons: string[] }> = {};

  crystalDatabase.forEach((crystal) => {
    scores[crystal.name] = { score: 0, reasons: [] };
  });

  const dailyInfluences = getDailyInfluences(today, userBirthday);

  const sunSign = birthChart.find((p) => p.body === 'Sun')?.sign || 'Aries';
  const moonSign = birthChart.find((p) => p.body === 'Moon')?.sign || 'Aries';

  const transitSun = currentTransits.find((p) => p.body === 'Sun');
  const transitMoon = currentTransits.find((p) => p.body === 'Moon');
  const transitMercury = currentTransits.find((p) => p.body === 'Mercury');
  const transitVenus = currentTransits.find((p) => p.body === 'Venus');
  const transitMars = currentTransits.find((p) => p.body === 'Mars');

  const aspects = calculateKeyAspects(birthChart, currentTransits);

  crystalDatabase.forEach((crystal) => {
    // Sun sign match
    if (crystal.sunSigns.includes(sunSign)) {
      scores[crystal.name].score += 15;
      scores[crystal.name].reasons.push(`Aligned with your ${sunSign} Sun`);
    }

    // Moon sign match
    if (crystal.moonSigns.includes(moonSign)) {
      scores[crystal.name].score += 12;
      scores[crystal.name].reasons.push(`Resonates with your ${moonSign} Moon`);
    }

    // Transit matches
    if (transitSun && crystal.sunSigns.includes(transitSun.sign)) {
      scores[crystal.name].score += 8;
      scores[crystal.name].reasons.push(
        `Sun transiting ${transitSun.sign} activates this crystal`,
      );
    }

    if (transitMoon && crystal.moonSigns.includes(transitMoon.sign)) {
      scores[crystal.name].score += 6;
      scores[crystal.name].reasons.push(
        `Moon in ${transitMoon.sign} enhances this crystal's energy`,
      );
    }

    // Aspect matches
    aspects.slice(0, 5).forEach((aspect) => {
      const planetCode = aspect.transitPlanet.toUpperCase().slice(0, 3);
      if (crystal.aspects.includes(planetCode)) {
        scores[crystal.name].score += 10 - aspect.orb;
        scores[crystal.name].reasons.push(
          `${aspect.transitPlanet} ${aspect.type} activates ${crystal.name}`,
        );
      }
    });

    // Property matches with daily energy
    if (
      crystal.properties.some(
        (p) =>
          p.toLowerCase().includes(dailyInfluences.dayEnergy) ||
          dailyInfluences.dayEnergy.includes(p.toLowerCase()),
      )
    ) {
      scores[crystal.name].score += 5;
      scores[crystal.name].reasons.push(
        `Supports today's ${dailyInfluences.dayEnergy} energy`,
      );
    }

    // Birthday boost
    if (dailyInfluences.birthdayBoost && crystal.sunSigns.includes(sunSign)) {
      scores[crystal.name].score += 20;
      scores[crystal.name].reasons.push(
        `🎂 Birthday crystal - extra powerful for you today!`,
      );
    }
  });

  // Find highest scoring crystal
  const sortedCrystals = Object.entries(scores)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 5);

  const winnerName = sortedCrystals[0][0];
  const winner = crystalDatabase.find((c) => c.name === winnerName)!;
  const reasons = scores[winnerName].reasons.slice(0, 4);

  return { crystal: winner, reasons };
};

export const getCrystalGuidance = (
  crystal: Crystal,
  birthChart: BirthChartData[],
): string => {
  const sunSign = birthChart.find((p) => p.body === 'Sun')?.sign || 'Aries';
  const moonSign = birthChart.find((p) => p.body === 'Moon')?.sign || 'Cancer';

  const templates = [
    `${crystal.name} harmonizes beautifully with your ${sunSign} Sun and ${moonSign} Moon. ${crystal.intention}. Work with this crystal during meditation or carry it throughout the day.`,
    `As a ${sunSign}, ${crystal.name} amplifies your natural ${crystal.properties[0] || 'energy'}. Place it on your ${crystal.chakra} chakra during meditation for best results.`,
    `Your ${moonSign} Moon benefits from ${crystal.name}'s ${crystal.properties.slice(0, 2).join(' and ')} energies. ${crystal.intention}.`,
  ];

  const hash = (crystal.name + sunSign).length;
  return templates[hash % templates.length];
};
