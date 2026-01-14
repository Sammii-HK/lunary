import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

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
  const title = `${signName} Horoscope ${year}: All Monthly Forecasts | Lunary`;
  const description = `${signName} horoscope for all 12 months of ${year}. Complete monthly predictions including love, career, and life guidance for ${signName}.`;

  return {
    title,
    description,
    keywords: [
      `${signName.toLowerCase()} horoscope ${year}`,
      `${signName.toLowerCase()} ${year}`,
      `${signName.toLowerCase()} monthly horoscope`,
      `${year} horoscope`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/horoscopes/${sign}/${year}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/horoscopes/${sign}/${year}`,
    },
  };
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

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title={`${signName} Horoscope ${year}: All Monthly Forecasts | Lunary`}
        h1={`${signName} Horoscope ${year}`}
        description={`Full monthly forecast for ${signName} in ${year} including love, career, and personal growth highlights.`}
        keywords={[
          `${signName.toLowerCase()} horoscope ${year}`,
          `${signName.toLowerCase()} ${year}`,
          `${year} monthly horoscope`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/horoscopes/${sign}/${year}`}
        intro={`Dive into every month of ${year} with forecasts for ${signName} that weave together the Moon, planetary transits, and practical rituals so you can plan ahead.`}
        meaning={`This ${year} forecast helps ${signName} timeframe focus. Use slow, deliberate planning infused with ${element.toLowerCase()} energy and the guidance of ${ruler} to own visible progress throughout the year.`}
        heroContent={heroContent}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Horoscopes', href: '/grimoire/horoscopes' },
          { label: signName, href: `/grimoire/horoscopes/${sign}` },
          { label: `${year}` },
        ]}
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
              Your ruler, {ruler}, highlights long-term momentum. Focus on
              steady growth, visible wins, and a clearer public direction.
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
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Other Years
          </h2>
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
    </div>
  );
}
