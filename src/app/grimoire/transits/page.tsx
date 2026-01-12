import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import {
  YEARLY_TRANSITS,
  getTransitsForYear,
} from '@/constants/seo/yearly-transits';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import {
  createItemListSchema,
  renderJsonLd,
  createBreadcrumbSchema,
} from '@/lib/schema';

export const metadata: Metadata = {
  title:
    'Yearly Astrological Transits 2026-2030 | How Each Year Affects You | Lunary',
  description:
    'Plan for career, relationship, and personal shifts with the definitive 2026–2030 transit timeline, including who is affected and how to work with each planet’s energy.',
  keywords: [
    'astrological transits',
    'saturn return',
    'jupiter transit',
    'yearly astrology',
    '2026 transits',
    '2027 transits',
    '2028 transits',
    '2029 transits',
    '2030 transits',
    'uranus transit',
  ],
  openGraph: {
    title: 'Yearly Astrological Transits 2026-2030 | Lunary',
    description:
      'Complete guide to major astrological transits. Saturn Return, Jupiter transits, and more.',
    url: 'https://lunary.app/grimoire/transits',
    images: [
      {
        url: '/api/og/grimoire/transits',
        width: 1200,
        height: 630,
        alt: 'Astrological Transits Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yearly Astrological Transits 2026-2030 | Lunary',
    description: 'Complete guide to major astrological transits.',
    images: ['/api/og/grimoire/transits'],
  },
  alternates: { canonical: 'https://lunary.app/grimoire/transits' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const years = [2025, 2026, 2027, 2028, 2029, 2030, 2033, 2040, 2048];

const SATURN_CYCLE_STEPS = [
  {
    label: 'First Square (1st Quarter)',
    years: '2033–2035 (approx)',
    ages: '37–39',
    birthYears: '1984–1987',
    notes:
      'The first square calls for a new level of maturity; it is about confronting the friction between ambition and responsibility and supports recalibrating the structures you built in your twenties.',
  },
  {
    label: 'Opposition (Halfway Point)',
    years: '2040–2041 (approx)',
    ages: '44–45',
    birthYears: '1975–1977',
    notes:
      'Opposition times spotlight relationships and the way you share power. This is a mirror for what you have built and what you are ready to surrender so the next decade can bloom.',
  },
  {
    label: 'Second Square (3rd Quarter)',
    years: '2048–2050 (approx)',
    ages: '52–54',
    birthYears: '1967–1969',
    notes:
      'The second square asks you to integrate earlier lessons, step back from overworking, and make room for wiser, more patient leadership as Saturn prepares for its second return.',
  },
  {
    label: 'Saturn Return (Conjunction)',
    years: '2025–2030',
    ages: '28–34',
    birthYears: '1995–2002',
    notes:
      'A full orbit brings Saturn back to its natal place. These years demand accountability, supporting choices that can anchor the next 29 years.',
  },
];

// const SATURN_YEARLY_SEQUENCE = [
//   {
//     year: 2025,
//     stage: 'Saturn Return (Conjunction)',
//     ages: '28–31',
//     birthYears: '1994–1997',
//     note: 'The late-90s cohort hits their full return; it mirrors the second return for the late-1960s births.',
//   },
//   {
//     year: 2026,
//     stage: 'Second Cycle (Square cluster)',
//     ages: '37–40',
//     birthYears: '1985–1989',
//     note: 'Those who returned around 2014–2018 now feel the square—the second cycle check-in before the halfway opposition.',
//   },
//   {
//     year: 2027,
//     stage: 'Opposition (Halfway)',
//     ages: '45–49',
//     birthYears: '1978–1982',
//     note: 'The halfway opposition asks this cohort to balance shared power, partnerships, and accountability.',
//   },
//   {
//     year: 2028,
//     stage: 'Second Square',
//     ages: '52–56',
//     birthYears: '1971–1975',
//     note: 'The second square arrives as Saturn prepares for the return; it is about integrating lessons and steadying leadership.',
//   },
//   {
//     year: 2029,
//     stage: 'Saturn Return (Taurus)',
//     ages: '28–30',
//     birthYears: '2000–2001',
//     note: 'A new Saturn return anchors the 2000 cohort—and Taurus lessons about values and stability.',
//   },
//   {
//     year: 2030,
//     stage: 'Return Continuation',
//     ages: '28–30',
//     birthYears: '2001–2002',
//     note: 'The return wraps up with more grounding before Saturn shifts into the next chapter.',
//   },
// ];

export default function TransitsIndexPage() {
  const transitsListSchema = createItemListSchema({
    name: 'Yearly Astrological Transits 2026-2030',
    description:
      'Complete guide to major astrological transits including Saturn Return, Jupiter transits, and planetary ingresses.',
    url: 'https://lunary.app/grimoire/transits',
    items: YEARLY_TRANSITS.slice(0, 20).map((transit) => ({
      name: transit.title,
      url: `https://lunary.app/grimoire/transits/${transit.id}`,
      description: transit.description,
    })),
  });

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(transitsListSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Transits', url: '/grimoire/transits' },
        ]),
      )}
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Transits' },
          ]}
        />

        <h1 className='text-4xl font-light mb-4'>
          Yearly Astrological Transits
        </h1>
        <p className='text-lg text-zinc-400 mb-6 max-w-3xl'>
          Every major transit from 2026 through 2030 is summarized here with key
          dates, planetary themes, and the signs it highlights so you can spot
          the turning points before they arrive.
        </p>

        <p className='text-base text-zinc-300 mb-8 max-w-3xl'>
          Think of each year as a curated list of what to watch for in
          relationships, career direction, and inner work—tap the cards to
          access specific feels, do/avoid guidance, and planet-by-planet notes.
        </p>

        <p className='text-base text-zinc-300 mb-8 max-w-3xl'>
          Not all transits affect everyone equally. Click a year below to see
          what themes shape relationships, career, and personal growth.
        </p>

        <div className='flex flex-wrap gap-3 mb-8'>
          {years.map((year) => (
            <a
              key={year}
              href={`#year-${year}`}
              className='px-4 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 transition-colors'
            >
              {year}
            </a>
          ))}
        </div>

        <div className='mb-10 p-5 rounded-lg border border-zinc-800 bg-zinc-900/40'>
          <p className='text-xs font-semibold tracking-[0.4em] uppercase text-lunary-primary-300 mb-2'>
            How to use this page
          </p>
          <p className='text-zinc-300 leading-relaxed mb-3'>
            Start by picking a year to scan the dates, feelings, and actions for
            each transit, then use your natal chart to see which houses get
            stirred.
          </p>
          <Link
            href='/horoscope'
            className='inline-flex px-4 py-2 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 transition-colors'
          >
            See your personal transit timeline
          </Link>
        </div>
        <div className='mb-12 p-5 rounded-2xl border border-lunary-primary-700 bg-lunary-primary-900/10'>
          <h2 className='text-2xl font-semibold text-lunary-primary-200 mb-3'>
            The full Saturn cycle you are moving through
          </h2>
          <p className='text-zinc-300 mb-6'>
            Our yearly list highlights the most visible Saturn returns, but
            Saturn meets you four times between returns. Below is a quick
            reference for the square, opposition, square again, and the
            return—each listing the ages and birth years that experience those
            catalytic moments.
          </p>
          {/* <div className='grid gap-3 mb-4 sm:grid-cols-2'>
            {SATURN_YEARLY_SEQUENCE.map((entry) => (
              <div
                key={entry.year}
                className='p-3 rounded-lg border border-zinc-800 bg-zinc-950/60 text-xs'
              >
                <div className='flex items-center justify-between text-[0.55rem] uppercase tracking-[0.3em] text-zinc-500'>
                  <span>{entry.year}</span>
                  <span>{entry.stage}</span>
                </div>
                <p className='text-xs text-zinc-400 mt-1'>
                  Ages {entry.ages} · Born {entry.birthYears}
                </p>
                <p className='text-xs text-zinc-300 mt-2 leading-relaxed'>
                  {entry.note}
                </p>
              </div>
            ))}
          </div> */}
          <div className='grid gap-4 md:grid-cols-2'>
            {SATURN_CYCLE_STEPS.map((step) => (
              <div
                key={step.label}
                className='p-4 rounded-xl border border-zinc-800 bg-zinc-950/60'
              >
                <p className='text-xs uppercase tracking-[0.3em] text-zinc-500 mb-2'>
                  {step.label}
                </p>
                <div className='flex items-baseline gap-2'>
                  <span className='text-lg font-semibold text-white'>
                    {step.years}
                  </span>
                  <span className='text-xs text-zinc-400'>
                    {step.ages} years old
                  </span>
                </div>
                <p className='text-sm text-zinc-400 mt-1'>
                  Born roughly {step.birthYears}
                </p>
                <p className='text-sm text-zinc-300 mt-3 leading-relaxed'>
                  {step.notes}
                </p>
              </div>
            ))}
          </div>
          <p className='text-xs text-zinc-400 mt-4'>
            These markers list the cohorts currently moving through each Saturn
            angle. If you were born before the dates shown here, these stages
            already happened for you, so treat them as collective reference
            points rather than your current cycle.
          </p>
        </div>

        {years.map((year) => {
          const yearTransits = getTransitsForYear(year);
          if (yearTransits.length === 0) return null;

          return (
            <div key={year} id={`year-${year}`} className='mb-12'>
              <h2 className='text-2xl font-light mb-6 text-lunary-primary-300'>
                {year} Transits
              </h2>
              <div className='grid md:grid-cols-2 gap-4'>
                {yearTransits.map((transit) => (
                  <Link
                    key={transit.id}
                    href={`/grimoire/transits/${transit.id}`}
                    className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
                  >
                    <div className='text-sm text-zinc-400 mb-1'>
                      {transit.dates}
                    </div>
                    <h3 className='text-lg font-medium mb-2 group-hover:text-lunary-primary-300 transition-colors'>
                      {transit.title}
                    </h3>
                    <p className='text-sm text-zinc-400 line-clamp-2'>
                      Quick snapshot of dates, standout signs, and practical
                      steps so you know why to dive into this transit.
                    </p>
                    <div className='flex flex-wrap gap-1 mt-3'>
                      {transit.signs.map((sign) => (
                        <span
                          key={sign}
                          className='text-xs px-2 py-1 rounded bg-lunary-primary-900/20 text-lunary-primary-300'
                        >
                          {sign}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        <div className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
          <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
            Personal Transit Readings
          </h2>
          <p className='text-zinc-300 mb-4'>
            See how these transits affect your personal natal chart for deeper
            insights.
          </p>
          <Link
            href='/horoscope'
            className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
          >
            View Your Personal Transits
          </Link>
        </div>
        <div className='mt-8'>
          <CosmicConnections
            entityType='hub-transits'
            entityKey='transits'
            title='Transits Connections'
          />
        </div>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
