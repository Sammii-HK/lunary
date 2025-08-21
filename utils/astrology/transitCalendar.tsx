'use client';

import dayjs from 'dayjs';
import { getAstrologicalChart, AstroChartInformation } from './astrology';
import { Observer } from 'astronomy-engine';

export type TransitEvent = {
  date: dayjs.Dayjs;
  planet: string;
  event: string;
  description: string;
  significance: 'low' | 'medium' | 'high';
  type: 'sign_change' | 'retrograde' | 'direct' | 'aspect' | 'lunar_phase';
};

// Get upcoming transit events for the next 30 days
export const getUpcomingTransits = (
  startDate: dayjs.Dayjs = dayjs(),
): TransitEvent[] => {
  const events: TransitEvent[] = [];
  const observer = new Observer(51.4769, 0.0005, 0);

  // Check each day for the next 30 days
  for (let i = 0; i < 30; i++) {
    const checkDate = startDate.add(i, 'day');
    const chart = getAstrologicalChart(checkDate.toDate(), observer);

    // Add lunar phase events
    const lunarEvents = getLunarPhaseEvents(checkDate);
    events.push(...lunarEvents);

    // Add planetary sign changes (simplified - would need ephemeris data for accuracy)
    const signChangeEvents = getPlanetarySignChanges(checkDate, chart);
    events.push(...signChangeEvents);

    // Add retrograde events (simplified)
    const retrogradeEvents = getRetrogradeEvents(checkDate);
    events.push(...retrogradeEvents);
  }

  // Remove duplicates and sort by date
  const uniqueEvents = events.filter(
    (event, index, self) =>
      index ===
      self.findIndex(
        (e) =>
          e.date.isSame(event.date, 'day') &&
          e.planet === event.planet &&
          e.event === event.event,
      ),
  );

  return uniqueEvents.sort((a, b) => a.date.valueOf() - b.date.valueOf());
};

const getLunarPhaseEvents = (date: dayjs.Dayjs): TransitEvent[] => {
  const events: TransitEvent[] = [];

  // Simplified lunar phase calculation
  const lunarMonth = 29.53;
  const knownNewMoon = dayjs('2024-01-11');
  const daysSinceNew = date.diff(knownNewMoon, 'day');
  const phase = (daysSinceNew % lunarMonth) / lunarMonth;

  // Check if this is a significant lunar phase day
  if (Math.abs(phase - 0) < 0.02 || Math.abs(phase - 1) < 0.02) {
    events.push({
      date,
      planet: 'Moon',
      event: 'New Moon',
      description:
        'Perfect time for new beginnings, setting intentions, and planting seeds for future growth.',
      significance: 'high',
      type: 'lunar_phase',
    });
  } else if (Math.abs(phase - 0.25) < 0.02) {
    events.push({
      date,
      planet: 'Moon',
      event: 'First Quarter',
      description:
        'Time to take action on your intentions, overcome challenges, and push forward.',
      significance: 'medium',
      type: 'lunar_phase',
    });
  } else if (Math.abs(phase - 0.5) < 0.02) {
    events.push({
      date,
      planet: 'Moon',
      event: 'Full Moon',
      description:
        'Peak energy for manifestation, completion, and releasing what no longer serves.',
      significance: 'high',
      type: 'lunar_phase',
    });
  } else if (Math.abs(phase - 0.75) < 0.02) {
    events.push({
      date,
      planet: 'Moon',
      event: 'Last Quarter',
      description:
        'Time for reflection, gratitude, and preparing for the next cycle.',
      significance: 'medium',
      type: 'lunar_phase',
    });
  }

  return events;
};

const getPlanetarySignChanges = (
  date: dayjs.Dayjs,
  chart: AstroChartInformation[],
): TransitEvent[] => {
  const events: TransitEvent[] = [];

  // Simplified sign change detection - in reality would need ephemeris data
  // This is a mock implementation for demonstration
  const planets = ['Mercury', 'Venus', 'Mars'];

  planets.forEach((planetName) => {
    const planet = chart.find((p) => p.body === planetName);
    if (planet) {
      // Mock sign change dates (in reality, would calculate from ephemeris)
      const dayOfYear = date.dayOfYear();

      // Mercury changes signs roughly every 20-25 days
      if (planetName === 'Mercury' && dayOfYear % 23 === 0) {
        events.push({
          date,
          planet: planetName,
          event: `Enters ${getNextSign(planet.sign)}`,
          description: `${planetName} shifts energy, bringing new communication themes and mental focus.`,
          significance: 'medium',
          type: 'sign_change',
        });
      }

      // Venus changes signs roughly every 30 days
      if (planetName === 'Venus' && dayOfYear % 31 === 0) {
        events.push({
          date,
          planet: planetName,
          event: `Enters ${getNextSign(planet.sign)}`,
          description: `${planetName} brings new themes in love, beauty, and values.`,
          significance: 'medium',
          type: 'sign_change',
        });
      }

      // Mars changes signs roughly every 45-60 days
      if (planetName === 'Mars' && dayOfYear % 52 === 0) {
        events.push({
          date,
          planet: planetName,
          event: `Enters ${getNextSign(planet.sign)}`,
          description: `${planetName} energizes a new area of life with passion and drive.`,
          significance: 'high',
          type: 'sign_change',
        });
      }
    }
  });

  return events;
};

const getRetrogradeEvents = (date: dayjs.Dayjs): TransitEvent[] => {
  const events: TransitEvent[] = [];

  // Simplified retrograde calculation - mock implementation
  const dayOfYear = date.dayOfYear();

  // Mercury retrograde roughly 3-4 times per year
  if (dayOfYear % 88 === 0) {
    events.push({
      date,
      planet: 'Mercury',
      event: 'Goes Retrograde',
      description:
        'Review communication, technology, and travel plans. Perfect time for reflection and revision.',
      significance: 'high',
      type: 'retrograde',
    });
  } else if (dayOfYear % 88 === 21) {
    events.push({
      date,
      planet: 'Mercury',
      event: 'Goes Direct',
      description:
        'Communication and technology issues clear up. Time to move forward with plans.',
      significance: 'medium',
      type: 'direct',
    });
  }

  // Venus retrograde roughly every 18 months
  if (dayOfYear % 584 === 0) {
    events.push({
      date,
      planet: 'Venus',
      event: 'Goes Retrograde',
      description:
        'Review relationships, values, and financial matters. Time for inner reflection on love.',
      significance: 'high',
      type: 'retrograde',
    });
  }

  return events;
};

const getNextSign = (currentSign: string): string => {
  const signs = [
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

  const currentIndex = signs.indexOf(currentSign);
  return signs[(currentIndex + 1) % 12];
};

// Get Solar Return information
export const getSolarReturnInsights = (
  birthDate: string,
  currentDate: dayjs.Dayjs = dayjs(),
): {
  nextSolarReturn: dayjs.Dayjs;
  daysTillReturn: number;
  personalYear: number;
  insights: string;
  themes: string[];
} => {
  const birth = dayjs(birthDate);
  const currentYear = currentDate.year();

  // Calculate next solar return (when Sun returns to natal position)
  let nextSolarReturn = dayjs(`${currentYear}-${birth.format('MM-DD')}`);

  // If birthday has passed this year, next solar return is next year
  if (nextSolarReturn.isBefore(currentDate)) {
    nextSolarReturn = dayjs(`${currentYear + 1}-${birth.format('MM-DD')}`);
  }

  const daysTillReturn = nextSolarReturn.diff(currentDate, 'day');

  // Calculate personal year (age + 1)
  const age = currentDate.diff(birth, 'year');
  const personalYear = getPersonalYearNumber(birth, currentDate);

  const insights = getSolarReturnInsights_Text(personalYear, daysTillReturn);
  const themes = getSolarReturnThemes(personalYear);

  return {
    nextSolarReturn,
    daysTillReturn,
    personalYear,
    insights,
    themes,
  };
};

const getPersonalYearNumber = (
  birthDate: dayjs.Dayjs,
  currentDate: dayjs.Dayjs,
): number => {
  const currentYear = currentDate.year();
  const birthMonth = birthDate.month() + 1;
  const birthDay = birthDate.date();

  // Add birth month + birth day + current year, reduce to single digit
  let sum = birthMonth + birthDay + currentYear;

  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum
      .toString()
      .split('')
      .map(Number)
      .reduce((acc, digit) => acc + digit, 0);
  }

  return sum;
};

const getSolarReturnInsights_Text = (
  personalYear: number,
  daysTillReturn: number,
): string => {
  const yearInsights = {
    1: 'This is your year of new beginnings and independence. Plant seeds for future growth.',
    2: 'A year of cooperation, relationships, and patience. Focus on partnerships and collaboration.',
    3: 'Creative expression and communication are highlighted. Share your gifts with the world.',
    4: 'Hard work and building solid foundations. Discipline and organization bring rewards.',
    5: 'Freedom, adventure, and change. Embrace new experiences and expand your horizons.',
    6: 'Family, home, and responsibility. Nurturing others and creating harmony.',
    7: 'Spiritual growth and introspection. Study, meditate, and trust your inner wisdom.',
    8: 'Material achievement and business success. Authority, recognition, and financial growth.',
    9: 'Completion and service. Release the old to make way for new cycles ahead.',
    11: 'Inspiration and enlightenment. Your intuition and spiritual gifts are heightened.',
    22: 'Master builder year. Manifest your dreams into reality through practical action.',
    33: 'Master teacher year. Healing, compassion, and service to humanity.',
  };

  const baseInsight =
    yearInsights[personalYear as keyof typeof yearInsights] ||
    'A year of personal growth and development.';

  if (daysTillReturn <= 30) {
    return `Your Solar Return approaches in ${daysTillReturn} days! ${baseInsight} Prepare for this new personal year by reflecting on your growth and setting intentions.`;
  } else if (daysTillReturn <= 90) {
    return `Your Solar Return is ${daysTillReturn} days away. ${baseInsight} This is a good time to prepare and plan for your upcoming personal new year.`;
  } else {
    return `Your next Solar Return is in ${daysTillReturn} days. ${baseInsight} You're currently in the energy of this personal year number.`;
  }
};

const getSolarReturnThemes = (personalYear: number): string[] => {
  const themes = {
    1: ['Independence', 'New beginnings', 'Leadership', 'Self-confidence'],
    2: ['Cooperation', 'Partnerships', 'Patience', 'Diplomacy'],
    3: ['Creativity', 'Communication', 'Joy', 'Self-expression'],
    4: ['Hard work', 'Foundation building', 'Organization', 'Stability'],
    5: ['Freedom', 'Adventure', 'Change', 'Expansion'],
    6: ['Family', 'Home', 'Responsibility', 'Nurturing'],
    7: ['Spirituality', 'Introspection', 'Study', 'Inner wisdom'],
    8: ['Achievement', 'Business', 'Authority', 'Material success'],
    9: ['Completion', 'Service', 'Humanitarianism', 'Endings'],
    11: ['Inspiration', 'Intuition', 'Enlightenment', 'Spiritual gifts'],
    22: ['Master building', 'Manifestation', 'Large-scale projects', 'Legacy'],
    33: ['Healing', 'Teaching', 'Compassion', 'Service to humanity'],
  };

  return (
    themes[personalYear as keyof typeof themes] || [
      'Growth',
      'Learning',
      'Development',
      'Progress',
    ]
  );
};
