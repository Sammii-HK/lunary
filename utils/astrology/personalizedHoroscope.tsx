'use client';

import dayjs from 'dayjs';
import { getAstrologicalChart, AstroChartInformation } from './astrology';
import { constellations } from '../constellations';
import { Observer } from 'astronomy-engine';
import { parseIsoDateOnly } from '@/lib/date-only';

export type HoroscopeReading = {
  sunSign: string;
  moonPhase: string;
  dailyGuidance: string;
  dailyFocus: string; // should be a clean phrase, not a sentence
  personalInsight: string;
  luckyElements: string[];
  lunarPhaseProgress: number;
  lunarPhaseDay: number;
};

export const getPersonalizedHoroscope = (
  userBirthday?: string,
): HoroscopeReading => {
  const today = dayjs();
  const parsedBirthDate = userBirthday ? parseIsoDateOnly(userBirthday) : null;
  const birthDate = parsedBirthDate
    ? dayjs(parsedBirthDate)
    : userBirthday
      ? dayjs(userBirthday)
      : null;

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
  const { lunarPhaseProgress, lunarPhaseDay } = getLunarPhaseContext(
    moonPhase,
    today,
  );

  const { dailyGuidance, dailyFocus } = generateDailyGuidance(
    currentChart,
    natalSunSign,
  );

  const personalInsight = generatePersonalInsight(natalChart, currentChart);
  const luckyElements = generateLuckyElements(natalSunSign, moonPhase);

  return {
    sunSign: natalSunSign,
    moonPhase,
    dailyGuidance,
    dailyFocus,
    personalInsight,
    luckyElements,
    lunarPhaseProgress,
    lunarPhaseDay,
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
): { lunarPhaseProgress: number; lunarPhaseDay: number } => {
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
  return { lunarPhaseProgress, lunarPhaseDay };
};

const generateDailyGuidance = (
  currentChart: AstroChartInformation[],
  sunSign: string,
): { dailyGuidance: string; dailyFocus: string } => {
  const sunPosition = currentChart.find((planet) => planet.body === 'Sun');
  const moonPosition = currentChart.find((planet) => planet.body === 'Moon');

  const constellation = sunPosition?.sign
    ? constellations[
        sunPosition.sign.toLowerCase() as keyof typeof constellations
      ]
    : null;

  const moonSign = moonPosition?.sign || 'the void';

  // Prefer a keyword that becomes a clean focus phrase
  const focusPhrase = (
    constellation?.keywords?.[1] ||
    constellation?.keywords?.[0] ||
    'inner wisdom'
  )
    .toLowerCase()
    .trim();

  if (constellation) {
    const signName = constellation.name.replace(/ sign$/i, '');

    return {
      // Keep copy clean and parsable
      dailyGuidance:
        `The Sun in ${signName} amplifies your ${sunSign} energy today. ` +
        `${constellation.information} ` +
        `With the Moon in ${moonSign}, your attention is pulled inward.\n` +
        `Focus: ${focusPhrase}.`,
      // Keep this as a phrase, not a sentence
      dailyFocus: focusPhrase,
    };
  }

  return {
    dailyGuidance:
      `With the Sun in ${sunPosition?.sign || sunSign}, today supports your ${sunSign} qualities. ` +
      `The Moon in ${moonSign} nudges you towards steadier choices.\n` +
      `Focus: ${focusPhrase}.`,
    dailyFocus: focusPhrase,
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
