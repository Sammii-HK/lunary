import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  ZODIAC_SIGNS,
  SIGN_DISPLAY_NAMES,
  SIGN_SYMBOLS,
  SIGN_ELEMENTS,
} from '@/constants/seo/monthly-horoscope';
import { CosmicHighlight } from './CosmicHighlight';
import { HoroscopeCosmicConnections } from '@/components/grimoire/HoroscopeCosmicConnections';

const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Monthly Horoscopes ${currentYear} & ${nextYear}: All Zodiac Signs`,
    description: `Free monthly horoscopes for all 12 zodiac signs. Get detailed predictions for love, career, health & more. Updated monthly for ${currentYear}-${nextYear + 4}.`,
    keywords: [
      'monthly horoscope',
      'free horoscope',
      `${currentYear} horoscope`,
      `${nextYear} horoscope`,
      'zodiac predictions',
      'astrology forecast',
      'aries horoscope',
      'taurus horoscope',
      'gemini horoscope',
      'cancer horoscope',
      'leo horoscope',
      'virgo horoscope',
      'libra horoscope',
      'scorpio horoscope',
      'sagittarius horoscope',
      'capricorn horoscope',
      'aquarius horoscope',
      'pisces horoscope',
    ],
    openGraph: {
      title: `Monthly Horoscopes ${currentYear} & ${nextYear}: All Zodiac Signs`,
      description: `Free monthly horoscopes for all 12 zodiac signs. Get your predictions for ${currentYear} and ${nextYear}.`,
      url: 'https://lunary.app/grimoire/horoscopes',
    },
    alternates: {
      canonical: 'https://lunary.app/grimoire/horoscopes',
    },
  };
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Monthly Horoscopes',
  description: 'Monthly horoscope predictions for all 12 zodiac signs',
  numberOfItems: 12,
  itemListElement: ZODIAC_SIGNS.map((sign, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: `${SIGN_DISPLAY_NAMES[sign]} Horoscope`,
    url: `https://lunary.app/grimoire/horoscopes/${sign}`,
  })),
};

const currentDate = new Date();
const currentMonth = currentDate
  .toLocaleString('en-US', { month: 'long' })
  .toLowerCase();

const AVAILABLE_YEARS = [2026, 2027, 2028, 2029, 2030, 2031];

export default function GrimoireHoroscopesPage() {
  return (
    <SEOContentTemplate
      title={`Monthly Horoscopes ${currentYear} & ${nextYear}: All Zodiac Signs`}
      h1='Free Monthly Horoscopes for All Zodiac Signs'
      description='Discover free monthly horoscopes for all 12 zodiac signs, with updates for every sign and season.'
      keywords={[
        'monthly horoscope',
        'free horoscope',
        `${currentYear} horoscope`,
        `${nextYear} horoscope`,
        'zodiac predictions',
        'astrology forecast',
        'monthly forecast',
        'zodiac signs',
        'aries horoscope',
        'taurus horoscope',
        'gemini horoscope',
        'cancer horoscope',
        'leo horoscope',
        'virgo horoscope',
        'libra horoscope',
        'scorpio horoscope',
        'sagittarius horoscope',
        'capricorn horoscope',
        'aquarius horoscope',
        'pisces horoscope',
      ]}
      canonicalUrl='https://lunary.app/grimoire/horoscopes'
      additionalSchemas={[structuredData]}
      whatIs={{
        question: 'What are monthly horoscopes?',
        answer: `Monthly horoscopes provide detailed astrological predictions for each zodiac sign covering an entire month. They forecast trends in love, career, health, and personal growth based on planetary movements and astrological transits. Our monthly horoscopes are updated regularly for ${currentYear} through ${nextYear + 4}, giving you comprehensive insights for long-range planning.`,
      }}
      intro={`Welcome to your complete monthly horoscope guide. Discover what the stars have in store for your zodiac sign with detailed predictions covering love, career, health, and personal growth.

Our monthly horoscopes are updated regularly and provide personalized insights based on current planetary movements and astrological transits. We publish forecasts from ${currentYear} through ${nextYear + 4}, giving you unprecedented long-range insight into your cosmic journey.

Select your zodiac sign below to explore detailed monthly predictions.`}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Horoscopes' },
      ]}
      cosmicConnections={
        <HoroscopeCosmicConnections
          variant='monthly-hub'
          currentYear={currentYear}
        />
      }
    >
      <CosmicHighlight />

      <div className='mb-12'>
        <h2 className='text-2xl font-light mb-6'>
          {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}{' '}
          {currentYear} Horoscopes
        </h2>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {ZODIAC_SIGNS.map((sign) => (
            <Link
              key={sign}
              href={`/grimoire/horoscopes/${sign}/${currentYear}/${currentMonth}`}
              className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 hover:bg-zinc-900 transition-all group'
            >
              <div className='text-4xl mb-3'>{SIGN_SYMBOLS[sign]}</div>
              <h3 className='text-lg font-medium text-zinc-100 group-hover:text-lunary-accent-300 transition-colors'>
                {SIGN_DISPLAY_NAMES[sign]}
              </h3>
              <p className='text-sm text-zinc-400'>
                {SIGN_ELEMENTS[sign]} Sign
              </p>
            </Link>
          ))}
        </div>
      </div>
    </SEOContentTemplate>
  );
}
