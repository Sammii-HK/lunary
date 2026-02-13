import type { GlobalCosmicData } from '@/lib/cosmic-snapshot/global-cache';
import {
  getChallengeTemplate,
  getMoonPhaseFallbackKey,
  type ChallengeTemplate,
} from './transit-challenge-map';

/**
 * Select a transit key from cosmic data.
 * Priority: retrograde > top transit aspect > planet-in-sign > moon phase fallback
 */
export function selectTransitKey(cosmicData: GlobalCosmicData): string {
  const { planetaryPositions, generalTransits, moonPhase } = cosmicData;

  // 1. Check for retrogrades (highest priority)
  const retrogradeMap: Record<string, string> = {
    Mercury: 'mercury_retrograde',
    Venus: 'venus_retrograde',
    Mars: 'mars_retrograde',
    Jupiter: 'jupiter_retrograde',
    Saturn: 'saturn_retrograde',
  };

  for (const [planet, key] of Object.entries(retrogradeMap)) {
    const pos = planetaryPositions[planet];
    if (pos?.retrograde) {
      const template = getChallengeTemplate(key);
      if (template) return key;
    }
  }

  // 2. Check top transit aspect
  if (generalTransits.length > 0) {
    const topTransit = generalTransits[0];
    const aspectMap: Record<string, string> = {
      Conjunction: 'conjunction_energy',
      Trine: 'trine_energy',
      Square: 'square_energy',
      Opposition: 'opposition_energy',
      Sextile: 'sextile_energy',
    };
    const aspectKey = aspectMap[topTransit.aspect];
    if (aspectKey) {
      const template = getChallengeTemplate(aspectKey);
      if (template) return aspectKey;
    }
  }

  // 3. Check notable planet-in-sign combos
  const planetSignMap: Record<string, Record<string, string>> = {
    Venus: {
      Pisces: 'venus_in_pisces',
      Taurus: 'venus_in_taurus',
      Libra: 'venus_in_libra',
    },
    Mars: { Aries: 'mars_in_aries' },
    Mercury: { Gemini: 'mercury_in_gemini', Virgo: 'mercury_in_virgo' },
    Jupiter: { Sagittarius: 'jupiter_in_sagittarius' },
    Saturn: { Capricorn: 'saturn_in_capricorn' },
    Sun: { Leo: 'sun_in_leo' },
    Moon: { Cancer: 'moon_in_cancer' },
  };

  for (const [planet, signKeys] of Object.entries(planetSignMap)) {
    const pos = planetaryPositions[planet];
    if (pos?.sign && signKeys[pos.sign]) {
      const key = signKeys[pos.sign];
      const template = getChallengeTemplate(key);
      if (template) return key;
    }
  }

  // 4. Fallback to moon phase
  return getMoonPhaseFallbackKey(moonPhase.name);
}

/**
 * Generate a challenge from cosmic data.
 */
export function generateChallenge(cosmicData: GlobalCosmicData): {
  transitKey: string;
  template: ChallengeTemplate;
} | null {
  const transitKey = selectTransitKey(cosmicData);
  const template = getChallengeTemplate(transitKey);

  if (!template) return null;

  return { transitKey, template };
}
