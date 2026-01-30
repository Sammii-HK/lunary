export interface TransitAspect {
  transitPlanet: string;
  natalPlanet: string;
  aspectType: string;
  transitSign: string;
  transitDegree: string;
  natalSign: string;
  natalDegree: string;
  orbDegrees: number;
  house?: number;
  duration?: {
    totalDays: number;
    remainingDays: number;
    displayText: string;
  };
}

export type IntensityLevel =
  | 'Mild'
  | 'Noticeable'
  | 'Highly Prominent'
  | 'Life-Defining';

export type ThemeTag =
  | 'Identity'
  | 'Creativity'
  | 'Boundaries'
  | 'Love'
  | 'Work'
  | 'Healing'
  | 'Transformation'
  | 'Communication'
  | 'Growth'
  | 'Intuition'
  | 'Power'
  | 'Freedom';

export interface TransitPremiumDetail {
  houseSummary?: string;
  natalContext?: string;
  orbExplanation?: string;
  timingSummary?: string;
  stackingNotes?: string;
  pastPattern?: string;
}

export interface TransitDetail {
  id: string;
  title: string;
  header: string;
  degreeInfo: string;
  intensity: 'Subtle' | 'Strong' | 'Exact';
  intensityLevel: IntensityLevel;
  themes: ThemeTag[];
  meaning: string;
  suggestion: string;
  premium?: TransitPremiumDetail;
  duration?: {
    totalDays: number;
    remainingDays: number;
    displayText: string;
  };
}

type Intensity = 'Subtle' | 'Strong' | 'Exact';

function getIntensity(orb: number): Intensity {
  if (orb <= 1.0) return 'Exact';
  if (orb <= 3.0) return 'Strong';
  return 'Subtle';
}

const PLANET_WEIGHT: Record<string, number> = {
  Sun: 3,
  Moon: 3,
  Mercury: 2,
  Venus: 2,
  Mars: 2,
  Jupiter: 3,
  Saturn: 4,
  Uranus: 4,
  Neptune: 4,
  Pluto: 5,
  Ascendant: 3,
  Midheaven: 3,
};

function getIntensityLevel(
  orb: number,
  transitPlanet: string,
  natalPlanet: string,
): IntensityLevel {
  const transitWeight = PLANET_WEIGHT[transitPlanet] || 2;
  const natalWeight = PLANET_WEIGHT[natalPlanet] || 2;
  const maxWeight = Math.max(transitWeight, natalWeight);

  const orbScore = orb <= 1 ? 4 : orb <= 2 ? 3 : orb <= 4 ? 2 : 1;
  const totalScore = orbScore + maxWeight;

  if (totalScore >= 8) return 'Life-Defining';
  if (totalScore >= 6) return 'Highly Prominent';
  if (totalScore >= 4) return 'Noticeable';
  return 'Mild';
}

const PLANET_THEME_TAGS: Record<string, ThemeTag[]> = {
  Sun: ['Identity', 'Power', 'Creativity'],
  Moon: ['Healing', 'Intuition'],
  Mercury: ['Communication'],
  Venus: ['Love', 'Creativity'],
  Mars: ['Power', 'Work'],
  Jupiter: ['Growth', 'Freedom'],
  Saturn: ['Boundaries', 'Work'],
  Uranus: ['Freedom', 'Transformation'],
  Neptune: ['Intuition', 'Healing'],
  Pluto: ['Transformation', 'Power'],
  Ascendant: ['Identity'],
  Midheaven: ['Work', 'Identity'],
};

const ASPECT_THEME_MODIFIER: Record<string, ThemeTag[]> = {
  conjunction: ['Power'],
  opposition: ['Boundaries'],
  square: ['Growth', 'Transformation'],
  trine: ['Creativity', 'Growth'],
  sextile: ['Communication', 'Growth'],
};

function getThemeTags(
  transitPlanet: string,
  natalPlanet: string,
  aspectType: string,
): ThemeTag[] {
  const themes = new Set<ThemeTag>();

  (PLANET_THEME_TAGS[transitPlanet] || []).forEach((t) => themes.add(t));
  (PLANET_THEME_TAGS[natalPlanet] || []).forEach((t) => themes.add(t));
  (ASPECT_THEME_MODIFIER[aspectType] || []).forEach((t) => themes.add(t));

  return Array.from(themes).slice(0, 3);
}

function buildPastPattern(
  transitPlanet: string,
  natalPlanet: string,
  aspectType: string,
): string {
  const outerPlanets = ['Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const isOuterTransit = outerPlanets.includes(transitPlanet);

  if (!isOuterTransit) {
    return `This ${transitPlanet} transit recurs monthly, offering regular opportunities to work with these themes.`;
  }

  const cycles: Record<string, string> = {
    Saturn:
      'roughly every 7 years when Saturn makes major aspects to this point',
    Uranus: 'roughly every 21 years when Uranus aspects this placement',
    Neptune:
      'roughly every 40+ years, making this a rare and significant influence',
    Pluto:
      'once or twice in a lifetime, marking a profound transformational period',
  };

  return `This transit occurs ${cycles[transitPlanet] || 'periodically'}. Reflect on similar themes from past cycles.`;
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

const HOUSE_THEMES: Record<number, string> = {
  1: 'identity, appearance, how you meet the world',
  2: 'resources, money, self-worth',
  3: 'communication, local environment, learning',
  4: 'home, roots, emotional foundations',
  5: 'creativity, romance, joy',
  6: 'work, routines, health',
  7: 'partnerships, contracts, long-term commitments',
  8: 'intimacy, shared resources, transformation',
  9: 'beliefs, travel, higher learning',
  10: 'career, public life, reputation',
  11: 'friends, networks, collective projects',
  12: 'rest, the unconscious, spiritual retreat',
};

function buildHouseSummary(house?: number): string | undefined {
  if (!house || !HOUSE_THEMES[house]) return undefined;
  return `This transit activates your ${house}${getOrdinalSuffix(house)} house, highlighting ${HOUSE_THEMES[house]}.`;
}

function getOrdinalSuffix(n: number): string {
  if (n === 11 || n === 12 || n === 13) return 'th';
  const lastDigit = n % 10;
  if (lastDigit === 1) return 'st';
  if (lastDigit === 2) return 'nd';
  if (lastDigit === 3) return 'rd';
  return 'th';
}

const SIGN_EXPRESSIONS: Record<string, string> = {
  Aries: 'through bold initiative and direct action',
  Taurus: 'through patience, stability, and sensory grounding',
  Gemini: 'through curiosity, communication, and mental agility',
  Cancer: 'through nurturing, emotional depth, and protective care',
  Leo: 'through creative self-expression and warm generosity',
  Virgo: 'through analysis, practical care, and attention to detail',
  Libra: 'through harmony, relationship, and aesthetic balance',
  Scorpio: 'through intensity, emotional depth, and transformative focus',
  Sagittarius:
    'through expansive vision, optimism, and philosophical exploration',
  Capricorn: 'through discipline, ambition, and long-term commitment',
  Aquarius: 'through innovation, independence, and collective vision',
  Pisces: 'through intuition, compassion, and spiritual sensitivity',
};

const PLANET_NATAL_VERBS: Record<string, string> = {
  Sun: 'expresses identity',
  Moon: 'processes emotion',
  Mercury: 'thinks and communicates',
  Venus: 'relates and values',
  Mars: 'asserts and acts',
  Jupiter: 'expands and believes',
  Saturn: 'structures and commits',
  Uranus: 'innovates and liberates',
  Neptune: 'imagines and dissolves',
  Pluto: 'transforms and empowers',
  Ascendant: 'presents itself',
  Midheaven: 'aims publicly',
};

function buildNatalContext(planet: string, sign: string): string {
  const verb = PLANET_NATAL_VERBS[planet] || 'expresses itself';
  const expression = SIGN_EXPRESSIONS[sign] || 'in its own unique way';
  return `Your natal ${planet} in ${sign} ${verb} ${expression}.`;
}

function buildOrbExplanation(orb: number, intensity: Intensity): string {
  if (orb <= 1.0) {
    return `With an orb under 1°, this transit is exact and highly noticeable today.`;
  }
  if (orb <= 3.0) {
    return `With a moderately tight orb of ${Math.round(orb * 10) / 10}°, this energy is strong but not overwhelming.`;
  }
  return `With a wider orb of ${Math.round(orb * 10) / 10}°, this influence is present in the background rather than at peak intensity.`;
}

function buildTimingSummary(intensity: Intensity): string {
  if (intensity === 'Exact') {
    return 'Exact influence today. You may feel this most strongly over a one to two day window.';
  }
  if (intensity === 'Strong') {
    return 'Strong influence across a three to five day window.';
  }
  return 'Subtle influence that colours a longer period rather than a single day.';
}

function detectStacking(
  aspects: TransitAspect[],
  selectedIndices: number[],
): Map<number, string> {
  const stackingNotes = new Map<number, string>();

  const planetCounts = new Map<string, number[]>();
  const houseCounts = new Map<number, number[]>();

  selectedIndices.forEach((idx) => {
    const aspect = aspects[idx];
    const planet = aspect.natalPlanet;
    if (!planetCounts.has(planet)) {
      planetCounts.set(planet, []);
    }
    planetCounts.get(planet)!.push(idx);

    if (aspect.house) {
      if (!houseCounts.has(aspect.house)) {
        houseCounts.set(aspect.house, []);
      }
      houseCounts.get(aspect.house)!.push(idx);
    }
  });

  planetCounts.forEach((indices, planet) => {
    if (indices.length > 1) {
      const theme = PLANET_THEMES[planet] || `${planet} themes`;
      indices.forEach((idx) => {
        const existing = stackingNotes.get(idx) || '';
        const note = `Another transit is also activating your natal ${planet}, so themes of ${theme.replace('your ', '')} are especially highlighted.`;
        stackingNotes.set(idx, existing ? `${existing} ${note}` : note);
      });
    }
  });

  houseCounts.forEach((indices, house) => {
    if (indices.length > 1) {
      const theme = HOUSE_THEMES[house] || 'this life area';
      indices.forEach((idx) => {
        const existing = stackingNotes.get(idx) || '';
        const note = `Multiple transits currently activate your ${house}${getOrdinalSuffix(house)} house, drawing attention to ${theme}.`;
        stackingNotes.set(idx, existing ? `${existing} ${note}` : note);
      });
    }
  });

  return stackingNotes;
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
  const selectedIndices = selected.map((_, i) => i);

  const stackingNotes = detectStacking(selected, selectedIndices);

  return selected.map((aspect, index) => {
    const intensity = getIntensity(aspect.orbDegrees);
    const intensityLevel = getIntensityLevel(
      aspect.orbDegrees,
      aspect.transitPlanet,
      aspect.natalPlanet,
    );
    const themes = getThemeTags(
      aspect.transitPlanet,
      aspect.natalPlanet,
      aspect.aspectType,
    );
    const orbRounded = Math.round(aspect.orbDegrees * 10) / 10;
    const aspectName = formatAspectName(aspect.aspectType);

    const premium: TransitPremiumDetail = {
      houseSummary: buildHouseSummary(aspect.house),
      natalContext: buildNatalContext(aspect.natalPlanet, aspect.natalSign),
      orbExplanation: buildOrbExplanation(aspect.orbDegrees, intensity),
      timingSummary: buildTimingSummary(intensity),
      stackingNotes: stackingNotes.get(index),
      pastPattern: buildPastPattern(
        aspect.transitPlanet,
        aspect.natalPlanet,
        aspect.aspectType,
      ),
    };

    return {
      id: `transit-${index}-${aspect.transitPlanet}-${aspect.natalPlanet}`,
      title: `${aspect.transitPlanet} ${aspectName} your natal ${aspect.natalPlanet}`,
      header: getDomain(aspect.transitPlanet, aspect.natalPlanet),
      degreeInfo: `${aspect.transitPlanet} at ${aspect.transitDegree} ${aspectName} ${aspect.natalPlanet} at ${aspect.natalDegree} (${orbRounded}° orb)`,
      intensity,
      intensityLevel,
      themes,
      meaning: buildMeaning(
        aspect.transitPlanet,
        aspect.natalPlanet,
        aspect.aspectType,
      ),
      suggestion: buildSuggestion(aspect.transitPlanet),
      premium,
      duration: aspect.duration,
    };
  });
}
