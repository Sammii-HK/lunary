import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ZODIAC_SIGNS,
  MONTHS,
  SIGN_DISPLAY_NAMES,
  MONTH_DISPLAY_NAMES,
  SIGN_SYMBOLS,
  SIGN_ELEMENTS,
  SIGN_RULERS,
  ZodiacSign,
  Month,
} from '@/constants/seo/monthly-horoscope';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { HoroscopeCosmicConnections } from '@/components/grimoire/HoroscopeCosmicConnections';
import { monthMeta } from '@/lib/horoscope-meta';
import { buildMonthlyForecast } from '@/lib/horoscope/monthly-forecast';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// 30-day revalidation for monthly horoscopes
export const revalidate = 2592000;
export const dynamicParams = false;

const START_YEAR = 2025;
const CURRENT_YEAR = new Date().getFullYear();
const END_YEAR = Math.max(CURRENT_YEAR + 1, START_YEAR + 1);
const AVAILABLE_YEARS = Array.from(
  { length: END_YEAR - START_YEAR + 1 },
  (_, i) => START_YEAR + i,
);

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

interface PageParams {
  sign: string;
  year: string;
  month: string;
}

function validateParams(params: PageParams): {
  sign: ZodiacSign;
  year: number;
  month: Month;
  monthNumber: number;
} | null {
  const sign = params.sign.toLowerCase() as ZodiacSign;
  const month = params.month.toLowerCase() as Month;
  const year = parseInt(params.year, 10);

  if (!ZODIAC_SIGNS.includes(sign)) return null;
  if (!MONTHS.includes(month)) return null;
  if (year < START_YEAR || year > END_YEAR) return null;

  const monthNumber = MONTHS.indexOf(month) + 1;
  return { sign, year, month, monthNumber };
}

export function generateStaticParams() {
  return ZODIAC_SIGNS.flatMap((sign) =>
    AVAILABLE_YEARS.flatMap((year) =>
      MONTHS.map((month) => ({
        sign,
        year: String(year),
        month,
      })),
    ),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const validated = validateParams(resolvedParams);

  if (!validated) {
    return { title: 'Horoscope Not Found | Lunary' };
  }

  const { sign, year, month, monthNumber } = validated;
  const signName = SIGN_DISPLAY_NAMES[sign];
  const monthName = MONTH_DISPLAY_NAMES[month];

  return monthMeta(signName, sign, String(year), month, monthName, monthNumber);
}

export default async function MonthlyHoroscopePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const resolvedParams = await params;
  const validated = validateParams(resolvedParams);
  const currentYear = new Date().getFullYear();

  if (!validated) {
    notFound();
  }

  const { sign, year, month, monthNumber } = validated;
  const signName = SIGN_DISPLAY_NAMES[sign];
  const monthName = MONTH_DISPLAY_NAMES[month];
  const symbol = SIGN_SYMBOLS[sign];
  const element = SIGN_ELEMENTS[sign];
  const ruler = SIGN_RULERS[sign];
  const forecast = buildMonthlyForecast(sign, year, month);

  const monthIndex = MONTHS.indexOf(month);
  const prevMonth = monthIndex > 0 ? MONTHS[monthIndex - 1] : MONTHS[11];
  const nextMonth = monthIndex < 11 ? MONTHS[monthIndex + 1] : MONTHS[0];

  const signIndex = ZODIAC_SIGNS.indexOf(sign);
  const prevSign =
    signIndex > 0 ? ZODIAC_SIGNS[signIndex - 1] : ZODIAC_SIGNS[11];
  const nextSign =
    signIndex < 11 ? ZODIAC_SIGNS[signIndex + 1] : ZODIAC_SIGNS[0];

  const meta = monthMeta(
    signName,
    sign,
    String(year),
    month,
    monthName,
    monthNumber,
  );
  const canonicalSource =
    meta.alternates?.canonical ??
    `/grimoire/horoscopes/${sign}/${year}/${month}`;
  const canonicalUrl =
    typeof canonicalSource === 'string'
      ? canonicalSource
      : String(canonicalSource);
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

  return (
    <SEOContentTemplate
      title={metaTitle ?? `${signName} Horoscope ${monthName} ${year}`}
      h1={`${symbol} ${signName} Horoscope ${monthName} ${year}: Your Complete Monthly Guide`}
      description={meta.description ?? ''}
      keywords={keywords}
      canonicalUrl={canonicalUrl}
      image={image}
      imageAlt={`${signName} ${monthName} ${year} Horoscope | Lunary`}
      datePublished={`${year}-${String(monthNumber).padStart(2, '0')}-01`}
      articleSection='Monthly Horoscopes'
      transitSign={signName}
      transitSignDisplay={signName}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Horoscopes', href: '/grimoire/horoscopes' },
        { label: signName, href: `/grimoire/horoscopes/${sign}` },
        { label: String(year), href: `/grimoire/horoscopes/${sign}/${year}` },
        { label: monthName },
      ]}
      whatIs={{
        question: `What can ${signName} expect in ${monthName} ${year}?`,
        answer: `${forecast.whatToExpect} ${forecast.decanFocus}`,
      }}
      intro={`${forecast.summary} ${forecast.slowMoving}`}
      tldr={forecast.tldr}
      faqs={[
        {
          question: `What can ${signName} expect in ${monthName} ${year}?`,
          answer: forecast.summary,
        },
        {
          question: `What is the main challenge for ${signName} in ${monthName} ${year}?`,
          answer: forecast.challenge,
        },
        {
          question: `How do slower planets affect ${signName} in ${monthName} ${year}?`,
          answer: `${forecast.slowMoving} ${forecast.decanFocus}`,
        },
      ]}
      meaning={`
## ${signName} Overview for ${monthName} ${year}

${forecast.summary} As a ${element} sign guided by ${ruler}, ${signName} does best this month by following the real timing of the sky instead of forcing a generic “monthly vibe.”

### How This Forecast Is Calculated

${forecast.methodology}

### Main Focus

${forecast.focus}

### Challenges to Navigate

${forecast.challenge}

### Opportunities Ahead

${forecast.opportunity}

### Timing Checkpoints

${forecast.timing}

### Slow Movers and Decans

${forecast.slowMoving}

${forecast.decanFocus}

### Love

${forecast.love}

### Career

${forecast.career}

### Wellbeing

${forecast.wellbeing}

### Year Ahead

${monthName} sets part of the tone for ${year}. The point is not to control every variable; it is to notice where the sky is actually helping, where it is applying pressure, and which slice of the month wants restraint versus action.

### Key Sky Events

${forecast.keyEvents.map((event) => `- **${event.dateLabel}: ${event.title}** — ${event.meaning}`).join('\n')}
      `}
      emotionalThemes={forecast.emotionalThemes}
      signsMostAffected={[signName]}
      tables={[
        {
          title: `${signName} ${monthName} ${year} At a Glance`,
          headers: ['Aspect', 'Details'],
          rows: [
            ['Sign', `${signName} ${symbol}`],
            ['Element', element],
            ['Ruling Planet', ruler],
            ...forecast.tableRows,
          ],
        },
      ]}
      followUpIntent={[
        {
          title: 'Dates and timing',
          description:
            'Use the month’s key sky events to choose when to act, wait, reset, or review.',
          href: `/grimoire/events/${year}`,
        },
        {
          title: 'Natal vs transit',
          description:
            'Compare this sign forecast with your birth chart to see where the month lands personally.',
          href: '/grimoire/birth-chart',
        },
        {
          title: 'Year context',
          description:
            'Zoom out from this month into the complete yearly forecast and quarterly checkpoints.',
          href: `/grimoire/horoscopes/${sign}/${year}`,
        },
        {
          title: 'Moon phase timing',
          description:
            'Layer the forecast with lunar phases for rituals, decisions, and emotional pacing.',
          href: `/grimoire/moon/${year}`,
        },
        {
          title: 'Placement examples',
          description:
            'Explore Sun, Moon, and Rising paths to make the forecast more specific.',
          href: `/grimoire/zodiac/${sign}`,
        },
      ]}
      components={null}
      cosmicConnections={
        <HoroscopeCosmicConnections
          variant='monthly-sign'
          sign={sign}
          monthSlug={month}
          year={year}
          currentYear={currentYear}
        />
      }
      ctaText={`Get your personalized ${signName} reading`}
      ctaHref='/horoscope'
      sources={[
        {
          name: 'Lunary monthly transit methodology',
          url: 'https://lunary.app/about/methodology',
        },
        {
          name: 'Astronomy Engine planetary calculations',
          url: 'https://github.com/cosinekitty/astronomy',
        },
        { name: 'Traditional Western astrology and decan doctrine' },
      ]}
    >
      <div className='mt-8 flex justify-between text-lg'>
        <div className='space-x-4'>
          {prevMonth && (
            <Link
              href={`/grimoire/horoscopes/${sign}/${year}/${prevMonth}`}
              className='text-lunary-primary-400 hover:text-content-brand flex items-center gap-2'
            >
              <ArrowLeft className='w-4 h-4' />
              {MONTH_DISPLAY_NAMES[prevMonth]}
            </Link>
          )}
        </div>
        <div className='space-x-4'>
          {nextMonth && (
            <Link
              href={`/grimoire/horoscopes/${sign}/${year}/${nextMonth}`}
              className='text-lunary-primary-400 hover:text-content-brand flex items-center gap-2'
            >
              {MONTH_DISPLAY_NAMES[nextMonth]}
              <ArrowRight className='w-4 h-4' />
            </Link>
          )}
        </div>
      </div>

      <div className='mt-6 flex flex-wrap gap-2 justify-center'>
        {ZODIAC_SIGNS.map((s) => (
          <Link
            key={s}
            href={`/grimoire/horoscopes/${s}/${year}/${month}`}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              s === sign
                ? 'bg-layer-base/30 text-content-secondary border border-lunary-primary-600'
                : 'bg-surface-card/50 text-content-muted hover:bg-surface-card hover:text-content-primary'
            }`}
          >
            {SIGN_SYMBOLS[s]} {SIGN_DISPLAY_NAMES[s]}
          </Link>
        ))}
      </div>

      <div className='mt-8 p-5 bg-surface-elevated/50 border border-stroke-subtle/50 rounded-xl'>
        <h3 className='text-lg font-medium text-content-primary mb-3'>
          Explore {signName} placements
        </h3>
        <p className='text-sm text-content-muted mb-4'>
          Your horoscope depends on where {signName} falls in your chart.
          Explore each placement for deeper insight.
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
    </SEOContentTemplate>
  );
}
