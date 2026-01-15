import {
  CosmicConnectionLink,
  CosmicConnectionSection,
} from '@/lib/cosmicConnectionsConfig';
import {
  MONTH_DISPLAY_NAMES,
  MONTHS,
  SIGN_DISPLAY_NAMES,
  SIGN_RULERS,
  ZodiacSign,
  Month,
} from '@/constants/seo/monthly-horoscope';

export type HoroscopeCosmicVariant =
  | 'monthly-sign'
  | 'yearly-sign'
  | 'sign-root'
  | 'monthly-hub'
  | 'daily-hub'
  | 'weekly-hub';

export interface HoroscopeCosmicOptions {
  variant: HoroscopeCosmicVariant;
  sign?: ZodiacSign;
  monthSlug?: string;
  year?: number;
  currentYear?: number;
}

const CURRENT_MONTH = MONTHS[new Date().getMonth()];
const CURRENT_YEAR = new Date().getFullYear();
const MONTH_SET = new Set<string>(MONTHS);

type HubVariant = Extract<
  HoroscopeCosmicVariant,
  'monthly-hub' | 'daily-hub' | 'weekly-hub'
>;

const HUB_TIMELINE_LINKS: Array<{ id: string; label: string; href: string }> = [
  {
    id: 'daily',
    label: 'Daily Horoscopes',
    href: '/grimoire/horoscopes/today',
  },
  {
    id: 'weekly',
    label: 'Weekly Horoscopes',
    href: '/grimoire/horoscopes/weekly',
  },
  { id: 'monthly', label: 'Monthly Horoscopes', href: '/grimoire/horoscopes' },
];

const HUB_FALLBACK_LINKS: Array<{ id: string; label: string; href: string }> = [
  { id: 'zodiac', label: 'Browse Zodiac Signs', href: '/grimoire/zodiac' },
  { id: 'events', label: 'Astrological Events', href: '/grimoire/events' },
  { id: 'moon', label: 'Lunar Almanac', href: '/grimoire/moon' },
  { id: 'transits', label: 'Transits Hub', href: '/grimoire/transits' },
];

const HUB_EXCLUSIONS: Record<HubVariant, Set<string>> = {
  'daily-hub': new Set(['daily']),
  'weekly-hub': new Set(['weekly']),
  'monthly-hub': new Set(['monthly']),
};

function sanitizeMonthSlug(value?: string): Month {
  if (!value) {
    return CURRENT_MONTH;
  }
  const normalized = value.toLowerCase();
  return MONTH_SET.has(normalized) ? (normalized as Month) : CURRENT_MONTH;
}

function sanitizeYear(value?: number, fallback?: number): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof fallback === 'number' && !Number.isNaN(fallback)) {
    return fallback;
  }
  return CURRENT_YEAR;
}

function getNextMonthInfo(month: Month, year: number) {
  const monthIndex = MONTHS.indexOf(month);
  if (monthIndex === -1) {
    return { month, year };
  }

  const nextIndex = (monthIndex + 1) % MONTHS.length;
  const nextMonth = MONTHS[nextIndex];
  const nextYear = nextIndex === 0 ? year + 1 : year;
  return { month: nextMonth, year: nextYear };
}

function buildSignTimelineLinks({
  sign,
  signName,
  month,
  year,
  skipCurrentMonth,
}: {
  sign: ZodiacSign;
  signName: string;
  month: Month;
  year: number;
  skipCurrentMonth?: boolean;
}): CosmicConnectionLink[] {
  const target = skipCurrentMonth
    ? getNextMonthInfo(month, year)
    : { month, year };

  const monthLabel = MONTH_DISPLAY_NAMES[target.month];

  return [
    {
      label: 'Daily Horoscope',
      href: '/grimoire/horoscopes/today',
    },
    {
      label: 'Weekly Horoscope',
      href: '/grimoire/horoscopes/weekly',
    },
    {
      label: `${monthLabel} ${target.year} Horoscope`,
      href: `/grimoire/horoscopes/${sign}/${target.year}/${target.month}`,
    },
    {
      label: `Explore all ${signName} horoscopes`,
      href: `/grimoire/horoscopes/${sign}`,
    },
  ];
}

function buildSignResourceLinks(sign: ZodiacSign, lunarYear: number) {
  const signName = SIGN_DISPLAY_NAMES[sign];
  const ruler = SIGN_RULERS[sign];

  return [
    {
      label: 'Birth Chart Guide',
      href: '/grimoire/guides/birth-chart-complete-guide',
    },
    {
      label: `${signName} Zodiac Sign`,
      href: `/grimoire/zodiac/${sign}`,
    },
    {
      label: `${ruler} in Astrology`,
      href: `/grimoire/astronomy/planets/${ruler.toLowerCase()}`,
    },
    {
      label: `${lunarYear} Lunar Events`,
      href: `/grimoire/moon/${lunarYear}`,
    },
  ];
}

function padLinksToFour(links: CosmicConnectionLink[]): CosmicConnectionLink[] {
  if (links.length >= 4) {
    return links.slice(0, 4);
  }

  const fallback: CosmicConnectionLink[] = [];
  for (const fallbackLink of HUB_FALLBACK_LINKS) {
    if (links.some((link) => link.href === fallbackLink.href)) continue;
    fallback.push({
      label: fallbackLink.label,
      href: fallbackLink.href,
    });
    if (links.length + fallback.length === 4) break;
  }

  return [...links, ...fallback].slice(0, 4);
}

function buildHubTimelineLinks(variant: HubVariant): CosmicConnectionLink[] {
  const exclusions = HUB_EXCLUSIONS[variant];
  const primary = HUB_TIMELINE_LINKS.filter((link) => !exclusions.has(link.id));

  return padLinksToFour(primary);
}

function isHubVariant(value: HoroscopeCosmicVariant): value is HubVariant {
  return (
    value === 'monthly-hub' || value === 'daily-hub' || value === 'weekly-hub'
  );
}

function buildHubAstrologyLinks(currentYear: number): CosmicConnectionLink[] {
  return [
    {
      label: 'Ruling Planets & Astrology',
      href: '/grimoire/astronomy/planets',
    },
    {
      label: `${currentYear} Cosmic Events`,
      href: `/grimoire/events/${currentYear}`,
    },
    {
      label: `${currentYear} Lunar Events`,
      href: `/grimoire/moon/${currentYear}`,
    },
    {
      label: 'Element Correspondences',
      href: '/grimoire/correspondences/elements',
    },
  ];
}

export function getHoroscopeCosmicSections(
  options: HoroscopeCosmicOptions,
): CosmicConnectionSection[] {
  const { variant, sign, monthSlug, year, currentYear } = options;
  const resolvedMonth = sanitizeMonthSlug(monthSlug);
  const resolvedYear = sanitizeYear(year, currentYear);
  const lunarYear = sanitizeYear(currentYear, resolvedYear);

  if (sign) {
    const signName = SIGN_DISPLAY_NAMES[sign];
    return [
      {
        title: `${signName} Horoscope Timeline`,
        links: buildSignTimelineLinks({
          sign,
          signName,
          month: resolvedMonth,
          year: resolvedYear,
          skipCurrentMonth: variant === 'monthly-sign',
        }),
      },
      {
        title: 'Sign Resources',
        links: buildSignResourceLinks(sign, lunarYear),
      },
    ];
  }

  if (isHubVariant(variant)) {
    return [
      {
        title: 'Horoscope Timelines',
        links: buildHubTimelineLinks(variant),
      },
      {
        title: 'Astrology Essentials',
        links: buildHubAstrologyLinks(lunarYear),
      },
    ];
  }

  return [];
}
