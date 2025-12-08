import { Metadata } from 'next';
import Link from 'next/link';
import {
  ZODIAC_SIGNS,
  SIGN_DISPLAY_NAMES,
  SIGN_SYMBOLS,
  SIGN_ELEMENTS,
} from '@/constants/seo/monthly-horoscope';
import Script from 'next/script';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Monthly Horoscopes 2025 & 2026: All Zodiac Signs | Lunary',
  description:
    'Free monthly horoscopes for all 12 zodiac signs. Get your Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, and Pisces predictions for 2025 and 2026.',
  keywords: [
    'monthly horoscope',
    'free horoscope',
    '2025 horoscope',
    '2026 horoscope',
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
    title: 'Monthly Horoscopes 2025 & 2026: All Zodiac Signs',
    description:
      'Free monthly horoscopes for all 12 zodiac signs. Get your predictions for 2025 and 2026.',
    url: 'https://lunary.app/horoscope',
  },
  alternates: {
    canonical: 'https://lunary.app/horoscope',
  },
};

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
    url: `https://lunary.app/horoscope/${sign}`,
  })),
};

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate
  .toLocaleString('en-US', { month: 'long' })
  .toLowerCase();

export default function HoroscopeIndexPage() {
  return (
    <>
      <Script
        id='horoscope-structured-data'
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className='min-h-screen bg-zinc-950 text-zinc-100'>
        <div className='max-w-6xl mx-auto px-4 py-12'>
          <Breadcrumbs items={[{ label: 'Horoscopes' }]} />

          <h1 className='text-4xl font-light mb-4'>Monthly Horoscopes</h1>
          <p className='text-lg text-zinc-400 mb-8 max-w-3xl'>
            Discover what the stars have in store for you. Select your zodiac
            sign below to read your monthly horoscope predictions for love,
            career, health, and more.
          </p>

          <div className='mb-12'>
            <h2 className='text-2xl font-light mb-6'>
              {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}{' '}
              {currentYear} Horoscopes
            </h2>
            <div className='grid md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {ZODIAC_SIGNS.map((sign) => (
                <Link
                  key={sign}
                  href={`/horoscope/${sign}/${currentYear}/${currentMonth}`}
                  className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-purple-500/50 hover:bg-zinc-900 transition-all group'
                >
                  <div className='text-4xl mb-3'>{SIGN_SYMBOLS[sign]}</div>
                  <h3 className='text-lg font-medium text-zinc-100 group-hover:text-purple-300 transition-colors'>
                    {SIGN_DISPLAY_NAMES[sign]}
                  </h3>
                  <p className='text-sm text-zinc-500'>
                    {SIGN_ELEMENTS[sign]} Sign
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className='p-6 rounded-lg border border-purple-500/30 bg-purple-500/10'>
            <h2 className='text-xl font-medium text-purple-300 mb-2'>
              Personalized Daily Insights
            </h2>
            <p className='text-zinc-300 mb-4'>
              Get horoscopes tailored to your complete birth chart, not just
              your Sun sign. Discover how the Moon, Rising, and planetary
              placements affect your daily life.
            </p>
            <Link
              href='/welcome'
              className='inline-flex px-6 py-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-medium transition-colors'
            >
              Get Your Personalized Horoscope
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
