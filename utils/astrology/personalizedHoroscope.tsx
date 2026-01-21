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
  dailyFocus: string;
  personalInsight: string;
  luckyElements: string[];
};

export const getPersonalizedHoroscope = (
  userBirthday?: string,
  userName?: string,
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

  const dailyGuidance = generateDailyGuidance(
    currentChart,
    natalSunSign,
    userName,
  );
  const personalInsight = generatePersonalInsight(
    natalChart,
    currentChart,
    userName,
  );
  const luckyElements = generateLuckyElements(natalSunSign, moonPhase);

  return {
    sunSign: natalSunSign,
    moonPhase,
    ...dailyGuidance,
    personalInsight,
    luckyElements,
  };
};

const getCurrentMoonPhase = (date: Date): string => {
  // Simplified moon phase calculation
  const phases = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent',
  ];
  const dayOfMonth = date.getDate();
  const phaseIndex = Math.floor((dayOfMonth / 30) * 8) % 8;
  return phases[phaseIndex];
};

const generateDailyGuidance = (
  currentChart: AstroChartInformation[],
  sunSign: string,
  userName?: string,
): { dailyGuidance: string; dailyFocus: string } => {
  const name = userName || 'dear soul';
  const sunPosition = currentChart.find((planet) => planet.body === 'Sun');
  const moonPosition = currentChart.find((planet) => planet.body === 'Moon');
  const constellation = sunPosition?.sign
    ? constellations[
        sunPosition.sign.toLowerCase() as keyof typeof constellations
      ]
    : null;

  const focusKeyword =
    constellation?.keywords?.[1]?.toLowerCase() || 'inner wisdom';
  const moonSign = moonPosition?.sign || 'the void';

  if (constellation) {
    return {
      dailyGuidance: `${name}, the Sun in ${constellation.name.replace(
        / sign$/i,
        '',
      )} amplifies your ${sunSign} energy today. ${constellation.information} The moon in ${moonSign} invites you to honor your ${focusKeyword} focus.`,
      dailyFocus: `Lean into ${focusKeyword} today.`,
    };
  }

  return {
    dailyGuidance: `${name}, with the Sun in ${sunPosition?.sign || sunSign}, today's skies support your ${sunSign} qualities. The moon in ${moonSign} nudges you toward ${focusKeyword}.`,
    dailyFocus: `Lean into ${focusKeyword} today.`,
  };
};

const generatePersonalInsight = (
  natalChart: AstroChartInformation[] | null,
  currentChart: AstroChartInformation[],
  userName?: string,
): string => {
  const name = userName || 'seeker';

  if (!natalChart) {
    return `${name}, while I don't have your complete birth information, the current planetary alignment suggests a time of growth and self-discovery. Trust in your inner wisdom.`;
  }

  const natalSun = natalChart.find((planet) => planet.body === 'Sun');
  const currentMoon = currentChart.find((planet) => planet.body === 'Moon');

  return `${name}, your natal Sun in ${natalSun?.sign || 'your birth sign'} resonates beautifully with today's Moon in ${currentMoon?.sign || 'transition'}. This creates a harmonious flow of energy that supports both your core self and your emotional needs. Pay attention to any intuitive insights that arise today.`;
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

  // Add moon phase specific element
  if (moonPhase.includes('Full')) {
    baseElements.push('Silver jewelry');
  } else if (moonPhase.includes('New')) {
    baseElements.push('Black candle');
  }

  return baseElements;
};
