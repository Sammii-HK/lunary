import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { HoroscopeCosmicConnections } from '@/components/grimoire/HoroscopeCosmicConnections';

import {
  ZODIAC_SIGNS,
  SIGN_DISPLAY_NAMES,
  SIGN_SYMBOLS,
  SIGN_ELEMENTS,
  SIGN_RULERS,
  ZodiacSign,
  MONTHS,
} from '@/constants/seo/monthly-horoscope';

const AVAILABLE_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

export async function generateStaticParams() {
  return ZODIAC_SIGNS.map((sign) => ({
    sign,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sign: string }>;
}): Promise<Metadata> {
  const { sign } = await params;
  const signKey = sign.toLowerCase() as ZodiacSign;

  if (!ZODIAC_SIGNS.includes(signKey)) {
    return { title: 'Sign Not Found | Lunary' };
  }

  const signName = SIGN_DISPLAY_NAMES[signKey];
  const title = `${signName} Horoscopes: Monthly Predictions & Forecasts | Lunary`;
  const description = `${signName} horoscopes for all months and years. Get detailed monthly predictions for ${signName} including love, career, health, and finance forecasts.`;

  return {
    title,
    description,
    keywords: [
      `${signName.toLowerCase()} horoscope`,
      `${signName.toLowerCase()} monthly horoscope`,
      `${signName.toLowerCase()} predictions`,
      `${signName.toLowerCase()} forecast`,
      'monthly horoscope',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/horoscopes/${sign}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/horoscopes/${sign}`,
    },
  };
}

export default async function SignHoroscopePage({
  params,
}: {
  params: Promise<{ sign: string }>;
}) {
  const { sign } = await params;
  const signKey = sign.toLowerCase() as ZodiacSign;

  if (!ZODIAC_SIGNS.includes(signKey)) {
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

  const birthChartCta = {
    text: 'Get your personalised horoscope based on your full birth chart',
    href: '/horoscope',
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthSlug = MONTHS[now.getMonth()];

  return (
    <SEOContentTemplate
      title={`${signName} Horoscopes: Monthly Predictions & Forecasts | Lunary`}
      h1={`${signName} Horoscopes`}
      description={`${signName} monthly horoscopes, insights, and yearly forecasts.`}
      keywords={[
        `${signName.toLowerCase()} horoscope`,
        `${signName.toLowerCase()} monthly horoscope`,
        `${signName.toLowerCase()} forecasts`,
        'monthly horoscope',
      ]}
      canonicalUrl={`https://lunary.app/grimoire/horoscopes/${sign}`}
      intro={`Select a year to read ${signName} horoscopes written with real planetary context. Each month includes lunations, transits, and practical guidance tailored to ${element.toLowerCase()} energy.`}
      meaning={`As a ${element} sign ruled by ${ruler}, ${signName} thrives on ${element.toLowerCase()} momentum, persistence, and emotional depth. These horoscopes help you channel your natural strengths into the rituals, relationships, and work that matter most.`}
      heroContent={heroContent}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Horoscopes', href: '/grimoire/horoscopes' },
        { label: signName },
      ]}
      cosmicConnections={
        <HoroscopeCosmicConnections
          variant='sign-root'
          sign={signKey}
          monthSlug={currentMonthSlug}
          year={currentYear}
          currentYear={currentYear}
        />
      }
      ctaText={birthChartCta.text}
      ctaHref={birthChartCta.href}
      childrenPosition='after-description'
    >
      <section className='mb-12'>
        <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
          Select a Year
        </h2>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          {AVAILABLE_YEARS.map((year) => (
            <Link
              key={year}
              href={`/grimoire/horoscopes/${sign}/${year}`}
              className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 hover:bg-zinc-900 transition-all text-center group'
            >
              <div className='text-2xl font-light text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                {year}
              </div>
              <div className='text-sm text-zinc-400 mt-1'>
                {signName} Horoscopes
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SEOContentTemplate>
  );
}
