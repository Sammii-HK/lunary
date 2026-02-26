export type Platform =
  | 'instagram'
  | 'tiktok'
  | 'twitter'
  | 'linkedin'
  | 'facebook'
  | 'pinterest'
  | 'bluesky'
  | 'threads';

export interface CosmicContext {
  moonPhase?: string;
  zodiacSign?: string;
  retrograde?: string[];
  primaryEvent?: string;
}

const hashtagThemes = {
  tarot: [
    '#tarot',
    '#dailytarot',
    '#tarotreading',
    '#tarotcards',
    '#tarotguidance',
    '#oraclecard',
    '#divination',
    '#tarotdaily',
    '#mysticaltarot',
    '#tarotinsight',
  ],
  astrology: [
    '#horoscope',
    '#astrology',
    '#zodiac',
    '#astrologyreading',
    '#cosmicinsight',
    '#planetary',
    '#starguide',
    '#astrologer',
    '#horoscopedaily',
    '#astroguide',
  ],
  moon: [
    '#mooncycles',
    '#moonphases',
    '#lunar',
    '#fullmoon',
    '#newmoon',
    '#moonmagic',
    '#lunarenergy',
    '#moonwisdom',
    '#celestial',
    '#moonritual',
  ],
  spiritual: [
    '#spirituality',
    '#spiritual',
    '#spiritualawakening',
    '#mystic',
    '#cosmic',
    '#energy',
    '#intuition',
    '#mindfulness',
    '#consciousness',
    '#enlightenment',
  ],
  guidance: [
    '#dailyguidance',
    '#cosmicguidance',
    '#spiritualguidance',
    '#dailyoracle',
    '#wisdom',
    '#insight',
    '#guidance',
    '#dailyinsight',
    '#cosmicwisdom',
    '#spiritualinsight',
  ],
  manifestation: [
    '#manifestation',
    '#manifest',
    '#intention',
    '#abundance',
    '#lawofattraction',
    '#positivevibes',
    '#alignment',
    '#vibration',
    '#frequency',
    '#creation',
  ],
};

const moonPhaseHashtags: Record<string, string[]> = {
  'New Moon': ['#newmoon', '#newmoonritual', '#newmoonmagic', '#darkmooon'],
  'Waxing Crescent': ['#waxingmoon', '#growingmoon', '#moonmagic'],
  'First Quarter': ['#firstquartermoon', '#halfmoon', '#moonphase'],
  'Waxing Gibbous': ['#waxinggibbous', '#almostfull', '#moonenergy'],
  'Full Moon': ['#fullmoon', '#fullmoonritual', '#fullmoonmagic', '#lunarlove'],
  'Waning Gibbous': ['#waningmoon', '#releasemoon', '#moonwisdom'],
  'Last Quarter': ['#lastquartermoon', '#halfmoon', '#moonreflection'],
  'Waning Crescent': ['#waningcrescent', '#balsamic', '#moonrest'],
};

const zodiacHashtags: Record<string, string[]> = {
  Aries: ['#aries', '#ariesseason', '#ariesenergy', '#fireSign'],
  Taurus: ['#taurus', '#taurusseason', '#taurusenergy', '#earthsign'],
  Gemini: ['#gemini', '#geminiseason', '#geminienergy', '#airsign'],
  Cancer: ['#cancer', '#cancerseason', '#cancerenergy', '#watersign'],
  Leo: ['#leo', '#leoseason', '#leoenergy', '#firesign'],
  Virgo: ['#virgo', '#virgoseason', '#virgoenergy', '#earthsign'],
  Libra: ['#libra', '#libraseason', '#libraenergy', '#airsign'],
  Scorpio: ['#scorpio', '#scorpioseason', '#scorpioenergy', '#watersign'],
  Sagittarius: [
    '#sagittarius',
    '#sagittariusseason',
    '#sagittariusenergy',
    '#firesign',
  ],
  Capricorn: [
    '#capricorn',
    '#capricornseason',
    '#capricornenergy',
    '#earthsign',
  ],
  Aquarius: ['#aquarius', '#aquariusseason', '#aquariusenergy', '#airsign'],
  Pisces: ['#pisces', '#piscesseason', '#piscesenergy', '#watersign'],
};

const retrogradeHashtags: Record<string, string[]> = {
  Mercury: ['#mercuryretrograde', '#mercuryrx', '#mercuryretro'],
  Venus: ['#venusretrograde', '#venusrx'],
  Mars: ['#marsretrograde', '#marsrx'],
  Jupiter: ['#jupiterretrograde', '#jupiterrx'],
  Saturn: ['#saturnretrograde', '#saturnrx'],
};

const platformLimits: Record<Platform, number> = {
  instagram: 3,
  tiktok: 5,
  twitter: 2,
  linkedin: 3,
  facebook: 2,
  pinterest: 0,
  bluesky: 3,
  threads: 0,
};

/**
 * Generates daily hashtags by picking one from each of 3 different themes
 * @param date ISO date string (YYYY-MM-DD)
 * @returns String of 3 hashtags separated by spaces
 */
export function getDailyHashtags(date: string): string {
  const dateObj = new Date(date);
  const seed = dateObj.getDate() + dateObj.getMonth() * 31;

  const themes = Object.keys(hashtagThemes);
  const selectedHashtags: string[] = [];

  for (let i = 0; i < 3; i++) {
    const themeIndex = (seed + i) % themes.length;
    const themeName = themes[themeIndex] as keyof typeof hashtagThemes;
    const themeHashtags = hashtagThemes[themeName];
    const hashtagIndex = (seed + i * 7) % themeHashtags.length;
    selectedHashtags.push(themeHashtags[hashtagIndex]);
  }

  return selectedHashtags.join(' ');
}

function getContextualHashtags(context: CosmicContext): string[] {
  const contextual: string[] = [];

  if (context.moonPhase) {
    const moonTags = moonPhaseHashtags[context.moonPhase];
    if (moonTags) {
      contextual.push(...moonTags.slice(0, 2));
    }
  }

  if (context.zodiacSign) {
    const zodiacTags = zodiacHashtags[context.zodiacSign];
    if (zodiacTags) {
      contextual.push(zodiacTags[0]);
    }
  }

  if (context.retrograde && context.retrograde.length > 0) {
    for (const planet of context.retrograde.slice(0, 2)) {
      const retroTags = retrogradeHashtags[planet];
      if (retroTags) {
        contextual.push(retroTags[0]);
      }
    }
  }

  return contextual;
}

function getBaseHashtags(date: string, count: number): string[] {
  const dateObj = new Date(date);
  const seed = dateObj.getDate() + dateObj.getMonth() * 31;
  const themes = Object.keys(hashtagThemes);
  const selected: string[] = [];

  for (let i = 0; i < count && i < themes.length * 2; i++) {
    const themeIndex = (seed + i) % themes.length;
    const themeName = themes[themeIndex] as keyof typeof hashtagThemes;
    const themeHashtags = hashtagThemes[themeName];
    const hashtagIndex = (seed + i * 7) % themeHashtags.length;
    const tag = themeHashtags[hashtagIndex];
    if (!selected.includes(tag)) {
      selected.push(tag);
    }
  }

  return selected;
}

/**
 * Generates platform-optimized hashtags based on cosmic context
 * @param platform Target social media platform
 * @param date ISO date string (YYYY-MM-DD)
 * @param context Optional cosmic context for dynamic hashtags
 * @returns String of hashtags separated by spaces, or empty string for platforms that don't use hashtags
 */
export function getPlatformHashtags(
  platform: Platform,
  date: string,
  context?: CosmicContext,
): string {
  const limit = platformLimits[platform];

  if (limit === 0) {
    return '';
  }

  const hashtags: string[] = [];

  if (context) {
    const contextual = getContextualHashtags(context);
    hashtags.push(...contextual);
  }

  const remaining = limit - hashtags.length;
  if (remaining > 0) {
    const base = getBaseHashtags(date, remaining);
    for (const tag of base) {
      if (!hashtags.includes(tag) && hashtags.length < limit) {
        hashtags.push(tag);
      }
    }
  }

  return hashtags.slice(0, limit).join(' ');
}

/**
 * Generates hashtags for all platforms at once
 * @param date ISO date string (YYYY-MM-DD)
 * @param context Optional cosmic context for dynamic hashtags
 * @returns Object with hashtags for each platform
 */
export function getAllPlatformHashtags(
  date: string,
  context?: CosmicContext,
): Record<Platform, string> {
  const platforms: Platform[] = [
    'instagram',
    'tiktok',
    'twitter',
    'linkedin',
    'facebook',
    'pinterest',
    'bluesky',
    'threads',
  ];

  const result = {} as Record<Platform, string>;
  for (const platform of platforms) {
    result[platform] = getPlatformHashtags(platform, date, context);
  }

  return result;
}
