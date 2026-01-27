export const PLANETS = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
] as const;

export type Planet = (typeof PLANETS)[number];

export const PLANET_DISPLAY: Record<Planet, string> = {
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluto',
};

export const PLANET_SYMBOLS: Record<Planet, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
};

export const ASPECTS = [
  'conjunct',
  'sextile',
  'square',
  'trine',
  'opposite',
  'quincunx',
  'semisextile',
] as const;

export type Aspect = (typeof ASPECTS)[number];

export const ASPECT_DATA: Record<
  Aspect,
  {
    displayName: string;
    symbol: string;
    degrees: number;
    nature: 'harmonious' | 'challenging' | 'neutral';
    keywords: string[];
    description: string;
  }
> = {
  conjunct: {
    displayName: 'Conjunction',
    symbol: '☌',
    degrees: 0,
    nature: 'neutral',
    keywords: ['fusion', 'intensity', 'focus', 'blending'],
    description:
      'A conjunction occurs when two planets occupy the same degree. This creates a fusion of energies, intensifying and blending their qualities.',
  },
  sextile: {
    displayName: 'Sextile',
    symbol: '⚹',
    degrees: 60,
    nature: 'harmonious',
    keywords: ['opportunity', 'talent', 'ease', 'communication'],
    description:
      'A sextile is a harmonious aspect of 60 degrees that creates opportunities and natural talents when activated consciously.',
  },
  square: {
    displayName: 'Square',
    symbol: '□',
    degrees: 90,
    nature: 'challenging',
    keywords: ['tension', 'action', 'conflict', 'growth'],
    description:
      'A square is a challenging aspect of 90 degrees that creates tension and friction, driving action and personal growth.',
  },
  trine: {
    displayName: 'Trine',
    symbol: '△',
    degrees: 120,
    nature: 'harmonious',
    keywords: ['flow', 'ease', 'gifts', 'natural ability'],
    description:
      'A trine is the most harmonious aspect at 120 degrees, creating natural flow and innate talents that come effortlessly.',
  },
  opposite: {
    displayName: 'Opposition',
    symbol: '☍',
    degrees: 180,
    nature: 'challenging',
    keywords: ['polarity', 'balance', 'awareness', 'projection'],
    description:
      'An opposition at 180 degrees creates a polarity between two planets, requiring balance and integration of opposite energies.',
  },
  quincunx: {
    displayName: 'Quincunx',
    symbol: '⚻',
    degrees: 150,
    nature: 'challenging',
    keywords: ['adjustment', 'discomfort', 'integration', 'fine-tuning'],
    description:
      'A quincunx at 150 degrees creates subtle friction between planets that share no natural connection, requiring constant adjustment and adaptation.',
  },
  semisextile: {
    displayName: 'Semi-Sextile',
    symbol: '⚺',
    degrees: 30,
    nature: 'harmonious',
    keywords: ['growth', 'potential', 'subtle opportunity', 'adjacent signs'],
    description:
      'A semi-sextile at 30 degrees connects planets in adjacent signs, creating minor but helpful connections that support gradual development.',
  },
};

export interface AspectInterpretation {
  planet1: Planet;
  aspect: Aspect;
  planet2: Planet;
  title: string;
  summary: string;
  keywords: string[];
  inNatal: string;
  inTransit: string;
  inSynastry: string;
}

export function getAspectInterpretation(
  planet1: Planet,
  aspect: Aspect,
  planet2: Planet,
): AspectInterpretation {
  const p1 = PLANET_DISPLAY[planet1];
  const p2 = PLANET_DISPLAY[planet2];
  const aspectData = ASPECT_DATA[aspect];

  const interpretations: Record<
    string,
    { natal: string; transit: string; synastry: string }
  > = {
    'sun-conjunct-moon': {
      natal:
        'A Sun conjunct Moon in the natal chart indicates strong alignment between conscious will and emotional needs. The personality is unified and self-aware.',
      transit:
        'When the transiting Sun conjuncts natal Moon, emotions are highlighted and there is increased self-awareness about emotional patterns.',
      synastry:
        'In synastry, Sun conjunct Moon creates deep emotional understanding and natural compatibility between partners.',
    },
    'venus-square-mars': {
      natal:
        'Venus square Mars creates passionate tension between love and desire. This aspect brings intensity to relationships and creative pursuits.',
      transit:
        'Transiting Venus square Mars heightens romantic tension and may bring conflicts between what you want and what you need in love.',
      synastry:
        'In synastry, Venus square Mars indicates strong physical attraction with potential for passionate conflicts.',
    },
    default: {
      natal: `${p1} ${aspectData.displayName.toLowerCase()} ${p2} in the natal chart creates a ${aspectData.nature} dynamic between ${p1.toLowerCase()} energy (${getKeywordsForPlanet(planet1)}) and ${p2.toLowerCase()} energy (${getKeywordsForPlanet(planet2)}).`,
      transit: `When transiting ${p1} forms a ${aspectData.displayName.toLowerCase()} to natal ${p2}, expect ${aspectData.nature === 'harmonious' ? 'opportunities' : 'challenges'} related to ${getThemesForPlanet(planet2)}.`,
      synastry: `In synastry, ${p1} ${aspectData.displayName.toLowerCase()} ${p2} indicates ${aspectData.nature === 'harmonious' ? 'natural harmony' : 'dynamic tension'} between partners regarding ${getThemesForPlanet(planet1)} and ${getThemesForPlanet(planet2)}.`,
    },
  };

  const key = `${planet1}-${aspect}-${planet2}`;
  const interp = interpretations[key] || interpretations.default;

  return {
    planet1,
    aspect,
    planet2,
    title: `${p1} ${aspectData.displayName} ${p2}`,
    summary: `${p1} ${aspectData.displayName.toLowerCase()} ${p2} is a ${aspectData.nature} aspect that ${aspectData.nature === 'harmonious' ? 'facilitates' : 'challenges'} the integration of ${p1.toLowerCase()} and ${p2.toLowerCase()} energies.`,
    keywords: [...aspectData.keywords, p1.toLowerCase(), p2.toLowerCase()],
    inNatal: interp.natal,
    inTransit: interp.transit,
    inSynastry: interp.synastry,
  };
}

function getKeywordsForPlanet(planet: Planet): string {
  const keywords: Record<Planet, string> = {
    sun: 'identity, vitality, ego',
    moon: 'emotions, instincts, nurturing',
    mercury: 'communication, thinking, learning',
    venus: 'love, beauty, values',
    mars: 'action, drive, passion',
    jupiter: 'expansion, wisdom, luck',
    saturn: 'structure, discipline, lessons',
    uranus: 'innovation, freedom, change',
    neptune: 'dreams, intuition, spirituality',
    pluto: 'transformation, power, rebirth',
  };
  return keywords[planet];
}

function getThemesForPlanet(planet: Planet): string {
  const themes: Record<Planet, string> = {
    sun: 'self-expression and life purpose',
    moon: 'emotional security and comfort',
    mercury: 'communication and mental processes',
    venus: 'relationships and personal values',
    mars: 'motivation and assertiveness',
    jupiter: 'growth and opportunities',
    saturn: 'responsibilities and limitations',
    uranus: 'independence and originality',
    neptune: 'imagination and spirituality',
    pluto: 'personal power and transformation',
  };
  return themes[planet];
}

export function generateAllAspectParams(): {
  planet1: string;
  aspect: string;
  planet2: string;
}[] {
  const params: { planet1: string; aspect: string; planet2: string }[] = [];

  for (let i = 0; i < PLANETS.length; i++) {
    for (let j = i + 1; j < PLANETS.length; j++) {
      for (const aspect of ASPECTS) {
        params.push({
          planet1: PLANETS[i],
          aspect,
          planet2: PLANETS[j],
        });
      }
    }
  }

  return params;
}
