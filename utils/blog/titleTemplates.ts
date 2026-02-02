// Title and subtitle templates with emotional hooks for blog content
// Creates engaging, curiosity-driven titles instead of formulaic ones

// Zodiac sign energy keywords for dynamic title generation
export const zodiacEnergy: Record<
  string,
  { verb: string; theme: string; vibe: string }
> = {
  Aries: { verb: 'Ignite', theme: 'Bold Beginnings', vibe: 'fiery courage' },
  Taurus: { verb: 'Ground', theme: 'Steady Growth', vibe: 'sensual stability' },
  Gemini: { verb: 'Connect', theme: 'Curious Minds', vibe: 'buzzing ideas' },
  Cancer: { verb: 'Nurture', theme: 'Heart & Home', vibe: 'emotional depth' },
  Leo: { verb: 'Shine', theme: 'Creative Fire', vibe: 'radiant confidence' },
  Virgo: { verb: 'Refine', theme: 'Mindful Details', vibe: 'practical magic' },
  Libra: {
    verb: 'Balance',
    theme: 'Harmony Calling',
    vibe: 'graceful connection',
  },
  Scorpio: {
    verb: 'Transform',
    theme: 'Deep Waters',
    vibe: 'powerful intensity',
  },
  Sagittarius: {
    verb: 'Explore',
    theme: 'Horizon Beckons',
    vibe: 'adventurous spirit',
  },
  Capricorn: {
    verb: 'Build',
    theme: 'Mountain Summit',
    vibe: 'ambitious structure',
  },
  Aquarius: {
    verb: 'Innovate',
    theme: 'Ideas Take Flight',
    vibe: 'revolutionary thinking',
  },
  Pisces: { verb: 'Dream', theme: 'Mystic Waters', vibe: 'spiritual flow' },
};

// Planet action templates for different event types
export const planetTitleTemplates: Record<
  string,
  {
    ingressTemplate: (sign: string) => string;
    retrogradeTemplate: string;
    directTemplate: string;
  }
> = {
  Mercury: {
    ingressTemplate: (sign) =>
      `Thoughts ${zodiacEnergy[sign]?.verb || 'Shift'}: Mercury Enters ${sign}`,
    retrogradeTemplate: 'Mercury Retrograde: Time to Reflect',
    directTemplate: 'Mercury Direct: Communication Clears',
  },
  Venus: {
    ingressTemplate: (sign) =>
      `Love ${zodiacEnergy[sign]?.verb || 'Transform'}s: Venus Enters ${sign}`,
    retrogradeTemplate: 'Venus Retrograde: Reviewing What You Value',
    directTemplate: 'Venus Direct: Love Flows Forward',
  },
  Mars: {
    ingressTemplate: (sign) =>
      `Energy ${zodiacEnergy[sign]?.verb || 'Shift'}s: Mars Enters ${sign}`,
    retrogradeTemplate: 'Mars Retrograde: Redirect Your Drive',
    directTemplate: 'Mars Direct: Action Resumes',
  },
  Jupiter: {
    ingressTemplate: (sign) => `Expansion Awaits: Jupiter Enters ${sign}`,
    retrogradeTemplate: 'Jupiter Retrograde: Inner Growth Season',
    directTemplate: 'Jupiter Direct: Opportunities Expand',
  },
  Saturn: {
    ingressTemplate: (sign) => `New Chapter: Saturn Enters ${sign}`,
    retrogradeTemplate: 'Saturn Retrograde: Reviewing Your Foundations',
    directTemplate: 'Saturn Direct: Structure Solidifies',
  },
  Uranus: {
    ingressTemplate: (sign) => `Revolution Begins: Uranus Enters ${sign}`,
    retrogradeTemplate: 'Uranus Retrograde: Internal Awakening',
    directTemplate: 'Uranus Direct: Change Accelerates',
  },
  Neptune: {
    ingressTemplate: (sign) => `Dreams Shift: Neptune Enters ${sign}`,
    retrogradeTemplate: 'Neptune Retrograde: Clarity Through Fog',
    directTemplate: 'Neptune Direct: Inspiration Returns',
  },
  Pluto: {
    ingressTemplate: (sign) => `Transformation Deepens: Pluto Enters ${sign}`,
    retrogradeTemplate: 'Pluto Retrograde: Inner Transformation',
    directTemplate: 'Pluto Direct: Power Resurfaces',
  },
  Sun: {
    ingressTemplate: (sign) => {
      const energy = zodiacEnergy[sign];
      return energy
        ? `${energy.theme}: Sun Enters ${sign}`
        : `New Solar Season: Sun Enters ${sign}`;
    },
    retrogradeTemplate: '', // Sun doesn't retrograde
    directTemplate: '',
  },
};

// Moon phase title templates
export const moonPhaseTitles: Record<string, (sign: string) => string> = {
  'New Moon': (sign) => {
    const energy = zodiacEnergy[sign];
    return energy
      ? `Fresh Start: New Moon in ${sign}`
      : `New Moon in ${sign}: Plant Your Seeds`;
  },
  'Full Moon': (sign) => {
    const energy = zodiacEnergy[sign];
    return energy
      ? `Time to ${energy.verb}: Full Moon in ${sign}`
      : `Full Moon in ${sign}: Illumination`;
  },
  'First Quarter': (sign) => `Take Action: First Quarter Moon in ${sign}`,
  'Last Quarter': (sign) => `Release & Reflect: Last Quarter Moon in ${sign}`,
};

// Named full moon titles (more evocative)
export const namedMoonTitles: Record<string, string> = {
  'Wolf Moon': 'Wolf Moon Rising: Howl Your Truth',
  'Snow Moon': 'Snow Moon Glow: Quiet Reflection',
  'Worm Moon': 'Worm Moon Awakens: Spring Stirs',
  'Pink Moon': 'Pink Moon Blooms: Love Unfolds',
  'Flower Moon': 'Flower Moon: Beauty Peaks',
  'Strawberry Moon': 'Strawberry Moon: Sweet Abundance',
  'Buck Moon': 'Buck Moon: Strength Emerges',
  'Sturgeon Moon': 'Sturgeon Moon: Deep Harvest',
  'Harvest Moon': 'Harvest Moon: Reap What You Sowed',
  'Hunter Moon': 'Hunter Moon: Focus Sharpens',
  'Beaver Moon': 'Beaver Moon: Prepare & Store',
  'Cold Moon': 'Cold Moon: Winter Wisdom',
};

// Fallback title templates when no major event
export const fallbackTitles = [
  "Cosmic Currents: This Week's Energy",
  'Celestial Guidance for the Week Ahead',
  'Your Weekly Cosmic Weather Report',
  "Navigating This Week's Astrology",
  'The Stars This Week: Your Guide',
];

// Subtitle templates based on event combinations
export const subtitleTemplates = {
  multipleRetrogrades: (count: number) =>
    `${count} planets in retrograde - time for reflection`,
  retrogradeAndIngress: (planet: string, sign: string) =>
    `Navigate ${planet} retrograde while ${sign} energy builds`,
  fullMoonWeek: (sign: string) => `Full Moon in ${sign} illuminates your path`,
  newMoonWeek: (sign: string) => `New Moon in ${sign} invites fresh intentions`,
  majorAspect: (planetA: string, planetB: string, aspect: string) =>
    `${planetA}-${planetB} ${aspect} shapes the week`,
  quietWeek: 'A week for integration and steady progress',
};

/**
 * Generate an engaging title based on the week's most significant event
 */
export function generateEngagingTitle(
  weekStart: Date,
  event: {
    type: 'ingress' | 'retrograde' | 'direct' | 'moon-phase';
    planet?: string;
    sign?: string;
    phaseName?: string;
    moonName?: string;
  } | null,
): string {
  const weekRange = formatWeekRange(weekStart);

  if (!event) {
    const randomFallback =
      fallbackTitles[Math.floor(Math.random() * fallbackTitles.length)];
    return `${randomFallback} (${weekRange})`;
  }

  let title = '';

  switch (event.type) {
    case 'ingress':
      if (event.planet && event.sign) {
        const templates = planetTitleTemplates[event.planet];
        if (templates?.ingressTemplate) {
          title = templates.ingressTemplate(event.sign);
        } else {
          const energy = zodiacEnergy[event.sign];
          title = energy
            ? `${energy.theme}: ${event.planet} Enters ${event.sign}`
            : `${event.planet} Enters ${event.sign}`;
        }
      }
      break;

    case 'retrograde':
      if (event.planet) {
        const templates = planetTitleTemplates[event.planet];
        title =
          templates?.retrogradeTemplate ||
          `${event.planet} Stations Retrograde`;
      }
      break;

    case 'direct':
      if (event.planet) {
        const templates = planetTitleTemplates[event.planet];
        title = templates?.directTemplate || `${event.planet} Stations Direct`;
      }
      break;

    case 'moon-phase':
      if (event.moonName && namedMoonTitles[event.moonName]) {
        title = namedMoonTitles[event.moonName];
      } else if (event.phaseName && event.sign) {
        const phaseTemplate = moonPhaseTitles[event.phaseName];
        title = phaseTemplate
          ? phaseTemplate(event.sign)
          : `${event.phaseName} in ${event.sign}`;
      }
      break;
  }

  return title ? `${title} (${weekRange})` : `Cosmic Currents (${weekRange})`;
}

/**
 * Generate an engaging subtitle that complements the title
 */
export function generateEngagingSubtitle(
  retrogradeCount: number,
  majorMoonPhase: { phase: string; sign: string } | null,
  topAspect: { planetA: string; planetB: string; aspect: string } | null,
  topIngress: { planet: string; sign: string } | null,
): string {
  // Priority: Multiple retrogrades > Full/New Moon > Major aspect > Ingress
  if (retrogradeCount >= 3) {
    return subtitleTemplates.multipleRetrogrades(retrogradeCount);
  }

  if (majorMoonPhase) {
    if (majorMoonPhase.phase.includes('Full')) {
      return subtitleTemplates.fullMoonWeek(majorMoonPhase.sign);
    }
    if (majorMoonPhase.phase.includes('New')) {
      return subtitleTemplates.newMoonWeek(majorMoonPhase.sign);
    }
  }

  if (topAspect) {
    return subtitleTemplates.majorAspect(
      topAspect.planetA,
      topAspect.planetB,
      topAspect.aspect,
    );
  }

  if (topIngress && retrogradeCount > 0) {
    return subtitleTemplates.retrogradeAndIngress('planetary', topIngress.sign);
  }

  return subtitleTemplates.quietWeek;
}

/**
 * Format week date range for title
 */
function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const startDay = weekStart.getDate();
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const endDay = weekEnd.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

/**
 * Generate narrative summary intro based on week's events
 */
export function generateNarrativeIntro(
  highlights: Array<{ planet: string; event: string; sign?: string }>,
  moonPhases: Array<{ phase: string; sign: string }>,
  aspects: Array<{ planetA: string; planetB: string; aspect: string }>,
): string {
  const parts: string[] = [];

  // Lead with the most significant event
  if (highlights.length > 0) {
    const main = highlights[0];
    if (main.event === 'enters-sign' && main.sign) {
      const energy = zodiacEnergy[main.sign];
      parts.push(
        energy
          ? `${main.planet} shifts into ${main.sign} this week, bringing ${energy.vibe} to your ${main.planet === 'Venus' ? 'relationships and values' : main.planet === 'Mercury' ? 'communications and thoughts' : main.planet === 'Mars' ? 'actions and desires' : 'experience'}.`
          : `${main.planet} enters ${main.sign}, shifting the cosmic tone.`,
      );
    } else if (main.event === 'goes-retrograde') {
      parts.push(
        `${main.planet} stations retrograde, inviting you to slow down and review ${main.planet === 'Mercury' ? 'plans and communications' : main.planet === 'Venus' ? 'relationships and finances' : main.planet === 'Mars' ? 'actions and motivations' : 'this area of life'}.`,
      );
    }
  }

  // Add moon phase context
  const majorMoon = moonPhases.find(
    (m) => m.phase.includes('Full') || m.phase.includes('New'),
  );
  if (majorMoon) {
    const energy = zodiacEnergy[majorMoon.sign];
    if (majorMoon.phase.includes('Full')) {
      parts.push(
        energy
          ? `The Full Moon in ${majorMoon.sign} illuminates themes of ${energy.vibe}, bringing matters to a head.`
          : `The Full Moon in ${majorMoon.sign} brings illumination and completion.`,
      );
    } else {
      parts.push(
        energy
          ? `The New Moon in ${majorMoon.sign} seeds intentions around ${energy.vibe}.`
          : `The New Moon in ${majorMoon.sign} invites fresh beginnings.`,
      );
    }
  }

  // Add aspect flavor
  if (aspects.length > 0 && parts.length < 3) {
    const topAspect = aspects[0];
    const isHarmonious = ['trine', 'sextile'].includes(
      topAspect.aspect.toLowerCase(),
    );
    parts.push(
      isHarmonious
        ? `A supportive ${topAspect.planetA}-${topAspect.planetB} ${topAspect.aspect} eases the way forward.`
        : `A ${topAspect.planetA}-${topAspect.planetB} ${topAspect.aspect} adds dynamic tension to navigate.`,
    );
  }

  return parts.join(' ');
}

/**
 * Generate closing/empowering statement for summary
 */
export function generateClosingStatement(
  dominantElement: 'fire' | 'earth' | 'air' | 'water' | 'mixed',
): string {
  const closings: Record<string, string[]> = {
    fire: [
      'Let passion guide your path forward.',
      'Your courage creates your reality.',
      'Trust your inner fire to light the way.',
    ],
    earth: [
      'Build something lasting this week.',
      'Steady progress creates real results.',
      'Ground your dreams in practical action.',
    ],
    air: [
      'Let your ideas take flight.',
      'Connection and communication open doors.',
      'Stay curious and keep learning.',
    ],
    water: [
      'Trust your intuition to guide you.',
      'Emotional wisdom leads the way.',
      'Flow with the cosmic currents.',
    ],
    mixed: [
      'Navigate with awareness and intention.',
      'Balance is your superpower this week.',
      'Trust the timing of your life.',
    ],
  };

  const options = closings[dominantElement] || closings.mixed;
  return options[Math.floor(Math.random() * options.length)];
}
