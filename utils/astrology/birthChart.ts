'use client';

import {
  getAstrologicalChart,
  AstroChartInformation,
  getZodiacSign,
  formatDegree,
} from './astrology';
import { Observer, AstroTime, Horizon, Ecliptic } from 'astronomy-engine';
import dayjs from 'dayjs';

export type BirthChartData = {
  body: string;
  sign: string;
  degree: number;
  minute: number;
  eclipticLongitude: number;
  retrograde: boolean;
};

// Helper to parse location string to coordinates
// Accepts formats like "London, UK", "51.4769, 0.0005", or "London"
async function parseLocationToCoordinates(
  location: string,
): Promise<{ latitude: number; longitude: number } | null> {
  // If it's already coordinates (lat, lon)
  const coordMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    return {
      latitude: parseFloat(coordMatch[1]),
      longitude: parseFloat(coordMatch[2]),
    };
  }

  // Try to geocode location string (basic implementation)
  // In production, you'd use a geocoding service like Google Maps, Mapbox, etc.
  // For now, return null and use default
  console.warn('Location geocoding not implemented, using default coordinates');
  return null;
}

export const generateBirthChart = async (
  birthDate: string,
  birthTime?: string,
  birthLocation?: string,
  observer?: Observer,
): Promise<BirthChartData[]> => {
  console.log(
    'Generating birth chart for date:',
    birthDate,
    'time:',
    birthTime,
    'location:',
    birthLocation,
  );

  // Parse birth date and time
  let birthDateTime: Date;
  if (birthTime) {
    // Combine date and time
    birthDateTime = dayjs(`${birthDate} ${birthTime}`).toDate();
  } else {
    // Use noon as default (midpoint of day)
    birthDateTime = dayjs(`${birthDate} 12:00`).toDate();
  }
  console.log('Parsed birth date/time:', birthDateTime);

  // Get observer coordinates
  let finalObserver: Observer;
  if (observer) {
    finalObserver = observer;
  } else if (birthLocation) {
    // Try to parse location to coordinates
    const coords = await parseLocationToCoordinates(birthLocation);
    if (coords) {
      finalObserver = new Observer(coords.latitude, coords.longitude, 0);
    } else {
      // Default to London if geocoding fails
      finalObserver = new Observer(51.4769, 0.0005, 0);
      console.log('Using default coordinates (London)');
    }
  } else {
    // Default to London
    finalObserver = new Observer(51.4769, 0.0005, 0);
    console.log('Using default coordinates (London)');
  }
  console.log('Using observer:', finalObserver);

  // Calculate astrological chart for birth date/time/location
  const astroChart = getAstrologicalChart(birthDateTime, finalObserver);
  console.log('Generated astro chart:', astroChart);

  // Convert to storage format
  const birthChartData: BirthChartData[] = astroChart.map(
    (planet: AstroChartInformation) => ({
      body: planet.body as string,
      sign: planet.sign,
      degree: planet.formattedDegree.degree,
      minute: planet.formattedDegree.minute,
      eclipticLongitude: planet.eclipticLongitude,
      retrograde: planet.retrograde,
    }),
  );

  // Calculate Ascendant (Rising Sign)
  // The Ascendant is the zodiac sign on the eastern horizon at birth
  try {
    const astroTime = new AstroTime(birthDateTime);
    // Calculate the horizon at the eastern point (azimuth = 90 degrees)
    // The Ascendant is at the intersection of the eastern horizon and the ecliptic
    const horizon = Horizon(astroTime, finalObserver, 0, 0, 'normal');

    // Calculate the ecliptic longitude of the Ascendant
    // This is a simplified calculation - for more accuracy, we'd need to calculate
    // the intersection of the horizon plane with the ecliptic plane
    // For now, we'll use the sidereal time to approximate
    const siderealTime = horizon.ra; // Right ascension of the meridian
    const localSiderealTime = siderealTime + finalObserver.longitude / 15; // Convert longitude to hours

    // Calculate the ecliptic longitude of the Ascendant
    // This is a simplified formula - the actual calculation is more complex
    const obliquity = 23.4393; // Earth's axial tilt in degrees
    const latRad = (finalObserver.latitude * Math.PI) / 180;
    const lstRad = (localSiderealTime * 15 * Math.PI) / 180;

    // Calculate the Ascendant using the formula:
    // tan(ASC) = (cos(lst) / (cos(lat) * tan(obliquity) + sin(lat) * sin(lst)))
    const tanAsc =
      Math.cos(lstRad) /
      (Math.cos(latRad) * Math.tan((obliquity * Math.PI) / 180) +
        Math.sin(latRad) * Math.sin(lstRad));
    let ascendantLongitude = Math.atan(tanAsc);

    // Adjust for quadrant
    if (Math.cos(lstRad) < 0) {
      ascendantLongitude += Math.PI;
    }
    if (ascendantLongitude < 0) {
      ascendantLongitude += 2 * Math.PI;
    }

    // Convert to degrees
    const ascendantLongitudeDeg = (ascendantLongitude * 180) / Math.PI;
    const ascendantSign = getZodiacSign(ascendantLongitudeDeg);
    const ascendantFormatted = formatDegree(ascendantLongitudeDeg);

    // Add Ascendant to birth chart data
    birthChartData.push({
      body: 'Ascendant',
      sign: ascendantSign,
      degree: ascendantFormatted.degree,
      minute: ascendantFormatted.minute,
      eclipticLongitude: ascendantLongitudeDeg,
      retrograde: false, // Ascendant doesn't retrograde
    });

    console.log('Calculated Ascendant:', {
      sign: ascendantSign,
      degree: ascendantFormatted.degree,
      minute: ascendantFormatted.minute,
      longitude: ascendantLongitudeDeg,
    });
  } catch (error) {
    console.error('Error calculating Ascendant:', error);
    // If Ascendant calculation fails, continue without it
  }

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
      const planetCoValue = BirthChartPlanet.create(
        {
          body: planet.body,
          sign: planet.sign,
          degree: planet.degree,
          minute: planet.minute,
          eclipticLongitude: planet.eclipticLongitude,
          retrograde: planet.retrograde,
        },
        profile._owner || profile,
      );

      birthChartCoValue.$jazz.push(planetCoValue);
    }

    // Save to profile using correct Jazz API
    profile.$jazz.set('birthChart', birthChartCoValue);

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
