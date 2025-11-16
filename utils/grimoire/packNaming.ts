// Pack naming and versioning system for shop expansion
export interface PackNaming {
  title: string;
  subtitle?: string;
  series: string;
  volume: string;
  edition: string;
  sku: string;
  slug: string;
  shortName: string;
  fullName: string;
}

export interface PackMetadata {
  category: string;
  subcategory?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  year: number;
  month?: number;
  specialEvent?: string;
  contentCount: {
    spells: number;
    crystals: number;
    herbs: number;
    rituals: number;
  };
}

// Series definitions for different pack types
export const PACK_SERIES = {
  // Core grimoire series
  'essential-grimoire': {
    name: 'Essential Grimoire',
    description: 'Foundational magical practices for everyday use',
    prefix: 'EG',
    pricing: { base: 249, premium: 399 },
  },
  'lunar-wisdom': {
    name: 'Lunar Wisdom',
    description: 'Moon-aligned practices and lunar magic',
    prefix: 'LW',
    pricing: { base: 199, premium: 349 },
  },
  'crystal-mastery': {
    name: 'Crystal Mastery',
    description: 'Comprehensive crystal healing and magic',
    prefix: 'CM',
    pricing: { base: 299, premium: 449 },
  },
  'seasonal-magic': {
    name: 'Seasonal Magic',
    description: 'Practices aligned with natural cycles',
    prefix: 'SM',
    pricing: { base: 349, premium: 499 },
  },
  'advanced-workings': {
    name: 'Advanced Workings',
    description: 'Complex rituals and advanced techniques',
    prefix: 'AW',
    pricing: { base: 499, premium: 699 },
  },
  'daily-practice': {
    name: 'Daily Practice',
    description: 'Simple daily magical routines',
    prefix: 'DP',
    pricing: { base: 149, premium: 249 },
  },
  'sabbat-celebrations': {
    name: 'Sabbat Celebrations',
    description: 'Wheel of the Year festival practices',
    prefix: 'SC',
    pricing: { base: 399, premium: 599 },
  },
};

// Volume naming patterns
export const VOLUME_PATTERNS = {
  // Numerical volumes
  numerical: (num: number) => `Volume ${num}`,
  roman: (num: number) => `Volume ${toRoman(num)}`,

  // Seasonal volumes
  seasonal: (season: string, year: number) => `${season} ${year}`,

  // Monthly volumes
  monthly: (month: number, year: number) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${months[month - 1]} ${year}`;
  },

  // Quarterly volumes
  quarterly: (quarter: number, year: number) => `Q${quarter} ${year}`,

  // Thematic volumes
  thematic: (theme: string) => theme,

  // Lunar cycle volumes
  lunar: (cycle: string, year: number) => `${cycle} Cycle ${year}`,
};

// Edition types
export const EDITION_TYPES = {
  standard: 'Standard Edition',
  deluxe: 'Deluxe Edition',
  premium: 'Premium Edition',
  collectors: "Collector's Edition",
  limited: 'Limited Edition',
  anniversary: 'Anniversary Edition',
  seasonal: 'Seasonal Edition',
  digital: 'Digital Edition',
  print: 'Print Edition',
  bundle: 'Bundle Edition',
};

// Generate comprehensive pack naming
export function generatePackNaming(metadata: PackMetadata): PackNaming {
  const series = determineSeries(metadata);
  const volume = generateVolume(metadata);
  const edition = determineEdition(metadata);

  const title = generateTitle(metadata, series);
  const subtitle = generateSubtitle(metadata);
  const sku = generateSKU(series, volume, edition, metadata);
  const slug = generateSlug(title, volume);

  return {
    title,
    subtitle,
    series: PACK_SERIES[series].name,
    volume,
    edition,
    sku,
    slug,
    shortName: generateShortName(title, volume),
    fullName: generateFullName(title, subtitle, series, volume, edition),
  };
}

function determineSeries(metadata: PackMetadata): keyof typeof PACK_SERIES {
  // Logic to determine series based on content and category
  const { category, subcategory, difficulty, contentCount } = metadata;

  if (category === 'moon' || subcategory?.includes('lunar')) {
    return 'lunar-wisdom';
  }

  if (category === 'crystals' || contentCount.crystals > contentCount.spells) {
    return 'crystal-mastery';
  }

  if (metadata.season || subcategory?.includes('seasonal')) {
    return 'seasonal-magic';
  }

  if (metadata.specialEvent?.includes('sabbat')) {
    return 'sabbat-celebrations';
  }

  if (difficulty === 'advanced' || difficulty === 'master') {
    return 'advanced-workings';
  }

  if (contentCount.spells <= 3 && contentCount.crystals <= 3) {
    return 'daily-practice';
  }

  return 'essential-grimoire';
}

function generateVolume(metadata: PackMetadata): string {
  const { year, month, season, specialEvent } = metadata;

  if (specialEvent) {
    return VOLUME_PATTERNS.thematic(specialEvent);
  }

  if (season) {
    return VOLUME_PATTERNS.seasonal(season, year);
  }

  if (month) {
    return VOLUME_PATTERNS.monthly(month, year);
  }

  // Default to year-based numbering
  const volumeNumber = year - 2024; // Start from Volume 1 in 2025
  return VOLUME_PATTERNS.numerical(Math.max(1, volumeNumber));
}

function determineEdition(metadata: PackMetadata): string {
  const { difficulty, contentCount, specialEvent } = metadata;

  if (specialEvent?.includes('anniversary')) {
    return EDITION_TYPES.anniversary;
  }

  if (specialEvent?.includes('limited')) {
    return EDITION_TYPES.limited;
  }

  const totalContent = Object.values(contentCount).reduce((a, b) => a + b, 0);

  if (totalContent > 20 || difficulty === 'master') {
    return EDITION_TYPES.premium;
  }

  if (totalContent > 10 || difficulty === 'advanced') {
    return EDITION_TYPES.deluxe;
  }

  return EDITION_TYPES.standard;
}

function generateTitle(
  metadata: PackMetadata,
  series: keyof typeof PACK_SERIES,
): string {
  const { category, subcategory, specialEvent } = metadata;

  if (specialEvent) {
    return formatTitle(specialEvent);
  }

  const categoryTitles: { [key: string]: string } = {
    protection: 'Shield & Ward',
    love: 'Heart & Soul',
    prosperity: 'Abundance & Success',
    healing: 'Restore & Renew',
    cleansing: 'Purify & Clear',
    divination: 'Sight & Wisdom',
    manifestation: 'Create & Manifest',
    banishing: 'Release & Remove',
    crystals: 'Stone & Crystal',
    moon: 'Lunar & Tides',
    seasonal: 'Cycles & Seasons',
  };

  const baseTitle = categoryTitles[category] || formatTitle(category);

  if (subcategory) {
    return `${baseTitle}: ${formatTitle(subcategory)}`;
  }

  return baseTitle;
}

function generateSubtitle(metadata: PackMetadata): string | undefined {
  const { difficulty, contentCount, season } = metadata;

  const parts: string[] = [];

  // Add difficulty descriptor
  const difficultyDescriptors = {
    beginner: 'Foundations',
    intermediate: 'Practices',
    advanced: 'Workings',
    master: 'Mastery',
  };
  parts.push(difficultyDescriptors[difficulty]);

  // Add content summary
  const totalContent = Object.values(contentCount).reduce((a, b) => a + b, 0);
  if (totalContent > 0) {
    parts.push(`${totalContent} Complete Practices`);
  }

  // Add seasonal context
  if (season) {
    parts.push(`${formatTitle(season)} Energy`);
  }

  return parts.length > 0 ? parts.join(' • ') : undefined;
}

function generateSKU(
  series: keyof typeof PACK_SERIES,
  volume: string,
  edition: string,
  metadata: PackMetadata,
): string {
  const seriesPrefix = PACK_SERIES[series].prefix;
  const year = metadata.year.toString().slice(-2); // Last 2 digits of year
  const month = metadata.month?.toString().padStart(2, '0') || '00';

  const editionCode =
    {
      [EDITION_TYPES.standard]: 'ST',
      [EDITION_TYPES.deluxe]: 'DX',
      [EDITION_TYPES.premium]: 'PR',
      [EDITION_TYPES.collectors]: 'CO',
      [EDITION_TYPES.limited]: 'LT',
      [EDITION_TYPES.anniversary]: 'AN',
      [EDITION_TYPES.seasonal]: 'SE',
      [EDITION_TYPES.digital]: 'DG',
      [EDITION_TYPES.print]: 'PT',
      [EDITION_TYPES.bundle]: 'BD',
    }[edition] || 'ST';

  return `${seriesPrefix}-${year}${month}-${editionCode}`;
}

function generateSlug(title: string, volume: string): string {
  const combined = `${title} ${volume}`;
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateShortName(title: string, volume: string): string {
  return `${title} ${volume}`;
}

function generateFullName(
  title: string,
  subtitle: string | undefined,
  series: string,
  volume: string,
  edition: string,
): string {
  const parts = [series, title];

  if (subtitle) {
    parts.push(`(${subtitle})`);
  }

  parts.push(`- ${volume}`);

  if (edition !== EDITION_TYPES.standard) {
    parts.push(`[${edition}]`);
  }

  return parts.join(' ');
}

function formatTitle(text: string): string {
  return text
    .split(/[\s-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function toRoman(num: number): string {
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = [
    'M',
    'CM',
    'D',
    'CD',
    'C',
    'XC',
    'L',
    'XL',
    'X',
    'IX',
    'V',
    'IV',
    'I',
  ];

  let result = '';
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += symbols[i];
      num -= values[i];
    }
  }
  return result;
}

// Generate pricing based on series and edition
export function generatePricing(
  series: keyof typeof PACK_SERIES,
  edition: string,
): number {
  const basePricing = PACK_SERIES[series].pricing;

  const editionMultipliers = {
    [EDITION_TYPES.standard]: 1.0,
    [EDITION_TYPES.deluxe]: 1.5,
    [EDITION_TYPES.premium]: 2.0,
    [EDITION_TYPES.collectors]: 2.5,
    [EDITION_TYPES.limited]: 3.0,
    [EDITION_TYPES.anniversary]: 2.2,
    [EDITION_TYPES.seasonal]: 1.3,
    [EDITION_TYPES.digital]: 0.8,
    [EDITION_TYPES.print]: 1.4,
    [EDITION_TYPES.bundle]: 1.8,
  };

  const multiplier = editionMultipliers[edition] || 1.0;
  const basePrice =
    edition.includes('Premium') || edition.includes('Deluxe')
      ? basePricing.premium
      : basePricing.base;

  return Math.round(basePrice * multiplier);
}

// Example usage functions
export function generateMonthlyPack(
  year: number,
  month: number,
  category: string,
): PackNaming {
  const metadata: PackMetadata = {
    category,
    difficulty: 'intermediate',
    year,
    month,
    contentCount: {
      spells: 5,
      crystals: 3,
      herbs: 4,
      rituals: 2,
    },
  };

  return generatePackNaming(metadata);
}

export function generateSeasonalPack(
  year: number,
  season: 'spring' | 'summer' | 'autumn' | 'winter',
  category: string,
): PackNaming {
  const metadata: PackMetadata = {
    category,
    difficulty: 'intermediate',
    year,
    season,
    contentCount: {
      spells: 8,
      crystals: 6,
      herbs: 5,
      rituals: 3,
    },
  };

  return generatePackNaming(metadata);
}

export function generateSpecialEventPack(
  specialEvent: string,
  category: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master' = 'advanced',
): PackNaming {
  const metadata: PackMetadata = {
    category,
    difficulty,
    year: new Date().getFullYear(),
    specialEvent,
    contentCount: {
      spells: 10,
      crystals: 8,
      herbs: 6,
      rituals: 4,
    },
  };

  return generatePackNaming(metadata);
}
