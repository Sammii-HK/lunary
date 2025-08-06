'use client';

import { getAstrologicalChart, AstroChartInformation } from './astrology';
import { Observer } from 'astronomy-engine';
import dayjs from 'dayjs';

export type BirthChartData = {
  body: string;
  sign: string;
  degree: number;
  minute: number;
  eclipticLongitude: number;
  retrograde: boolean;
};

export const generateBirthChart = (
  birthDate: string,
  observer?: Observer,
): BirthChartData[] => {
  console.log('Generating birth chart for date:', birthDate);

  // Use default observer if none provided (can be enhanced with birth location later)
  const defaultObserver = observer || new Observer(51.4769, 0.0005, 0);
  console.log('Using observer:', defaultObserver);

  // Parse birth date
  const birthDateTime = dayjs(birthDate).toDate();
  console.log('Parsed birth date:', birthDateTime);

  // Calculate astrological chart for birth date
  const astroChart = getAstrologicalChart(birthDateTime, defaultObserver);
  console.log('Generated astro chart:', astroChart);

  // Convert to storage format
  const birthChartData = astroChart.map((planet: AstroChartInformation) => ({
    body: planet.body,
    sign: planet.sign,
    degree: planet.formattedDegree.degree,
    minute: planet.formattedDegree.minute,
    eclipticLongitude: planet.eclipticLongitude,
    retrograde: planet.retrograde,
  }));

  console.log('Converted birth chart data:', birthChartData);
  return birthChartData;
};

export const saveBirthChartToProfile = (
  profile: any,
  birthChart: BirthChartData[],
): void => {
  try {
    console.log('Attempting to save birth chart:', birthChart);

    // Store as JSON string (simpler for Jazz)
    const birthChartJson = JSON.stringify(birthChart);
    profile.birthChartData = birthChartJson;

    console.log('Birth chart saved as JSON string');
  } catch (error) {
    console.error('Error saving birth chart to profile:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
  }
};

export const getBirthChartFromProfile = (
  profile: any,
): BirthChartData[] | null => {
  try {
    if (!profile?.birthChartData) return null;

    // Parse from JSON string
    const birthChart = JSON.parse(profile.birthChartData);
    return birthChart as BirthChartData[];
  } catch (error) {
    console.error('Error retrieving birth chart from profile:', error);
    return null;
  }
};

export const hasBirthChart = (profile: any): boolean => {
  const result = !!profile?.birthChartData;
  console.log('hasBirthChart check:', {
    profile: !!profile,
    birthChartData: !!profile?.birthChartData,
    result,
  });
  return result;
};
