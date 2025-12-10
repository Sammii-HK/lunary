'use client';

import dayjs from 'dayjs';
import { getAstrologicalChart, AstroChartInformation } from './astrology';
import { constellations } from '../constellations';
import { Observer } from 'astronomy-engine';

type HoroscopeReading = {
  sunSign: string;
  moonPhase: string;
  dailyGuidance: string;
  personalInsight: string;
  luckyElements: string[];
};

export const getPersonalizedHoroscope = (
  userBirthday?: string,
  userName?: string,
): HoroscopeReading => {
  const today = dayjs();
  const birthDate = userBirthday ? dayjs(userBirthday) : null;

  // Default observer (can be enhanced with user location later)
  const observer = new Observer(51.4769, 0.0005, 0);

  // Get current astrological chart
  const currentChart = getAstrologicalChart(today.toDate(), observer);

  // Get natal chart if birthday is provided
  const natalChart = birthDate
    ? getAstrologicalChart(birthDate.toDate(), observer)
    : null;

  // Determine sun sign from birthday
  const sunSign = birthDate
    ? getSunSign(birthDate.month() + 1, birthDate.date())
    : 'Unknown';

  // Get current moon phase
  const moonPhase = getCurrentMoonPhase(today.toDate());

  // Generate personalized guidance
  const dailyGuidance = generateDailyGuidance(currentChart, sunSign, userName);
  const personalInsight = generatePersonalInsight(
    natalChart,
    currentChart,
    userName,
  );
  const luckyElements = generateLuckyElements(sunSign, moonPhase);

  return {
    sunSign,
    moonPhase,
    dailyGuidance,
    personalInsight,
    luckyElements,
  };
};

const getSunSign = (month: number, day: number): string => {
  // Simplified sun sign calculation
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
    return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
    return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
    return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
    return 'Aquarius';
  return 'Pisces';
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
): string => {
  const name = userName || 'dear soul';
  const sunPosition = currentChart.find((planet) => planet.body === 'Sun');
  const moonPosition = currentChart.find((planet) => planet.body === 'Moon');

  const constellation = sunPosition?.sign
    ? constellations[
        sunPosition.sign.toLowerCase() as keyof typeof constellations
      ]
    : null;

  if (constellation) {
    return `${name}, as a ${sunSign}, today's cosmic energies align with ${constellation.name} influence. ${constellation.information} The moon in ${moonPosition?.sign || 'transition'} enhances your ${constellation.keywords[0].toLowerCase()} nature. Focus on ${constellation.keywords[1]?.toLowerCase() || 'inner wisdom'} today.`;
  }

  return `${name}, the cosmic energies today support your ${sunSign} nature. Trust your intuition and embrace the day's possibilities.`;
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
