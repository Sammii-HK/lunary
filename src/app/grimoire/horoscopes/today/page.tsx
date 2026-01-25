import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createItemListSchema } from '@/lib/schema';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { HoroscopeCosmicConnections } from '@/components/grimoire/HoroscopeCosmicConnections';
import { CosmicHighlight } from '../CosmicHighlight';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Today's Horoscope: Daily Astrology for All 12 Signs | Lunary",
  description:
    "Read today's horoscope for all 12 zodiac signs. Daily astrology insights, cosmic guidance, and personalised readings updated every day.",
  keywords: [
    'today horoscope',
    'daily horoscope',
    'horoscope today',
    'zodiac horoscope',
    'daily astrology',
    'moon transits today',
    'planetary transits today',
    'real astrology',
  ],
  openGraph: {
    title: "Today's Horoscope - All 12 Signs | Lunary",
    description: 'Daily astrology insights for every zodiac sign.',
    url: 'https://lunary.app/grimoire/horoscopes/today',
    images: [
      {
        url: '/api/og/grimoire/horoscopes-today',
        width: 1200,
        height: 630,
        alt: 'Today’s Horoscopes by Zodiac Sign – Lunary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Today's Horoscope - All 12 Signs | Lunary",
    description: 'Daily astrology insights for every zodiac sign.',
    images: ['/api/og/grimoire/horoscopes-today'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/horoscopes/today',
  },
};

const signs = [
  { name: 'Aries', symbol: '♈', dates: 'Mar 21 — Apr 19', element: 'Fire' },
  { name: 'Taurus', symbol: '♉', dates: 'Apr 20 — May 20', element: 'Earth' },
  { name: 'Gemini', symbol: '♊', dates: 'May 21 — Jun 20', element: 'Air' },
  { name: 'Cancer', symbol: '♋', dates: 'Jun 21 — Jul 22', element: 'Water' },
  { name: 'Leo', symbol: '♌', dates: 'Jul 23 — Aug 22', element: 'Fire' },
  { name: 'Virgo', symbol: '♍', dates: 'Aug 23 — Sep 22', element: 'Earth' },
  { name: 'Libra', symbol: '♎', dates: 'Sep 23 — Oct 22', element: 'Air' },
  { name: 'Scorpio', symbol: '♏', dates: 'Oct 23 — Nov 21', element: 'Water' },
  {
    name: 'Sagittarius',
    symbol: '♐',
    dates: 'Nov 22 — Dec 21',
    element: 'Fire',
  },
  {
    name: 'Capricorn',
    symbol: '♑',
    dates: 'Dec 22 — Jan 19',
    element: 'Earth',
  },
  { name: 'Aquarius', symbol: '♒', dates: 'Jan 20 — Feb 18', element: 'Air' },
  { name: 'Pisces', symbol: '♓', dates: 'Feb 19 — Mar 20', element: 'Water' },
];

export default function GrimoireTodayHoroscopePage() {
  const currentYear = new Date().getFullYear();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const itemListSchema = createItemListSchema({
    name: "Today's Horoscopes",
    description: 'Daily horoscope readings for every zodiac sign.',
    url: 'https://lunary.app/horoscope/today',
    items: signs.map((sign) => ({
      name: `${sign.name} Daily Horoscope`,
      url: `https://lunary.app/horoscopes/today/${sign.name.toLowerCase()}`,
      description: `Today's horoscope for ${sign.name} (${sign.dates}).`,
    })),
  });

  return (
    <SEOContentTemplate
      title='Horoscope Today: Daily Astrology for All 12 Zodiac Signs | Lunary'
      h1='Today’s Horoscopes'
      description='Horoscope today for all 12 zodiac signs. Clear daily astrology guidance with insights for love, career, and personal growth.'
      keywords={[
        'today horoscope',
        'daily horoscope',
        'horoscope today',
        'zodiac horoscope',
        'daily astrology',
        'moon transits today',
        'planetary transits today',
        'real astrology',
      ]}
      canonicalUrl='https://lunary.app/grimoire/horoscopes/today'
      additionalSchemas={[itemListSchema]}
      intro='Select your zodiac sign to read the freshest daily horoscope. Each sign block mirrors the Moon + transit energy that powers our authenticated experience.'
      meaningTitle='How the daily forecast stays fresh'
      meaning={`
Every dawn we rebuild the horoscopes so the tone, keywords, and advice mirror the current Moon phase, transits, and planetary aspects. That means what you read today feels different tomorrow, just like the sky.

The same Moon + transit data that powers the authenticated app feeds this Grimoire hub, so you still get the full cosmic story before signing in.

- Transits update the moment a planet shifts signs.
- The Moon focus highlights phase, polarity, and keywords hourly.
- We spotlight the top tensions so you can respond instead of react.
      `}
      heroContent={
        <div className='text-center space-y-1'>
          <p className='text-sm text-lunary-primary-400'>{today}</p>
          <p className='text-xs text-zinc-500 uppercase tracking-[0.3em]'>
            Updated every dawn with real planetary context
          </p>
        </div>
      }
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Horoscopes', href: '/grimoire/horoscopes' },
        { label: 'Today' },
      ]}
      cosmicConnections={
        <HoroscopeCosmicConnections
          variant='daily-hub'
          currentYear={currentYear}
        />
      }
      components={<CosmicHighlight />}
    >
      {/* <section className='mb-12 grid gap-6 md:grid-cols-2'>
        <div className='rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6'>
          <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
            Daily Signals
          </h3>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            These signals are the same pulse that powers the Lunary app,
            rewritten for this public hub so you can scan the essentials before
            picking your sign.
          </p>
        </div>
        <div className='rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6'>
          <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
            Why this page matters
          </h3>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            The Grimoire aggregates our daily horoscopes so you can share the
            energy with friends, reference it throughout the day, and still head
            into the app when you want chart-precise guidance.
          </p>
        </div>
      </section> */}

      <section className='mb-12'>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {signs.map((sign) => (
            <Link
              key={sign.name}
              href={`/grimoire/horoscopes/today/${sign.name.toLowerCase()}`}
              className='group p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-all'
            >
              <div className='text-3xl mb-2'>{sign.symbol}</div>
              <h2 className='text-lg font-medium group-hover:text-lunary-primary-300 transition-colors'>
                {sign.name}
              </h2>
              <p className='text-xs text-zinc-500'>{sign.dates}</p>
              <div className='flex items-center gap-1 mt-3 text-xs text-zinc-400'>
                <span>{sign.element}</span>
                <ArrowRight className='w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity' />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SEOContentTemplate>
  );
}
