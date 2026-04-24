import { BirthChartData } from '../astrology/birthChart';
import { parseIsoDateOnly } from '@/lib/date-only';

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
  ADA: 'adaptability',
  INT: 'intuition',
  ALI: 'alignment',
  ANG: 'angelic connection',
  SPG: 'spiritual growth',
  LOV: 'love',
  EMH: 'emotional healing',
  EMO: 'emotional balance',
  EMF: 'EMF protection',
  PRO: 'protection',
  GRD: 'grounding',
  GRI: 'grief healing',
  CLE: 'cleansing',
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
  STA: 'stability',
  CAL: 'calming',
  FOC: 'focus',
  CON: 'concentration',
  LCK: 'luck',
  LEA: 'leadership',
  LOG: 'logic',
  TRU: 'truth',
  PAS: 'passion',
  PAT: 'patience',
  CNF: 'confidence',
  SEL: 'self-love',
  PSP: 'prosperity',
  MAG: 'magic',
  MED: 'meditation',
  MEM: 'memory',
  MEN: 'mental clarity',
  AMP: 'amplification',
  HAR: 'harmony',
  GRO: 'growth',
  FEM: 'feminine energy',
  DRE: 'dream work',
  ILL: 'illumination',
  INN: 'inner peace',
  INS: 'insight',
  JOY: 'joy',
  NEG: 'negativity clearing',
  OPP: 'opportunity',
  OPT: 'optimism',
  PSY: 'psychic ability',
  PUR: 'purification',
  RAP: 'rapid change',
  SPI: 'spirituality',
  SUC: 'success',
  TEA: 'teaching',
  UNI: 'unity',
  WIL: 'willpower',
};

const decodeList = (codes: string, map: Record<string, string>): string[] =>
  codes ? codes.split(',').map((c) => map[c] || c) : [];

const intentionExpand: Record<string, string> = {
  protection: 'Shield from negativity and reveal hidden truths',
  stability: 'Ground your energy and find inner balance',
  grounding: 'Connect deeply to earth and stabilize your energy',
  healing: 'Support physical and emotional restoration',
  'emotional healing': 'Release old wounds and nurture your heart',
  love: 'Open your heart to give and receive love freely',
  'self-love': 'Cultivate deep appreciation and care for yourself',
  clarity: 'Clear mental fog and see your path forward',
  'mental clarity': 'Sharpen focus and enhance mental processes',
  intuition: 'Awaken your inner knowing and trust your instincts',
  'psychic ability': 'Develop and strengthen your psychic gifts',
  'psychic protection': 'Shield your energy from negative influences',
  'psychic vision': 'Open your third eye to see beyond the veil',
  'spiritual growth': 'Expand consciousness and deepen your practice',
  'spiritual awakening': 'Accelerate your journey to enlightenment',
  'spiritual connection': 'Strengthen your bond with the divine',
  transformation: 'Embrace change and evolve into your highest self',
  abundance: 'Attract prosperity and welcome blessings',
  prosperity: 'Manifest financial success and material security',
  manifestation: 'Turn your intentions into reality',
  courage: 'Face challenges with strength and bravery',
  strength: 'Build resilience and inner power',
  confidence: 'Step into your power with self-assurance',
  leadership: 'Inspire others and lead with wisdom',
  creativity: 'Unlock artistic expression and innovative thinking',
  communication: 'Express yourself clearly and authentically',
  wisdom: 'Access ancient knowledge and higher understanding',
  peace: 'Find serenity and release anxiety',
  calm: 'Soothe stress and restore tranquility',
  balance: 'Harmonize all aspects of your being',
  harmony: 'Create flow and alignment in your life',
  energy: 'Boost vitality and overcome fatigue',
  joy: 'Invite happiness and lightheartedness',
  passion: 'Ignite enthusiasm and desire',
  luck: 'Attract fortunate opportunities',
  growth: 'Foster personal development and expansion',
  patience: 'Cultivate calm acceptance of timing',
  logic: 'Enhance rational thinking and analysis',
  alignment: 'Bring body, mind, and spirit into unity',
  amplification: 'Magnify intentions and energy',
  'dream work': 'Enhance dreams and their messages',
  'angelic communication': 'Connect with angelic guides and messages',
  'connection to nature': 'Deepen your bond with the natural world',
  'grief healing': 'Find comfort and peace after loss',
  illumination: 'Bring light to darkness and understanding',
  'EMF protection': 'Shield from electromagnetic frequencies',
};

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
  intention: intentionExpand[entry.i] || entry.i,
  description: `${entry.n} supports ${decodeList(entry.p, propDecode).join(' and ')}`,
  element: 'Mixed',
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
    const birthday = parseIsoDateOnly(userBirthday) ?? new Date(userBirthday);
    if (!isNaN(birthday.getTime())) {
      birthdayBoost =
        birthday.getMonth() === month && birthday.getDate() === dayOfMonth;
    }
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

type CrystalReason = {
  key: string;
  text: string;
  weight: number;
};

type CrystalScore = {
  score: number;
  reasons: CrystalReason[];
};

const TRANSIT_PLANET_WEIGHTS: Record<string, number> = {
  Moon: 12,
  Mercury: 10,
  Venus: 10,
  Mars: 10,
  Sun: 8,
  Jupiter: 6,
  Saturn: 6,
  Uranus: 4,
  Neptune: 4,
  Pluto: 4,
};

const EXACT_ASPECT_BONUS = (orb: number, planet: string) =>
  Math.max(2, (TRANSIT_PLANET_WEIGHTS[planet] || 5) - Math.min(orb, 7));

const formatAspectType = (type: string) =>
  type === 'conjunction'
    ? 'conjunct'
    : type === 'opposition'
      ? 'opposite'
      : type;

const pushReason = (
  bucket: CrystalScore,
  reason: CrystalReason,
  scoreBoost = reason.weight,
) => {
  bucket.score += scoreBoost;
  const existing = bucket.reasons.find((entry) => entry.key === reason.key);
  if (!existing) {
    bucket.reasons.push(reason);
    return;
  }
  if (reason.weight > existing.weight) {
    existing.text = reason.text;
    existing.weight = reason.weight;
  }
};

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
  const scores: Record<string, CrystalScore> = {};

  crystalDatabase.forEach((crystal) => {
    scores[crystal.name] = { score: 0, reasons: [] };
  });

  const dailyInfluences = getDailyInfluences(today, userBirthday);

  const sunSign = birthChart.find((p) => p.body === 'Sun')?.sign || 'Aries';
  const moonSign = birthChart.find((p) => p.body === 'Moon')?.sign || 'Aries';

  const transitSun = currentTransits.find((p) => p.body === 'Sun');
  const transitMoon = currentTransits.find((p) => p.body === 'Moon');
  const aspects = calculateKeyAspects(birthChart, currentTransits);

  crystalDatabase.forEach((crystal) => {
    const bucket = scores[crystal.name];

    // Sun sign match
    if (crystal.sunSigns.includes(sunSign)) {
      pushReason(
        bucket,
        {
          key: `sun:${sunSign}`,
          text: `Supports the steady themes of your ${sunSign} Sun`,
          weight: 5,
        },
        6,
      );
    }

    // Moon sign match
    if (crystal.moonSigns.includes(moonSign)) {
      pushReason(
        bucket,
        {
          key: `moon:${moonSign}`,
          text: `Resonates with your ${moonSign} Moon's emotional tone`,
          weight: 6,
        },
        6,
      );
    }

    // Transit matches
    if (transitSun && crystal.sunSigns.includes(transitSun.sign)) {
      pushReason(
        bucket,
        {
          key: `transit-sun:${transitSun.sign}`,
          text: `The Sun moving through ${transitSun.sign} pulls this crystal forward today`,
          weight: 5,
        },
        4,
      );
    }

    if (transitMoon && crystal.moonSigns.includes(transitMoon.sign)) {
      pushReason(
        bucket,
        {
          key: `transit-moon:${transitMoon.sign}`,
          text: `Today's Moon in ${transitMoon.sign} heightens this crystal's sensitivity`,
          weight: 7,
        },
        8,
      );
    }

    // Aspect matches
    aspects.slice(0, 7).forEach((aspect) => {
      const planetCode = aspect.transitPlanet.toUpperCase().slice(0, 3);
      if (crystal.aspects.includes(planetCode)) {
        const aspectWeight = EXACT_ASPECT_BONUS(
          aspect.orb,
          aspect.transitPlanet,
        );
        pushReason(
          bucket,
          {
            key: `aspect:${aspect.transitPlanet}:${aspect.natalPlanet}:${aspect.type}`,
            text: `${aspect.transitPlanet} ${formatAspectType(aspect.type)} your natal ${aspect.natalPlanet} within ${aspect.orb.toFixed(1)}°`,
            weight: aspectWeight + 3,
          },
          aspectWeight + 2,
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
      pushReason(
        bucket,
        {
          key: `day-energy:${dailyInfluences.dayEnergy}`,
          text: `Matches today's ${dailyInfluences.dayEnergy} tone`,
          weight: 4,
        },
        5,
      );
    }

    // Birthday boost
    if (dailyInfluences.birthdayBoost && crystal.sunSigns.includes(sunSign)) {
      pushReason(
        bucket,
        {
          key: 'birthday-boost',
          text: `Birthday proximity makes this crystal especially charged for you today`,
          weight: 8,
        },
        14,
      );
    }
  });

  // Find highest scoring crystal
  const sortedCrystals = Object.entries(scores)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 12);

  const topScore = sortedCrystals[0]?.[1].score ?? 0;
  const candidateNames = sortedCrystals
    .filter(([, data]) => data.score >= Math.max(1, topScore - 6))
    .map(([name]) => name);
  const rotationPool =
    candidateNames.length > 0
      ? candidateNames
      : sortedCrystals.map(([name]) => name);

  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const dailySeed =
    dayOfYear +
    today.getUTCMonth() * 31 +
    today.getUTCDate() +
    aspects
      .slice(0, 3)
      .reduce(
        (sum, aspect) =>
          sum + Math.round(aspect.orb * 10) + aspect.transitPlanet.length,
        0,
      );

  const winnerName =
    rotationPool.length > 1
      ? rotationPool[dailySeed % rotationPool.length]
      : rotationPool[0];

  const winner = crystalDatabase.find((c) => c.name === winnerName)!;
  const reasons = scores[winnerName].reasons
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4)
    .map((reason) => reason.text);

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
