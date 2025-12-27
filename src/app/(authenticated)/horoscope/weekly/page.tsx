import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';

export const revalidate = 604800;

export const metadata: Metadata = {
  title: 'Weekly Horoscope: This Week for All 12 Signs | Lunary',
  description:
    'Read your weekly horoscope for all 12 zodiac signs. Extended astrology forecasts with insights for love, career, and personal growth this week.',
  keywords: [
    'weekly horoscope',
    'this week horoscope',
    'horoscope this week',
    'weekly astrology',
    'weekly zodiac forecast',
  ],
  openGraph: {
    title: 'Weekly Horoscope - All 12 Signs | Lunary',
    description: 'Extended weekly astrology forecasts for every zodiac sign.',
    url: 'https://lunary.app/horoscope/weekly',
  },
  alternates: { canonical: 'https://lunary.app/horoscope/weekly' },
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

function getWeekRange(): string {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };
  return `${startOfWeek.toLocaleDateString('en-US', options)} - ${endOfWeek.toLocaleDateString('en-US', options)}, ${endOfWeek.getFullYear()}`;
}

export default function WeeklyHoroscopeIndexPage() {
  const weekRange = getWeekRange();

  const itemListSchema = createItemListSchema({
    name: 'Weekly Horoscopes',
    description: 'Weekly horoscope readings for all 12 zodiac signs.',
    url: 'https://lunary.app/horoscope/weekly',
    items: signs.map((sign) => ({
      name: `${sign.name} Weekly Horoscope`,
      url: `https://lunary.app/horoscope/weekly/${sign.name.toLowerCase()}`,
      description: `This week's horoscope for ${sign.name} (${sign.dates}).`,
    })),
  });

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(itemListSchema)}
      <div className='max-w-5xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Horoscope', href: '/horoscope' },
            { label: 'Weekly' },
          ]}
        />

        <header className='mb-12'>
          <p className='text-lunary-primary-400 mb-2'>{weekRange}</p>
          <h1 className='text-2xl md:text-5xl font-light mb-4'>
            Weekly Horoscope
          </h1>
          <p className='text-xl text-zinc-400 leading-relaxed'>
            Extended weekly forecasts for all 12 zodiac signs. Updated every
            week with insights on love, career, and personal growth.
          </p>
        </header>

        <section className='mb-12'>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {signs.map((sign) => (
              <Link
                key={sign.name}
                href={`/horoscope/weekly/${sign.name.toLowerCase()}`}
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
            href='/horoscope/today'
            className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='text-lg font-medium mb-2'>Daily Horoscopes</h3>
            <p className='text-zinc-400 text-sm'>
              Quick daily insights for all signs.
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
              See how this week's transits affect your birth chart.
            </p>
          </Link>
        </section>
      </div>
    </div>
  );
}
