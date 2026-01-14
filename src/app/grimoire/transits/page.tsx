import { Metadata } from 'next';
import Link from 'next/link';
import {
  YEARLY_TRANSITS,
  getTransitsForYear,
} from '@/constants/seo/yearly-transits';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import {
  createItemListSchema,
  renderJsonLd,
  createBreadcrumbSchema,
} from '@/lib/schema';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { getCosmicConnections } from '@/lib/cosmicConnectionsConfig';

export const metadata: Metadata = {
  title: 'Astrological Transits: Meaning, How To Read Them, Timing | Lunary',
  description:
    'Astrological transits track the moving planets and this guide explains their meaning and timing so you can plan the most impactful moments.',
  keywords: [
    'astrological transits',
    'transit meaning',
    'how to read transits',
    'transit timing',
    'planetary transits',
    'saturn return meaning',
  ],
  openGraph: {
    title: 'Astrological Transits: Meaning, How To Read Them, Timing | Lunary',
    description:
      'Understand the meaning and timing of major transits so you can work with planetary timing confidently.',
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
    title: 'Astrological Transits: Meaning, How To Read Them, Timing | Lunary',
    description:
      'Find out what each transit means and when to move with planetary timing.',
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

const cosmicConnections = getCosmicConnections('hub-transits', 'transits');

const years = [2025, 2026, 2027, 2028, 2029, 2030, 2033, 2040, 2048];

const mostSearchedTransits = [
  {
    title: 'Saturn Return 2025',
    description:
      'Return lessons for the 1995-1996 birth years and the Pisces horizon.',
    href: '/grimoire/transits/saturn-return-2025',
  },
  {
    title: 'Saturn Return 2026',
    description:
      'Pisces → Aries return that launches the late-90s cohort into leadership.',
    href: '/grimoire/transits/saturn-return-2026',
  },
  {
    title: 'Jupiter in Gemini 2025',
    description:
      'Communication, learning, and curiosity expand—ideal for writers and students.',
    href: '/grimoire/transits/jupiter-gemini-2025',
  },
  {
    title: 'Mercury Retrograde 2025',
    description:
      'Mercury Rx periods for the year to help you spot moments for review.',
    href: '/grimoire/events/2025/mercury-retrograde',
  },
];

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
    name: 'Astrological transits meaning & timing',
    description:
      'Interpretations for major transits with timing notes so you can read Saturn returns, Jupiter shifts, and planetary ingresses with clarity.',
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
        <SEOContentTemplate
          title='Astrological Transits: Meaning, How To Read Them, Timing'
          h1='Astrological Transits'
          description='Understand planetary transits, their timing, and how to work with shifting sky context.'
          keywords={[
            'astrological transits',
            'transit meaning',
            'how to read transits',
            'transit timing',
            'planetary transits',
            'saturn return meaning',
          ]}
          canonicalUrl='https://lunary.app/grimoire/transits'
          intro='Transits are the moving planets making angles to your natal placements. This hub catalogues their influence, timing, and practical meaning. Transits gain meaning through relationship, not isolation.'
          breadcrumbs={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Transits', href: '/grimoire/transits' },
          ]}
          relatedItems={[
            {
              name: "Today's Horoscopes",
              href: '/grimoire/horoscopes/today',
              type: 'topic',
            },
            {
              name: 'Weekly Horoscopes',
              href: '/grimoire/horoscopes/weekly',
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
          ]}
          meaning={`
            Each transit marks a planetary shift that gently reshapes the cosmic weather; observing it keeps you aligned with the sky rather than trying to force an outcome.
            We pair these notes with timing guidance so you can choose when to act and when to wait, depending on how your birth chart interacts with the current planetary dance.
          `}
          cosmicConnections={
            <CosmicConnections
              entityType='hub-transits'
              entityKey='transits'
              title='Transits Connections'
            />
          }
        >
          <section className='mb-12 grid gap-4 md:grid-cols-2'>
            {mostSearchedTransits.map((transit) => (
              <Link
                key={transit.href}
                href={transit.href}
                className='group flex flex-col gap-2 p-4 rounded-lg border border-zinc-800 bg-zinc-950/30 hover:border-lunary-primary-500 transition-colors'
              >
                <h3 className='text-lg font-semibold text-zinc-100 group-hover:text-lunary-primary-300'>
                  {transit.title}
                </h3>
                <p className='text-sm text-zinc-400'>{transit.description}</p>
              </Link>
            ))}
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-semibold text-zinc-100 mb-4'>
              Transit timing by year
            </h2>
            <div className='grid gap-4 md:grid-cols-2'>
              {years.map((year) => (
                <Link
                  key={year}
                  href={`/grimoire/transits/${year}`}
                  className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/40 text-sm text-zinc-300 transition hover:border-lunary-primary-600'
                >
                  {year} transits
                </Link>
              ))}
            </div>
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-semibold text-zinc-100 mb-4'>
              Saturn cycle and timing
            </h2>
            <div className='space-y-4'>
              {SATURN_CYCLE_STEPS.map((step) => (
                <div
                  key={step.label}
                  className='rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-zinc-300'
                >
                  <p className='text-xs uppercase tracking-[0.3em] text-zinc-500'>
                    {step.label}
                  </p>
                  <h3 className='text-lg text-zinc-100'>{step.years}</h3>
                  <p className='text-sm text-zinc-500'>
                    Ages: {step.ages} · Birth years: {step.birthYears}
                  </p>
                  <p className='text-sm leading-relaxed'>{step.notes}</p>
                </div>
              ))}
            </div>
          </section>

          <section className='mb-12 grid gap-4 md:grid-cols-2'>
            {years.map((year) => {
              const yearTransits = getTransitsForYear(year);
              if (yearTransits.length === 0) return null;
              return (
                <div key={year} id={`year-${year}`} className='space-y-4'>
                  <h2 className='text-xl font-semibold text-lunary-primary-300'>
                    {year} Transits
                  </h2>
                  <div className='grid gap-4'>
                    {yearTransits.map((transit) => (
                      <Link
                        key={transit.id}
                        href={`/grimoire/transits/${transit.id}`}
                        className='p-5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
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
          </section>
        </SEOContentTemplate>
      </div>
    </div>
  );
}
