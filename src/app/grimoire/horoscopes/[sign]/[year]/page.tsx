import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { HoroscopeCosmicConnections } from '@/components/grimoire/HoroscopeCosmicConnections';
import { yearMeta } from '@/lib/horoscope-meta';
import snippetsData from '@/data/yearly-horoscope-snippets.json';

import {
  ZODIAC_SIGNS,
  MONTHS,
  SIGN_DISPLAY_NAMES,
  SIGN_SYMBOLS,
  SIGN_ELEMENTS,
  MONTH_DISPLAY_NAMES,
  ZodiacSign,
} from '@/constants/seo/monthly-horoscope';
import {
  formatRulershipValue,
  getPrimaryRuler,
} from '@/lib/astrology/rulerships';
import { buildMonthlyForecast } from '@/lib/horoscope/monthly-forecast';

// 30-day revalidation for yearly horoscopes
export const revalidate = 2592000;
export const dynamicParams = false;

const CURRENT_YEAR = new Date().getFullYear();
const AVAILABLE_YEARS = [
  Math.max(2025, CURRENT_YEAR - 1),
  CURRENT_YEAR,
  CURRENT_YEAR + 1,
];

function resolveOgImageUrl(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof URL) return value.toString();
  if (typeof value === 'object' && value !== null) {
    const candidate = value as { url?: string | URL; src?: string | URL };
    if (typeof candidate.url === 'string') return candidate.url;
    if (candidate.url instanceof URL) return candidate.url.toString();
    if (typeof candidate.src === 'string') return candidate.src;
    if (candidate.src instanceof URL) return candidate.src.toString();
  }
  return undefined;
}

function resolveCanonicalUrl(value: unknown, fallback: string): string {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  if (value instanceof URL) return value.toString();
  if (typeof value === 'object' && value !== null) {
    const candidate = value as { canonical?: string | URL };
    if (typeof candidate.canonical === 'string') return candidate.canonical;
    if (candidate.canonical instanceof URL)
      return candidate.canonical.toString();
  }
  return fallback;
}

const SIGN_SEASON_MONTHS: Record<ZodiacSign, string[]> = {
  aries: ['March', 'April'],
  taurus: ['April', 'May'],
  gemini: ['May', 'June'],
  cancer: ['June', 'July'],
  leo: ['July', 'August'],
  virgo: ['August', 'September'],
  libra: ['September', 'October'],
  scorpio: ['October', 'November'],
  sagittarius: ['November', 'December'],
  capricorn: ['December', 'January'],
  aquarius: ['January', 'February'],
  pisces: ['February', 'March'],
};

type YearCheckpoint = {
  label: string;
  month: (typeof MONTHS)[number];
};

const YEAR_CHECKPOINTS: YearCheckpoint[] = [
  { label: 'Opening stretch', month: 'january' },
  { label: 'Spring pivot', month: 'april' },
  { label: 'Summer expansion', month: 'july' },
  { label: 'Autumn integration', month: 'october' },
];

function cleanForecastSentence(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function uniqueNonEmpty(values: Array<string | undefined>): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean))];
}

export function generateStaticParams() {
  return ZODIAC_SIGNS.flatMap((sign) =>
    AVAILABLE_YEARS.map((year) => ({
      sign,
      year: String(year),
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sign: string; year: string }>;
}): Promise<Metadata> {
  const { sign, year } = await params;
  const signKey = sign.toLowerCase() as ZodiacSign;
  const yearNum = parseInt(year);

  if (!ZODIAC_SIGNS.includes(signKey) || !AVAILABLE_YEARS.includes(yearNum)) {
    return { title: 'Not Found | Lunary' };
  }

  const signName = SIGN_DISPLAY_NAMES[signKey];
  return yearMeta(signName, sign, year);
}

export default async function YearHoroscopePage({
  params,
}: {
  params: Promise<{ sign: string; year: string }>;
}) {
  const { sign, year } = await params;
  const signKey = sign.toLowerCase() as ZodiacSign;
  const yearNum = parseInt(year);

  if (!ZODIAC_SIGNS.includes(signKey) || !AVAILABLE_YEARS.includes(yearNum)) {
    notFound();
  }

  const signName = SIGN_DISPLAY_NAMES[signKey];
  const symbol = SIGN_SYMBOLS[signKey];
  const element = SIGN_ELEMENTS[signKey];
  const ruler = getPrimaryRuler(signName);
  const rulership = formatRulershipValue(signName);

  const heroContent = (
    <div className='text-center space-y-3'>
      <span className='text-6xl'>{symbol}</span>
      <p className='text-sm uppercase tracking-[0.3em] text-content-muted'>
        {element} Sign • Rulership: {rulership}
      </p>
    </div>
  );

  const seasonMonths = SIGN_SEASON_MONTHS[signKey] ?? [];
  const seasonText =
    seasonMonths.length > 0 ? seasonMonths.join(' and ') : 'your solar season';

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthSlug = MONTHS[now.getMonth()];

  const meta = yearMeta(signName, sign, year);
  const checkpointForecasts = YEAR_CHECKPOINTS.map((checkpoint) => ({
    ...checkpoint,
    forecast: buildMonthlyForecast(signKey, yearNum, checkpoint.month),
  }));
  const [januaryForecast, aprilForecast, julyForecast, octoberForecast] =
    checkpointForecasts.map((entry) => entry.forecast);
  const yearlySlowMoving = uniqueNonEmpty(
    checkpointForecasts.map((entry) => entry.forecast.slowMoving),
  );
  const yearlyDecanFocus = uniqueNonEmpty(
    checkpointForecasts.map((entry) => entry.forecast.decanFocus),
  );
  const yearlyChallenge = uniqueNonEmpty(
    checkpointForecasts.map((entry) => entry.forecast.challenge),
  ).slice(0, 2);
  const yearlyOpportunity = uniqueNonEmpty(
    checkpointForecasts.map((entry) => entry.forecast.opportunity),
  ).slice(0, 2);
  const yearlyTiming = checkpointForecasts
    .map(
      (entry) =>
        `**${entry.label} (${MONTH_DISPLAY_NAMES[entry.month]})**: ${cleanForecastSentence(entry.forecast.timing)}`,
    )
    .join('\n');
  const faqItems = [
    {
      question: `What does the ${signName} horoscope ${year} cover?`,
      answer: `It maps the year in two layers: the slow-moving planets shaping the long story for ${signName}, and the monthly checkpoints that show when love, work, energy, and relationships move fastest.`,
    },
    {
      question: `How should I use the ${year} ${signName} horoscope?`,
      answer: `Use it as a timing map. Start with the long-range current, then use the quarterly pivots and monthly forecasts to decide when to push, when to adjust, and when to let a transit finish revealing its terms.`,
    },
    {
      question: `Is this ${signName} horoscope personalized?`,
      answer:
        'No. It is a general forecast based on the Sun sign, not your full birth chart.',
    },
    {
      question: `Does the ${year} forecast include all months?`,
      answer: 'Yes. You can navigate every month of the year from this page.',
    },
    {
      question: `Which months bring the strongest love energy for ${signName} in ${year}?`,
      answer: `Your sign season (${seasonText}) still matters, but the better guide is the months when your supportive transits are easiest to use. Right now the clearest growth current is: ${yearlyOpportunity[0] ?? januaryForecast.love}`,
    },
    {
      question: `What love and career priorities should ${signName} keep in mind this year?`,
      answer: `Lead with your ${element.toLowerCase()} strengths, but let the sky set the pace. The main opening this year is ${yearlyOpportunity[0] ?? julyForecast.career} The main pressure point is ${yearlyChallenge[0] ?? octoberForecast.career}`,
    },
    {
      question: `What key transits should ${signName} track in ${year}?`,
      answer:
        `${yearlySlowMoving[0] ?? januaryForecast.slowMoving} ${yearlySlowMoving[1] ?? ''}`.trim(),
    },
  ];
  const canonicalValue =
    meta.alternates?.canonical ?? `/grimoire/horoscopes/${sign}/${year}`;
  const canonicalUrl = resolveCanonicalUrl(
    canonicalValue,
    `/grimoire/horoscopes/${sign}/${year}`,
  );
  const metaTitle = meta.title ? String(meta.title) : undefined;
  const keywords =
    Array.isArray(meta.keywords) || typeof meta.keywords === 'string'
      ? Array.isArray(meta.keywords)
        ? meta.keywords
        : [meta.keywords]
      : [];
  const openGraphImages = meta.openGraph?.images
    ? Array.isArray(meta.openGraph.images)
      ? meta.openGraph.images
      : [meta.openGraph.images]
    : [];
  const resolvedImage = openGraphImages
    .map(resolveOgImageUrl)
    .find((value): value is string => typeof value === 'string');
  const image = resolvedImage ?? 'https://lunary.app/api/og/cosmic';

  // ItemList schema for all 12 months
  const monthsItemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: MONTHS.map((month, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${signName} ${MONTH_DISPLAY_NAMES[month]} ${year}`,
      url: `https://lunary.app/grimoire/horoscopes/${sign}/${year}/${month}`,
    })),
  };

  return (
    <SEOContentTemplate
      title={metaTitle ?? `${signName} Horoscope ${year}`}
      h1={`${signName} Horoscope ${year}: Complete Year Guide`}
      description={meta.description ?? ''}
      keywords={keywords}
      canonicalUrl={canonicalUrl}
      datePublished={`${year}-01-01`}
      image={image}
      imageAlt={`${signName} Horoscope ${year} | Lunary`}
      transitSign={signName}
      transitSignDisplay={signName}
      whatIs={{
        question: `What does the ${signName} horoscope for ${year} include?`,
        answer: `The ${signName} horoscope for ${year} provides a transit-led yearly overview and complete monthly forecasts for love, career, health, and personal growth. ${signName} is a ${element} sign with rulership ${rulership}, so this guide tracks how outer-planet shifts, supportive aspects, and pressure points build across the year. It includes all 12 monthly predictions, key timing pivots, and practical guidance for the year ahead.`,
      }}
      intro={`Track ${signName} through ${year} with a grounded yearly forecast built from real planetary movement: the slow movers setting the long arc, the sharper monthly pivots, and the months when your sign gets the clearest openings or the hardest pressure tests.`}
      meaning={`## What to Expect for ${signName} in ${year}

${year} brings important themes for ${signName}, but this is not one long generic mood board. The story comes from the planets actually shaping your sign across the year.

### The long-range current

${yearlySlowMoving[0] ?? januaryForecast.slowMoving}

${yearlySlowMoving[1] ?? ''}

### Where the year wants growth

${yearlyOpportunity[0] ?? januaryForecast.opportunity}

${yearlyOpportunity[1] ?? ''}

### Where the year applies pressure

${yearlyChallenge[0] ?? aprilForecast.challenge}

${yearlyChallenge[1] ?? ''}

### Timing pivots

${yearlyTiming}

### Decan timing for ${signName}

${yearlyDecanFocus[0] ?? januaryForecast.decanFocus}

${yearlyDecanFocus[1] ?? ''}

Select any month below for the detailed version of how those transits land in real time. Your element (${element}) and rulership (${rulership}) still matter, but the strongest story this year comes from how the slow movers and exact sign-to-sign aspects keep leaning on your chart.`}
      additionalSchemas={[monthsItemListSchema]}
      heroContent={heroContent}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Horoscopes', href: '/grimoire/horoscopes' },
        { label: signName, href: `/grimoire/horoscopes/${sign}` },
        { label: `${year}` },
      ]}
      cosmicConnections={
        <HoroscopeCosmicConnections
          variant='yearly-sign'
          sign={signKey}
          monthSlug={currentMonthSlug}
          year={yearNum}
          currentYear={currentYear}
        />
      }
      components={null}
      faqs={faqItems}
      tldr={`${year} asks ${signName} to work with the long-range planets, not just the monthly weather: follow the strongest growth windows, respect the pressure points, and time your bigger moves around the clearest seasonal pivots.`}
      ctaText='See your full birth-chart horoscope in the app'
      ctaHref='/horoscope'
      childrenPosition='after-description'
    >
      {(() => {
        const yearSnippets = (
          snippetsData.years as Record<
            string,
            Record<string, { snippet: string }>
          >
        )[year];
        const signSnippet = yearSnippets?.[signKey]?.snippet;
        return signSnippet ? (
          <section className='mb-10 rounded-lg border border-stroke-subtle bg-surface-elevated/30 px-6 py-5'>
            <p className='text-sm uppercase tracking-widest text-content-muted mb-3'>
              {year} at a glance
            </p>
            <p className='text-content-secondary leading-relaxed'>
              {signSnippet}
            </p>
          </section>
        ) : null;
      })()}

      <section className='mb-12 grid gap-4 md:grid-cols-3'>
        <div className='rounded-lg border border-stroke-subtle bg-surface-elevated/40 p-5'>
          <h2 className='text-lg font-medium text-content-primary mb-2'>
            Long-range current
          </h2>
          <p className='text-sm text-content-muted'>
            {yearlySlowMoving[0] ?? januaryForecast.slowMoving}
          </p>
        </div>
        <div className='rounded-lg border border-stroke-subtle bg-surface-elevated/40 p-5'>
          <h2 className='text-lg font-medium text-content-primary mb-2'>
            Main opportunity
          </h2>
          <p className='text-sm text-content-muted'>
            {yearlyOpportunity[0] ?? julyForecast.opportunity}
          </p>
        </div>
        <div className='rounded-lg border border-stroke-subtle bg-surface-elevated/40 p-5'>
          <h2 className='text-lg font-medium text-content-primary mb-2'>
            Main pressure point
          </h2>
          <p className='text-sm text-content-muted'>
            {yearlyChallenge[0] ?? octoberForecast.challenge}
          </p>
        </div>
      </section>

      <section className='mb-12'>
        <h2 className='text-2xl font-medium text-content-primary mb-6'>
          Yearly checkpoints
        </h2>
        <div className='grid gap-4 md:grid-cols-2'>
          {checkpointForecasts.map(({ label, month, forecast }) => (
            <div
              key={month}
              className='rounded-lg border border-stroke-subtle bg-surface-elevated/40 p-5'
            >
              <div className='mb-2 flex items-center justify-between gap-3'>
                <h3 className='text-lg font-medium text-content-primary'>
                  {label}
                </h3>
                <span className='text-xs uppercase tracking-[0.2em] text-content-muted'>
                  {MONTH_DISPLAY_NAMES[month]}
                </span>
              </div>
              <p className='mb-3 text-sm text-content-muted'>
                {forecast.summary}
              </p>
              <ul className='space-y-2 text-sm text-content-muted'>
                <li>
                  <span className='font-medium text-content-primary'>
                    Focus:
                  </span>{' '}
                  {forecast.focus}
                </li>
                <li>
                  <span className='font-medium text-content-primary'>
                    Pressure:
                  </span>{' '}
                  {forecast.challenge}
                </li>
                <li>
                  <span className='font-medium text-content-primary'>
                    Opening:
                  </span>{' '}
                  {forecast.opportunity}
                </li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className='mb-12'>
        <h2 className='text-2xl font-medium text-content-primary mb-6'>
          Select a Month
        </h2>
        <div className='grid grid-cols-3 md:grid-cols-4 gap-4'>
          {MONTHS.map((month) => (
            <Link
              key={month}
              href={`/grimoire/horoscopes/${sign}/${year}/${month}`}
              className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50 hover:border-lunary-primary-600 hover:bg-surface-elevated transition-all text-center group'
            >
              <div className='font-medium text-content-primary group-hover:text-content-brand transition-colors'>
                {MONTH_DISPLAY_NAMES[month]}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className='mb-12'>
        <h2 className='text-2xl font-medium text-content-primary mb-6'>
          Other Years
        </h2>
        <div className='flex flex-wrap gap-2'>
          {AVAILABLE_YEARS.filter((y) => y !== yearNum).map((y) => (
            <Link
              key={y}
              href={`/grimoire/horoscopes/${sign}/${y}`}
              className='px-4 py-2 rounded-lg bg-surface-card/50 text-content-secondary hover:bg-surface-card hover:text-content-primary transition-colors text-sm'
            >
              {y}
            </Link>
          ))}
        </div>
      </section>

      <section className='mb-12'>
        <div className='p-5 bg-surface-elevated/50 border border-stroke-subtle/50 rounded-xl'>
          <h2 className='text-lg font-medium text-content-primary mb-3'>
            Explore {signName} placements
          </h2>
          <p className='text-sm text-content-muted mb-4'>
            Your {year} horoscope shifts depending on where {signName} sits in
            your chart. Explore each placement for deeper insight.
          </p>
          <div className='flex flex-wrap gap-3'>
            <Link
              href={`/grimoire/zodiac/${sign}`}
              className='text-sm text-lunary-primary-400 hover:text-content-brand transition-colors'
            >
              {signName} Sun sign &rarr;
            </Link>
            <Link
              href={`/grimoire/moon-in/${sign}`}
              className='text-sm text-lunary-primary-400 hover:text-content-brand transition-colors'
            >
              Moon in {signName} &rarr;
            </Link>
            <Link
              href={`/grimoire/rising/${sign}`}
              className='text-sm text-lunary-primary-400 hover:text-content-brand transition-colors'
            >
              {signName} rising &rarr;
            </Link>
          </div>
        </div>
      </section>

      <section className='mb-12'>
        <h2 className='text-2xl font-medium text-content-primary mb-6'>
          Other Signs for {year}
        </h2>
        <div className='flex flex-wrap gap-2'>
          {ZODIAC_SIGNS.filter((s) => s !== signKey).map((s) => (
            <Link
              key={s}
              href={`/grimoire/horoscopes/${s}/${year}`}
              className='px-4 py-2 rounded-lg bg-surface-card/50 text-content-secondary hover:bg-surface-card hover:text-content-primary transition-colors text-sm'
            >
              {SIGN_SYMBOLS[s]} {SIGN_DISPLAY_NAMES[s]}
            </Link>
          ))}
        </div>
      </section>
    </SEOContentTemplate>
  );
}
