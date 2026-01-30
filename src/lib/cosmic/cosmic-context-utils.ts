import { getMoonPhase } from '../../../utils/moon/moonPhases';
import { monthlyMoonPhases } from '../../../utils/moon/monthlyPhases';

export interface CosmicContextData {
  moonPhase: {
    phase: string;
    emoji: string;
    name: string;
    keywords: string[];
    information: string;
    icon: {
      src: string;
      alt: string;
    };
  };
  aspects?: Array<{
    planet1: string;
    planet2: string;
    aspectType: string;
    aspectSymbol: string;
  }>;
}

/**
 * Converts a moon phase label like "Full Moon" to camelCase like "fullMoon"
 */
function stringToCamelCase(string: string): string {
  return string[0].toLowerCase() + string.substring(1).replace(' ', '');
}

/**
 * Gets cosmic context (moon phase and optional aspects) for a given date
 */
export function getCosmicContextForDate(date: Date): CosmicContextData {
  const moonPhaseLabel = getMoonPhase(date);
  const phaseKey = stringToCamelCase(moonPhaseLabel);
  const phaseData =
    monthlyMoonPhases[phaseKey as keyof typeof monthlyMoonPhases];

  return {
    moonPhase: {
      phase: phaseKey,
      emoji: phaseData?.symbol || '🌙',
      name: moonPhaseLabel,
      keywords: phaseData?.keywords || [],
      information: phaseData?.information || '',
      icon: phaseData?.icon || {
        src: '/icons/moon-phases/new-moon.svg',
        alt: 'Moon phase icon',
      },
    },
  };
}

/**
 * Formats an aspect for display
 */
export function formatAspect(aspect: {
  planet1: string;
  planet2: string;
  aspectSymbol: string;
}): string {
  return `${aspect.planet1} ${aspect.aspectSymbol} ${aspect.planet2}`;
}

/**
 * Gets moon phase emoji for a given date
 */
export function getMoonPhaseEmoji(moonPhaseLabel: string): string {
  const phaseKey = stringToCamelCase(moonPhaseLabel);
  const phaseData =
    monthlyMoonPhases[phaseKey as keyof typeof monthlyMoonPhases];
  return phaseData?.symbol || '🌙';
}
