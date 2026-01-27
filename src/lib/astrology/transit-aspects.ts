/**
 * Shared utility for calculating transit aspects
 *
 * Extracted from horoscope components for reuse across tarot, horoscope, and other features
 */

import type { BirthChartData } from '../../../utils/astrology/birthChart';
import type { TransitAspect } from '@/features/horoscope/transitDetails';
import { zodiacSymbol } from '@/constants/symbols';

/**
 * Format degree position as readable string with Astromicon zodiac symbol
 */
export function formatDegree(longitude: number, sign: string): string {
  const degreeInSign = longitude % 30;
  const wholeDegree = Math.floor(degreeInSign);
  const minutes = Math.floor((degreeInSign - wholeDegree) * 60);
  const signSymbol =
    zodiacSymbol[sign.toLowerCase() as keyof typeof zodiacSymbol] || sign;
  return `${wholeDegree}°${minutes.toString().padStart(2, '0')}' ${signSymbol}`;
}

/**
 * Calculate house position using whole sign house system
 */
export function calculateHouse(
  planetLongitude: number,
  ascendantLongitude: number,
): number {
  const ascendantSign = Math.floor(ascendantLongitude / 30);
  const planetSign = Math.floor(planetLongitude / 30);
  return ((planetSign - ascendantSign + 12) % 12) + 1;
}

/**
 * Calculate transit aspects between current transits and natal chart
 *
 * This is the shared implementation used by horoscope, tarot, and other features
 */
export function calculateTransitAspects(
  birthChart: BirthChartData[],
  currentTransits: any[],
): TransitAspect[] {
  const aspects: TransitAspect[] = [];

  const aspectDefinitions = [
    { name: 'conjunction', angle: 0, orb: 10 },
    { name: 'opposition', angle: 180, orb: 10 },
    { name: 'trine', angle: 120, orb: 8 },
    { name: 'square', angle: 90, orb: 8 },
    { name: 'sextile', angle: 60, orb: 6 },
  ];

  if (!birthChart || !currentTransits) {
    return aspects;
  }

  // Get ascendant for house calculations
  const ascendant = birthChart.find((p) => p.body === 'Ascendant');
  const ascendantLongitude = ascendant?.eclipticLongitude ?? 0;

  currentTransits.forEach((transit) => {
    const transitPlanet = transit.body;
    const transitSign = transit.sign;
    const transitLongitude = transit.eclipticLongitude;

    birthChart.forEach((natal) => {
      const natalPlanet = natal.body;
      const natalSign = natal.sign;
      const natalLongitude = natal.eclipticLongitude;

      aspectDefinitions.forEach((aspectDef) => {
        let diff = Math.abs(transitLongitude - natalLongitude);
        if (diff > 180) {
          diff = 360 - diff;
        }

        const orbDiff = Math.abs(diff - aspectDef.angle);

        if (orbDiff <= aspectDef.orb) {
          // Calculate house position
          const house = calculateHouse(transitLongitude, ascendantLongitude);

          aspects.push({
            transitPlanet,
            natalPlanet,
            aspectType: aspectDef.name,
            transitSign,
            transitDegree: formatDegree(transitLongitude, transitSign),
            natalSign,
            natalDegree: formatDegree(natalLongitude, natalSign),
            orbDegrees: orbDiff,
            house,
          });
        }
      });
    });
  });

  // Sort by orb (tightest aspects first)
  return aspects.sort((a, b) => a.orbDegrees - b.orbDegrees);
}
