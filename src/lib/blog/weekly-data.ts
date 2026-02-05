/**
 * Weekly Blog Data Fetching Layer
 *
 * Fetches pre-computed astronomical data from the database instead of
 * recalculating ~56 astronomical calculations per request.
 *
 * Uses:
 * - yearly_forecasts table for retrogrades, aspects, seasonal events, ingresses
 * - global_cosmic_data table for moon phases, planetary positions
 *
 * Falls back to full generation if pre-computed data is missing.
 */

import { sql } from '@vercel/postgres';
import { startOfWeek, addDays, format, isWithinInterval } from 'date-fns';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import type { YearlyForecast } from '../forecast/yearly';
import type { GlobalCosmicData } from '../cosmic-snapshot/global-cache';
import type {
  WeeklyCosmicData,
  PlanetaryHighlight,
  RetrogradeChange,
  SignIngress,
  MajorAspect,
  MoonPhaseEvent,
  SeasonalEvent,
  DailyForecast,
  BestDaysGuidance,
  WeeklyCrystalGuide,
  MagicalTimingGuide,
  RankedDay,
} from '../../../utils/blog/weeklyContentGenerator';
import {
  crystalDatabase,
  getCrystalsByZodiacSign,
  type Crystal,
} from '../../constants/grimoire/crystals';
import { getAspectMeaning } from '../../../utils/blog/aspectInterpretations';
import {
  generateEngagingTitle,
  generateEngagingSubtitle,
  generateNarrativeIntro,
  generateClosingStatement,
} from '../../../utils/blog/titleTemplates';

// =============================================================================
// Types for database structures
// =============================================================================

interface YearlyForecastRow {
  year: number;
  forecast: YearlyForecast;
  summary: string | null;
}

interface GlobalCosmicDataRow {
  data_date: Date;
  moon_phase: GlobalCosmicData['moonPhase'];
  planetary_positions: GlobalCosmicData['planetaryPositions'];
  general_transits: GlobalCosmicData['generalTransits'];
}

// =============================================================================
// Core Data Fetching Functions
// =============================================================================

/**
 * Fetch yearly forecast data from the database
 */
async function fetchYearlyForecast(
  year: number,
): Promise<YearlyForecast | null> {
  try {
    const result = await sql<YearlyForecastRow>`
      SELECT year, forecast, summary
      FROM yearly_forecasts
      WHERE year = ${year}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      console.warn(`[weekly-data] No yearly forecast found for ${year}`);
      return null;
    }

    return result.rows[0].forecast;
  } catch (error) {
    console.error('[weekly-data] Error fetching yearly forecast:', error);
    return null;
  }
}

/**
 * Fetch global cosmic data for a date range (7 days for a week)
 */
async function fetchGlobalCosmicDataRange(
  startDate: Date,
  endDate: Date,
): Promise<GlobalCosmicDataRow[]> {
  try {
    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');

    const result = await sql<GlobalCosmicDataRow>`
      SELECT data_date, moon_phase, planetary_positions, general_transits
      FROM global_cosmic_data
      WHERE data_date >= ${startStr}::date AND data_date <= ${endStr}::date
      ORDER BY data_date ASC
    `;

    return result.rows;
  } catch (error) {
    console.error('[weekly-data] Error fetching global cosmic data:', error);
    return [];
  }
}

// =============================================================================
// Data Transformation Functions
// =============================================================================

/**
 * Filter yearly forecast retrogrades to those occurring within the week
 */
function extractRetrogradeChanges(
  yearlyForecast: YearlyForecast,
  weekStart: Date,
  weekEnd: Date,
): RetrogradeChange[] {
  const retrogrades = yearlyForecast.retrogrades || [];

  const changes: RetrogradeChange[] = [];

  for (const retro of retrogrades) {
    // Check if retrograde starts this week
    if (retro.startDate) {
      const startDate = new Date(retro.startDate);
      if (isWithinInterval(startDate, { start: weekStart, end: weekEnd })) {
        changes.push({
          planet: retro.planet,
          date: startDate,
          action: 'begins',
          sign: extractSignFromDescription(retro.description) || 'Unknown',
          significance: getRetrogradeMeaning(retro.planet, 'begins'),
          guidance: getRetrogradeGuidance(
            retro.planet,
            'begins',
            extractSignFromDescription(retro.description) || 'Unknown',
          ),
        });
      }
    }

    // Check if retrograde ends this week
    if (retro.endDate) {
      const endDate = new Date(retro.endDate);
      if (isWithinInterval(endDate, { start: weekStart, end: weekEnd })) {
        changes.push({
          planet: retro.planet,
          date: endDate,
          action: 'ends',
          sign: extractSignFromDescription(retro.description) || 'Unknown',
          significance: getRetrogradeMeaning(retro.planet, 'ends'),
          guidance: getRetrogradeGuidance(
            retro.planet,
            'ends',
            extractSignFromDescription(retro.description) || 'Unknown',
          ),
        });
      }
    }
  }

  return changes.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Filter yearly forecast aspects to those occurring within the week
 */
function extractMajorAspects(
  yearlyForecast: YearlyForecast,
  weekStart: Date,
  weekEnd: Date,
): MajorAspect[] {
  const keyAspects = yearlyForecast.keyAspects || [];

  const aspects: MajorAspect[] = [];

  for (const aspect of keyAspects) {
    const aspectDate = new Date(aspect.date);

    // Check if aspect date falls within the week
    if (isWithinInterval(aspectDate, { start: weekStart, end: weekEnd })) {
      const planetA = aspect.planets[0] || 'Unknown';
      const planetB = aspect.planets[1] || 'Unknown';
      const aspectType = aspect.aspect;

      const meaning = getAspectMeaning(planetA, planetB, aspectType);

      aspects.push({
        planetA,
        planetB,
        aspect: aspectType,
        date: aspectDate,
        significance: getAspectSignificance(planetA, planetB, aspectType),
        energy: meaning.energy || aspect.description,
        guidance:
          combineAspectGuidance(meaning) ||
          `Work with this ${aspectType} energy consciously.`,
      });
    }

    // Also check if the aspect period overlaps with the week (startDate/endDate)
    if (aspect.startDate && aspect.endDate) {
      const aspStart = new Date(aspect.startDate);
      const aspEnd = new Date(aspect.endDate);

      // Check if there's any overlap
      const overlaps =
        (aspStart <= weekEnd && aspEnd >= weekStart) ||
        isWithinInterval(aspStart, { start: weekStart, end: weekEnd }) ||
        isWithinInterval(aspEnd, { start: weekStart, end: weekEnd });

      if (
        overlaps &&
        !aspects.find(
          (a) =>
            a.planetA === aspect.planets[0] &&
            a.planetB === aspect.planets[1] &&
            a.aspect === aspect.aspect,
        )
      ) {
        const planetA = aspect.planets[0] || 'Unknown';
        const planetB = aspect.planets[1] || 'Unknown';
        const aspectType = aspect.aspect;
        const meaning = getAspectMeaning(planetA, planetB, aspectType);

        // Use the midpoint of overlap with the week as the date
        const overlapStart = aspStart > weekStart ? aspStart : weekStart;

        aspects.push({
          planetA,
          planetB,
          aspect: aspectType,
          date: overlapStart,
          significance: getAspectSignificance(planetA, planetB, aspectType),
          energy: meaning.energy || aspect.description,
          guidance:
            combineAspectGuidance(meaning) ||
            `Work with this ${aspectType} energy consciously.`,
        });
      }
    }
  }

  // Sort by significance and date
  return aspects
    .sort((a, b) => {
      const sigOrder = { extraordinary: 4, high: 3, medium: 2, low: 1 };
      const sigDiff = sigOrder[b.significance] - sigOrder[a.significance];
      if (sigDiff !== 0) return sigDiff;
      return a.date.getTime() - b.date.getTime();
    })
    .slice(0, 10); // Limit to top 10
}

/**
 * Filter yearly forecast seasonal events to those occurring within the week
 */
function extractSeasonalEvents(
  yearlyForecast: YearlyForecast,
  weekStart: Date,
  weekEnd: Date,
): SeasonalEvent[] {
  const events = yearlyForecast.seasonalEvents || [];

  const filtered: SeasonalEvent[] = [];

  for (const event of events) {
    const eventDate = new Date(event.date);

    if (isWithinInterval(eventDate, { start: weekStart, end: weekEnd })) {
      filtered.push({
        name: event.type
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        date: eventDate,
        type: mapSeasonalType(event.type),
        significance: event.description,
        energy: getSeasonalEnergy(event.type),
      });
    }
  }

  return filtered;
}

/**
 * Extract sign ingresses from yearly forecast
 */
function extractSignIngresses(
  yearlyForecast: YearlyForecast,
  weekStart: Date,
  weekEnd: Date,
): SignIngress[] {
  const ingresses = yearlyForecast.ingresses || [];

  const filtered: SignIngress[] = [];

  for (const ingress of ingresses) {
    const ingressDate = new Date(ingress.exactDate);

    if (isWithinInterval(ingressDate, { start: weekStart, end: weekEnd })) {
      filtered.push({
        planet: ingress.planet,
        date: ingressDate,
        fromSign: ingress.fromSign,
        toSign: ingress.toSign,
        significance: ingress.description,
        energy: getSignIngressEnergy(
          ingress.planet,
          ingress.fromSign,
          ingress.toSign,
        ),
      });
    }
  }

  return filtered;
}

/**
 * Detect moon phase transitions from global cosmic data
 */
function extractMoonPhases(
  globalData: GlobalCosmicDataRow[],
): MoonPhaseEvent[] {
  const phases: MoonPhaseEvent[] = [];
  let lastMajorPhase: string | null = null;

  // Named moons by month
  const moonNames: { [key: number]: string } = {
    1: 'Wolf Moon',
    2: 'Snow Moon',
    3: 'Worm Moon',
    4: 'Pink Moon',
    5: 'Flower Moon',
    6: 'Strawberry Moon',
    7: 'Buck Moon',
    8: 'Sturgeon Moon',
    9: 'Harvest Moon',
    10: 'Hunter Moon',
    11: 'Beaver Moon',
    12: 'Cold Moon',
  };

  for (const row of globalData) {
    const moonPhase = row.moon_phase;
    const positions = row.planetary_positions;

    if (!moonPhase) continue;

    const phaseName = moonPhase.name;
    const isSignificant = moonPhase.isSignificant;

    // Only include significant phases (New Moon, Full Moon, Quarter phases)
    const isMajorPhase =
      isSignificant ||
      phaseName.includes('New Moon') ||
      phaseName.includes('Full Moon') ||
      phaseName.includes('First Quarter') ||
      phaseName.includes('Third Quarter') ||
      phaseName.includes('Last Quarter');

    if (isMajorPhase && phaseName !== lastMajorPhase) {
      const date = new Date(row.data_date);
      const moonSign = positions?.Moon?.sign || 'Unknown';

      // Check if it's a named full moon
      let displayName = phaseName;
      if (phaseName === 'Full Moon' || phaseName.includes('Full Moon')) {
        const month = date.getMonth() + 1;
        const namedMoon = moonNames[month];
        if (namedMoon) {
          displayName = `${namedMoon} (Full Moon)`;
        }
      }

      phases.push({
        phase: displayName,
        date,
        time: format(date, 'HH:mm'),
        sign: moonSign,
        energy: getMoonPhaseEnergy(phaseName, moonSign),
        guidance: getMoonPhaseGuidance(phaseName, moonSign),
        ritualSuggestions: getMoonPhaseRituals(phaseName),
      });

      lastMajorPhase = phaseName;
    }
  }

  return phases;
}

/**
 * Detect planetary ingresses (sign changes) from global cosmic data
 */
function extractPlanetaryHighlights(
  globalData: GlobalCosmicDataRow[],
  retrogradeChanges: RetrogradeChange[],
  signIngresses: SignIngress[],
): PlanetaryHighlight[] {
  const highlights: PlanetaryHighlight[] = [];

  // Add retrograde changes as highlights
  for (const change of retrogradeChanges) {
    highlights.push({
      planet: change.planet,
      event: change.action === 'begins' ? 'goes-retrograde' : 'goes-direct',
      date: change.date,
      description: `${change.planet} ${change.action === 'begins' ? 'stations retrograde' : 'stations direct'} in ${change.sign}`,
      significance: getRetrogradeSignificance(change.planet),
      details: {},
    });
  }

  // Add sign ingresses as highlights
  for (const ingress of signIngresses) {
    // Skip Moon and Sun (too frequent/expected)
    if (ingress.planet === 'Moon' || ingress.planet === 'Sun') continue;

    highlights.push({
      planet: ingress.planet,
      event: 'enters-sign',
      date: ingress.date,
      description: `${ingress.planet} enters ${ingress.toSign}`,
      significance: getSignIngressSignificance(ingress.planet, ingress.toSign),
      details: {
        fromSign: ingress.fromSign,
        toSign: ingress.toSign,
      },
    });
  }

  // Detect ingresses from comparing consecutive days in global data
  for (let i = 1; i < globalData.length; i++) {
    const yesterday = globalData[i - 1];
    const today = globalData[i];

    if (!yesterday.planetary_positions || !today.planetary_positions) continue;

    // Check each planet for sign changes
    const slowPlanets = [
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn',
      'Uranus',
      'Neptune',
    ];

    for (const planet of slowPlanets) {
      const yesterdayPos = yesterday.planetary_positions[planet];
      const todayPos = today.planetary_positions[planet];

      if (!yesterdayPos || !todayPos) continue;

      if (yesterdayPos.sign !== todayPos.sign) {
        // Check if we already have this ingress
        const alreadyExists = highlights.some(
          (h) =>
            h.planet === planet &&
            h.event === 'enters-sign' &&
            h.details?.toSign === todayPos.sign,
        );

        if (!alreadyExists) {
          highlights.push({
            planet,
            event: 'enters-sign',
            date: new Date(today.data_date),
            description: `${planet} enters ${todayPos.sign}`,
            significance: getSignIngressSignificance(planet, todayPos.sign),
            details: {
              fromSign: yesterdayPos.sign,
              toSign: todayPos.sign,
            },
          });
        }
      }
    }
  }

  // Sort by significance and date
  const significanceOrder = { extraordinary: 4, high: 3, medium: 2, low: 1 };
  return highlights.sort((a, b) => {
    const sigDiff =
      significanceOrder[b.significance] - significanceOrder[a.significance];
    if (sigDiff !== 0) return sigDiff;
    if (a.event.includes('retrograde') && !b.event.includes('retrograde'))
      return -1;
    if (b.event.includes('retrograde') && !a.event.includes('retrograde'))
      return 1;
    return a.date.getTime() - b.date.getTime();
  });
}

// =============================================================================
// Derived Content Generation (Cheap calculations from pre-fetched data)
// =============================================================================

/**
 * Generate daily forecasts from pre-fetched global cosmic data
 */
function generateDailyForecastsFromData(
  globalData: GlobalCosmicDataRow[],
  majorAspects: MajorAspect[],
  moonPhases: MoonPhaseEvent[],
): DailyForecast[] {
  const forecasts: DailyForecast[] = [];
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const planetaryRulers: { [key: number]: string } = {
    0: 'Sun',
    1: 'Moon',
    2: 'Mars',
    3: 'Mercury',
    4: 'Jupiter',
    5: 'Venus',
    6: 'Saturn',
  };

  for (const row of globalData) {
    const date = new Date(row.data_date);
    const positions = row.planetary_positions;
    const moonSign = positions?.Moon?.sign || 'Unknown';
    const dayIndex = date.getDay();
    const planetaryRuler = planetaryRulers[dayIndex] || 'Sun';
    const dateStr = date.toDateString();

    // Get events for this day
    const majorEvents: string[] = [];

    // Check for sign ingresses in positions
    Object.entries(positions || {}).forEach(([planet, data]: [string, any]) => {
      if (planet === 'Moon') return;
      // Check if near beginning of sign (first 2 degrees)
      const degreeInSign = data.degree;
      if (degreeInSign !== undefined && degreeInSign < 2) {
        majorEvents.push(`${planet} enters ${data.sign}`);
      }
    });

    // Get aspects for this day
    const todayAspects = majorAspects.filter(
      (a) => a.date.toDateString() === dateStr,
    );

    // Get moon phases for this day
    const todayMoonPhases = moonPhases.filter(
      (m) => m.date.toDateString() === dateStr,
    );

    // Check for retrograde planets
    const retrogradePlanets = Object.entries(positions || {})
      .filter(
        ([planet, data]: [string, any]) =>
          data.retrograde && planet !== 'Sun' && planet !== 'Moon',
      )
      .map(([planet]) => planet);

    // Generate content
    const energy = generateDailyEnergy(
      planetaryRuler,
      moonSign,
      majorEvents,
      todayAspects,
      todayMoonPhases,
      retrogradePlanets,
    );

    const guidance = generateDailyGuidance(
      planetaryRuler,
      moonSign,
      todayAspects,
      todayMoonPhases,
      retrogradePlanets,
    );

    const avoid = generateDailyAvoid(
      planetaryRuler,
      moonSign,
      todayAspects,
      retrogradePlanets,
    );

    forecasts.push({
      date,
      dayOfWeek: daysOfWeek[dayIndex],
      planetaryRuler,
      moonSign,
      majorEvents,
      energy,
      guidance,
      avoid,
    });
  }

  return forecasts;
}

/**
 * Generate best days guidance based on pre-fetched data
 */
function generateBestDaysFromData(
  dailyForecasts: DailyForecast[],
  majorAspects: MajorAspect[],
  moonPhases: MoonPhaseEvent[],
): BestDaysGuidance {
  type DayScore = {
    date: Date;
    score: number;
    reasons: string[];
    forecast: DailyForecast;
  };

  const loveScores: DayScore[] = [];
  const prosperityScores: DayScore[] = [];
  const healingScores: DayScore[] = [];
  const protectionScores: DayScore[] = [];
  const manifestationScores: DayScore[] = [];
  const cleansingScores: DayScore[] = [];

  const PLANET_RULER_BONUS = 3;
  const MOON_SIGN_BONUS = 2;
  const HARMONIOUS_ASPECT_BONUS = 4;
  const MOON_PHASE_BONUS = 3;

  const getAspectsOnDate = (date: Date) =>
    majorAspects.filter((a) => a.date.toDateString() === date.toDateString());

  const getMoonPhaseOnDate = (date: Date) =>
    moonPhases.find((m) => m.date.toDateString() === date.toDateString());

  for (const forecast of dailyForecasts) {
    const dayAspects = getAspectsOnDate(forecast.date);
    const dayMoonPhase = getMoonPhaseOnDate(forecast.date);

    // LOVE scoring
    let loveScore = 0;
    const loveReasons: string[] = [];

    if (forecast.planetaryRuler === 'Venus') {
      loveScore += PLANET_RULER_BONUS;
      loveReasons.push('Venus rules this day - peak romantic energy');
    }
    if (forecast.moonSign === 'Libra') {
      loveScore += MOON_SIGN_BONUS;
      loveReasons.push('Moon in Libra favors partnership and harmony');
    }
    if (forecast.moonSign === 'Taurus') {
      loveScore += MOON_SIGN_BONUS;
      loveReasons.push('Moon in Taurus enhances sensuality and connection');
    }
    for (const aspect of dayAspects) {
      if (aspect.planetA === 'Venus' || aspect.planetB === 'Venus') {
        if (['trine', 'sextile', 'conjunction'].includes(aspect.aspect)) {
          loveScore += HARMONIOUS_ASPECT_BONUS;
          const other =
            aspect.planetA === 'Venus' ? aspect.planetB : aspect.planetA;
          loveReasons.push(
            `Venus ${aspect.aspect} ${other} brings romantic flow`,
          );
        }
      }
    }

    if (loveScore > 0) {
      loveScores.push({
        date: forecast.date,
        score: loveScore,
        reasons: loveReasons,
        forecast,
      });
    }

    // PROSPERITY scoring
    let prosperityScore = 0;
    const prosperityReasons: string[] = [];

    if (forecast.planetaryRuler === 'Jupiter') {
      prosperityScore += PLANET_RULER_BONUS;
      prosperityReasons.push('Jupiter rules this day - expansion and luck');
    }
    if (forecast.moonSign === 'Sagittarius') {
      prosperityScore += MOON_SIGN_BONUS;
      prosperityReasons.push('Moon in Sagittarius amplifies opportunity');
    }
    if (forecast.moonSign === 'Taurus') {
      prosperityScore += MOON_SIGN_BONUS;
      prosperityReasons.push('Moon in Taurus grounds financial matters');
    }

    if (prosperityScore > 0) {
      prosperityScores.push({
        date: forecast.date,
        score: prosperityScore,
        reasons: prosperityReasons,
        forecast,
      });
    }

    // HEALING scoring
    let healingScore = 0;
    const healingReasons: string[] = [];

    if (forecast.planetaryRuler === 'Moon') {
      healingScore += PLANET_RULER_BONUS;
      healingReasons.push('Moon rules this day - emotional healing supported');
    }
    if (forecast.moonSign === 'Cancer') {
      healingScore += MOON_SIGN_BONUS;
      healingReasons.push('Moon in Cancer nurtures inner healing');
    }
    if (forecast.moonSign === 'Pisces') {
      healingScore += MOON_SIGN_BONUS;
      healingReasons.push('Moon in Pisces opens spiritual healing');
    }
    if (dayMoonPhase) {
      healingScore += MOON_PHASE_BONUS;
      healingReasons.push(`${dayMoonPhase.phase} amplifies healing rituals`);
    }

    if (healingScore > 0) {
      healingScores.push({
        date: forecast.date,
        score: healingScore,
        reasons: healingReasons,
        forecast,
      });
    }

    // PROTECTION scoring
    let protectionScore = 0;
    const protectionReasons: string[] = [];

    if (forecast.planetaryRuler === 'Mars') {
      protectionScore += PLANET_RULER_BONUS;
      protectionReasons.push('Mars rules this day - defensive strength peaks');
    }
    if (forecast.planetaryRuler === 'Saturn') {
      protectionScore += 2;
      protectionReasons.push("Saturn's energy builds lasting protection");
    }
    if (forecast.moonSign === 'Aries') {
      protectionScore += MOON_SIGN_BONUS;
      protectionReasons.push('Moon in Aries empowers boundaries');
    }
    if (forecast.moonSign === 'Scorpio') {
      protectionScore += MOON_SIGN_BONUS;
      protectionReasons.push('Moon in Scorpio strengthens psychic shields');
    }

    if (protectionScore > 0) {
      protectionScores.push({
        date: forecast.date,
        score: protectionScore,
        reasons: protectionReasons,
        forecast,
      });
    }

    // MANIFESTATION scoring
    let manifestationScore = 0;
    const manifestationReasons: string[] = [];

    if (forecast.planetaryRuler === 'Sun') {
      manifestationScore += PLANET_RULER_BONUS;
      manifestationReasons.push('Sun rules this day - willpower magnified');
    }
    if (dayMoonPhase?.phase.includes('New')) {
      manifestationScore += MOON_PHASE_BONUS + 2;
      manifestationReasons.push(
        'New Moon is the ultimate time for new intentions',
      );
    }
    if (forecast.moonSign === 'Aries') {
      manifestationScore += MOON_SIGN_BONUS;
      manifestationReasons.push('Moon in Aries initiates powerful beginnings');
    }
    if (forecast.moonSign === 'Leo') {
      manifestationScore += MOON_SIGN_BONUS;
      manifestationReasons.push('Moon in Leo amplifies creative vision');
    }

    if (manifestationScore > 0) {
      manifestationScores.push({
        date: forecast.date,
        score: manifestationScore,
        reasons: manifestationReasons,
        forecast,
      });
    }

    // CLEANSING scoring
    let cleansingScore = 0;
    const cleansingReasons: string[] = [];

    if (forecast.planetaryRuler === 'Saturn') {
      cleansingScore += PLANET_RULER_BONUS;
      cleansingReasons.push(
        'Saturn rules this day - release what no longer serves',
      );
    }
    if (dayMoonPhase?.phase.includes('Full')) {
      cleansingScore += MOON_PHASE_BONUS;
      cleansingReasons.push('Full Moon illuminates what needs releasing');
    }
    if (
      dayMoonPhase?.phase.includes('Waning') ||
      dayMoonPhase?.phase.includes('Last')
    ) {
      cleansingScore += MOON_PHASE_BONUS;
      cleansingReasons.push('Waning Moon naturally supports letting go');
    }
    if (forecast.moonSign === 'Scorpio') {
      cleansingScore += MOON_SIGN_BONUS;
      cleansingReasons.push('Moon in Scorpio transforms and purges');
    }

    if (cleansingScore > 0) {
      cleansingScores.push({
        date: forecast.date,
        score: cleansingScore,
        reasons: cleansingReasons,
        forecast,
      });
    }
  }

  const toRankedDays = (scores: DayScore[]): RankedDay[] => {
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s, index) => ({
        date: s.date,
        strength:
          index === 0 && s.score >= 5
            ? 'best'
            : s.score >= 4
              ? 'good'
              : 'favorable',
        whyGood: s.reasons[0] || 'Favorable cosmic alignment',
      }));
  };

  const generateSummaryReason = (
    ranked: RankedDay[],
    category: string,
  ): string => {
    if (ranked.length === 0) {
      return `Look for ${category.toLowerCase()} opportunities throughout the week.`;
    }
    const best = ranked.find((r) => r.strength === 'best');
    if (best) {
      const dayName = best.date.toLocaleDateString('en-US', {
        weekday: 'long',
      });
      return `${dayName} is your power day for ${category.toLowerCase()}. ${best.whyGood}.`;
    }
    return `${ranked.length} favorable days for ${category.toLowerCase()} this week.`;
  };

  const loveRanked = toRankedDays(loveScores);
  const prosperityRanked = toRankedDays(prosperityScores);
  const healingRanked = toRankedDays(healingScores);
  const protectionRanked = toRankedDays(protectionScores);
  const manifestationRanked = toRankedDays(manifestationScores);
  const cleansingRanked = toRankedDays(cleansingScores);

  return {
    love: {
      dates: loveRanked.map((r) => r.date),
      reason: generateSummaryReason(loveRanked, 'Love'),
      ranked: loveRanked,
    },
    prosperity: {
      dates: prosperityRanked.map((r) => r.date),
      reason: generateSummaryReason(prosperityRanked, 'Prosperity'),
      ranked: prosperityRanked,
    },
    healing: {
      dates: healingRanked.map((r) => r.date),
      reason: generateSummaryReason(healingRanked, 'Healing'),
      ranked: healingRanked,
    },
    protection: {
      dates: protectionRanked.map((r) => r.date),
      reason: generateSummaryReason(protectionRanked, 'Protection'),
      ranked: protectionRanked,
    },
    manifestation: {
      dates: manifestationRanked.map((r) => r.date),
      reason: generateSummaryReason(manifestationRanked, 'Manifestation'),
      ranked: manifestationRanked,
    },
    cleansing: {
      dates: cleansingRanked.map((r) => r.date),
      reason: generateSummaryReason(cleansingRanked, 'Cleansing'),
      ranked: cleansingRanked,
    },
  };
}

/**
 * Generate crystal recommendations from crystal database
 */
function generateCrystalRecommendationsFromData(
  dailyForecasts: DailyForecast[],
): WeeklyCrystalGuide[] {
  const crystalGuide: WeeklyCrystalGuide[] = [];
  const usedCrystals = new Set<string>();

  if (!crystalDatabase || crystalDatabase.length === 0) {
    return crystalGuide;
  }

  const planetMap: { [key: string]: string } = {
    Sun: 'Sun',
    Moon: 'Moon',
    Mars: 'Mars',
    Mercury: 'Mercury',
    Jupiter: 'Jupiter',
    Venus: 'Venus',
    Saturn: 'Saturn',
  };

  const planetThemes: Record<string, { theme: string; action: string }> = {
    Sun: { theme: 'vitality and self-expression', action: 'shine your light' },
    Moon: { theme: 'intuition and emotions', action: 'trust your feelings' },
    Mars: { theme: 'courage and motivation', action: 'take bold action' },
    Mercury: { theme: 'communication and clarity', action: 'speak your truth' },
    Jupiter: { theme: 'abundance and growth', action: 'expand your horizons' },
    Venus: { theme: 'love and harmony', action: 'open your heart' },
    Saturn: {
      theme: 'discipline and mastery',
      action: 'build solid foundations',
    },
  };

  const usageTemplates = [
    (crystal: string, chakra: string) =>
      `Hold ${crystal} during morning meditation to set your intention for the day.`,
    (crystal: string, chakra: string) =>
      `Place ${crystal} on your ${chakra} chakra while resting to absorb its energy.`,
    (crystal: string, chakra: string) =>
      `Carry ${crystal} in your pocket or bag to maintain its supportive vibration throughout the day.`,
    (crystal: string, chakra: string) =>
      `Keep ${crystal} on your desk or workspace to enhance focus and alignment.`,
    (crystal: string, chakra: string) =>
      `Sleep with ${crystal} under your pillow or on your nightstand for dream work.`,
    (crystal: string, chakra: string) =>
      `Create a small altar with ${crystal} as the centerpiece for today's intentions.`,
    (crystal: string, chakra: string) =>
      `Hold ${crystal} while journaling to deepen your insights and self-reflection.`,
  ];

  const getCrystalsByPlanet = (planet: string): Crystal[] => {
    return crystalDatabase.filter(
      (crystal) =>
        crystal.planets.includes(planet) ||
        crystal.planets.includes('All Planets'),
    );
  };

  const generateAffirmation = (
    crystal: Crystal,
    planet: string,
    moonSign: string,
  ): string => {
    const intentions = crystal.intentions || [];

    if (intentions.length > 0) {
      const intention = intentions[0].toLowerCase();
      return `I welcome ${intention} into my life with ease and grace.`;
    }

    const affirmations: Record<string, string> = {
      Sun: 'I radiate confidence and embrace my authentic self.',
      Moon: 'I trust my intuition and honor my emotional wisdom.',
      Mars: 'I have the courage to pursue what sets my soul on fire.',
      Mercury: 'My thoughts are clear and my words carry power.',
      Jupiter: 'Abundance flows to me naturally and effortlessly.',
      Venus: 'I am worthy of love and beauty surrounds me.',
      Saturn: 'I build my dreams with patience and persistence.',
    };

    return (
      affirmations[planet] || `I align with the cosmic energy of ${moonSign}.`
    );
  };

  for (let index = 0; index < dailyForecasts.length; index++) {
    const forecast = dailyForecasts[index];
    const planet =
      planetMap[forecast.planetaryRuler] || forecast.planetaryRuler;

    let selectedCrystal: Crystal | null = null;

    // Try to find matching crystal
    try {
      const moonCrystals = getCrystalsByZodiacSign(forecast.moonSign);
      for (const crystal of moonCrystals) {
        if (!usedCrystals.has(crystal.name)) {
          selectedCrystal = crystal;
          break;
        }
      }
    } catch {
      // Ignore errors
    }

    if (!selectedCrystal) {
      const planetCrystals = getCrystalsByPlanet(planet);
      for (const crystal of planetCrystals) {
        if (!usedCrystals.has(crystal.name)) {
          selectedCrystal = crystal;
          break;
        }
      }
    }

    if (!selectedCrystal) {
      for (const crystal of crystalDatabase) {
        if (!usedCrystals.has(crystal.name)) {
          selectedCrystal = crystal;
          break;
        }
      }
    }

    if (!selectedCrystal) {
      const idx = index % crystalDatabase.length;
      selectedCrystal = crystalDatabase[idx];
    }

    usedCrystals.add(selectedCrystal.name);

    const chakra = selectedCrystal.primaryChakra
      ? selectedCrystal.primaryChakra.replace(' Chakra', '')
      : selectedCrystal.chakras && selectedCrystal.chakras.length > 0
        ? selectedCrystal.chakras[0]
        : 'Crown';

    const intention =
      selectedCrystal.intentions && selectedCrystal.intentions.length > 0
        ? selectedCrystal.intentions[0]
        : `Align with ${forecast.moonSign} moon energy`;

    const theme = planetThemes[planet];
    const reason = theme
      ? `On this ${forecast.planetaryRuler} day with Moon in ${forecast.moonSign}, ${selectedCrystal.name} enhances ${theme.theme} and helps you ${theme.action}.`
      : `${selectedCrystal.name} aligns with today's ${forecast.moonSign} moon energy, supporting your intentions.`;

    const usageTemplate = usageTemplates[index % usageTemplates.length];
    const usage =
      selectedCrystal.workingWith?.meditation ||
      usageTemplate(selectedCrystal.name, chakra);

    const affirmation = generateAffirmation(
      selectedCrystal,
      planet,
      forecast.moonSign,
    );

    crystalGuide.push({
      date: forecast.date,
      crystal: selectedCrystal.name,
      reason,
      usage,
      chakra,
      intention,
      affirmation,
    });
  }

  return crystalGuide;
}

/**
 * Generate magical timing guide from pre-fetched data
 */
function generateMagicalTimingFromData(
  weekStart: Date,
  weekEnd: Date,
  moonPhases: MoonPhaseEvent[],
  globalData: GlobalCosmicDataRow[],
): MagicalTimingGuide {
  const powerDays: Date[] = [];
  const voidOfCourseMoon: Array<{ start: Date; end: Date; guidance: string }> =
    [];
  const planetaryHours: Array<{
    planet: string;
    bestFor: string[];
    dates: Date[];
  }> = [];
  const eclipses: Array<{
    type: string;
    date: Date;
    sign: string;
    guidance: string;
  }> = [];

  // Power days from moon phases
  for (const mp of moonPhases) {
    if (mp.phase.includes('New Moon') || mp.phase.includes('Full Moon')) {
      powerDays.push(mp.date);
    }
  }

  // Planetary hours mapping
  const planetaryHourBestFor: { [key: string]: string[] } = {
    Sun: ['Leadership', 'Confidence', 'Personal power', 'Success'],
    Venus: ['Love', 'Relationships', 'Beauty', 'Harmony'],
    Mercury: ['Communication', 'Learning', 'Writing', 'Networking'],
    Moon: ['Intuition', 'Emotions', 'Nurturing', 'Dream work'],
    Saturn: ['Structure', 'Discipline', 'Long-term goals', 'Protection'],
    Jupiter: ['Expansion', 'Abundance', 'Wisdom', 'Growth'],
    Mars: ['Action', 'Courage', 'Competition', 'Initiative'],
  };

  // Detect void of course moon from sign changes in global data
  for (let i = 1; i < globalData.length; i++) {
    const yesterday = globalData[i - 1];
    const today = globalData[i];

    const yesterdayMoon = yesterday.planetary_positions?.Moon;
    const todayMoon = today.planetary_positions?.Moon;

    if (yesterdayMoon && todayMoon && yesterdayMoon.sign !== todayMoon.sign) {
      const voidStart = new Date(yesterday.data_date);
      voidStart.setHours(18, 0, 0, 0);
      const voidEnd = new Date(today.data_date);
      voidEnd.setHours(6, 0, 0, 0);

      voidOfCourseMoon.push({
        start: voidStart,
        end: voidEnd,
        guidance:
          'Moon void of course - avoid starting new projects, focus on completion and reflection instead.',
      });
    }
  }

  // Build planetary hours for each day
  for (const row of globalData) {
    const date = new Date(row.data_date);
    const dayOfWeek = date.getDay();
    const dayRuler = [
      'Sun',
      'Moon',
      'Mars',
      'Mercury',
      'Jupiter',
      'Venus',
      'Saturn',
    ][dayOfWeek];

    const existingHour = planetaryHours.find((h) => h.planet === dayRuler);
    if (existingHour) {
      existingHour.dates.push(date);
    } else {
      planetaryHours.push({
        planet: dayRuler,
        bestFor: planetaryHourBestFor[dayRuler] || ['General activities'],
        dates: [date],
      });
    }
  }

  return {
    powerDays,
    voidOfCourseMoon,
    planetaryHours,
    eclipses,
  };
}

// =============================================================================
// Title and Summary Generation
// =============================================================================

function generateWeeklyTitleFromData(
  weekStart: Date,
  highlights: PlanetaryHighlight[],
  moonPhases: MoonPhaseEvent[],
): string {
  const majorEvent =
    highlights.find((h) => h.significance === 'extraordinary') ||
    highlights.find((h) => h.significance === 'high') ||
    highlights.find((h) => h.event === 'goes-retrograde') ||
    highlights.find((h) => h.event === 'enters-sign') ||
    null;

  let event: {
    type: 'ingress' | 'retrograde' | 'direct' | 'moon-phase';
    planet?: string;
    sign?: string;
    phaseName?: string;
    moonName?: string;
  } | null = null;

  if (majorEvent && 'planet' in majorEvent) {
    if (majorEvent.event === 'enters-sign') {
      event = {
        type: 'ingress',
        planet: majorEvent.planet,
        sign: majorEvent.details.toSign,
      };
    } else if (majorEvent.event === 'goes-retrograde') {
      event = {
        type: 'retrograde',
        planet: majorEvent.planet,
      };
    } else if (majorEvent.event === 'goes-direct') {
      event = {
        type: 'direct',
        planet: majorEvent.planet,
      };
    }
  } else if (moonPhases.length > 0) {
    const majorMoon = moonPhases.find(
      (m) => m.phase.includes('Full') || m.phase.includes('New'),
    );
    if (majorMoon) {
      const namedMatch = majorMoon.phase.match(/^(\w+ Moon)/);
      event = {
        type: 'moon-phase',
        phaseName: majorMoon.phase.includes('Full') ? 'Full Moon' : 'New Moon',
        sign: majorMoon.sign,
        moonName: namedMatch ? namedMatch[1] : undefined,
      };
    }
  }

  return generateEngagingTitle(weekStart, event);
}

function generateWeeklySubtitleFromData(
  majorAspects: MajorAspect[],
  retrogradeChanges: RetrogradeChange[],
  highlights: PlanetaryHighlight[],
  moonPhases: MoonPhaseEvent[],
): string {
  const retrogradeCount = retrogradeChanges.filter(
    (r) => r.action === 'begins',
  ).length;

  const majorMoon = moonPhases.find(
    (m) => m.phase.includes('Full') || m.phase.includes('New'),
  );
  const majorMoonPhase = majorMoon
    ? { phase: majorMoon.phase, sign: majorMoon.sign }
    : null;

  const topAspect =
    majorAspects.length > 0
      ? {
          planetA: majorAspects[0].planetA,
          planetB: majorAspects[0].planetB,
          aspect: majorAspects[0].aspect,
        }
      : null;

  const ingressHighlight = highlights.find((h) => h.event === 'enters-sign');
  const topIngress =
    ingressHighlight && ingressHighlight.details.toSign
      ? {
          planet: ingressHighlight.planet,
          sign: ingressHighlight.details.toSign,
        }
      : null;

  return generateEngagingSubtitle(
    retrogradeCount,
    majorMoonPhase,
    topAspect,
    topIngress,
  );
}

function generateWeeklySummaryFromData(
  highlights: PlanetaryHighlight[],
  aspects: MajorAspect[],
  moonPhases: MoonPhaseEvent[],
): string {
  const simpleHighlights = highlights
    .filter((h) => h.event !== 'enters-sign' || h.details?.toSign)
    .slice(0, 3)
    .map((h) => ({
      planet: h.planet,
      event: h.event,
      sign: h.details?.toSign,
    }));

  const simpleMoonPhases = moonPhases.slice(0, 2).map((m) => ({
    phase: m.phase,
    sign: m.sign,
  }));

  const simpleAspects = aspects.slice(0, 2).map((a) => ({
    planetA: a.planetA,
    planetB: a.planetB,
    aspect: a.aspect,
  }));

  const narrativeIntro = generateNarrativeIntro(
    simpleHighlights,
    simpleMoonPhases,
    simpleAspects,
  );

  const signElements: Record<string, 'fire' | 'earth' | 'air' | 'water'> = {
    Aries: 'fire',
    Leo: 'fire',
    Sagittarius: 'fire',
    Taurus: 'earth',
    Virgo: 'earth',
    Capricorn: 'earth',
    Gemini: 'air',
    Libra: 'air',
    Aquarius: 'air',
    Cancer: 'water',
    Scorpio: 'water',
    Pisces: 'water',
  };

  const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 };
  [...simpleHighlights, ...simpleMoonPhases].forEach((item) => {
    const sign = 'sign' in item ? item.sign : undefined;
    if (sign && signElements[sign]) {
      elementCounts[signElements[sign]]++;
    }
  });

  type ElementType = 'fire' | 'earth' | 'air' | 'water';
  const entries = Object.entries(elementCounts) as [ElementType, number][];
  let dominantElement: ElementType | 'mixed' = 'mixed';
  let maxCount = 0;

  for (const [element, count] of entries) {
    if (count > maxCount) {
      maxCount = count;
      dominantElement = element;
    }
  }

  const closing = generateClosingStatement(
    dominantElement === 'mixed' || maxCount < 2 ? 'mixed' : dominantElement,
  );

  if (narrativeIntro) {
    return `${narrativeIntro} ${closing}`;
  }

  return `Navigate this week with awareness and intention. ${closing}`;
}

// =============================================================================
// Helper Functions
// =============================================================================

function extractSignFromDescription(description: string): string | null {
  // Extract sign from descriptions like "Mercury retrograde period (Gemini -> Cancer)"
  const match = description.match(/\((\w+)\s*(?:->|→)?\s*(\w+)?\)/);
  if (match) {
    return match[2] || match[1];
  }
  // Try to find a zodiac sign directly in the text
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
  for (const sign of signs) {
    if (description.includes(sign)) {
      return sign;
    }
  }
  return null;
}

function getRetrogradeMeaning(
  planet: string,
  action: 'begins' | 'ends',
): string {
  const meanings: { [key: string]: { begins: string; ends: string } } = {
    Mercury: {
      begins: 'Communication and technology may face delays',
      ends: 'Clear communication and forward momentum return',
    },
    Venus: {
      begins: 'Time to review relationships and values',
      ends: 'Love and harmony flow more smoothly',
    },
    Mars: {
      begins: 'Energy may feel blocked or redirected inward',
      ends: 'Action and motivation surge forward',
    },
    Jupiter: {
      begins: 'Expansion turns inward for reflection',
      ends: 'Growth and opportunities expand outward',
    },
    Saturn: {
      begins: 'Structures and discipline require review',
      ends: 'Foundations become solid again',
    },
  };

  return (
    meanings[planet]?.[action] ||
    `${planet} ${action === 'begins' ? 'stations retrograde' : 'stations direct'}`
  );
}

function getRetrogradeGuidance(
  planet: string,
  action: 'begins' | 'ends',
  sign: string,
): string {
  const guidance: { [key: string]: { begins: string; ends: string } } = {
    Mercury: {
      begins:
        'Back up important data, double-check communications, and embrace patience with technology. Use this time for reflection and revision.',
      ends: 'Move forward with communication projects, sign contracts, and launch new ventures with confidence.',
    },
    Venus: {
      begins:
        'Reflect on relationships and personal values. Avoid major relationship decisions. Focus on self-love and artistic pursuits.',
      ends: 'Relationships and creative projects can move forward. Time for new partnerships and artistic expression.',
    },
    Mars: {
      begins:
        'Channel energy into inner work and planning. Avoid aggressive actions. Focus on strategy over direct action.',
      ends: 'Take bold action on plans made during retrograde. Energy and motivation are strong for new initiatives.',
    },
  };

  const signEnergies: { [key: string]: string } = {
    Aries: 'pioneering and initiating energy',
    Taurus: 'grounding and stabilizing energy',
    Gemini: 'communicative and adaptable energy',
    Cancer: 'nurturing and emotional depth',
    Leo: 'creative and confident expression',
    Virgo: 'practical and analytical focus',
    Libra: 'harmony and relationship focus',
    Scorpio: 'transformative and intense energy',
    Sagittarius: 'expansive and philosophical perspective',
    Capricorn: 'disciplined and structured approach',
    Aquarius: 'innovative and humanitarian vision',
    Pisces: 'intuitive and spiritual connection',
  };

  const baseGuidance =
    guidance[planet]?.[action] ||
    `Work with ${planet}'s ${action === 'begins' ? 'inward' : 'outward'} energy in ${sign}.`;
  return `${baseGuidance} The ${sign} influence adds ${signEnergies[sign] || 'cosmic energy'} to this transition.`;
}

function getRetrogradeSignificance(
  planet: string,
): 'low' | 'medium' | 'high' | 'extraordinary' {
  const significanceMap: {
    [key: string]: 'low' | 'medium' | 'high' | 'extraordinary';
  } = {
    Mercury: 'high',
    Venus: 'medium',
    Mars: 'medium',
    Jupiter: 'low',
    Saturn: 'low',
    Uranus: 'low',
    Neptune: 'low',
  };
  return significanceMap[planet] || 'low';
}

function getSignIngressSignificance(
  planet: string,
  sign: string,
): 'low' | 'medium' | 'high' | 'extraordinary' {
  const significanceMap: {
    [key: string]: 'low' | 'medium' | 'high' | 'extraordinary';
  } = {
    Sun: 'medium',
    Moon: 'low',
    Mercury: 'low',
    Venus: 'medium',
    Mars: 'medium',
    Jupiter: 'high',
    Saturn: 'high',
    Uranus: 'extraordinary',
    Neptune: 'extraordinary',
    Pluto: 'extraordinary',
  };
  return significanceMap[planet] || 'low';
}

function getSignIngressEnergy(
  planet: string,
  fromSign: string,
  toSign: string,
): string {
  const planetMeanings: { [key: string]: string } = {
    Mercury: 'communication and thinking patterns',
    Venus: 'love, values, and relationships',
    Mars: 'action, energy, and drive',
    Jupiter: 'expansion, growth, and opportunity',
    Saturn: 'structure, discipline, and responsibility',
    Uranus: 'innovation, revolution, and sudden change',
    Neptune: 'intuition, dreams, and spiritual connection',
  };

  return `${planet} shifts ${planetMeanings[planet] || 'energy'} from ${fromSign} to ${toSign}`;
}

function getAspectSignificance(
  planetA: string,
  planetB: string,
  aspect: string,
): 'low' | 'medium' | 'high' | 'extraordinary' {
  // Jupiter-Saturn conjunctions are extraordinary
  if (
    aspect === 'conjunction' &&
    ((planetA === 'Jupiter' && planetB === 'Saturn') ||
      (planetA === 'Saturn' && planetB === 'Jupiter'))
  ) {
    return 'extraordinary';
  }

  // Outer planet aspects are high significance
  const outerPlanets = ['Uranus', 'Neptune', 'Pluto'];
  if (outerPlanets.includes(planetA) || outerPlanets.includes(planetB)) {
    return 'high';
  }

  // Squares and oppositions are high
  if (aspect === 'square' || aspect === 'opposition') {
    return 'high';
  }

  // Trines and conjunctions are high
  if (aspect === 'trine' || aspect === 'conjunction') {
    return 'high';
  }

  // Sextiles are medium
  if (aspect === 'sextile') {
    return 'medium';
  }

  return 'low';
}

function combineAspectGuidance(meaning: {
  energy?: string;
  expect?: string;
  workWith?: string;
  avoid?: string;
}): string {
  const parts: string[] = [];
  if (meaning.expect) {
    parts.push(`Expect: ${meaning.expect}.`);
  }
  if (meaning.workWith) {
    parts.push(`How to work with this: ${meaning.workWith}.`);
  }
  if (meaning.avoid) {
    parts.push(`Avoid: ${meaning.avoid}.`);
  }
  return parts.join(' ');
}

function mapSeasonalType(
  type: string,
): 'equinox' | 'solstice' | 'cross-quarter' {
  if (type.includes('equinox')) return 'equinox';
  if (type.includes('solstice')) return 'solstice';
  return 'cross-quarter';
}

function getSeasonalEnergy(type: string): string {
  const energies: { [key: string]: string } = {
    spring_equinox: 'Renewal, balance, and new beginnings',
    summer_solstice: 'Expansion, growth, and celebration',
    fall_equinox: 'Harvest, gratitude, and preparation',
    winter_solstice: 'Reflection, rest, and inner light',
  };
  return energies[type] || 'Seasonal transition energy';
}

function getMoonPhaseEnergy(phase: string, sign: string): string {
  const normalizedPhase = normalizeMoonPhaseName(phase);
  const phaseEnergies: { [key: string]: string } = {
    'New Moon': 'beginnings and intention setting',
    'Waxing Crescent': 'growth and building momentum',
    'First Quarter': 'action and decision-making',
    'Waxing Gibbous': 'refinement and adjustment',
    'Full Moon': 'culmination and release',
    'Waning Gibbous': 'gratitude and sharing',
    'Last Quarter': 'reflection and letting go',
    'Third Quarter': 'reflection and letting go',
    'Waning Crescent': 'rest and preparation',
  };

  return `The ${phase} in ${sign} brings energy for ${phaseEnergies[normalizedPhase] || 'cosmic alignment'}`;
}

function getMoonPhaseGuidance(phase: string, sign: string): string {
  const normalizedPhase = normalizeMoonPhaseName(phase);
  const guidance: { [key: string]: string } = {
    'New Moon': `Set intentions aligned with ${sign} energy. Plant seeds for new beginnings.`,
    'Waxing Crescent': `Take action on your New Moon intentions. Build momentum steadily.`,
    'First Quarter': `Make decisions and take bold action. Overcome obstacles with ${sign} determination.`,
    'Waxing Gibbous': `Refine your approach. Make adjustments before the Full Moon.`,
    'Full Moon': `Release what no longer serves you. Celebrate achievements and let go with ${sign} grace.`,
    'Waning Gibbous': `Express gratitude. Share your wisdom and abundance.`,
    'Last Quarter': `Reflect on lessons learned. Release patterns that hold you back.`,
    'Third Quarter': `Reflect on lessons learned. Release patterns that hold you back.`,
    'Waning Crescent': `Rest and prepare for the next cycle. Trust the process.`,
  };

  return (
    guidance[normalizedPhase] || `Work with the ${phase} energy in ${sign}.`
  );
}

function getMoonPhaseRituals(phase: string): string[] {
  const normalizedPhase = normalizeMoonPhaseName(phase);
  const rituals: { [key: string]: string[] } = {
    'New Moon': [
      'Write intentions',
      'Meditation',
      'Candle lighting',
      'Vision board creation',
    ],
    'Waxing Crescent': [
      'Affirmations',
      'Gentle movement',
      'Plant care',
      'Creative projects',
    ],
    'First Quarter': [
      'Action planning',
      'Exercise',
      'Communication',
      'Decision-making',
    ],
    'Waxing Gibbous': [
      'Review goals',
      'Adjust plans',
      'Practice gratitude',
      'Self-care',
    ],
    'Full Moon': [
      'Release ceremony',
      'Full moon meditation',
      'Gratitude practice',
      'Cleansing rituals',
    ],
    'Waning Gibbous': [
      'Sharing wisdom',
      'Teaching others',
      'Gratitude journaling',
      'Community connection',
    ],
    'Last Quarter': [
      'Reflection journaling',
      'Letting go rituals',
      'Forgiveness work',
      'Space clearing',
    ],
    'Third Quarter': [
      'Reflection journaling',
      'Letting go rituals',
      'Forgiveness work',
      'Space clearing',
    ],
    'Waning Crescent': [
      'Rest and restoration',
      'Dream work',
      'Intuitive practices',
      'Preparation',
    ],
  };

  return (
    rituals[normalizedPhase] || [
      'Meditation',
      'Journaling',
      'Nature connection',
    ]
  );
}

function normalizeMoonPhaseName(phase: string): string {
  const lower = phase.toLowerCase();
  if (lower.includes('new moon')) return 'New Moon';
  if (lower.includes('full moon')) return 'Full Moon';
  if (lower.includes('first quarter')) return 'First Quarter';
  if (lower.includes('last quarter') || lower.includes('third quarter'))
    return 'Last Quarter';
  if (lower.includes('waxing crescent')) return 'Waxing Crescent';
  if (lower.includes('waxing gibbous')) return 'Waxing Gibbous';
  if (lower.includes('waning gibbous')) return 'Waning Gibbous';
  if (lower.includes('waning crescent')) return 'Waning Crescent';
  return phase;
}

function generateDailyEnergy(
  ruler: string,
  moonSign: string,
  events: string[],
  aspects: MajorAspect[],
  moonPhases: MoonPhaseEvent[],
  retrogradePlanets: string[],
): string {
  const rulerEnergies: { [key: string]: string } = {
    Sun: 'confidence and self-expression',
    Moon: 'emotions and intuition',
    Mars: 'action and courage',
    Mercury: 'communication and learning',
    Jupiter: 'expansion and optimism',
    Venus: 'love and harmony',
    Saturn: 'discipline and structure',
  };

  const signEnergies: { [key: string]: string } = {
    Aries: 'pioneering and initiating energy',
    Taurus: 'grounding and stabilizing energy',
    Gemini: 'communicative and adaptable energy',
    Cancer: 'nurturing and emotional depth',
    Leo: 'creative and confident expression',
    Virgo: 'practical and analytical focus',
    Libra: 'harmony and relationship focus',
    Scorpio: 'transformative and intense energy',
    Sagittarius: 'expansive and philosophical perspective',
    Capricorn: 'disciplined and structured approach',
    Aquarius: 'innovative and humanitarian vision',
    Pisces: 'intuitive and spiritual connection',
  };

  let energy = `${ruler} rules today, bringing ${rulerEnergies[ruler] || 'cosmic energy'}. `;
  energy += `The Moon in ${moonSign} adds ${signEnergies[moonSign] || 'cosmic energy'}.`;

  if (moonPhases.length > 0) {
    const phase = moonPhases[0];
    energy += ` The ${phase.phase} brings ${phase.energy || 'powerful cosmic energy'}.`;
  }

  if (aspects.length > 0) {
    const aspect = aspects[0];
    energy += ` The ${aspect.aspect} between ${aspect.planetA} and ${aspect.planetB} creates ${aspect.energy || 'dynamic energy'}.`;
  }

  if (retrogradePlanets.length > 0) {
    energy += ` ${retrogradePlanets.join(', ')} ${retrogradePlanets.length === 1 ? 'is' : 'are'} retrograde, encouraging reflection and review.`;
  }

  if (events.length > 0) {
    energy += ` ${events[0]} influences the day's energy.`;
  }

  return energy;
}

function generateDailyGuidance(
  ruler: string,
  moonSign: string,
  aspects: MajorAspect[],
  moonPhases: MoonPhaseEvent[],
  retrogradePlanets: string[],
): string {
  const guidance: { [key: string]: string } = {
    Sun: 'Focus on your authentic self and personal goals. Shine your light.',
    Moon: 'Honor your emotions and intuition. Nurture yourself and others.',
    Mars: 'Take action on your goals. Channel energy constructively.',
    Mercury: 'Communicate clearly and learn something new. Stay curious.',
    Jupiter: 'Expand your horizons. Seek growth and opportunity.',
    Venus: 'Cultivate beauty, love, and harmony. Appreciate what you have.',
    Saturn: 'Build structure and discipline. Work on long-term goals.',
  };

  let guidanceText =
    guidance[ruler] || `Work with ${ruler}'s energy in ${moonSign}.`;

  if (moonPhases.length > 0 && moonPhases[0].guidance) {
    guidanceText += ` ${moonPhases[0].guidance}`;
  }

  if (aspects.length > 0 && aspects[0].guidance) {
    guidanceText += ` ${aspects[0].guidance}`;
  }

  if (retrogradePlanets.length > 0) {
    guidanceText += ` With ${retrogradePlanets.join(' and ')} retrograde, take time to review and reflect rather than rushing forward.`;
  }

  return guidanceText;
}

function generateDailyAvoid(
  ruler: string,
  moonSign: string,
  aspects: MajorAspect[],
  retrogradePlanets: string[],
): string[] {
  const avoid: { [key: string]: string[] } = {
    Sun: ['Ego conflicts', 'Overconfidence', 'Neglecting others'],
    Moon: ['Emotional suppression', 'Ignoring feelings', 'Overreacting'],
    Mars: ['Aggression', 'Impulsivity', 'Rushing'],
    Mercury: ['Miscommunication', 'Overthinking', 'Scattered focus'],
    Jupiter: ['Overindulgence', 'Overconfidence', 'Ignoring details'],
    Venus: ['Superficiality', 'Dependency', 'Avoiding conflict'],
    Saturn: ['Rigidity', 'Self-criticism', 'Isolation'],
  };

  let avoidList = [
    ...(avoid[ruler] || ['Negativity', 'Rushing', 'Overcommitment']),
  ];

  if (aspects.length > 0) {
    const aspect = aspects[0];
    if (aspect.aspect === 'square' || aspect.aspect === 'opposition') {
      avoidList.push(
        'Forcing outcomes',
        'Ignoring tension',
        'Avoiding necessary challenges',
      );
    }
  }

  if (retrogradePlanets.length > 0) {
    avoidList.push(
      'Rushing new initiatives',
      'Making hasty decisions',
      'Ignoring past patterns',
    );
    if (retrogradePlanets.includes('Mercury')) {
      avoidList.push(
        'Signing contracts',
        'Major purchases',
        'Miscommunication',
      );
    }
    if (retrogradePlanets.includes('Venus')) {
      avoidList.push(
        'Rush relationships',
        'Major beauty changes',
        'Impulsive spending',
      );
    }
  }

  return Array.from(new Set(avoidList));
}

// =============================================================================
// Main Public Function
// =============================================================================

/**
 * Get weekly blog data from pre-computed database tables.
 *
 * This replaces ~56 astronomical calculations per request with 2 database queries:
 * 1. yearly_forecasts for retrogrades, aspects, seasonal events, ingresses
 * 2. global_cosmic_data for moon phases and planetary positions
 *
 * Falls back to full generation if pre-computed data is missing.
 */
export async function getWeeklyBlogData(
  startDate: Date,
): Promise<WeeklyCosmicData | null> {
  // Normalize to Monday of the week
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = addDays(weekStart, 6);
  weekEnd.setHours(23, 59, 59, 999);

  const year = weekStart.getFullYear();

  console.log(
    `[weekly-data] Fetching pre-computed data for week ${format(weekStart, 'yyyy-MM-dd')}`,
  );

  // Fetch pre-computed data from database
  const [yearlyForecast, globalDataRows] = await Promise.all([
    fetchYearlyForecast(year),
    fetchGlobalCosmicDataRange(weekStart, weekEnd),
  ]);

  // Check if we have enough data
  if (!yearlyForecast) {
    console.warn(
      `[weekly-data] Missing yearly forecast for ${year}, returning null`,
    );
    return null;
  }

  if (globalDataRows.length < 5) {
    console.warn(
      `[weekly-data] Insufficient global cosmic data (${globalDataRows.length}/7 days), returning null`,
    );
    return null;
  }

  console.log(
    `[weekly-data] Found ${globalDataRows.length} days of global data and yearly forecast`,
  );

  // Extract data from pre-computed sources
  const retrogradeChanges = extractRetrogradeChanges(
    yearlyForecast,
    weekStart,
    weekEnd,
  );
  const majorAspects = extractMajorAspects(yearlyForecast, weekStart, weekEnd);
  const seasonalEvents = extractSeasonalEvents(
    yearlyForecast,
    weekStart,
    weekEnd,
  );
  const signIngresses = extractSignIngresses(
    yearlyForecast,
    weekStart,
    weekEnd,
  );
  const moonPhases = extractMoonPhases(globalDataRows);
  const planetaryHighlights = extractPlanetaryHighlights(
    globalDataRows,
    retrogradeChanges,
    signIngresses,
  );

  // Generate derived content (cheap calculations from pre-fetched data)
  const dailyForecasts = generateDailyForecastsFromData(
    globalDataRows,
    majorAspects,
    moonPhases,
  );
  const bestDaysFor = generateBestDaysFromData(
    dailyForecasts,
    majorAspects,
    moonPhases,
  );
  const crystalRecommendations =
    generateCrystalRecommendationsFromData(dailyForecasts);
  const magicalTiming = generateMagicalTimingFromData(
    weekStart,
    weekEnd,
    moonPhases,
    globalDataRows,
  );

  // Generate title and summary
  const title = generateWeeklyTitleFromData(
    weekStart,
    planetaryHighlights,
    moonPhases,
  );
  const subtitle = generateWeeklySubtitleFromData(
    majorAspects,
    retrogradeChanges,
    planetaryHighlights,
    moonPhases,
  );
  const summary = generateWeeklySummaryFromData(
    planetaryHighlights,
    majorAspects,
    moonPhases,
  );

  const weekNumber = getISOWeek(weekStart);
  const yearNum = getISOWeekYear(weekStart);

  return {
    weekStart,
    weekEnd,
    title,
    subtitle,
    summary,
    planetaryHighlights,
    retrogradeChanges,
    signIngresses,
    majorAspects,
    moonPhases,
    seasonalEvents,
    dailyForecasts,
    bestDaysFor,
    crystalRecommendations,
    magicalTiming,
    generatedAt: new Date().toISOString(),
    weekNumber,
    year: yearNum,
  };
}

/**
 * Check if pre-computed data is available for a given week.
 * Useful for determining whether to use getWeeklyBlogData or fall back to generateWeeklyContent.
 */
export async function hasPrecomputedDataForWeek(
  startDate: Date,
): Promise<boolean> {
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const year = weekStart.getFullYear();

  try {
    const [yearlyForecast, globalDataRows] = await Promise.all([
      fetchYearlyForecast(year),
      fetchGlobalCosmicDataRange(weekStart, weekEnd),
    ]);

    return yearlyForecast !== null && globalDataRows.length >= 5;
  } catch (error) {
    console.error(
      '[weekly-data] Error checking pre-computed data availability:',
      error,
    );
    return false;
  }
}
