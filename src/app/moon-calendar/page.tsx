import { Metadata } from 'next';
import Link from 'next/link';
import { Moon, ArrowRight, Calendar } from 'lucide-react';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Moon Calendar 2025-2030: Full Moon & New Moon Dates | Lunary',
  description:
    'Complete moon calendar with full moon, new moon, and all lunar phases from 2025-2030. Track moon cycles, plan rituals, and align with lunar energy.',
  keywords: [
    'moon calendar',
    'full moon dates',
    'new moon dates',
    'lunar calendar',
    'moon phases 2025',
    'moon phases 2026',
    'moon cycle calendar',
    'lunar phases',
  ],
  openGraph: {
    title: 'Moon Calendar 2025-2030 | Lunary',
    description:
      'Complete moon calendar with full moon, new moon, and all lunar phases.',
    url: 'https://lunary.app/moon-calendar',
    type: 'website',
  },
  alternates: { canonical: 'https://lunary.app/moon-calendar' },
};

const years = [
  { year: 2025, description: 'Current year moon phases and lunar events' },
  {
    year: 2026,
    description: 'Plan ahead with next year lunar cycle predictions',
  },
  { year: 2027, description: 'Future moon phases and eclipse forecasts' },
  { year: 2028, description: 'Long-range lunar planning calendar' },
  { year: 2029, description: 'Multi-year moon cycle tracking' },
  { year: 2030, description: 'Extended lunar calendar projections' },
];

export default function MoonCalendarHubPage() {
  const itemListSchema = createItemListSchema({
    name: 'Moon Calendar by Year',
    description:
      'Complete moon calendar from 2025-2030 with full moon, new moon, and all lunar phases.',
    url: 'https://lunary.app/moon-calendar',
    items: years.map((y) => ({
      name: `Moon Calendar ${y.year}`,
      url: `https://lunary.app/moon-calendar/${y.year}`,
      description: y.description,
    })),
  });

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(itemListSchema)}
      <div className='max-w-5xl mx-auto px-4 py-12'>
        <Breadcrumbs items={[{ label: 'Moon Calendar' }]} />

        <header className='mb-12'>
          <div className='flex items-center gap-4 mb-4'>
            <Moon className='w-10 h-10 text-lunary-secondary-400' />
            <h1 className='text-4xl md:text-5xl font-light'>Moon Calendar</h1>
          </div>
          <p className='text-xl text-zinc-400 leading-relaxed max-w-3xl'>
            Track the lunar cycle with complete moon phase calendars from 2025
            through 2030. Know when every new moon, full moon, and quarter phase
            occurs to align your intentions with lunar energy.
          </p>
        </header>

        <section className='mb-12'>
          <h2 className='text-2xl font-light mb-2'>How the Moon Cycle Works</h2>
          <div className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <p className='text-zinc-300 mb-4'>
              The lunar cycle lasts approximately 29.5 days, moving through
              eight distinct phases. Each phase carries unique energy for
              manifestation, release, and reflection.
            </p>
            <ul className='grid md:grid-cols-2 gap-3 text-sm text-zinc-400'>
              <li className='flex items-center gap-2'>
                <span className='w-2 h-2 rounded-full bg-zinc-600'></span>
                New Moon — Set intentions, plant seeds
              </li>
              <li className='flex items-center gap-2'>
                <span className='w-2 h-2 rounded-full bg-zinc-500'></span>
                Waxing Crescent — Take first steps
              </li>
              <li className='flex items-center gap-2'>
                <span className='w-2 h-2 rounded-full bg-zinc-400'></span>
                First Quarter — Overcome challenges
              </li>
              <li className='flex items-center gap-2'>
                <span className='w-2 h-2 rounded-full bg-zinc-300'></span>
                Waxing Gibbous — Refine and adjust
              </li>
              <li className='flex items-center gap-2'>
                <span className='w-2 h-2 rounded-full bg-lunary-secondary-400'></span>
                Full Moon — Culmination, gratitude
              </li>
              <li className='flex items-center gap-2'>
                <span className='w-2 h-2 rounded-full bg-zinc-300'></span>
                Waning Gibbous — Share wisdom
              </li>
              <li className='flex items-center gap-2'>
                <span className='w-2 h-2 rounded-full bg-zinc-400'></span>
                Last Quarter — Release, let go
              </li>
              <li className='flex items-center gap-2'>
                <span className='w-2 h-2 rounded-full bg-zinc-500'></span>
                Waning Crescent — Rest, restore
              </li>
            </ul>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-light mb-6'>Select Year</h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {years.map((y) => (
              <Link
                key={y.year}
                href={`/moon-calendar/${y.year}`}
                className='group p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-lunary-secondary-600 transition-all'
              >
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-2xl font-medium group-hover:text-lunary-secondary-300 transition-colors'>
                    {y.year}
                  </span>
                  <Calendar className='w-5 h-5 text-zinc-600 group-hover:text-lunary-secondary-400 transition-colors' />
                </div>
                <p className='text-sm text-zinc-400'>{y.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className='p-8 rounded-xl border border-lunary-secondary-700 bg-gradient-to-r from-lunary-secondary-900/20 to-lunary-primary-900/20'>
          <h2 className='text-xl font-medium text-lunary-secondary-300 mb-2'>
            Deepen Your Lunar Practice
          </h2>
          <p className='text-zinc-300 mb-4'>
            Learn how to work with moon phases for manifestation, ritual timing,
            and emotional alignment in our comprehensive guide.
          </p>
          <Link
            href='/grimoire/guides/moon-phases-guide'
            className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-lunary-secondary-900/30 hover:bg-lunary-secondary-900/50 border border-lunary-secondary-700 text-lunary-secondary-300 font-medium transition-colors'
          >
            Moon Phases Guide
            <ArrowRight className='w-4 h-4' />
          </Link>
        </section>
      </div>
    </div>
  );
}
