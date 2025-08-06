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

export const saveBirthChartToProfile = async (
  profile: any,
  birthChart: BirthChartData[],
): Promise<void> => {
  try {
    console.log('Attempting to save birth chart:', birthChart);

    // Import the schema
    const { BirthChart, BirthChartPlanet } = await import('../../schema');
    
    // Create birth chart as CoValue list
    const birthChartCoValue = BirthChart.create([], profile._owner || profile);
    
    // Create and add each planet as a CoMap
    for (const planet of birthChart) {
      const planetCoValue = BirthChartPlanet.create({
        body: planet.body,
        sign: planet.sign,
        degree: planet.degree,
        minute: planet.minute,
        eclipticLongitude: planet.eclipticLongitude,
        retrograde: planet.retrograde,
      }, profile._owner || profile);
      
      birthChartCoValue.push(planetCoValue);
    }
    
    // Save to profile
    profile.birthChart = birthChartCoValue;

    console.log('Birth chart saved as CoValue');
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
    if (!profile?.birthChart) return null;

    // Convert CoValue list to BirthChartData array
    const birthChartCoValue = profile.birthChart;
    const birthChart: BirthChartData[] = [];
    
    for (let i = 0; i < birthChartCoValue.length; i++) {
      const planet = birthChartCoValue[i];
      if (planet) {
        birthChart.push({
          body: planet.body,
          sign: planet.sign,
          degree: planet.degree,
          minute: planet.minute,
          eclipticLongitude: planet.eclipticLongitude,
          retrograde: planet.retrograde,
        });
      }
    }
    
    return birthChart;
  } catch (error) {
    console.error('Error retrieving birth chart from profile:', error);
    return null;
  }
};

export const hasBirthChart = (profile: any): boolean => {
  const result = !!profile?.birthChart && profile.birthChart.length > 0;
  console.log('hasBirthChart check:', {
    profile: !!profile,
    birthChart: !!profile?.birthChart,
    length: profile?.birthChart?.length,
    result,
  });
  return result;
};
