/**
 * Consolidated birth chart fetcher with pattern detection
 * Single source of truth for birth chart data
 */

import { sql } from '@vercel/postgres';
import { BirthChartSnapshot } from './types';
import { detectNatalAspectPatterns } from '../journal/aspect-pattern-detector';

const BASE_LAT = 51.5074;
const BASE_LON = -0.1278;

/**
 * Fetches birth chart from database and enriches it with:
 * - Calculated Descendant (if missing)
 * - Detected chart patterns (Yods, T-Squares, Grand Trines, etc.)
 * - Whole Sign house system
 *
 * This is the ONLY function that should fetch birth chart data.
 * All other code should use this to ensure patterns are always included.
 */
export async function fetchBirthChartWithPatterns(
  userId: string,
): Promise<BirthChartSnapshot | null> {
  try {
    const result = await sql`
      SELECT birth_chart, birthday, location
      FROM user_profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (result.rows.length === 0 || !result.rows[0].birth_chart) {
      console.log(
        '[fetchBirthChartWithPatterns] No birth chart found for user',
        userId,
      );
      return null;
    }

    const birthChartData = result.rows[0].birth_chart as any[];
    const birthday = result.rows[0].birthday;
    const location = result.rows[0].location as any;

    // Calculate Descendant if missing (exactly opposite the Ascendant)
    const ascendant = birthChartData.find((p: any) => p.body === 'Ascendant');
    const hasDescendant = birthChartData.some(
      (p: any) => p.body === 'Descendant',
    );

    if (
      ascendant &&
      !hasDescendant &&
      ascendant.eclipticLongitude !== undefined
    ) {
      const descendantLongitude = (ascendant.eclipticLongitude + 180) % 360;
      const descendantSign = Math.floor(descendantLongitude / 30);
      const signNames = [
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
      const descendantDegree = descendantLongitude % 30;

      birthChartData.push({
        body: 'Descendant',
        sign: signNames[descendantSign],
        degree: descendantDegree,
        eclipticLongitude: descendantLongitude,
      });
    }

    // Calculate Whole Sign houses
    const ascendantLongitude = ascendant?.eclipticLongitude || 0;
    const ascendantSign = Math.floor(
      (((ascendantLongitude % 360) + 360) % 360) / 30,
    );

    const calculateWholeSignHouse = (planetLongitude: number): number => {
      const planetSign = Math.floor(
        (((planetLongitude % 360) + 360) % 360) / 30,
      );
      const houseDiff = (planetSign - ascendantSign + 12) % 12;
      return houseDiff + 1;
    };

    // Transform to BirthChartPlacement format with all sensitive points
    const placements = birthChartData
      .filter((p) =>
        [
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
          'Ascendant',
          'Descendant',
          'Midheaven',
          'North Node',
          'South Node',
          'Chiron',
          'Lilith',
        ].includes(p.body),
      )
      .map((p) => {
        const house = p.eclipticLongitude
          ? calculateWholeSignHouse(p.eclipticLongitude)
          : p.house || 0;

        return {
          planet: p.body === 'Ascendant' ? 'Rising' : p.body,
          sign: p.sign,
          house: house,
          degree: p.degree || 0,
        };
      });

    // Detect chart patterns (Yods, T-Squares, Grand Trines, Stelliums, etc.)
    const chartPatterns = detectNatalAspectPatterns(birthChartData);

    return {
      date: birthday || '1990-01-01',
      time: location?.birthTime || '12:00',
      lat: location?.latitude || BASE_LAT,
      lon: location?.longitude || BASE_LON,
      placements,
      aspects: [], // TODO: Calculate aspects if needed
      patterns: chartPatterns.map((p) => ({
        type: p.type,
        planets: p.planets,
        description: p.description,
        significance:
          p.confidence > 0.9 ? 'high' : p.confidence > 0.7 ? 'medium' : 'low',
      })),
    };
  } catch (error) {
    console.error('[fetchBirthChartWithPatterns] Error:', error);
    return null;
  }
}

/**
 * Formats birth chart into a readable summary for AI context
 * Pure function - just formatting, no fetching or calculation
 */
export function formatBirthChartSummary(
  birthChart: BirthChartSnapshot | null,
): string {
  if (!birthChart || !birthChart.placements) {
    return 'Birth chart data is not available.';
  }

  const parts: string[] = [];

  // Major placements
  const majorPlanets = [
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

  const keyPlacements = birthChart.placements
    .filter((p) => majorPlanets.includes(p.planet))
    .map((p) => {
      const house = p.house ? ` (H${p.house})` : '';
      return `${p.planet} in ${p.sign}${house}`;
    });

  if (keyPlacements.length > 0) {
    parts.push(`Placements: ${keyPlacements.join(', ')}`);
  }

  // Aspects
  if (birthChart.aspects && birthChart.aspects.length > 0) {
    const topAspects = birthChart.aspects
      .slice(0, 5)
      .map((a) => `${a.a} ${a.type} ${a.b}`)
      .join(', ');
    parts.push(`Aspects: ${topAspects}`);
  }

  // Chart Patterns - THE KEY SECTION
  if (birthChart.patterns && birthChart.patterns.length > 0) {
    const patternDescriptions = birthChart.patterns
      .slice(0, 10) // Show up to 10 patterns
      .map((p) => `${p.type}: ${p.description}`)
      .join('; ');
    parts.push(`Chart Patterns: ${patternDescriptions}`);
  }

  return parts.length > 0 ? parts.join('. ') : 'Birth chart data available.';
}
