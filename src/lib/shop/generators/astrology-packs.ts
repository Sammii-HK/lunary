import { ShopProduct, SHOP_GRADIENTS, PRICE_TIERS } from '../types';

const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

const ZODIAC_SEASON_DATES: Record<string, { start: string; end: string }> = {
  Aries: { start: 'March 21', end: 'April 19' },
  Taurus: { start: 'April 20', end: 'May 20' },
  Gemini: { start: 'May 21', end: 'June 20' },
  Cancer: { start: 'June 21', end: 'July 22' },
  Leo: { start: 'July 23', end: 'August 22' },
  Virgo: { start: 'August 23', end: 'September 22' },
  Libra: { start: 'September 23', end: 'October 22' },
  Scorpio: { start: 'October 23', end: 'November 21' },
  Sagittarius: { start: 'November 22', end: 'December 21' },
  Capricorn: { start: 'December 22', end: 'January 19' },
  Aquarius: { start: 'January 20', end: 'February 18' },
  Pisces: { start: 'February 19', end: 'March 20' },
};

const ZODIAC_THEMES: Record<
  string,
  { theme: string; energy: string; focus: string }
> = {
  Aries: {
    theme: 'initiation and courage',
    energy: 'fiery',
    focus: 'new beginnings',
  },
  Taurus: {
    theme: 'stability and pleasure',
    energy: 'grounded',
    focus: 'abundance',
  },
  Gemini: {
    theme: 'communication and curiosity',
    energy: 'airy',
    focus: 'learning',
  },
  Cancer: {
    theme: 'nurturing and home',
    energy: 'watery',
    focus: 'emotional security',
  },
  Leo: {
    theme: 'creativity and self-expression',
    energy: 'radiant',
    focus: 'confidence',
  },
  Virgo: {
    theme: 'service and refinement',
    energy: 'analytical',
    focus: 'health',
  },
  Libra: {
    theme: 'balance and partnership',
    energy: 'harmonious',
    focus: 'relationships',
  },
  Scorpio: {
    theme: 'transformation and depth',
    energy: 'intense',
    focus: 'power',
  },
  Sagittarius: {
    theme: 'expansion and truth',
    energy: 'adventurous',
    focus: 'growth',
  },
  Capricorn: {
    theme: 'ambition and structure',
    energy: 'determined',
    focus: 'achievement',
  },
  Aquarius: {
    theme: 'innovation and community',
    energy: 'electric',
    focus: 'vision',
  },
  Pisces: {
    theme: 'intuition and transcendence',
    energy: 'mystical',
    focus: 'spirituality',
  },
};

// Each zodiac sign gets a unique soft gradient reflecting its energy
const ZODIAC_GRADIENTS: Record<string, string> = {
  Aries: SHOP_GRADIENTS.supernovaToNebula, // Fiery, initiating energy
  Taurus: SHOP_GRADIENTS.vertNebulaToRose, // Grounded, earthy warmth
  Gemini: SHOP_GRADIENTS.horizCometToRose, // Airy, communicative flow
  Cancer: SHOP_GRADIENTS.lightRoseToMainHaze, // Nurturing, lunar
  Leo: SHOP_GRADIENTS.supernovaFade, // Radiant, solar brightness
  Virgo: SHOP_GRADIENTS.hazeFade, // Refined, analytical clarity
  Libra: SHOP_GRADIENTS.cometHazeRose, // Balanced, harmonious blend
  Scorpio: SHOP_GRADIENTS.nebulaToSupernova, // Deep, transformative intensity
  Sagittarius: SHOP_GRADIENTS.horizHazeToSupernova, // Expansive, adventurous
  Capricorn: SHOP_GRADIENTS.cometToSupernova, // Disciplined, structured
  Aquarius: SHOP_GRADIENTS.cometFade, // Electric, innovative glow
  Pisces: SHOP_GRADIENTS.lightNebulaToHaze, // Mystical, dreamy
};

function generateSunSeasonPack(
  sign: (typeof ZODIAC_SIGNS)[number],
): ShopProduct {
  const dates = ZODIAC_SEASON_DATES[sign];
  const themes = ZODIAC_THEMES[sign];

  return {
    id: `${sign.toLowerCase()}-season`,
    slug: `${sign.toLowerCase()}-season-pack`,
    title: `${sign} Season Pack`,
    tagline: `Embrace the ${themes.energy} energy of ${sign}.`,
    description: `From ${dates.start} to ${dates.end}, the sun moves through ${sign}, infusing the collective with ${themes.theme}. This pack helps you harness ${sign} season's energy regardless of your sun sign, with rituals, practices, and guidance for ${themes.focus}.`,
    category: 'astrology' as const,
    whatInside: [
      `${sign} season dates and astrological significance`,
      `Rituals aligned with ${sign} energy`,
      `Journal prompts for ${themes.focus}`,
      `Crystal and herb correspondences for ${sign}`,
      `Altar setup for ${sign} season`,
      `${sign} season tarot spread`,
      `Daily practices for the month`,
    ],
    perfectFor: [
      `Making the most of ${sign} season`,
      `${sign} sun, moon, or rising signs`,
      `Anyone drawn to ${themes.theme}`,
    ],
    related: [
      `${ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(sign) + 1) % 12].toLowerCase()}-season-pack`,
      `${ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(sign) + 11) % 12].toLowerCase()}-season-pack`,
    ],
    price: PRICE_TIERS.standard,
    gradient: ZODIAC_GRADIENTS[sign], // Unique gradient per sign!
  };
}

function generateSaturnReturnPack(): ShopProduct {
  return {
    id: 'saturn-return-survival',
    slug: 'saturn-return-survival-pack',
    title: 'Saturn Return Survival Pack',
    tagline: 'Navigate your cosmic coming-of-age.',
    description:
      'Around ages 27-30 and again at 57-60, Saturn returns to its natal position, demanding we grow up and build foundations that last. This profound transit dismantles what is not authentic and rewards what is. This pack guides you through the challenges and gifts of your Saturn Return.',
    category: 'astrology' as const,
    whatInside: [
      'Understanding your Saturn Return timing and themes',
      'Saturn natal sign interpretations',
      'Saturn house meaning for your return',
      'Rituals for each phase of the return',
      'Grounding and stability practices',
      'Career and life structure assessment tools',
      'Saturn-honouring altar guide',
      'Crystal and herb correspondences',
      'Journal prompts for integration',
    ],
    perfectFor: [
      'Those approaching or in their late 20s/early 30s',
      'Anyone experiencing major life restructuring',
      'Second Saturn Return preparation (late 50s)',
    ],
    related: [
      'saturn-grounding-pack',
      'capricorn-season-pack',
      'house-meanings-pack',
    ],
    price: PRICE_TIERS.deepDive,
    gradient: SHOP_GRADIENTS.vertCometToHaze, // Saturn's stern, structured energy
  };
}

function generateJupiterExpansionPack(): ShopProduct {
  return {
    id: 'jupiter-expansion-year',
    slug: 'jupiter-expansion-year-pack',
    title: 'Jupiter Expansion Year Pack',
    tagline: 'Grow into your greatest potential.',
    description:
      "Every twelve years, Jupiter returns to its natal position, opening doors of opportunity and expansion. Even in years between, Jupiter's transits bring blessings to different life areas. This pack helps you identify and maximise your Jupiter opportunities.",
    category: 'astrology' as const,
    whatInside: [
      'Jupiter transit timing and meaning',
      'Jupiter through the houses guide',
      'Abundance and expansion rituals',
      'Luck-enhancing practices',
      'Opportunity manifestation spell',
      'Jupiter-honouring altar guide',
      'Sagittarius and Pisces season connections',
      'Gratitude and growth journal prompts',
    ],
    perfectFor: [
      'Those experiencing a Jupiter return (every 12 years)',
      'Anyone wanting to expand abundance',
      'Growth and opportunity manifestation',
    ],
    related: [
      'sagittarius-season-pack',
      'pisces-season-pack',
      'new-moon-manifestation-pack',
    ],
    price: PRICE_TIERS.deepDive,
    gradient: SHOP_GRADIENTS.fullSpectrum, // Jupiter's expansive, multi-hued blessing
  };
}

export function generateAstrologyPacks(): ShopProduct[] {
  const sunSeasonPacks = ZODIAC_SIGNS.map(generateSunSeasonPack);
  const saturnReturn = generateSaturnReturnPack();
  const jupiterExpansion = generateJupiterExpansionPack();

  return [...sunSeasonPacks, saturnReturn, jupiterExpansion];
}

export function getAstrologyPackBySlug(slug: string): ShopProduct | undefined {
  return generateAstrologyPacks().find((pack) => pack.slug === slug);
}

export function getCurrentSunSeasonPack(): ShopProduct | undefined {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();

  const signIndex = ZODIAC_SIGNS.findIndex((sign) => {
    const dates = ZODIAC_SEASON_DATES[sign];
    const [startMonth, startDay] = parseDate(dates.start);
    const [endMonth, endDay] = parseDate(dates.end);

    if (startMonth === month && day >= startDay) return true;
    if (endMonth === month && day <= endDay) return true;
    return false;
  });

  if (signIndex !== -1) {
    return generateSunSeasonPack(ZODIAC_SIGNS[signIndex]);
  }

  return undefined;
}

function parseDate(dateStr: string): [number, number] {
  const months: Record<string, number> = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };

  const [monthName, dayStr] = dateStr.split(' ');
  return [months[monthName], parseInt(dayStr, 10)];
}
