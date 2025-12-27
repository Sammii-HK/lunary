import { Observer } from 'astronomy-engine';
import tzLookup from 'tz-lookup';
import type { BirthChartData } from './birthChart';
import { generateBirthChart, generateBirthChartWithHouses } from './birthChart';
import { geocodeLocation } from '../location';

export type BirthChartInput = {
  birthDate: string;
  birthTime?: string;
  birthLocation?: string;
  fallbackTimezone?: string;
};

export type BirthChartContext = {
  timezone?: string;
  timezoneSource?: 'location' | 'fallback';
  observer?: Observer;
};

export const resolveBirthChartContext = async (
  input: BirthChartInput,
): Promise<BirthChartContext> => {
  if (!input.birthLocation) {
    return { timezone: input.fallbackTimezone, timezoneSource: 'fallback' };
  }

  const coords = await geocodeLocation(input.birthLocation);
  if (!coords) {
    return { timezone: input.fallbackTimezone, timezoneSource: 'fallback' };
  }

  let timezone: string | undefined;
  let timezoneSource: BirthChartContext['timezoneSource'] = 'fallback';
  try {
    timezone = tzLookup(coords.latitude, coords.longitude);
    timezoneSource = 'location';
  } catch {
    timezone = input.fallbackTimezone;
  }

  return {
    timezone,
    timezoneSource,
    observer: new Observer(coords.latitude, coords.longitude, 0),
  };
};

export const createBirthChart = async (input: BirthChartInput) => {
  const context = await resolveBirthChartContext(input);
  return generateBirthChart(
    input.birthDate,
    input.birthTime,
    input.birthLocation,
    context.timezone,
    context.observer,
  );
};

export const createBirthChartWithMetadata = async (
  input: BirthChartInput,
): Promise<{
  birthChart: BirthChartData[];
  timezone?: string;
  timezoneSource?: BirthChartContext['timezoneSource'];
}> => {
  const context = await resolveBirthChartContext(input);
  const birthChart = await generateBirthChart(
    input.birthDate,
    input.birthTime,
    input.birthLocation,
    context.timezone,
    context.observer,
  );
  return {
    birthChart,
    timezone: context.timezone,
    timezoneSource: context.timezoneSource,
  };
};

export const createBirthChartWithHouses = async (input: BirthChartInput) => {
  const context = await resolveBirthChartContext(input);
  return generateBirthChartWithHouses(
    input.birthDate,
    input.birthTime,
    input.birthLocation,
    context.timezone,
    context.observer,
  );
};
