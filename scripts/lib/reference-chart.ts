/**
 * Reference birth chart for generating CTA examples
 * Profile: January 15, 1990, 12:00 PM, London, UK
 */

import {
  generateBirthChart,
  generateBirthChartWithHouses,
} from '../../utils/astrology/birthChart';
import type {
  BirthChartData,
  BirthChartResult,
} from '../../utils/astrology/birthChart';

export const REFERENCE_PROFILE = {
  birthDate: '1990-01-15',
  birthTime: '12:00',
  birthLocation: 'London, UK',
  birthTimezone: 'Europe/London',
} as const;

/**
 * Generate the reference birth chart
 */
export async function generateReferenceChart(): Promise<BirthChartData[]> {
  const chart = await generateBirthChart(
    REFERENCE_PROFILE.birthDate,
    REFERENCE_PROFILE.birthTime,
    REFERENCE_PROFILE.birthLocation,
    REFERENCE_PROFILE.birthTimezone,
  );

  return chart;
}

/**
 * Get a cached reference chart or generate a new one
 */
let cachedChart: BirthChartData[] | null = null;

export async function getReferenceChart(): Promise<BirthChartData[]> {
  if (!cachedChart) {
    cachedChart = await generateReferenceChart();
  }
  return cachedChart;
}

/**
 * Format a chart position as degrees and minutes
 */
export function formatPosition(
  degree: number,
  minute: number,
  sign: string,
): string {
  return `${Math.floor(degree)}°${Math.floor(minute).toString().padStart(2, '0')}' ${sign}`;
}

/**
 * Format a full position with ecliptic longitude
 */
export function formatFullPosition(body: BirthChartData): string {
  return formatPosition(body.degree, body.minute, body.sign);
}

/**
 * Generate the reference birth chart with houses
 */
export async function generateReferenceChartWithHouses(): Promise<BirthChartResult> {
  const result = await generateBirthChartWithHouses(
    REFERENCE_PROFILE.birthDate,
    REFERENCE_PROFILE.birthTime,
    REFERENCE_PROFILE.birthLocation,
    REFERENCE_PROFILE.birthTimezone,
  );

  return result;
}

/**
 * Get a cached reference chart with houses or generate a new one
 */
let cachedChartWithHouses: BirthChartResult | null = null;

export async function getReferenceChartWithHouses(): Promise<BirthChartResult> {
  if (!cachedChartWithHouses) {
    cachedChartWithHouses = await generateReferenceChartWithHouses();
  }
  return cachedChartWithHouses;
}
