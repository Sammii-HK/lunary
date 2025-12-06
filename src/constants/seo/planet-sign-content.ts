// Content database for Planet in Sign combinations
// 12 planets × 12 signs = 144 unique pages

export interface PlanetSignContent {
  planet: string;
  sign: string;
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  meaning: string;
  strengths: string[];
  challenges: string[];
  advice: string;
}

// Planet descriptions for content generation
export const planetDescriptions: Record<
  string,
  { name: string; themes: string; rules: string }
> = {
  sun: {
    name: 'Sun',
    themes: 'core identity, ego, vitality, life purpose',
    rules: 'Leo',
  },
  moon: {
    name: 'Moon',
    themes: 'emotions, instincts, nurturing, inner needs',
    rules: 'Cancer',
  },
  mercury: {
    name: 'Mercury',
    themes: 'communication, thinking, learning, intellect',
    rules: 'Gemini and Virgo',
  },
  venus: {
    name: 'Venus',
    themes: 'love, beauty, pleasure, values, relationships',
    rules: 'Taurus and Libra',
  },
  mars: {
    name: 'Mars',
    themes: 'action, drive, passion, aggression, energy',
    rules: 'Aries',
  },
  jupiter: {
    name: 'Jupiter',
    themes: 'expansion, luck, wisdom, abundance, growth',
    rules: 'Sagittarius',
  },
  saturn: {
    name: 'Saturn',
    themes: 'discipline, structure, responsibility, limitations',
    rules: 'Capricorn',
  },
  uranus: {
    name: 'Uranus',
    themes: 'innovation, rebellion, sudden change, originality',
    rules: 'Aquarius',
  },
  neptune: {
    name: 'Neptune',
    themes: 'dreams, intuition, spirituality, illusion',
    rules: 'Pisces',
  },
  pluto: {
    name: 'Pluto',
    themes: 'transformation, power, rebirth, the unconscious',
    rules: 'Scorpio',
  },
  chiron: {
    name: 'Chiron',
    themes: 'wounds, healing, teaching, wisdom through pain',
    rules: 'associated with Virgo and Sagittarius',
  },
  'north-node': {
    name: 'North Node',
    themes: 'life purpose, karmic direction, soul growth',
    rules: 'no sign (point of destiny)',
  },
};

// Sign descriptions for content generation
export const signDescriptions: Record<
  string,
  {
    name: string;
    element: string;
    modality: string;
    traits: string;
    ruler: string;
  }
> = {
  aries: {
    name: 'Aries',
    element: 'Fire',
    modality: 'Cardinal',
    traits: 'bold, pioneering, competitive, independent',
    ruler: 'Mars',
  },
  taurus: {
    name: 'Taurus',
    element: 'Earth',
    modality: 'Fixed',
    traits: 'stable, sensual, determined, practical',
    ruler: 'Venus',
  },
  gemini: {
    name: 'Gemini',
    element: 'Air',
    modality: 'Mutable',
    traits: 'curious, adaptable, communicative, quick-witted',
    ruler: 'Mercury',
  },
  cancer: {
    name: 'Cancer',
    element: 'Water',
    modality: 'Cardinal',
    traits: 'nurturing, emotional, protective, intuitive',
    ruler: 'Moon',
  },
  leo: {
    name: 'Leo',
    element: 'Fire',
    modality: 'Fixed',
    traits: 'confident, creative, generous, dramatic',
    ruler: 'Sun',
  },
  virgo: {
    name: 'Virgo',
    element: 'Earth',
    modality: 'Mutable',
    traits: 'analytical, practical, helpful, detail-oriented',
    ruler: 'Mercury',
  },
  libra: {
    name: 'Libra',
    element: 'Air',
    modality: 'Cardinal',
    traits: 'harmonious, diplomatic, fair, relationship-focused',
    ruler: 'Venus',
  },
  scorpio: {
    name: 'Scorpio',
    element: 'Water',
    modality: 'Fixed',
    traits: 'intense, transformative, passionate, mysterious',
    ruler: 'Pluto (traditional: Mars)',
  },
  sagittarius: {
    name: 'Sagittarius',
    element: 'Fire',
    modality: 'Mutable',
    traits: 'adventurous, philosophical, optimistic, freedom-loving',
    ruler: 'Jupiter',
  },
  capricorn: {
    name: 'Capricorn',
    element: 'Earth',
    modality: 'Cardinal',
    traits: 'ambitious, disciplined, responsible, practical',
    ruler: 'Saturn',
  },
  aquarius: {
    name: 'Aquarius',
    element: 'Air',
    modality: 'Fixed',
    traits: 'innovative, humanitarian, independent, unconventional',
    ruler: 'Uranus (traditional: Saturn)',
  },
  pisces: {
    name: 'Pisces',
    element: 'Water',
    modality: 'Mutable',
    traits: 'intuitive, compassionate, artistic, dreamy',
    ruler: 'Neptune (traditional: Jupiter)',
  },
};

// Generate content for a planet-sign combination
export function generatePlanetSignContent(
  planetKey: string,
  signKey: string,
): PlanetSignContent {
  const planet = planetDescriptions[planetKey];
  const sign = signDescriptions[signKey];

  if (!planet || !sign) {
    throw new Error(`Invalid planet (${planetKey}) or sign (${signKey})`);
  }

  const slug = `${planetKey}-in-${signKey}`;
  const title = `${planet.name} in ${sign.name}: Meaning & Personality Traits`;

  return {
    planet: planet.name,
    sign: sign.name,
    slug,
    title,
    description: `Discover what ${planet.name} in ${sign.name} means in your birth chart. Learn about personality traits, strengths, challenges, and how this placement affects ${planet.themes}.`,
    keywords: [
      `${planet.name.toLowerCase()} in ${sign.name.toLowerCase()}`,
      `${planet.name.toLowerCase()} in ${sign.name.toLowerCase()} meaning`,
      `${planet.name.toLowerCase()} in ${sign.name.toLowerCase()} personality`,
      `${planet.name.toLowerCase()} ${sign.name.toLowerCase()} natal`,
      `${sign.name.toLowerCase()} ${planet.name.toLowerCase()}`,
    ],
    meaning: generateMeaning(planet, sign),
    strengths: generateStrengths(planet, sign),
    challenges: generateChallenges(planet, sign),
    advice: generateAdvice(planet, sign),
  };
}

function generateMeaning(
  planet: { name: string; themes: string; rules: string },
  sign: { name: string; element: string; modality: string; traits: string },
): string {
  return `When ${planet.name} is placed in ${sign.name} in your birth chart, it colors your expression of ${planet.themes} with the ${sign.element} element's energy and ${sign.name}'s ${sign.traits} nature.

${planet.name} represents ${planet.themes} in astrology. In ${sign.name}, these themes take on a distinctly ${sign.modality.toLowerCase()} ${sign.element.toLowerCase()} quality, meaning you approach ${planet.themes.split(',')[0]} in a ${sign.traits.split(',')[0]} way.

This placement suggests that your ${planet.themes.split(',')[0]} is expressed through ${sign.name}'s lens—${sign.traits}. The ${sign.element} element brings ${sign.element === 'Fire' ? 'passion and enthusiasm' : sign.element === 'Earth' ? 'practicality and groundedness' : sign.element === 'Air' ? 'intellect and communication' : 'emotion and intuition'} to how you experience ${planet.name}'s domain.`;
}

function generateStrengths(
  planet: { name: string; themes: string },
  sign: { name: string; traits: string; element: string },
): string[] {
  const traits = sign.traits.split(', ');
  return [
    `${traits[0].charAt(0).toUpperCase() + traits[0].slice(1)} approach to ${planet.themes.split(',')[0]}`,
    `Natural ${sign.element.toLowerCase()} element gifts enhance ${planet.name}'s expression`,
    `${sign.name} energy brings ${traits[1]} qualities to ${planet.name} matters`,
    `Strong ${traits[2]} nature supports growth in ${planet.name}'s areas`,
  ];
}

function generateChallenges(
  planet: { name: string; themes: string },
  sign: { name: string; traits: string; element: string },
): string[] {
  const elementChallenges: Record<string, string> = {
    Fire: 'impulsiveness or burnout',
    Earth: 'stubbornness or resistance to change',
    Air: 'overthinking or emotional detachment',
    Water: 'emotional overwhelm or escapism',
  };

  return [
    `May struggle with ${elementChallenges[sign.element]} in ${planet.name} matters`,
    `${sign.name}'s shadow side can complicate ${planet.themes.split(',')[0]}`,
    `Learning to balance ${sign.name} traits with other chart influences`,
    `Integrating ${planet.name}'s lessons through ${sign.name}'s growth edges`,
  ];
}

function generateAdvice(
  planet: { name: string; themes: string },
  sign: { name: string; traits: string; element: string },
): string {
  return `To make the most of your ${planet.name} in ${sign.name} placement, embrace ${sign.name}'s natural strengths while remaining aware of potential shadow expressions. Use the ${sign.element} element's gifts—${sign.element === 'Fire' ? 'passion and courage' : sign.element === 'Earth' ? 'patience and persistence' : sign.element === 'Air' ? 'objectivity and communication' : 'intuition and empathy'}—to enhance your ${planet.themes.split(',')[0]}. Remember that this placement is one part of your complete birth chart, and other factors will also influence how you express ${planet.name}'s energy.`;
}

// Get all valid planet keys
export const planetKeys = Object.keys(planetDescriptions);

// Get all valid sign keys
export const signKeys = Object.keys(signDescriptions);

// Generate all combinations for sitemap
export function getAllPlanetSignSlugs(): string[] {
  const slugs: string[] = [];
  for (const planet of planetKeys) {
    for (const sign of signKeys) {
      slugs.push(`${planet}-in-${sign}`);
    }
  }
  return slugs;
}
