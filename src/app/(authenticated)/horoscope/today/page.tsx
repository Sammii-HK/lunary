import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Today's Horoscope: Daily Astrology for All 12 Signs | Lunary",
  description:
    "Read today's horoscope for all 12 zodiac signs. Daily astrology insights, cosmic guidance, and personalised readings updated every day.",
  keywords: [
    'daily horoscope',
    "today's horoscope",
    'horoscope today',
    'daily astrology',
    'zodiac horoscope',
  ],
  openGraph: {
    title: "Today's Horoscope - All 12 Signs | Lunary",
    description: 'Daily astrology insights for every zodiac sign.',
    url: 'https://lunary.app/horoscope/today',
  },
  alternates: { canonical: 'https://lunary.app/horoscope/today' },
};

const signs = [
  { name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire' },
  { name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth' },
  { name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air' },
  { name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water' },
  { name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire' },
  { name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth' },
  { name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'Air' },
  { name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'Water' },
  {
    name: 'Sagittarius',
    symbol: '♐',
    dates: 'Nov 22 - Dec 21',
    element: 'Fire',
  },
  {
    name: 'Capricorn',
    symbol: '♑',
    dates: 'Dec 22 - Jan 19',
    element: 'Earth',
  },
  { name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'Air' },
  { name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'Water' },
];

export default function TodayHoroscopeIndexPage() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const itemListSchema = createItemListSchema({
    name: "Today's Horoscopes",
    description: 'Daily horoscope readings for all 12 zodiac signs.',
    url: 'https://lunary.app/horoscope/today',
    items: signs.map((sign) => ({
      name: `${sign.name} Daily Horoscope`,
      url: `https://lunary.app/horoscope/today/${sign.name.toLowerCase()}`,
      description: `Today's horoscope for ${sign.name} (${sign.dates}).`,
    })),
  });

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(itemListSchema)}
      <div className='max-w-5xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Horoscope', href: '/horoscope' },
            { label: 'Today' },
          ]}
        />

        <header className='mb-12'>
          <p className='text-lunary-primary-400 mb-2'>{today}</p>
          <h1 className='text-2xl md:text-5xl font-light mb-4'>
            Today's Horoscope
          </h1>
          <p className='text-xl text-zinc-400 leading-relaxed'>
            Select your zodiac sign to read your daily horoscope. Updated every
            day with fresh cosmic insights.
          </p>
        </header>

        <section className='mb-12'>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {signs.map((sign) => (
              <Link
                key={sign.name}
                href={`/horoscope/today/${sign.name.toLowerCase()}`}
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

        <section className='grid md:grid-cols-2 gap-6 mb-12'>
          <Link
            href='/horoscope/weekly'
            className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='text-lg font-medium mb-2'>Weekly Horoscopes</h3>
            <p className='text-zinc-400 text-sm'>
              Extended weekly forecasts for all signs.
            </p>
          </Link>
          <Link
            href='/birth-chart'
            className='p-6 rounded-xl border border-lunary-primary-700 bg-lunary-primary-900/10 hover:bg-lunary-primary-900/20 transition-colors'
          >
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Personal Transits
            </h3>
            <p className='text-zinc-400 text-sm'>
              See how today's transits affect your birth chart.
            </p>
          </Link>
        </section>
      </div>
    </div>
  );
}
