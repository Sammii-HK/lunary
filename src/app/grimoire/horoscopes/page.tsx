import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  ZODIAC_SIGNS,
  SIGN_DISPLAY_NAMES,
  SIGN_SYMBOLS,
  SIGN_ELEMENTS,
} from '@/constants/seo/monthly-horoscope';
import { renderJsonLd, createBreadcrumbSchema } from '@/lib/schema';

const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Monthly Horoscopes ${currentYear} & ${nextYear}: All Zodiac Signs | Lunary`,
    description: `Free monthly horoscopes for all 12 zodiac signs. Get your Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, and Pisces predictions for ${currentYear} and ${nextYear}.`,
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

export default function GrimoireHoroscopesPage() {
  return (
    <>
      {renderJsonLd(structuredData)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Horoscopes', url: '/grimoire/horoscopes' },
        ]),
      )}
      <div className='min-h-screen bg-zinc-950 text-zinc-100'>
        <div className='max-w-6xl mx-auto px-4 py-12 space-y-10'>
          <SEOContentTemplate
            title={`Monthly Horoscopes ${currentYear} & ${nextYear}: All Zodiac Signs | Lunary`}
            h1='Monthly Horoscopes'
            description='Discover free monthly horoscopes for all 12 zodiac signs, with updates for every sign and season.'
            keywords={[
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
            ]}
            canonicalUrl='https://lunary.app/grimoire/horoscopes'
            intro='Select your zodiac sign to read the freshest monthly predictions for love, career, health, and more—updated with real-time lunar, solar, and planetary context.'
            breadcrumbs={[
              { label: 'Grimoire', href: '/grimoire' },
              { label: 'Horoscopes' },
            ]}
          >
            <section className='mb-10 grid gap-4 md:grid-cols-3'>
              <div className='col-span-2 rounded-2xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900/80 to-lunary-primary-950 p-6'>
                <p className='text-xs uppercase tracking-widest text-zinc-400'>
                  Cosmic Highlight (changes daily)
                </p>
                <h2 className='text-2xl font-semibold text-white mt-2'>
                  Moon trines Venus in Libra today, so gentle connections and
                  artistic sparks feel effortless. Tap in to carry calm momentum
                  into your week.
                </h2>
                <p className='mt-4 text-sm text-zinc-300 leading-relaxed'>
                  Every sunrise we refresh the highlight with the most current
                  Luna/Venus/Mars angles, new-moon intentions, and transit
                  activations that shift your personal story. This summary is
                  the first pulse of your daily ritual—bookmark it, then dive
                  into your sign below.
                </p>
                <div className='mt-5 flex flex-wrap gap-2 text-[11px] capitalize text-zinc-300 tracking-widest'>
                  <span className='rounded-md border border-zinc-700 px-3 py-1'>
                    Daily transits updated at 00:00 UTC
                  </span>
                  <span className='rounded-md border border-zinc-700 px-3 py-1'>
                    Moon phase adjustments every 12 hours
                  </span>
                  <span className='rounded-md border border-zinc-700 px-3 py-1'>
                    Notifications deliver the freshest insights
                  </span>
                </div>
              </div>
              <div className='space-y-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-5'>
                <h3 className='text-sm font-semibold tracking-wide text-zinc-300'>
                  Daily Signals
                </h3>
                <ul className='space-y-2 text-sm text-zinc-200 leading-relaxed'>
                  <li>
                    <strong>Daily Vibe:</strong> Horoscopes refresh at dawn with
                    language that mirrors each day's planetary shifts so nothing
                    ever feels stale.
                  </li>
                  <li>
                    <strong>Transit Watch:</strong> Every listed transit
                    recalculates the moment a planet moves so your action plan
                    keeps pace with Mars, Mercury, and the Moon.
                  </li>
                  <li>
                    <strong>Moon Focus:</strong> We highlight the current Moon
                    phase, polarity energy, and evolving keywords per sign so
                    lunar context stays visible.
                  </li>
                </ul>
                <p className='text-xs text-lunary-accent-300'>
                  <Link
                    href='/grimoire/horoscopes/today'
                    className='inline underline'
                  >
                    View today's horoscope →
                  </Link>
                </p>
              </div>
            </section>

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
        </div>
      </div>
    </>
  );
}
