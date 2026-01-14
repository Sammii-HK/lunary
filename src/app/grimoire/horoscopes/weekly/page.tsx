import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { renderJsonLd, createItemListSchema } from '@/lib/schema';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const revalidate = 604800;

export const metadata: Metadata = {
  title: 'Weekly Horoscope Hub | Lunary Grimoire',
  description:
    'Public weekly horoscopes for every zodiac sign, refreshed with transit and lunar context for the week ahead.',
  keywords: [
    'weekly horoscope',
    'weekly astrology',
    'zodiac weekly forecast',
    'horoscope hub',
  ],
  openGraph: {
    title: 'Weekly Horoscope Hub | Lunary Grimoire',
    description:
      'Public weekly horoscopes for all signs, including transit cues and lunar highlights.',
    url: 'https://lunary.app/grimoire/horoscopes/weekly',
  },
  alternates: { canonical: 'https://lunary.app/grimoire/horoscopes/weekly' },
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
  return `${startOfWeek.toLocaleDateString('en-US', options)} - ${endOfWeek.toLocaleDateString(
    'en-US',
    options,
  )}, ${endOfWeek.getFullYear()}`;
}

export default function GrimoireWeeklyHoroscopePage() {
  const weekRange = getWeekRange();

  const itemListSchema = createItemListSchema({
    name: 'Weekly Horoscopes Hub',
    description: 'Weekly horoscope listings for all zodiac signs.',
    url: 'https://lunary.app/grimoire/horoscopes/weekly',
    items: signs.map((sign) => ({
      name: `${sign.name} Weekly Horoscope`,
      url: `https://lunary.app/horoscope/weekly/${sign.name.toLowerCase()}`,
      description: `Weekly astrology for ${sign.name} (${sign.dates}).`,
    })),
  });

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(itemListSchema)}
      <div className='max-w-5xl mx-auto px-4 py-12'>
        <SEOContentTemplate
          title='Weekly Horoscope Hub | Lunary Grimoire'
          h1='Weekly Horoscope'
          description='Extended weekly forecasts for every zodiac sign, refreshed each week with lunar and transit signals.'
          keywords={[
            'weekly horoscope',
            'weekly astrology',
            'zodiac weekly forecast',
            'horoscope hub',
          ]}
          canonicalUrl='https://lunary.app/grimoire/horoscopes/weekly'
          intro='A weekly overview for every zodiac sign, built with transits, Moon phases, and actionable cues so you can plan ahead.'
          heroContent={
            <div className='text-center space-y-1'>
              <p className='text-sm text-lunary-primary-400'>{weekRange}</p>
              <p className='text-xs text-zinc-500 uppercase tracking-[0.3em]'>
                Updated every Monday with fresh cosmic context
              </p>
            </div>
          }
          breadcrumbs={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Horoscopes', href: '/grimoire/horoscopes' },
            { label: 'Weekly' },
          ]}
          relatedItems={[
            {
              name: "Today's Horoscopes",
              href: '/grimoire/horoscopes/today',
              type: 'topic',
            },
            {
              name: 'Monthly Horoscopes',
              href: '/grimoire/horoscopes',
              type: 'topic',
            },
            {
              name: 'Current Transits',
              href: '/grimoire/transits',
              type: 'topic',
            },
            {
              name: 'Moon Phases',
              href: '/grimoire/moon',
              type: 'topic',
            },
            {
              name: 'Planets',
              href: '/grimoire/planets',
              type: 'topic',
            },
            {
              name: 'Birth Chart & Personal Transits',
              href: '/grimoire/birth-chart',
              type: 'topic',
            },
          ]}
          ctaText='Read this week through your full birth chart'
          ctaHref='/horoscope'
        >
          <section className='mb-12 space-y-4'>
            <h2 className='text-2xl font-semibold text-zinc-100'>
              How to read a weekly horoscope
            </h2>
            <p className='text-sm text-zinc-400 leading-relaxed'>
              Weekly horoscopes describe shifting planetary movement, not fixed
              outcomes, and each entry highlights the current dance between the
              planets rather than delivering a predetermined fate.
            </p>
            <p className='text-sm text-zinc-400 leading-relaxed'>
              This week reflects changing relationships between the planets, so
              how it lands depends on your individual birth chart, houses, and
              personal timing.
            </p>
            <p className='text-sm text-zinc-400 leading-relaxed'>
              Focus on timing, transits, and context—these themes evolve through
              the week and guide what feels activated for you more than
              predicting certainty.
            </p>
            <p className='text-xs text-zinc-500'>
              Weekly horoscopes update because planetary relationships shift,
              not because of calendar dates.
            </p>
          </section>

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
          <p className='text-sm text-zinc-500'>
            Planetary themes evolve through the week; revisit this hub as the
            sky shifts.
          </p>
        </SEOContentTemplate>
      </div>
    </div>
  );
}
