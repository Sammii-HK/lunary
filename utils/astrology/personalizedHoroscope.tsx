'use client';

import dayjs from 'dayjs';
import { getAstrologicalChart, AstroChartInformation } from './astrology';
import { constellations, Constellation } from '../constellations';
import { Observer } from 'astronomy-engine';
import { parseIsoDateOnly } from '@/lib/date-only';

export type HoroscopeReading = {
  sunSign: string;
  moonPhase: string;
  moonSign: string;
  dailyGuidance: string;
  dailyAction: string;
  dailyFocus: string; // should be a clean phrase, not a sentence
  personalInsight: string;
  luckyElements: string[];
  lunarPhaseProgress: number;
  lunarPhaseDay: number;
  lunarCycleProgress: number;

  // NEW: daily variation context
  dateISO: string; // YYYY-MM-DD
  weekday: string; // Monday, Tuesday, ...
  planetaryDay: string; // Moon, Mars, Mercury, Jupiter, Venus, Saturn, Sun
  personalDayNumber?: number; // 1-9 (optional if no birthday)
};

export const getPersonalizedHoroscope = (
  userBirthday?: string,
): HoroscopeReading => {
  const today = dayjs();
  const dateISO = today.format('YYYY-MM-DD');
  const weekday = today.format('dddd');
  const planetaryDay = getPlanetaryDay(today);

  const parsedBirthDate = userBirthday ? parseIsoDateOnly(userBirthday) : null;
  const birthDate = parsedBirthDate
    ? dayjs(parsedBirthDate)
    : userBirthday
      ? dayjs(userBirthday)
      : null;

  const personalDayNumber = birthDate
    ? getPersonalDayNumber(birthDate, today)
    : undefined;

  const observer = new Observer(51.4769, 0.0005, 0);
  const currentChart = getAstrologicalChart(today.toDate(), observer);
  const natalChart = birthDate
    ? getAstrologicalChart(birthDate.toDate(), observer)
    : null;

  const natalSunSign =
    natalChart?.find((planet) => planet.body === 'Sun')?.sign ||
    currentChart.find((planet) => planet.body === 'Sun')?.sign ||
    'Unknown';

  const moonPhase = getCurrentMoonPhase(today.toDate());
  const moonSign =
    currentChart.find((planet) => planet.body === 'Moon')?.sign || 'the void';
  const { lunarPhaseProgress, lunarPhaseDay, lunarCycleProgress } =
    getLunarPhaseContext(moonPhase, today);

  const { dailyGuidance, dailyFocus, dailyAction } = generateDailyGuidance({
    currentChart,
    sunSign: natalSunSign,
    dateISO,
    weekday,
    planetaryDay,
    personalDayNumber,
    birthDate,
    lunarPhaseDay,
    moonPhase,
  });

  const personalInsight = generatePersonalInsight(natalChart, currentChart);
  const luckyElements = generateLuckyElements(natalSunSign, moonPhase);

  return {
    sunSign: natalSunSign,
    moonPhase,
    dailyGuidance,
    dailyAction,
    dailyFocus,
    personalInsight,
    luckyElements,
    lunarPhaseProgress,
    lunarPhaseDay,
    lunarCycleProgress,
    dateISO,
    weekday,
    planetaryDay,
    personalDayNumber,
    moonSign,
  };
};

const LUNAR_PHASES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
] as const;

const getCurrentMoonPhase = (date: Date): string => {
  const dayOfMonth = date.getDate();
  const phaseIndex =
    Math.floor((dayOfMonth / 30) * LUNAR_PHASES.length) % LUNAR_PHASES.length;
  return LUNAR_PHASES[phaseIndex];
};

const getLunarPhaseContext = (
  moonPhase: string,
  date: dayjs.Dayjs,
): {
  lunarPhaseProgress: number;
  lunarPhaseDay: number;
  lunarCycleProgress: number;
} => {
  const phaseIndex = LUNAR_PHASES.findIndex((phase) => phase === moonPhase);
  const normalizedIndex = phaseIndex >= 0 ? phaseIndex : 0;
  const nominalDuration = 30 / LUNAR_PHASES.length;
  const cycleDay = ((date.date() - 1) % 30) + 1;
  const phaseStart = Math.round(normalizedIndex * nominalDuration) + 1;
  let dayOffset = cycleDay - phaseStart;
  if (dayOffset < 0) dayOffset += 30;
  let dayPosition = dayOffset + 1;
  if (dayPosition > nominalDuration) dayPosition = nominalDuration;
  const lunarPhaseDay = Math.max(1, Math.round(dayPosition));
  const lunarPhaseProgress = Math.min(
    100,
    Math.max(0, Math.round((dayPosition / nominalDuration) * 100)),
  );
  const lunarCycleProgress = Math.min(
    100,
    Math.max(0, Math.round((cycleDay / 29.53) * 100)),
  );
  return { lunarPhaseProgress, lunarPhaseDay, lunarCycleProgress };
};

// -------------------------
// NEW helpers for variance
// -------------------------
const hashToIndex = (input: string, modulo: number) => {
  // simple deterministic hash (FNV-ish)
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const n = Math.abs(hash);
  return modulo === 0 ? 0 : n % modulo;
};

const getPlanetaryDay = (date: dayjs.Dayjs): string => {
  // dayjs().day(): Sunday=0 ... Saturday=6
  switch (date.day()) {
    case 0:
      return 'Sun';
    case 1:
      return 'Moon';
    case 2:
      return 'Mars';
    case 3:
      return 'Mercury';
    case 4:
      return 'Jupiter';
    case 5:
      return 'Venus';
    case 6:
      return 'Saturn';
    default:
      return 'Sun';
  }
};

const reduceToSingleDigit = (num: number): number => {
  let n = Math.abs(num);
  while (n > 9) {
    n = n
      .toString()
      .split('')
      .reduce((acc, d) => acc + Number(d), 0);
  }
  return n === 0 ? 9 : n; // keep it 1-9 feeling
};

const getPersonalDayNumber = (birthDate: dayjs.Dayjs, today: dayjs.Dayjs) => {
  // Personal Year = reduce(birthMonth + birthDay + currentYear)
  const birthMonth = birthDate.month() + 1;
  const birthDay = birthDate.date();
  const currentYear = Number(today.format('YYYY'));
  const personalYear = reduceToSingleDigit(birthMonth + birthDay + currentYear);

  // Personal Month = reduce(personalYear + currentMonth)
  const currentMonth = today.month() + 1;
  const personalMonth = reduceToSingleDigit(personalYear + currentMonth);

  // Personal Day = reduce(personalMonth + currentDay)
  const currentDay = today.date();
  return reduceToSingleDigit(personalMonth + currentDay);
};

type DailyGuidanceInput = {
  currentChart: AstroChartInformation[];
  sunSign: string;
  dateISO: string;
  weekday: string;
  planetaryDay: string;
  personalDayNumber?: number;
  birthDate: dayjs.Dayjs | null;
  lunarPhaseDay: number;
  moonPhase: string;
};

type FocusAspect =
  | 'conjunction'
  | 'sextile'
  | 'square'
  | 'trine'
  | 'opposition';

type FocusDescriptor = {
  label: string;
  moonSigns?: string[];
  sunSigns?: string[];
  personalDayNumbers?: number[];
  phases?: string[];
  aspects?: FocusAspect[];
  keywords?: string[];
  baseWeight?: number;
};

type FocusContext = {
  date: dayjs.Dayjs;
  dateISO: string;
  sunSign: string;
  planetaryDay: string;
  personalDayNumber?: number;
  moonPhase: string;
  lunarPhaseDay: number;
  moonSign: string;
  keywords: string[];
  aspects: Set<FocusAspect>;
};

const FOCUS_VOCAB: FocusDescriptor[] = [
  {
    label: 'momentum',
    moonSigns: ['Aries', 'Leo', 'Sagittarius'],
    phases: ['Waxing', 'New'],
    aspects: ['trine', 'sextile'],
    keywords: ['momentum', 'energy', 'initiative', 'courage'],
    baseWeight: 2,
  },
  {
    label: 'boundaries',
    moonSigns: ['Cancer', 'Scorpio', 'Capricorn'],
    aspects: ['square', 'opposition'],
    keywords: ['structure', 'discipline', 'boundaries', 'safety'],
  },
  {
    label: 'initiation',
    moonSigns: ['Aries', 'Sagittarius'],
    phases: ['New'],
    personalDayNumbers: [1],
    keywords: ['beginning', 'launch', 'start'],
  },
  {
    label: 'patience',
    moonSigns: ['Taurus', 'Cancer', 'Pisces'],
    phases: ['Waning', 'Full'],
    keywords: ['patience', 'steady', 'allow'],
  },
  {
    label: 'self trust',
    sunSigns: ['Leo', 'Aquarius'],
    keywords: ['trust', 'self-trust', 'confidence'],
  },
  {
    label: 'refinement',
    keywords: ['refine', 'revision', 'detail'],
    aspects: ['square', 'trine'],
    personalDayNumbers: [3, 9],
  },
  {
    label: 'release',
    phases: ['Full', 'Waning'],
    keywords: ['release', 'let', 'flow'],
    aspects: ['opposition'],
  },
  {
    label: 'assertion',
    moonSigns: ['Aries', 'Scorpio'],
    keywords: ['assert', 'speak', 'stand'],
    aspects: ['conjunction'],
  },
  {
    label: 'integration',
    moonSigns: ['Libra', 'Aquarius'],
    keywords: ['integration', 'balance', 'harmony'],
    aspects: ['trine', 'sextile'],
  },
  {
    label: 'discernment',
    phases: ['Waning'],
    keywords: ['discern', 'clarify', 'choose'],
    aspects: ['opposition'],
  },
  {
    label: 'clarity',
    keywords: ['clarity', 'insight'],
    aspects: ['sextile'],
    personalDayNumbers: [7],
  },
  {
    label: 'devotion',
    moonSigns: ['Cancer', 'Pisces'],
    keywords: ['devotion', 'care', 'service'],
  },
  {
    label: 'steadiness',
    moonSigns: ['Taurus', 'Capricorn'],
    keywords: ['steadiness', 'stability'],
  },
  {
    label: 'presence',
    keywords: ['presence', 'grounded'],
  },
  {
    label: 'courage',
    moonSigns: ['Aries', 'Leo'],
    keywords: ['courage', 'bravery'],
    aspects: ['conjunction'],
  },
  {
    label: 'adaptation',
    moonSigns: ['Gemini', 'Virgo'],
    keywords: ['adapt', 'flexibility'],
    aspects: ['sextile'],
  },
  {
    label: 'alignment',
    keywords: ['alignment', 'synchronicity', 'resonance'],
    phases: ['Waxing'],
  },
  {
    label: 'creativity',
    moonSigns: ['Leo', 'Aquarius'],
    keywords: ['creativity', 'expression'],
  },
  {
    label: 'perspective',
    keywords: ['perspective', 'vision'],
    aspects: ['trine'],
  },
  {
    label: 'grounding',
    moonSigns: ['Taurus', 'Capricorn'],
    keywords: ['grounding', 'root', 'earth'],
  },
  {
    label: 'generosity',
    moonSigns: ['Leo', 'Libra'],
    keywords: ['generosity', 'give', 'share'],
  },
  {
    label: 'focus',
    keywords: ['focus', 'attention', 'clarity'],
    aspects: ['conjunction'],
  },
  {
    label: 'discipline',
    moonSigns: ['Capricorn', 'Saturn'],
    keywords: ['discipline', 'structure'],
    personalDayNumbers: [4, 8],
  },
  {
    label: 'rest',
    moonSigns: ['Pisces', 'Cancer'],
    keywords: ['rest', 'recover', 'pause'],
  },
  {
    label: 'reflection',
    keywords: ['reflect', 'review', 'mirror'],
    phases: ['Full', 'Waning'],
  },
  {
    label: 'connection',
    moonSigns: ['Libra', 'Cancer'],
    keywords: ['connect', 'relate', 'relationship'],
  },
  {
    label: 'gratitude',
    keywords: ['gratitude', 'thank', 'appreciate'],
  },
  {
    label: 'simplicity',
    keywords: ['simplicity', 'streamline'],
    aspects: ['square'],
  },
];

const FOCUS_HISTORY_WINDOW = 6;

function resolveDailyFocus(params: {
  date: dayjs.Dayjs;
  dateISO: string;
  sunSign: string;
  currentChart: AstroChartInformation[];
  planetaryDay: string;
  personalDayNumber?: number;
  birthDate: dayjs.Dayjs | null;
  moonPhase: string;
  lunarPhaseDay: number;
  moonSign: string;
}): string {
  const todayContext = buildFocusContext({
    date: params.date,
    sunSign: params.sunSign,
    birthDate: params.birthDate,
    planetaryDay: params.planetaryDay,
    personalDayNumber: params.personalDayNumber,
    moonPhase: params.moonPhase,
    lunarPhaseDay: params.lunarPhaseDay,
    moonSign: params.moonSign,
    chart: params.currentChart,
  });

  const seen = new Set<string>();
  for (let offset = 1; offset <= FOCUS_HISTORY_WINDOW; offset++) {
    const pastDate = params.date.subtract(offset, 'day');
    const pastContext = buildFocusContext({
      date: pastDate,
      sunSign: params.sunSign,
      birthDate: params.birthDate,
    });
    seen.add(selectFocusLabel(pastContext, new Set()));
  }

  return selectFocusLabel(todayContext, seen);
}

function buildFocusContext(params: {
  date: dayjs.Dayjs;
  sunSign: string;
  birthDate: dayjs.Dayjs | null;
  planetaryDay?: string;
  personalDayNumber?: number;
  moonPhase?: string;
  lunarPhaseDay?: number;
  moonSign?: string;
  chart?: AstroChartInformation[];
}): FocusContext {
  const chart =
    params.chart ??
    getAstrologicalChart(
      params.date.toDate(),
      new Observer(51.4769, 0.0005, 0),
    );
  const planetaryDay = params.planetaryDay ?? getPlanetaryDay(params.date);
  const moonPhase =
    params.moonPhase ?? getCurrentMoonPhase(params.date.toDate());
  const lunarPhaseDay =
    params.lunarPhaseDay ??
    getLunarPhaseContext(moonPhase, params.date).lunarPhaseDay;
  const moonSign =
    params.moonSign ||
    chart.find((planet) => planet.body === 'Moon')?.sign ||
    'the void';
  const personalDayNumber =
    params.personalDayNumber ??
    (params.birthDate
      ? getPersonalDayNumber(params.birthDate, params.date)
      : undefined);
  const sunPosition = chart.find((planet) => planet.body === 'Sun');
  const constellation =
    sunPosition?.sign &&
    constellations[
      sunPosition.sign.toLowerCase() as keyof typeof constellations
    ];
  const keywords =
    (constellation as Constellation)?.keywords
      ?.filter(Boolean)
      .map((keyword) => keyword.toLowerCase().trim()) ?? [];
  return {
    date: params.date,
    dateISO: params.date.format('YYYY-MM-DD'),
    sunSign: params.sunSign,
    planetaryDay,
    personalDayNumber,
    moonPhase,
    lunarPhaseDay,
    moonSign,
    keywords,
    aspects: getMajorAspects(chart),
  };
}

function selectFocusLabel(context: FocusContext, seen: Set<string>): string {
  const scored = FOCUS_VOCAB.map((descriptor) => ({
    descriptor,
    weight: computeFocusWeight(descriptor, context),
  })).filter((item) => item.weight > 0);

  if (scored.length === 0) {
    return 'presence';
  }

  const expanded: FocusDescriptor[] = [];
  scored.forEach((item) => {
    for (let i = 0; i < item.weight; i += 1) {
      expanded.push(item.descriptor);
    }
  });

  const seed = `${context.dateISO}|focus`;
  const start = expanded.length > 0 ? hashToIndex(seed, expanded.length) : 0;

  for (let offset = 0; offset < expanded.length; offset += 1) {
    const candidate = expanded[(start + offset) % expanded.length];
    if (!seen.has(candidate.label)) {
      return candidate.label;
    }
  }

  return expanded[start]?.label ?? 'presence';
}

function computeFocusWeight(
  descriptor: FocusDescriptor,
  context: FocusContext,
) {
  let weight = descriptor.baseWeight ?? 1;
  if (
    descriptor.moonSigns?.some((sign) => isSameText(sign, context.moonSign))
  ) {
    weight += 2;
  }
  if (descriptor.sunSigns?.some((sign) => isSameText(sign, context.sunSign))) {
    weight += 1;
  }
  if (
    descriptor.personalDayNumbers?.includes(context.personalDayNumber ?? -1)
  ) {
    weight += 1;
  }
  if (
    descriptor.phases?.some((phase) =>
      context.moonPhase.toLowerCase().includes(phase.toLowerCase()),
    )
  ) {
    weight += 2;
  }
  if (
    descriptor.keywords?.some((keyword) =>
      context.keywords.includes(keyword.toLowerCase()),
    )
  ) {
    weight += 1;
  }
  if (descriptor.aspects?.some((aspect) => context.aspects.has(aspect))) {
    weight += 2;
  }
  return Math.max(1, weight);
}

function getMajorAspects(chart: AstroChartInformation[]): Set<FocusAspect> {
  const relevantBodies = [
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
  ] as const;
  const positions = chart
    .filter((planet) =>
      relevantBodies.includes(planet.body as (typeof relevantBodies)[number]),
    )
    .map((planet) => ({
      body: planet.body,
      longitude: planet.eclipticLongitude,
    }));
  const aspects = new Set<FocusAspect>();
  const aspectDefinitions: Array<{
    name: FocusAspect;
    angle: number;
    orb: number;
  }> = [
    { name: 'conjunction', angle: 0, orb: 6 },
    { name: 'sextile', angle: 60, orb: 4 },
    { name: 'square', angle: 90, orb: 4 },
    { name: 'trine', angle: 120, orb: 4 },
    { name: 'opposition', angle: 180, orb: 6 },
  ];

  for (let i = 0; i < positions.length; i += 1) {
    for (let j = i + 1; j < positions.length; j += 1) {
      const diff = normalizeAngle(
        Math.abs(positions[i].longitude - positions[j].longitude),
      );
      const angle = diff > 180 ? 360 - diff : diff;
      aspectDefinitions.forEach((definition) => {
        if (Math.abs(angle - definition.angle) <= definition.orb) {
          aspects.add(definition.name);
        }
      });
    }
  }
  return aspects;
}

function normalizeAngle(angle: number) {
  const mod = ((angle % 360) + 360) % 360;
  return mod;
}

const isSameText = (left: string, right: string) =>
  left?.toLowerCase() === right?.toLowerCase();

const titleCase = (s: string) =>
  s
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const focusToMeaning: Record<string, { support: string; action: string }> = {
  presence: {
    support: 'Awareness lands better than speed today.',
    action: 'Before your first reply, take one slow breath.',
  },
  integration: {
    support:
      'Connections work best when you blend opposites instead of picking sides.',
    action:
      'Name the two things you are balancing, then choose the smallest next step.',
  },
  assertion: {
    support: 'Clear boundaries beat loud energy today.',
    action: 'Say one direct sentence you have been avoiding.',
  },
  release: {
    support: 'This is good timing for editing, clearing, and letting go.',
    action: 'Remove one small thing from your to-do list or your space.',
  },
  momentum: {
    support: 'Progress comes from one clean push, not ten scattered efforts.',
    action: 'Do ten minutes on the task you have been postponing.',
  },
  rest: {
    support: 'Recovery is productive when it is deliberate.',
    action: 'Take five minutes away from screens and let your shoulders drop.',
  },
};

const getFocusMeaning = (label: string) => {
  const key = label.trim().toLowerCase();
  return (
    focusToMeaning[key] ?? {
      support: 'Keep it simple and choose what matters most.',
      action: 'Pick one small action and finish it before starting another.',
    }
  );
};

const generateDailyGuidance = ({
  currentChart,
  sunSign,
  dateISO,
  weekday,
  planetaryDay,
  personalDayNumber,
  birthDate,
  lunarPhaseDay,
  moonPhase,
}: DailyGuidanceInput): {
  dailyGuidance: string;
  dailyAction: string;
  dailyFocus: string;
} => {
  const sunPosition = currentChart.find((planet) => planet.body === 'Sun');
  const moonPosition = currentChart.find((planet) => planet.body === 'Moon');

  const moonSign = moonPosition?.sign || 'the void';

  const focusLabel = resolveDailyFocus({
    dateISO,
    date: dayjs(dateISO),
    sunSign,
    currentChart,
    planetaryDay,
    personalDayNumber,
    birthDate,
    moonPhase,
    lunarPhaseDay,
    moonSign,
  });

  const focusTitle = titleCase(focusLabel);

  const constellation = sunPosition?.sign
    ? constellations[
        sunPosition.sign.toLowerCase() as keyof typeof constellations
      ]
    : null;

  const signName = constellation
    ? constellation.name.replace(/ sign$/i, '')
    : sunPosition?.sign || sunSign;

  const personalDayLine =
    typeof personalDayNumber === 'number'
      ? `Personal day ${personalDayNumber} adds a subtle theme of pacing and choice. `
      : '';

  const { support, action } = getFocusMeaning(focusLabel);

  const skyLine =
    `${weekday} is ruled by ${planetaryDay}. ` +
    `The Moon is in ${moonSign} and ${moonPhase} Day ${lunarPhaseDay}. ` +
    `The Sun is in ${signName}.`;

  const meaningLine = `${support}`;

  const actionLine = action;

  const extraLine = constellation?.information
    ? `A note from ${signName}: ${constellation.information}`
    : '';

  return {
    dailyGuidance: [
      skyLine,
      personalDayLine.trim(),
      meaningLine,
      extraLine.trim(),
      actionLine,
    ]
      .filter(Boolean)
      .join('\n'),
    dailyAction: actionLine,
    dailyFocus: focusLabel,
  };
};

const generatePersonalInsight = (
  natalChart: AstroChartInformation[] | null,
  currentChart: AstroChartInformation[],
): string => {
  if (!natalChart) {
    return `Without your full birth data, today still points to growth through small, intentional choices. Trust what you already know.`;
  }

  const natalSun = natalChart.find((planet) => planet.body === 'Sun');
  const currentMoon = currentChart.find((planet) => planet.body === 'Moon');

  return `Your natal Sun in ${natalSun?.sign || 'your birth sign'} resonates with today’s Moon in ${currentMoon?.sign || 'transition'}. This supports both self-direction and emotional clarity. Notice any intuitive insights that surface.`;
};

const generateLuckyElements = (
  sunSign: string,
  moonPhase: string,
): string[] => {
  const elements = {
    Aries: ['Red jasper', 'Tuesday', 'Number 1'],
    Taurus: ['Rose quartz', 'Friday', 'Number 6'],
    Gemini: ['Citrine', 'Wednesday', 'Number 5'],
    Cancer: ['Moonstone', 'Monday', 'Number 2'],
    Leo: ['Sunstone', 'Sunday', 'Number 1'],
    Virgo: ['Amazonite', 'Wednesday', 'Number 6'],
    Libra: ['Lapis lazuli', 'Friday', 'Number 7'],
    Scorpio: ['Obsidian', 'Tuesday', 'Number 8'],
    Sagittarius: ['Turquoise', 'Thursday', 'Number 9'],
    Capricorn: ['Garnet', 'Saturday', 'Number 10'],
    Aquarius: ['Amethyst', 'Saturday', 'Number 11'],
    Pisces: ['Aquamarine', 'Thursday', 'Number 12'],
  };

  const baseElements = elements[sunSign as keyof typeof elements] || [
    'Quartz crystal',
    'Today',
    'Number 7',
  ];

  if (moonPhase.includes('Full')) baseElements.push('Silver jewellery');
  if (moonPhase.includes('New')) baseElements.push('Black candle');

  return baseElements;
};
