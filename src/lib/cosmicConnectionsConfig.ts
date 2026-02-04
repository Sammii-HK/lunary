import {
  ZODIAC_CORRESPONDENCES,
  PLANETARY_CORRESPONDENCES,
  TAROT_MAJOR_ARCANA_CORRESPONDENCES,
} from '@/constants/entity-relationships';
import {
  HOUSES,
  getTarotForPlanetOrSign,
  getElementForSign,
} from '@/constants/seo/cosmic-ontology';

export interface CosmicConnectionLink {
  label: string;
  href: string;
}

export interface CosmicConnectionSection {
  title: string;
  links: CosmicConnectionLink[];
}

export type EntityType =
  | 'sign'
  | 'planet'
  | 'house'
  | 'placement'
  | 'aspect'
  | 'moon'
  | 'tarot'
  | 'crystal'
  | 'glossary-term'
  | 'hub-transits'
  | 'hub-moon'
  | 'hub-placements'
  | 'hub-glossary'
  | 'hub-horoscopes'
  | 'archetype'
  | 'witchcraft'
  | 'hub-events'
  | 'angel-number'
  | 'rising'
  | 'compatibility'
  | 'double-hour';

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/\s+/g, '-');
}

const HOUSE_NUMBER_TO_SLUG: Record<number, string> = {
  1: 'first',
  2: 'second',
  3: 'third',
  4: 'fourth',
  5: 'fifth',
  6: 'sixth',
  7: 'seventh',
  8: 'eighth',
  9: 'ninth',
  10: 'tenth',
  11: 'eleventh',
  12: 'twelfth',
};

const SLUG_TO_HOUSE_NUMBER: Record<string, number> = Object.fromEntries(
  Object.entries(HOUSE_NUMBER_TO_SLUG).map(([k, v]) => [v, parseInt(k)]),
);

function getSignConnections(signKey: string): CosmicConnectionSection[] {
  const signLower = signKey.toLowerCase();
  const signData = ZODIAC_CORRESPONDENCES[signLower];
  const signName = signLower.charAt(0).toUpperCase() + signLower.slice(1);
  const element = getElementForSign(signLower);

  const sections: CosmicConnectionSection[] = [];

  const coreAstrology: CosmicConnectionLink[] = [
    { label: 'All Zodiac Signs', href: '/grimoire/zodiac' },
    {
      label: 'Birth Chart Guide',
      href: '/grimoire/guides/birth-chart-complete-guide',
    },
  ];

  if (signData?.rulingPlanet) {
    coreAstrology.push({
      label: `${signData.rulingPlanet} (Ruling Planet)`,
      href: `/grimoire/astronomy/planets/${signData.rulingPlanet.toLowerCase()}`,
    });
  }

  if (element) {
    coreAstrology.push({
      label: `${element.name} Element`,
      href: `/grimoire/correspondences/elements/${element.name.toLowerCase()}`,
    });
  }

  sections.push({ title: 'Core Astrology', links: coreAstrology.slice(0, 4) });

  const placements: CosmicConnectionLink[] = [
    {
      label: `Sun in ${signName}`,
      href: `/grimoire/placements/sun-in-${signLower}`,
    },
    {
      label: `Moon in ${signName}`,
      href: `/grimoire/placements/moon-in-${signLower}`,
    },
    { label: `Rising in ${signName}`, href: `/grimoire/moon-in/${signLower}` },
    { label: 'All Placements', href: '/grimoire/placements' },
  ];
  sections.push({
    title: `Placements in ${signName}`,
    links: placements.slice(0, 4),
  });

  const tools: CosmicConnectionLink[] = [
    {
      label: `${signName} Daily Horoscope`,
      href: `/grimoire/horoscopes/${signLower}`,
    },
    { label: 'Weekly Horoscope', href: '/grimoire/horoscopes/weekly' },
  ];

  if (signData?.crystals?.[0]) {
    tools.push({
      label: `Crystals for ${signName}`,
      href: `/grimoire/crystals/${toSlug(signData.crystals[0])}`,
    });
  }

  const tarotCorr = getTarotForPlanetOrSign(signLower);
  if (tarotCorr) {
    tools.push({ label: tarotCorr.card, href: tarotCorr.cardUrl });
  }

  sections.push({ title: 'Horoscopes & Tools', links: tools.slice(0, 4) });

  return sections;
}

function getPlanetConnections(planetKey: string): CosmicConnectionSection[] {
  const planetLower = planetKey.toLowerCase();
  const planetData = PLANETARY_CORRESPONDENCES[planetLower];
  const planetName = planetLower.charAt(0).toUpperCase() + planetLower.slice(1);

  const sections: CosmicConnectionSection[] = [];

  const aboutPlanet: CosmicConnectionLink[] = [
    { label: 'All Planets', href: '/grimoire/astronomy/planets' },
    { label: 'Astronomy Guide', href: '/grimoire/astronomy' },
  ];

  if (planetData?.rulesZodiac) {
    planetData.rulesZodiac.slice(0, 2).forEach((sign) => {
      aboutPlanet.push({
        label: `${sign} (Ruled by ${planetName})`,
        href: `/grimoire/zodiac/${sign.toLowerCase()}`,
      });
    });
  }

  sections.push({ title: 'About This Planet', links: aboutPlanet.slice(0, 4) });

  const planetNotSun = planetLower === 'sun' ? 'Saturn' : planetName;

  const placementsTransits: CosmicConnectionLink[] = [
    { label: `${planetName} in Signs`, href: '/grimoire/placements' },
    { label: 'Transits Hub', href: '/grimoire/transits' },
    {
      label: `${planetNotSun} Retrograde`,
      href: `/grimoire/astronomy/retrogrades/${planetNotSun.toLowerCase()}`,
    },
    { label: 'Current Forecast', href: '/forecast' },
  ];
  sections.push({
    title: 'Placements & Transits',
    links: placementsTransits.slice(0, 4),
  });

  const deepen: CosmicConnectionLink[] = [
    {
      label: 'Birth Chart Guide',
      href: '/grimoire/guides/birth-chart-complete-guide',
    },
    { label: 'Calculate Birth Chart', href: '/birth-chart' },
  ];

  if (planetData?.tarotCard) {
    deepen.push({ label: planetData.tarotCard, href: planetData.tarotUrl });
  }

  sections.push({ title: 'Deepen Your Chart', links: deepen.slice(0, 3) });

  return sections;
}

function getHouseConnections(houseKey: string): CosmicConnectionSection[] {
  const houseNumber =
    SLUG_TO_HOUSE_NUMBER[houseKey.toLowerCase()] || parseInt(houseKey);
  const houseData = HOUSES[houseNumber];

  const sections: CosmicConnectionSection[] = [];

  const basics: CosmicConnectionLink[] = [
    { label: 'All Houses', href: '/grimoire/houses' },
    { label: 'Houses Explained', href: '/grimoire/birth-chart' },
    {
      label: 'Birth Chart Guide',
      href: '/grimoire/guides/birth-chart-complete-guide',
    },
  ];
  sections.push({ title: 'House Basics', links: basics });

  const planets: CosmicConnectionLink[] = [
    { label: 'Planets in Houses', href: '/grimoire/houses' },
    { label: 'Calculate Birth Chart', href: '/birth-chart' },
  ];

  if (houseData?.naturalSign) {
    planets.push({
      label: `${houseData.naturalSign} (Natural Sign)`,
      href: `/grimoire/zodiac/${houseData.naturalSign.toLowerCase()}`,
    });
  }

  if (houseData?.naturalRuler) {
    planets.push({
      label: `${houseData.naturalRuler} (Natural Ruler)`,
      href: `/grimoire/astronomy/planets/${houseData.naturalRuler.toLowerCase()}`,
    });
  }

  sections.push({ title: 'Planets & Placements', links: planets.slice(0, 4) });

  return sections;
}

function getPlacementConnections(
  placementSlug: string,
): CosmicConnectionSection[] {
  const match = placementSlug.match(/^([a-z-]+)-in-([a-z]+)$/);
  if (!match) return [];

  const [, planet, sign] = match;
  const planetName =
    planet.charAt(0).toUpperCase() + planet.slice(1).replace(/-/g, ' ');
  const signName = sign.charAt(0).toUpperCase() + sign.slice(1);

  const sections: CosmicConnectionSection[] = [];

  const core: CosmicConnectionLink[] = [
    { label: planetName, href: `/grimoire/astronomy/planets/${planet}` },
    { label: signName, href: `/grimoire/zodiac/${sign}` },
    { label: 'All Houses', href: '/grimoire/houses' },
  ];
  sections.push({ title: 'Core Links', links: core });

  const guides: CosmicConnectionLink[] = [
    {
      label: 'Birth Chart Guide',
      href: '/grimoire/guides/birth-chart-complete-guide',
    },
    { label: 'All Placements', href: '/grimoire/placements' },
    { label: 'All Zodiac Signs', href: '/grimoire/zodiac' },
  ];
  sections.push({ title: 'Chart & Guides', links: guides });

  const signData = ZODIAC_CORRESPONDENCES[sign];
  const insight: CosmicConnectionLink[] = [
    { label: 'Daily Horoscope', href: '/horoscope' },
    { label: 'Your Forecast', href: '/forecast' },
  ];

  if (signData?.crystals?.[0]) {
    insight.push({
      label: `${signName} Crystals`,
      href: `/grimoire/crystals/${toSlug(signData.crystals[0])}`,
    });
  }

  sections.push({ title: 'Related Insight', links: insight.slice(0, 3) });

  return sections;
}

function getAspectConnections(
  planet1: string,
  _aspect: string,
  planet2: string,
): CosmicConnectionSection[] {
  const p1Name = planet1.charAt(0).toUpperCase() + planet1.slice(1);
  const p2Name = planet2.charAt(0).toUpperCase() + planet2.slice(1);

  const sections: CosmicConnectionSection[] = [];

  const basics: CosmicConnectionLink[] = [
    { label: 'All Aspects', href: '/grimoire/aspects' },
    { label: 'Aspect Types', href: '/grimoire/aspects/types' },
  ];
  sections.push({ title: 'Aspect Basics', links: basics });

  const planets: CosmicConnectionLink[] = [
    { label: p1Name, href: `/grimoire/astronomy/planets/${planet1}` },
    { label: p2Name, href: `/grimoire/astronomy/planets/${planet2}` },
  ];
  sections.push({ title: 'Planets Involved', links: planets });

  const chart: CosmicConnectionLink[] = [
    {
      label: 'Birth Chart Guide',
      href: '/grimoire/guides/birth-chart-complete-guide',
    },
    { label: 'Transits Hub', href: '/grimoire/transits' },
    { label: 'Calculate Birth Chart', href: '/birth-chart' },
  ];
  sections.push({ title: 'Chart & Transits', links: chart });

  return sections;
}

function getMoonConnections(_moonKey: string): CosmicConnectionSection[] {
  const sections: CosmicConnectionSection[] = [];

  const essentials: CosmicConnectionLink[] = [
    { label: 'Moon Phases Guide', href: '/grimoire/guides/moon-phases-guide' },
    { label: 'Moon Calendar', href: '/grimoire/moon' },
    { label: 'Moon Signs', href: '/grimoire/moon/signs' },
    { label: 'Full Moons', href: '/grimoire/moon/full-moons' },
  ];
  sections.push({ title: 'Moon Essentials', links: essentials.slice(0, 4) });

  const rituals: CosmicConnectionLink[] = [
    { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
    { label: 'New Moon Rituals', href: '/grimoire/moon/phases/new-moon' },
    { label: 'Full Moon Rituals', href: '/grimoire/moon/phases/full-moon' },
  ];
  sections.push({ title: 'Rituals', links: rituals.slice(0, 3) });

  const support: CosmicConnectionLink[] = [
    { label: 'Manifestation', href: '/grimoire/spells' },
    { label: 'Moon Crystals', href: '/grimoire/crystals/moonstone' },
    { label: 'Selenite', href: '/grimoire/crystals/selenite' },
  ];
  sections.push({ title: 'Support', links: support.slice(0, 3) });

  return sections;
}

function getTarotConnections(cardSlug: string): CosmicConnectionSection[] {
  const sections: CosmicConnectionSection[] = [];

  // Tarot basics - always shown
  const basics: CosmicConnectionLink[] = [
    { label: 'Tarot Guide', href: '/grimoire/guides/tarot-complete-guide' },
    { label: 'All Tarot Cards', href: '/grimoire/tarot' },
    { label: 'Yes or No Tarot', href: '/grimoire/tarot/yes-or-no' },
    { label: 'Tarot Spreads', href: '/grimoire/tarot/spreads' },
  ];
  sections.push({ title: 'Tarot Basics', links: basics });

  // Determine if major or minor arcana and get correspondences
  const tarotCorr = TAROT_MAJOR_ARCANA_CORRESPONDENCES[cardSlug];
  const astroLinks: CosmicConnectionLink[] = [];

  // Major Arcana: link to zodiac sign and planet
  if (tarotCorr?.zodiacSign) {
    astroLinks.push({
      label: tarotCorr.zodiacSign,
      href: `/grimoire/zodiac/${tarotCorr.zodiacSign.toLowerCase()}`,
    });
  }
  if (tarotCorr?.planet) {
    astroLinks.push({
      label: tarotCorr.planet,
      href: `/grimoire/astronomy/planets/${tarotCorr.planet.toLowerCase()}`,
    });
  }

  // Minor Arcana: detect suit from slug and link to element
  const suitMatch = cardSlug.match(/-(cups|wands|swords|pentacles)$/);
  if (suitMatch) {
    const suit = suitMatch[1];
    const suitElementMap: Record<string, { element: string; sign: string }> = {
      cups: { element: 'water', sign: 'cancer' },
      wands: { element: 'fire', sign: 'aries' },
      swords: { element: 'air', sign: 'gemini' },
      pentacles: { element: 'earth', sign: 'taurus' },
    };
    const suitData = suitElementMap[suit];
    if (suitData) {
      astroLinks.push({
        label: `${suitData.element.charAt(0).toUpperCase() + suitData.element.slice(1)} Element`,
        href: `/grimoire/correspondences/elements/${suitData.element}`,
      });
      astroLinks.push({
        label: `Suit of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
        href: `/grimoire/tarot/suits/${suit}`,
      });
    }
  }

  if (astroLinks.length > 0) {
    sections.push({
      title: 'Astrology & Elements',
      links: astroLinks.slice(0, 4),
    });
  }

  // Spiritual practice links
  const practice: CosmicConnectionLink[] = [
    { label: 'Daily Tarot Reading', href: '/tarot' },
    { label: 'Moon Phases', href: '/grimoire/moon' },
    { label: 'Crystals', href: '/grimoire/crystals' },
    { label: 'Meditation', href: '/grimoire/meditation' },
  ];
  sections.push({ title: 'Practice', links: practice });

  return sections;
}

function getCrystalConnections(crystalSlug: string): CosmicConnectionSection[] {
  const sections: CosmicConnectionSection[] = [];

  const basics: CosmicConnectionLink[] = [
    { label: 'Crystal Guide', href: '/grimoire/guides/crystal-healing-guide' },
    { label: 'All Crystals', href: '/grimoire/crystals' },
    { label: 'Chakras', href: '/grimoire/chakras' },
  ];
  sections.push({ title: 'Crystal Basics', links: basics });

  const astroSupport: CosmicConnectionLink[] = [];

  for (const [signKey, signData] of Object.entries(ZODIAC_CORRESPONDENCES)) {
    const crystalMatch = signData.crystals.some(
      (c) => toSlug(c) === crystalSlug,
    );
    if (crystalMatch) {
      astroSupport.push({
        label: signKey.charAt(0).toUpperCase() + signKey.slice(1),
        href: `/grimoire/zodiac/${signKey}`,
      });
    }
  }

  if (astroSupport.length > 0) {
    sections.push({
      title: 'Zodiac Connections',
      links: astroSupport.slice(0, 3),
    });
  }

  const ritual: CosmicConnectionLink[] = [
    { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
    { label: 'Spells', href: '/grimoire/spells' },
    { label: 'Meditation', href: '/grimoire/meditation' },
  ];
  sections.push({ title: 'Ritual Use', links: ritual.slice(0, 3) });

  return sections;
}

function getGlossaryConnections(_term: string): CosmicConnectionSection[] {
  const sections: CosmicConnectionSection[] = [];

  const learn: CosmicConnectionLink[] = [
    { label: 'Astrology Glossary', href: '/grimoire/glossary' },
    {
      label: 'Birth Chart Guide',
      href: '/grimoire/guides/birth-chart-complete-guide',
    },
    { label: "Beginner's Guide", href: '/grimoire/beginners' },
  ];
  sections.push({ title: 'Learn More', links: learn });

  return sections;
}

function getHubTransitsConnections(): CosmicConnectionSection[] {
  return [
    {
      title: 'Transit Resources',
      links: [
        { label: 'Birth Chart & Houses', href: '/birth-chart' },
        { label: 'Astrological Events', href: '/grimoire/events' },
        {
          label: 'Planets Hub',
          href: '/grimoire/astronomy/planets',
        },
        { label: 'Zodiac Signs', href: '/grimoire/zodiac' },
        { label: 'Houses Guide', href: '/grimoire/houses' },
      ],
    },
  ];
}

function getHubEventsConnections(): CosmicConnectionSection[] {
  const currentYear = new Date().getFullYear();

  return [
    {
      title: 'Event Resources',
      links: [
        { label: 'Retrogrades Hub', href: '/grimoire/astronomy/retrogrades' },
        { label: 'Transits Hub', href: '/grimoire/transits' },
        { label: 'Moon Calendar', href: '/grimoire/moon' },
        {
          label: 'Birth Chart Guide',
          href: '/grimoire/guides/birth-chart-complete-guide',
        },
      ],
    },
    {
      title: `${currentYear} Highlights`,
      links: [
        {
          label: `${currentYear} Astrology Events`,
          href: `/grimoire/events/${currentYear}`,
        },
        {
          label: `${currentYear} Mercury Retrograde`,
          href: `/grimoire/events/${currentYear}/mercury-retrograde`,
        },
        {
          label: `${currentYear} Venus Retrograde`,
          href: `/grimoire/events/${currentYear}/venus-retrograde`,
        },
        {
          label: `${currentYear} Eclipses`,
          href: `/grimoire/events/${currentYear}/eclipses`,
        },
      ],
    },
    {
      title: 'Deep Dive',
      links: [
        { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
        { label: 'Spells Fundamentals', href: '/grimoire/spells/fundamentals' },
        { label: 'Crystals', href: '/grimoire/crystals' },
        { label: 'Horoscopes Hub', href: '/grimoire/horoscopes' },
      ],
    },
  ];
}

function getHubMoonConnections(): CosmicConnectionSection[] {
  return [
    {
      title: 'Related Pages',
      links: [
        {
          label: 'Moon Phases Guide',
          href: '/grimoire/guides/moon-phases-guide',
        },
        { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
        { label: 'Full Moons 2025', href: '/grimoire/moon/full-moons' },
        { label: 'New Moon Rituals', href: '/grimoire/moon/phases/new-moon' },
      ],
    },
  ];
}

function getHubPlacementsConnections(): CosmicConnectionSection[] {
  return [
    {
      title: 'Related Pages',
      links: [
        {
          label: 'Birth Chart Guide',
          href: '/grimoire/guides/birth-chart-complete-guide',
        },
        { label: 'All Zodiac Signs', href: '/grimoire/zodiac' },
        { label: 'All Planets', href: '/grimoire/astronomy/planets' },
        { label: 'Calculate Birth Chart', href: '/birth-chart' },
      ],
    },
  ];
}

function getHubCrystalsConnections(): CosmicConnectionSection[] {
  return [
    {
      title: 'Crystal Uses',
      links: [
        { label: 'Protection Magic', href: '/grimoire/protection' },
        { label: 'Manifestation', href: '/grimoire/manifestation' },
        { label: 'Meditation', href: '/grimoire/meditation' },
        { label: 'Chakras', href: '/grimoire/chakras' },
      ],
    },
    {
      title: 'Related Topics',
      links: [
        { label: 'Spells & Rituals', href: '/grimoire/spells' },
        { label: 'Moon Magic', href: '/grimoire/moon' },
        { label: 'Candle Magic', href: '/grimoire/candle-magic' },
        {
          label: 'Color Correspondences',
          href: '/grimoire/correspondences/colors',
        },
        { label: 'Chakra Healing', href: '/grimoire/chakras' },
        { label: 'Magical Correspondences', href: '/grimoire/correspondences' },
      ],
    },
    {
      title: 'Related Correspondences',
      links: [
        { label: 'Correspondences', href: '/grimoire/correspondences' },
        { label: 'Herbs', href: '/grimoire/correspondences/herbs' },
        { label: 'Colors', href: '/grimoire/correspondences/colors' },
        { label: 'Elements', href: '/grimoire/correspondences/elements' },
      ],
    },
    {
      title: 'Learn More',
      links: [
        {
          label: 'Crystal Healing Guide',
          href: '/grimoire/guides/crystal-healing-guide',
        },
        { label: 'Candle Magic', href: '/grimoire/candle-magic' },
        {
          label: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
        { label: 'Book of Shadows', href: '/book-of-shadows' },
      ],
    },
  ];
}

function getHubGlossaryConnections(): CosmicConnectionSection[] {
  return [
    {
      title: 'Learn Astrology',
      links: [
        {
          label: 'Birth Chart Guide',
          href: '/grimoire/guides/birth-chart-complete-guide',
        },
        { label: "Beginner's Guide", href: '/grimoire/beginners' },
        { label: 'All Zodiac Signs', href: '/grimoire/zodiac' },
        { label: 'All Planets', href: '/grimoire/astronomy/planets' },
      ],
    },
  ];
}

function getArchetypeConnections(
  archetypeId: string,
): CosmicConnectionSection[] {
  const sections: CosmicConnectionSection[] = [];

  // About archetypes section
  const aboutArchetypes: CosmicConnectionLink[] = [
    { label: 'All 12 Archetypes', href: '/grimoire/archetypes' },
    { label: 'Book of Shadows', href: '/book-of-shadows' },
    { label: 'Your Profile', href: '/profile' },
  ];
  sections.push({ title: 'Explore Archetypes', links: aboutArchetypes });

  // Related practices based on archetype
  const practices: CosmicConnectionLink[] = [
    { label: 'Tarot Reading', href: '/tarot' },
    { label: 'Birth Chart', href: '/birth-chart' },
    { label: 'Moon Phases', href: '/grimoire/moon' },
    { label: 'Shadow Work', href: '/grimoire/meditation' },
  ];
  sections.push({ title: 'Related Practices', links: practices.slice(0, 4) });

  // Grimoire resources
  const grimoire: CosmicConnectionLink[] = [
    { label: 'Tarot Cards', href: '/grimoire/tarot' },
    { label: 'Crystals', href: '/grimoire/crystals' },
    { label: 'Chakras', href: '/grimoire/chakras' },
    { label: 'Zodiac Signs', href: '/grimoire/zodiac' },
  ];
  sections.push({ title: 'Grimoire Resources', links: grimoire.slice(0, 4) });

  return sections;
}

function getRisingConnections(risingSlug: string): CosmicConnectionSection[] {
  const signMatch = risingSlug.match(/^([a-z]+)-rising$/);
  const sign = signMatch?.[1] || risingSlug;
  const signName = sign.charAt(0).toUpperCase() + sign.slice(1);

  const sections: CosmicConnectionSection[] = [];

  // Core astrology
  const core: CosmicConnectionLink[] = [
    { label: 'All Rising Signs', href: '/grimoire/rising' },
    { label: `${signName} Sun Sign`, href: `/grimoire/zodiac/${sign}` },
    { label: `Moon in ${signName}`, href: `/grimoire/moon-in/${sign}` },
    {
      label: 'Birth Chart Guide',
      href: '/grimoire/guides/birth-chart-complete-guide',
    },
  ];
  sections.push({ title: 'Astrology', links: core });

  // Placements
  const placements: CosmicConnectionLink[] = [
    {
      label: `Sun in ${signName}`,
      href: `/grimoire/placements/sun-in-${sign}`,
    },
    {
      label: `Mercury in ${signName}`,
      href: `/grimoire/placements/mercury-in-${sign}`,
    },
    {
      label: `Venus in ${signName}`,
      href: `/grimoire/placements/venus-in-${sign}`,
    },
    { label: 'All Placements', href: '/grimoire/placements' },
  ];
  sections.push({ title: 'Placements', links: placements });

  // Tools
  const tools: CosmicConnectionLink[] = [
    { label: 'Calculate Birth Chart', href: '/birth-chart' },
    { label: 'Daily Horoscope', href: '/horoscope' },
    { label: 'Compatibility', href: '/grimoire/compatibility' },
  ];
  sections.push({ title: 'Tools', links: tools });

  return sections;
}

function getCompatibilityConnections(
  matchSlug: string,
): CosmicConnectionSection[] {
  const match = matchSlug.match(/^([a-z]+)-and-([a-z]+)$/);
  const sign1 = match?.[1] || '';
  const sign2 = match?.[2] || '';
  const sign1Name = sign1.charAt(0).toUpperCase() + sign1.slice(1);
  const sign2Name = sign2.charAt(0).toUpperCase() + sign2.slice(1);

  const sections: CosmicConnectionSection[] = [];

  // Individual signs
  const signs: CosmicConnectionLink[] = [
    { label: `${sign1Name} Sign`, href: `/grimoire/zodiac/${sign1}` },
    { label: `${sign2Name} Sign`, href: `/grimoire/zodiac/${sign2}` },
    { label: 'All Zodiac Signs', href: '/grimoire/zodiac' },
    { label: 'All Compatibility', href: '/grimoire/compatibility' },
  ];
  sections.push({ title: 'Zodiac Signs', links: signs });

  // Synastry
  const synastry: CosmicConnectionLink[] = [
    { label: 'Synastry Calculator', href: '/grimoire/synastry/generate' },
    { label: 'Synastry Aspects', href: '/grimoire/synastry/aspects' },
    {
      label: 'Venus-Mars Aspects',
      href: '/grimoire/synastry/aspects/venus-conjunct-mars',
    },
  ];
  sections.push({ title: 'Synastry', links: synastry });

  // Deepen understanding
  const deepen: CosmicConnectionLink[] = [
    {
      label: 'Birth Chart Guide',
      href: '/grimoire/guides/birth-chart-complete-guide',
    },
    { label: 'Calculate Birth Chart', href: '/birth-chart' },
    { label: 'Daily Horoscope', href: '/horoscope' },
  ];
  sections.push({ title: 'Learn More', links: deepen });

  return sections;
}

function getAngelNumberConnections(
  numberSlug: string,
): CosmicConnectionSection[] {
  const sections: CosmicConnectionSection[] = [];

  // Numerology basics
  const basics: CosmicConnectionLink[] = [
    { label: 'All Angel Numbers', href: '/grimoire/angel-numbers' },
    { label: 'Numerology Overview', href: '/grimoire/numerology' },
    { label: 'Life Path Numbers', href: '/grimoire/life-path' },
    { label: 'Mirror Hours', href: '/grimoire/mirror-hours' },
  ];
  sections.push({ title: 'Numerology', links: basics });

  // Related spiritual practices
  const spiritual: CosmicConnectionLink[] = [
    { label: 'Manifestation', href: '/grimoire/manifestation' },
    { label: 'Meditation', href: '/grimoire/meditation' },
    { label: 'Daily Tarot', href: '/tarot' },
    { label: 'Moon Phases', href: '/grimoire/moon' },
  ];
  sections.push({ title: 'Spiritual Practice', links: spiritual });

  // Deepen your understanding
  const deepen: CosmicConnectionLink[] = [
    { label: 'Birth Chart', href: '/birth-chart' },
    { label: 'Daily Horoscope', href: '/horoscope' },
    { label: 'Crystals', href: '/grimoire/crystals' },
    { label: 'Correspondences', href: '/grimoire/correspondences' },
  ];
  sections.push({ title: 'Explore More', links: deepen });

  return sections;
}

function getWitchConnections(): CosmicConnectionSection[] {
  const sections: CosmicConnectionSection[] = [];

  const basics: CosmicConnectionLink[] = [
    { label: 'Practices Hub', href: '/grimoire/practices' },
    { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
    {
      label: 'Famous Witches',
      href: '/grimoire/modern-witchcraft/famous-witches',
    },
    { label: 'Spells Fundamentals', href: '/grimoire/spells/fundamentals' },
  ];
  sections.push({
    title: 'Witchcraft Basics',
    links: basics,
  });

  const practiceLinks: CosmicConnectionLink[] = [
    { label: 'Spells', href: '/grimoire/spells' },
    { label: 'Tarot', href: '/grimoire/tarot' },
    { label: 'Crystals', href: '/grimoire/crystals' },
    { label: 'Witchcraft Tools', href: '/grimoire/witchcraft-tools' },
  ];
  sections.push({
    title: 'Practices & Tools',
    links: practiceLinks,
  });

  const deepenLinks: CosmicConnectionLink[] = [
    { label: 'Protection Guide', href: '/grimoire/protection' },
    { label: 'Shadow Work', href: '/grimoire/shadow-work' },
    { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
    { label: 'Tools Guide', href: '/grimoire/modern-witchcraft/tools-guide' },
  ];
  sections.push({
    title: 'Deepen Your Practice',
    links: deepenLinks,
  });

  return sections;
}

function getDoubleHourConnections(timeSlug: string): CosmicConnectionSection[] {
  const sections: CosmicConnectionSection[] = [];

  // Numerology basics
  const basics: CosmicConnectionLink[] = [
    { label: 'All Double Hours', href: '/grimoire/double-hours' },
    { label: 'Mirror Hours', href: '/grimoire/mirror-hours' },
    { label: 'Numerology Overview', href: '/grimoire/numerology' },
    { label: 'Angel Numbers', href: '/grimoire/angel-numbers' },
  ];
  sections.push({ title: 'Clock Numerology', links: basics });

  // Related spiritual practices
  const spiritual: CosmicConnectionLink[] = [
    { label: 'Manifestation', href: '/grimoire/manifestation' },
    { label: 'Meditation', href: '/grimoire/meditation' },
    { label: 'Moon Phases', href: '/grimoire/moon' },
    { label: 'Daily Tarot', href: '/tarot' },
  ];
  sections.push({ title: 'Spiritual Practice', links: spiritual });

  // Deepen your understanding
  const deepen: CosmicConnectionLink[] = [
    { label: 'Birth Chart', href: '/birth-chart' },
    { label: 'Daily Horoscope', href: '/horoscope' },
    { label: 'Crystals', href: '/grimoire/crystals' },
    { label: 'Correspondences', href: '/grimoire/correspondences' },
  ];
  sections.push({ title: 'Explore More', links: deepen });

  return sections;
}

export function getCosmicConnections(
  entityType: EntityType,
  slugOrKey: string,
  extraParams?: { planet1?: string; aspect?: string; planet2?: string },
): CosmicConnectionSection[] {
  switch (entityType) {
    case 'sign':
      return getSignConnections(slugOrKey);
    case 'planet':
      return getPlanetConnections(slugOrKey);
    case 'house':
      return getHouseConnections(slugOrKey);
    case 'placement':
      return getPlacementConnections(slugOrKey);
    case 'aspect':
      if (extraParams?.planet1 && extraParams?.aspect && extraParams?.planet2) {
        return getAspectConnections(
          extraParams.planet1,
          extraParams.aspect,
          extraParams.planet2,
        );
      }
      return [];
    case 'moon':
      return getMoonConnections(slugOrKey);
    case 'tarot':
      return getTarotConnections(slugOrKey);
    case 'crystal':
      return getCrystalConnections(slugOrKey);
    case 'glossary-term':
      return getGlossaryConnections(slugOrKey);
    case 'hub-transits':
      return getHubTransitsConnections();
    case 'hub-moon':
      return getHubMoonConnections();
    case 'hub-events':
      return getHubEventsConnections();
    case 'hub-placements':
      return getHubPlacementsConnections();
    case 'hub-glossary':
      if (slugOrKey === 'crystals') {
        return getHubCrystalsConnections();
      }
      return getHubGlossaryConnections();
    case 'hub-horoscopes':
      return [];
    case 'archetype':
      return getArchetypeConnections(slugOrKey);
    case 'witchcraft':
      return getWitchConnections();
    case 'angel-number':
      return getAngelNumberConnections(slugOrKey);
    case 'rising':
      return getRisingConnections(slugOrKey);
    case 'compatibility':
      return getCompatibilityConnections(slugOrKey);
    case 'double-hour':
      return getDoubleHourConnections(slugOrKey);
    default:
      return [];
  }
}
