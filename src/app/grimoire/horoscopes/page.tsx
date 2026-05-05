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
    description: `Free monthly horoscopes for all 12 zodiac signs. Get detailed predictions for love, career, health & more. Updated monthly for ${currentYear}-${nextYear}.`,
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

const AVAILABLE_YEARS = [currentYear, nextYear];

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
        answer: `Monthly horoscopes provide detailed astrological predictions for each zodiac sign covering an entire month. They forecast trends in love, career, health, and personal growth based on planetary movements and astrological transits. Our monthly horoscopes are updated regularly for ${currentYear} and ${nextYear}, giving you a focused forecast window without sending you wandering into stale future pages.`,
      }}
      intro={`Welcome to your complete monthly horoscope guide. Discover what the stars have in store for your zodiac sign with detailed predictions covering love, career, health, and personal growth.

Our monthly horoscopes are updated regularly and provide personalized insights based on current planetary movements and astrological transits. We publish forecasts for ${currentYear} and ${nextYear}, keeping the archive focused on what people are actually searching for right now.

Select your zodiac sign below to explore detailed monthly predictions.`}
      meaning={`A useful horoscope is not just mood-writing for a sign. It is a forecast built from actual sky conditions. Lunary monthly horoscopes start with the major transits of the period, then translate those movements sign by sign. That means the point is not “what adjective fits Aries this month?” It is “which planets are moving, what signs are they in, what aspects are forming, and how would that land for this sign?”

That is also why monthly forecasts work better than generic evergreen sign pages. They are grounded in timing. The strongest forecast pages tell you what is active now, what pressure is building, what support is available, and which signs feel a transit directly versus by trine, square, opposition, or sextile.`}
      howToWorkWith={[
        'Read the monthly forecast as a transit summary for your sign, not a fixed identity statement.',
        'Check the yearly forecast alongside the monthly page to separate long themes from short ones.',
        'Notice which transits hit your sign directly and which work through trines, squares, or oppositions.',
        'Compare the forecast with your natal chart if you know your Rising sign and chart ruler.',
      ]}
      internalLinks={[
        { text: 'Birth Chart Guide', href: '/grimoire/birth-chart' },
        { text: 'Transits Guide', href: '/grimoire/transits' },
        { text: 'Sky Now current chart', href: '/grimoire/astrology/sky-now' },
        { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
      ]}
      sources={[
        {
          name: 'Lunary monthly transit methodology',
          url: 'https://lunary.app/developers',
        },
        {
          name: 'Astronomy Engine planetary calculations',
          url: 'https://github.com/cosinekitty/astronomy',
        },
        {
          name: 'Traditional transit and sign doctrine',
        },
      ]}
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
              className='p-6 rounded-lg border border-stroke-subtle bg-surface-elevated/50 hover:border-lunary-primary-600 hover:bg-surface-elevated transition-all group'
            >
              <div className='text-4xl mb-3'>{SIGN_SYMBOLS[sign]}</div>
              <h3 className='text-lg font-medium text-content-primary group-hover:text-content-brand-accent transition-colors'>
                {SIGN_DISPLAY_NAMES[sign]}
              </h3>
              <p className='text-sm text-content-muted'>
                {SIGN_ELEMENTS[sign]} Sign
              </p>
            </Link>
          ))}
        </div>
      </div>

      <section className='mb-12 p-6 rounded-lg border border-stroke-subtle bg-surface-elevated/40'>
        <h2 className='text-xl font-medium text-content-primary mb-4'>
          How to read a monthly horoscope properly
        </h2>
        <ul className='list-disc pl-5 space-y-2 text-sm text-content-muted'>
          <li>
            Start with the major transit of the month, not the sign adjectives.
          </li>
          <li>
            Ask whether the sky is hitting your sign directly or by aspect.
          </li>
          <li>
            Use the yearly forecast to see whether the month is part of a bigger
            story.
          </li>
          <li>
            Use your birth chart if you want the forecast to get truly personal.
          </li>
        </ul>
      </section>
    </SEOContentTemplate>
  );
}
