import type { Dignity } from './dignities';
import type { HouseNature } from './chart-analysis';
import type { HouseNumber } from './types';

export type ArchetypeSignals = {
  dignity: Dignity | null;
  houseNature: HouseNature;
  houseNumber: HouseNumber | null;
  rulerInRising: boolean;
  retrograde: boolean;
};

export type Archetype = {
  label: string;
  tagline: string;
  rationale: string;
};

export function selectArchetype(s: ArchetypeSignals): Archetype {
  const isDignified = s.dignity === 'domicile' || s.dignity === 'exaltation';
  const isDebilitated = s.dignity === 'detriment' || s.dignity === 'fall';

  // The Unshakeable Self — max coherence: dignified + rules itself + angular
  if (isDignified && s.rulerInRising && s.houseNature === 'angular') {
    return {
      label: 'The Unshakeable Self',
      tagline:
        'Your chart ruler rules itself, in its own sign, in a loud house.',
      rationale:
        'Rare triple-coherence: the planet directing your whole chart is in the sign it rules, in an angular house. What you see is what you get — and it comes through at full strength.',
    };
  }

  // The Broadcast Signal — dignified + angular (usually 10th or 1st)
  if (isDignified && s.houseNature === 'angular') {
    return {
      label: 'The Broadcast Signal',
      tagline: 'Your core identity expresses naturally, and publicly.',
      rationale:
        "Your chart ruler is dignified and placed angularly. The planet at the helm of your chart isn't struggling — it's at home, and it's seen.",
    };
  }

  // The Crucible — debilitated + angular — challenge worked through in public
  if (isDebilitated && s.houseNature === 'angular') {
    return {
      label: 'The Crucible',
      tagline: 'Your core self is forged through public, visible challenge.',
      rationale:
        'Your chart ruler operates against its natural grain, but in a loud house. The challenge is part of the identity — and the growth happens where people can see it.',
    };
  }

  // The Alchemist — debilitated in shadow house (8th or 12th)
  if (isDebilitated && (s.houseNumber === 8 || s.houseNumber === 12)) {
    return {
      label: 'The Alchemist',
      tagline: 'You transform the wound. Quietly, repeatedly, completely.',
      rationale:
        "Your chart ruler sits in one of the chart's deepest houses, under stress from sign placement. The work of your life is turning that pressure into power.",
    };
  }

  // The Natural Mirror — ruler in 7th
  if (s.houseNumber === 7) {
    return {
      label: 'The Natural Mirror',
      tagline: 'You find yourself through the people closest to you.',
      rationale:
        "Your chart ruler lives in the house of partnership. Relationships aren't an add-on — they're the primary surface where your identity gets revealed and tested.",
    };
  }

  // The Hidden Architect — retrograde + cadent
  if (s.retrograde && s.houseNature === 'cadent') {
    return {
      label: 'The Hidden Architect',
      tagline: 'You build your life out of sight.',
      rationale:
        'Your chart ruler is retrograde in a cadent house — two inward signals stacked. Your core expression runs internally first, publicly second (if at all).',
    };
  }

  // The Inward Signature — retrograde alone
  if (s.retrograde) {
    return {
      label: 'The Inward Signature',
      tagline: 'Your core self is processed internally first.',
      rationale:
        'A retrograde chart ruler pulls your primary self-expression inward. You work it out before you show it.',
    };
  }

  // The Seeker — 9th house
  if (s.houseNumber === 9) {
    return {
      label: 'The Seeker',
      tagline: 'You live through expansion, meaning, and higher ground.',
      rationale:
        'Your chart ruler sits in the house of philosophy, travel, and long-range vision. Your identity expresses through what lies beyond the immediate.',
    };
  }

  // The Underground Current — default for cadent placements
  if (s.houseNature === 'cadent') {
    return {
      label: 'The Underground Current',
      tagline: 'Your core expression runs beneath the surface.',
      rationale:
        'Your chart ruler sits in a cadent house — the houses of processing and preparation. Your identity works its way through before it arrives outwardly.',
    };
  }

  // Fallback — positive, non-generic
  return {
    label: 'The Original Signature',
    tagline: 'Your chart ruler tells its own story.',
    rationale:
      'Your chart ruler sits in its own unique combination of sign and house — a configuration that doesn\u2019t map onto a stock archetype. Your identity expression is literally one of one.',
  };
}
