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

  // The Unshakeable Self, max coherence: dignified + rules itself + angular
  if (isDignified && s.rulerInRising && s.houseNature === 'angular') {
    return {
      label: 'The Unshakeable Self',
      tagline:
        'Your chart ruler rules itself, in its own sign, in a loud house.',
      rationale:
        'Rare triple-coherence: the planet directing your whole chart is in the sign it rules, in an angular house. What you see is what you get, and it comes through at full strength.',
    };
  }

  // The Broadcast Signal, dignified + angular (usually 10th or 1st)
  if (isDignified && s.houseNature === 'angular') {
    return {
      label: 'The Broadcast Signal',
      tagline: 'Your core identity expresses naturally, and publicly.',
      rationale:
        "Your chart ruler is dignified and placed angularly. The planet at the helm of your chart isn't struggling, it's at home, and it's seen.",
    };
  }

  // The Crucible, debilitated + angular, challenge worked through in public
  if (isDebilitated && s.houseNature === 'angular') {
    return {
      label: 'The Crucible',
      tagline: 'Your core self is forged through public, visible challenge.',
      rationale:
        'Your chart ruler operates against its natural grain, but in a loud house. The challenge is part of the identity, and the growth happens where people can see it.',
    };
  }

  // The Alchemist, debilitated in shadow house (8th or 12th)
  if (isDebilitated && (s.houseNumber === 8 || s.houseNumber === 12)) {
    return {
      label: 'The Alchemist',
      tagline: 'You transform the wound. Quietly, repeatedly, completely.',
      rationale:
        "Your chart ruler sits in one of the chart's deepest houses, under stress from sign placement. The work of your life is turning that pressure into power.",
    };
  }

  // The Natural Mirror, ruler in 7th
  if (s.houseNumber === 7) {
    return {
      label: 'The Natural Mirror',
      tagline: 'You find yourself through the people closest to you.',
      rationale:
        "Your chart ruler lives in the house of partnership. Relationships aren't an add-on, they're the primary surface where your identity gets revealed and tested.",
    };
  }

  // The Hidden Architect, retrograde + cadent
  if (s.retrograde && s.houseNature === 'cadent') {
    return {
      label: 'The Hidden Architect',
      tagline: 'You build your life out of sight.',
      rationale:
        'Your chart ruler is retrograde in a cadent house, two inward signals stacked. Your core expression runs internally first, publicly second (if at all).',
    };
  }

  // The Inward Signature, retrograde alone
  if (s.retrograde) {
    return {
      label: 'The Inward Signature',
      tagline: 'Your core self is processed internally first.',
      rationale:
        'A retrograde chart ruler pulls your primary self-expression inward. You work it out before you show it.',
    };
  }

  // House-specific archetypes (ordered by house, most specific wins)
  if (s.houseNumber === 2) {
    return {
      label: 'The Vault',
      tagline:
        'Your identity is built around what you value, and what you keep.',
      rationale:
        'Your chart ruler lives in the house of resources, self-worth, and the things you hold on to. What you value, you become, and what you build stays built.',
    };
  }

  if (s.houseNumber === 3) {
    return {
      label: 'The Voice',
      tagline: 'Your identity lives in how you speak, write, and translate.',
      rationale:
        'Your chart ruler sits in the house of communication and local mind. Your core self expresses through language, ideas, and the way you connect the dots for other people.',
    };
  }

  if (s.houseNumber === 4) {
    return {
      label: 'The Foundation',
      tagline: 'Your core self is built from the inside out, from home.',
      rationale:
        "Your chart ruler lives in the house of roots, family, and the private inner world. You build outward from a foundation most people never see, and it's that foundation that defines everything else.",
    };
  }

  if (s.houseNumber === 5) {
    return {
      label: 'The Creator',
      tagline: 'You find yourself by making things that weren\u2019t there.',
      rationale:
        'Your chart ruler sits in the house of creativity, play, romance, and children. Your identity expresses through what you bring into being, art, projects, relationships, children of the literal or creative kind.',
    };
  }

  if (s.houseNumber === 6) {
    return {
      label: 'The Craftsperson',
      tagline: 'Your identity lives in the doing, the details, and the craft.',
      rationale:
        'Your chart ruler sits in the house of service, work, and daily practice. You find yourself through skill, repetition, and the quiet pride of doing something well.',
    };
  }

  if (s.houseNumber === 8) {
    return {
      label: 'The Shadow Worker',
      tagline: 'You do the work most people look away from.',
      rationale:
        "Your chart ruler lives in the house of intimacy, transformation, and what's buried. Your core self expresses through the conversations, relationships, and inner work other people avoid.",
    };
  }

  // The Seeker, 9th house
  if (s.houseNumber === 9) {
    return {
      label: 'The Seeker',
      tagline: 'You live through expansion, meaning, and higher ground.',
      rationale:
        'Your chart ruler sits in the house of philosophy, travel, and long-range vision. Your identity expresses through what lies beyond the immediate.',
    };
  }

  if (s.houseNumber === 10) {
    return {
      label: 'The Legacy Builder',
      tagline: 'Your identity is what you build in public, over time.',
      rationale:
        "Your chart ruler lives in the house of career, reputation, and long-arc visibility. You aren't wired for invisibility, you're wired for the record.",
    };
  }

  if (s.houseNumber === 11) {
    return {
      label: 'The Network',
      tagline: 'You find yourself through the people you gather around you.',
      rationale:
        'Your chart ruler sits in the house of friendship, community, and long-range vision. Your identity expresses through the circles you build and the future you can see from inside them.',
    };
  }

  if (s.houseNumber === 12) {
    return {
      label: 'The Threshold',
      tagline: 'Your core self lives just on the other side of the visible.',
      rationale:
        'Your chart ruler sits in the house of the unseen, dream, retreat, surrender, and what comes before form. Your identity expresses through what most people would call intuition, and you would call obvious.',
    };
  }

  // The Underground Current, default for cadent placements (catches any cadent we missed)
  if (s.houseNature === 'cadent') {
    return {
      label: 'The Underground Current',
      tagline: 'Your core expression runs beneath the surface.',
      rationale:
        'Your chart ruler sits in a cadent house, the houses of processing and preparation. Your identity works its way through before it arrives outwardly.',
    };
  }

  // Fallback, positive, non-generic
  return {
    label: 'The Original Signature',
    tagline: 'Your chart ruler tells its own story.',
    rationale:
      'Your chart ruler sits in its own unique combination of sign and house, a configuration that doesn\u2019t map onto a stock archetype. Your identity expression is literally one of one.',
  };
}
