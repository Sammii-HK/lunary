export interface TransitAspect {
  transitPlanet: string;
  natalPlanet: string;
  aspectType: string;
  transitSign: string;
  transitDegree: string;
  natalSign: string;
  natalDegree: string;
  orbDegrees: number;
}

export interface TransitDetail {
  id: string;
  title: string;
  header: string;
  degreeInfo: string;
  intensity: 'Subtle' | 'Strong' | 'Exact';
  meaning: string;
  suggestion: string;
}

type Intensity = 'Subtle' | 'Strong' | 'Exact';

function getIntensity(orb: number): Intensity {
  if (orb <= 1.0) return 'Exact';
  if (orb <= 3.0) return 'Strong';
  return 'Subtle';
}

const DOMAIN_MAP: Record<string, Record<string, string>> = {
  Venus: {
    Mars: 'Relationships & Passion',
    Sun: 'Self-Worth & Visibility',
    Moon: 'Emotional Harmony',
    Mercury: 'Social Connection',
    Jupiter: 'Love & Abundance',
    Saturn: 'Commitment & Values',
    Uranus: 'Unexpected Attraction',
    Neptune: 'Romantic Idealism',
    Pluto: 'Deep Desire',
    Ascendant: 'Personal Magnetism',
    Midheaven: 'Creative Recognition',
  },
  Moon: {
    Saturn: 'Emotional Responsibility',
    Neptune: 'Dreams & Sensitivity',
    Sun: 'Inner & Outer Self',
    Mercury: 'Emotional Communication',
    Venus: 'Emotional Harmony',
    Mars: 'Emotional Drive',
    Jupiter: 'Emotional Expansion',
    Uranus: 'Emotional Awakening',
    Pluto: 'Emotional Depth',
    Ascendant: 'Emotional Presentation',
    Midheaven: 'Public Feelings',
  },
  Mars: {
    Saturn: 'Discipline & Friction',
    Sun: 'Will & Action',
    Moon: 'Emotional Drive',
    Mercury: 'Mental Energy',
    Venus: 'Relationships & Passion',
    Jupiter: 'Expansive Action',
    Uranus: 'Sudden Initiative',
    Neptune: 'Inspired Action',
    Pluto: 'Power & Drive',
    Ascendant: 'Personal Energy',
    Midheaven: 'Career Drive',
  },
  Sun: {
    Moon: 'Inner & Outer Self',
    Mercury: 'Self-Expression',
    Venus: 'Self-Worth & Visibility',
    Mars: 'Will & Action',
    Jupiter: 'Growth & Confidence',
    Saturn: 'Identity & Structure',
    Uranus: 'Authentic Awakening',
    Neptune: 'Spiritual Identity',
    Pluto: 'Personal Power',
    Ascendant: 'Core Identity',
    Midheaven: 'Purpose & Recognition',
  },
  Mercury: {
    Sun: 'Self-Expression',
    Moon: 'Emotional Communication',
    Venus: 'Social Connection',
    Mars: 'Mental Energy',
    Jupiter: 'Expanded Thinking',
    Saturn: 'Structured Thought',
    Uranus: 'Breakthrough Ideas',
    Neptune: 'Intuitive Thought',
    Pluto: 'Deep Insight',
    Ascendant: 'Communication Style',
    Midheaven: 'Professional Voice',
  },
};

const OUTER_PLANET_DOMAINS: Record<string, string> = {
  Jupiter: 'Growth & Opportunity',
  Saturn: 'Lessons & Structure',
  Uranus: 'Change & Liberation',
  Neptune: 'Spirit & Imagination',
  Pluto: 'Deep Transformation',
};

function getDomain(transitPlanet: string, natalPlanet: string): string {
  if (DOMAIN_MAP[transitPlanet]?.[natalPlanet]) {
    return DOMAIN_MAP[transitPlanet][natalPlanet];
  }
  if (DOMAIN_MAP[natalPlanet]?.[transitPlanet]) {
    return DOMAIN_MAP[natalPlanet][transitPlanet];
  }
  if (OUTER_PLANET_DOMAINS[transitPlanet]) {
    return OUTER_PLANET_DOMAINS[transitPlanet];
  }
  if (OUTER_PLANET_DOMAINS[natalPlanet]) {
    return OUTER_PLANET_DOMAINS[natalPlanet];
  }
  return 'Personal Growth';
}

const ASPECT_ENERGY: Record<string, string> = {
  conjunction: 'amplifies and fuses with',
  sextile: 'offers supportive opportunities for',
  trine: 'flows harmoniously with',
  square: 'creates productive tension with',
  opposition: 'seeks balance with',
};

const PLANET_THEMES: Record<string, string> = {
  Sun: 'your core identity and vitality',
  Moon: 'your emotional needs and instincts',
  Mercury: 'your thinking and communication',
  Venus: 'your relationships and values',
  Mars: 'your drive and assertiveness',
  Jupiter: 'your growth and expansion',
  Saturn: 'your responsibilities and boundaries',
  Uranus: 'your need for freedom and change',
  Neptune: 'your dreams and intuition',
  Pluto: 'your personal power and transformation',
  Ascendant: 'how you present yourself',
  Midheaven: 'your public life and career',
};

const ASPECT_MEANINGS: Record<string, Record<string, string>> = {
  conjunction: {
    positive:
      'This blending of energies intensifies both forces, creating a powerful focus.',
    neutral:
      'These energies merge, making it difficult to separate one influence from the other.',
  },
  sextile: {
    positive: 'This supportive aspect opens doors when you take initiative.',
    neutral:
      'Opportunities arise naturally, but require your conscious engagement.',
  },
  trine: {
    positive:
      'Natural ease flows between these areas of life, offering gifts without struggle.',
    neutral:
      'Harmony exists here, though the lack of friction may make growth less urgent.',
  },
  square: {
    positive: 'This creative tension motivates action and breakthrough.',
    neutral: 'Friction between these forces demands adjustment and growth.',
  },
  opposition: {
    positive:
      'Awareness of opposing needs creates opportunity for integration.',
    neutral: 'Balance is required between these two poles of experience.',
  },
};

function buildMeaning(
  transitPlanet: string,
  natalPlanet: string,
  aspectType: string,
): string {
  const transitTheme =
    PLANET_THEMES[transitPlanet] || `${transitPlanet} energy`;
  const natalTheme = PLANET_THEMES[natalPlanet] || `your natal ${natalPlanet}`;
  const aspectAction = ASPECT_ENERGY[aspectType] || 'influences';
  const aspectMeaning =
    ASPECT_MEANINGS[aspectType]?.positive ||
    ASPECT_MEANINGS[aspectType]?.neutral ||
    '';

  const isHarmonic = ['trine', 'sextile', 'conjunction'].includes(aspectType);

  if (aspectType === 'conjunction') {
    return `Transit ${transitPlanet} merges with ${natalTheme}, intensifying this area of your chart. ${aspectMeaning}`;
  }

  if (aspectType === 'opposition') {
    return `Transit ${transitPlanet} illuminates ${natalTheme} from across the zodiac. ${aspectMeaning}`;
  }

  if (isHarmonic) {
    return `Transit ${transitPlanet} ${aspectAction} ${natalTheme}. ${aspectMeaning}`;
  }

  return `Transit ${transitPlanet} ${aspectAction} ${natalTheme}. ${aspectMeaning}`;
}

const SUGGESTIONS: Record<string, Record<string, string[]>> = {
  Venus: {
    default: [
      'Express appreciation to someone you value today.',
      'Make time for beauty, art, or something that brings you pleasure.',
      'Reach out to someone you care about.',
    ],
  },
  Mars: {
    default: [
      'Channel this energy into physical activity or a project you care about.',
      'Take one bold step toward something you want.',
      'Assert your needs clearly but kindly.',
    ],
  },
  Moon: {
    default: [
      'Honour your feelings without judgment today.',
      'Create space for emotional processing.',
      'Nurture yourself or someone close to you.',
    ],
  },
  Sun: {
    default: [
      'Step into your authentic self today.',
      'Let your light shine in one specific area.',
      'Take action that aligns with your core values.',
    ],
  },
  Mercury: {
    default: [
      'Express an idea you have been holding back.',
      'Have an important conversation you have been postponing.',
      'Write down your thoughts to gain clarity.',
    ],
  },
  Jupiter: {
    default: [
      'Say yes to an opportunity that expands your horizons.',
      'Think bigger than usual about what is possible.',
      'Share your optimism with others.',
    ],
  },
  Saturn: {
    default: [
      'Take responsibility for something you have been avoiding.',
      'Create structure where there has been chaos.',
      'Commit to a long-term goal with patience.',
    ],
  },
  Uranus: {
    default: [
      'Try something you have never done before.',
      'Break a routine that no longer serves you.',
      'Embrace the unexpected with curiosity.',
    ],
  },
  Neptune: {
    default: [
      'Make time for imagination, meditation, or creative work.',
      'Trust your intuition on a decision you face.',
      'Connect with something greater than yourself.',
    ],
  },
  Pluto: {
    default: [
      'Face a fear that has been limiting you.',
      'Let go of something that no longer serves your growth.',
      'Look beneath the surface of a situation.',
    ],
  },
};

function buildSuggestion(transitPlanet: string): string {
  const suggestions = SUGGESTIONS[transitPlanet]?.default || [
    'Stay present and open to how this energy wants to move through you.',
  ];
  const index = Math.floor(Math.random() * suggestions.length);
  return suggestions[index];
}

function formatAspectName(aspectType: string): string {
  const names: Record<string, string> = {
    conjunction: 'conjunct',
    sextile: 'sextile',
    trine: 'trine',
    square: 'square',
    opposition: 'opposite',
  };
  return names[aspectType] || aspectType;
}

export function buildTransitDetails(
  aspects: TransitAspect[],
  options?: { maxItems?: number },
): TransitDetail[] {
  const maxItems = options?.maxItems ?? 3;

  if (!aspects || aspects.length === 0) {
    return [];
  }

  const sorted = [...aspects].sort((a, b) => a.orbDegrees - b.orbDegrees);
  const selected = sorted.slice(0, maxItems);

  return selected.map((aspect, index) => {
    const intensity = getIntensity(aspect.orbDegrees);
    const orbRounded = Math.round(aspect.orbDegrees * 10) / 10;
    const aspectName = formatAspectName(aspect.aspectType);

    return {
      id: `transit-${index}-${aspect.transitPlanet}-${aspect.natalPlanet}`,
      title: `${aspect.transitPlanet} ${aspectName} your natal ${aspect.natalPlanet}`,
      header: getDomain(aspect.transitPlanet, aspect.natalPlanet),
      degreeInfo: `${aspect.transitPlanet} at ${aspect.transitDegree} ${aspectName} ${aspect.natalPlanet} at ${aspect.natalDegree} (${orbRounded}° orb)`,
      intensity,
      meaning: buildMeaning(
        aspect.transitPlanet,
        aspect.natalPlanet,
        aspect.aspectType,
      ),
      suggestion: buildSuggestion(aspect.transitPlanet),
    };
  });
}
