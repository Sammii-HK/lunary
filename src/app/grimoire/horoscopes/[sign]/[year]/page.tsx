import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { HoroscopeCosmicConnections } from '@/components/grimoire/HoroscopeCosmicConnections';
import { yearMeta } from '@/lib/horoscope-meta';

import {
  ZODIAC_SIGNS,
  MONTHS,
  SIGN_DISPLAY_NAMES,
  SIGN_SYMBOLS,
  SIGN_ELEMENTS,
  SIGN_RULERS,
  MONTH_DISPLAY_NAMES,
  ZodiacSign,
} from '@/constants/seo/monthly-horoscope';

const AVAILABLE_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

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

export async function generateStaticParams() {
  const params: { sign: string; year: string }[] = [];

  ZODIAC_SIGNS.forEach((sign) => {
    AVAILABLE_YEARS.forEach((year) => {
      params.push({
        sign,
        year: String(year),
      });
    });
  });

  return params;
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
  const ruler = SIGN_RULERS[signKey];

  const heroContent = (
    <div className='text-center space-y-3'>
      <span className='text-6xl'>{symbol}</span>
      <p className='text-sm uppercase tracking-[0.3em] text-zinc-400'>
        {element} Sign • Ruled by {ruler}
      </p>
    </div>
  );

  const seasonMonths = SIGN_SEASON_MONTHS[signKey] ?? [];
  const seasonText =
    seasonMonths.length > 0 ? seasonMonths.join(' and ') : 'your solar season';

  const faqItems = [
    {
      question: `What does the ${signName} horoscope ${year} cover?`,
      answer:
        'It summarizes month-by-month themes with a focus on love, career, and personal growth.',
    },
    {
      question: `How should I use the ${year} ${signName} horoscope?`,
      answer:
        'Use it as a planning guide to spot timing, themes, and priorities across the year.',
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
      answer: `Your sign season (${seasonText}) naturally lifts the heart, and the month before and after your solar return tends to be the most magnetic. Use that energy as a starting point to initiate new connections or deepen existing ones.`,
    },
    {
      question: `What love and career priorities should ${signName} keep in mind this year?`,
      answer: `Lean into your element (${element}) and the steady rulership of ${ruler}. Love grows when you stay emotionally present; career momentum needs disciplined pursuit and visible consistency.`,
    },
    {
      question: `What key transits should ${signName} track in ${year}?`,
      answer: `Watch how ${ruler} and the outer planets (Jupiter, Saturn, and the slower generational bodies) move through your opposite signs. Those transits cue growth windows, so mark them in your calendar alongside the months when the Sun and Venus light up your sign.`,
    },
  ];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthSlug = MONTHS[now.getMonth()];

  const meta = yearMeta(signName, sign, year);
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

  return (
    <SEOContentTemplate
      title={metaTitle ?? `${signName} Horoscope ${year}`}
      h1={`${signName} Horoscope ${year}`}
      description={meta.description ?? ''}
      keywords={keywords}
      canonicalUrl={canonicalUrl}
      image={image}
      imageAlt={`${signName} Horoscope ${year} | Lunary`}
      intro={`Dive into every month of ${year} with forecasts for ${signName} that weave together the Moon, planetary transits, and practical rituals so you can plan ahead.`}
      meaning={`This ${year} forecast helps ${signName} timeframe focus. Use slow, deliberate planning infused with ${element.toLowerCase()} energy and the guidance of ${ruler} to own visible progress throughout the year.`}
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
      faqs={faqItems}
      tldr={`TL;DR: ${year} keeps ${signName} rooted in ${element.toLowerCase()} consistency while ${ruler} asks you to tell a longer story with your choices.`}
      ctaText='See your full birth-chart horoscope in the app'
      ctaHref='/horoscope'
      childrenPosition='after-description'
    >
      <section className='mb-12 grid gap-4 md:grid-cols-3'>
        <div className='rounded-lg border border-zinc-800 bg-zinc-900/40 p-5'>
          <h2 className='text-lg font-medium text-zinc-100 mb-2'>Love</h2>
          <p className='text-sm text-zinc-400'>
            {year} invites {signName} to build love through{' '}
            {element.toLowerCase()} consistency. Lead with honesty and let
            relationships deepen through shared routines.
          </p>
        </div>
        <div className='rounded-lg border border-zinc-800 bg-zinc-900/40 p-5'>
          <h2 className='text-lg font-medium text-zinc-100 mb-2'>Career</h2>
          <p className='text-sm text-zinc-400'>
            Your ruler, {ruler}, highlights long-term momentum. Focus on steady
            growth, visible wins, and a clearer public direction.
          </p>
        </div>
        <div className='rounded-lg border border-zinc-800 bg-zinc-900/40 p-5'>
          <h2 className='text-lg font-medium text-zinc-100 mb-2'>Year</h2>
          <p className='text-sm text-zinc-400'>
            This year is about aligning your monthly choices with a single
            through-line. Let {signName} set the tone for what you want to be
            known for.
          </p>
        </div>
      </section>

      <section className='mb-12'>
        <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
          Select a Month
        </h2>
        <div className='grid grid-cols-3 md:grid-cols-4 gap-4'>
          {MONTHS.map((month) => (
            <Link
              key={month}
              href={`/grimoire/horoscopes/${sign}/${year}/${month}`}
              className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 hover:bg-zinc-900 transition-all text-center group'
            >
              <div className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                {MONTH_DISPLAY_NAMES[month]}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className='mb-12'>
        <h2 className='text-2xl font-medium text-zinc-100 mb-6'>Other Years</h2>
        <div className='flex flex-wrap gap-2'>
          {AVAILABLE_YEARS.filter((y) => y !== yearNum).map((y) => (
            <Link
              key={y}
              href={`/grimoire/horoscopes/${sign}/${y}`}
              className='px-4 py-2 rounded-lg bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-sm'
            >
              {y}
            </Link>
          ))}
        </div>
      </section>

      <section className='mb-12'>
        <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
          Other Signs for {year}
        </h2>
        <div className='flex flex-wrap gap-2'>
          {ZODIAC_SIGNS.filter((s) => s !== signKey).map((s) => (
            <Link
              key={s}
              href={`/grimoire/horoscopes/${s}/${year}`}
              className='px-4 py-2 rounded-lg bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-sm'
            >
              {SIGN_SYMBOLS[s]} {SIGN_DISPLAY_NAMES[s]}
            </Link>
          ))}
        </div>
      </section>
    </SEOContentTemplate>
  );
}
