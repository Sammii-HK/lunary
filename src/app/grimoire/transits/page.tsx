import { Metadata } from 'next';
import Link from 'next/link';
import {
  YEARLY_TRANSITS,
  getTransitsForYear,
} from '@/constants/seo/yearly-transits';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { createItemListSchema } from '@/lib/schema';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { getCosmicConnections } from '@/lib/cosmicConnectionsConfig';

// 30-day ISR revalidation
export const revalidate = 2592000;
export const metadata: Metadata = {
  title: 'Astrological Transits: What They Mean and How to Read Them | Lunary',
  description:
    'Learn what astrological transits mean, how to read planetary movement, and how to use timing for decisions, growth, and self-understanding.',
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
      'Transits meaning, how to read transits, and the transit of the day—learn how planetary timing shapes your life and where to start.',
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
      'Transits meaning, how to read transits, and the transit of the day—learn how planetary timing shapes your life and where to start.',
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

const currentYear = new Date().getFullYear();
const transitYears = YEARLY_TRANSITS.map((transit) => transit.year);
const years = [...new Set(transitYears)].sort((a, b) => a - b);
const cosmicSections = [
  ...getCosmicConnections('hub-transits', 'transits'),
  {
    title: 'Transit Years',
    links: years.map((year) => ({
      label: `${year} Transits`,
      href: `/grimoire/transits/year/${year}`,
    })),
  },
];

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

export default function TransitsIndexPage() {
  const currentYear = new Date().getFullYear();
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
  const faqs = [
    {
      question: 'What do transits mean in astrology?',
      answer:
        'Transits describe how current planet positions interact with your birth chart to highlight timing and themes.',
    },
    {
      question: 'How do I read transits?',
      answer:
        'Start with the transit planet, the sign it is in, and the area of your chart it activates.',
    },
    {
      question: 'What is the transit of the day?',
      answer:
        'It is the most influential current transit highlighted for quick daily context and timing.',
    },
    {
      question: 'Where can I track retrogrades and major shifts?',
      answer:
        'Use the retrogrades hub and the yearly transit links on this page to see dates and themes.',
    },
  ];

  return (
    <SEOContentTemplate
      title='Transits Meaning, How to Read Transits & Transit of the Day'
      h1='Transits Meaning, How to Read Transits & Transit of the Day'
      description='Transits meaning, how to read transits, and the transit of the day—learn how planetary timing shapes your life and where to start.'
      keywords={[
        'astrological transits',
        'transit meaning',
        'how to read transits',
        'transit timing',
        'planetary transits',
        'saturn return meaning',
      ]}
      canonicalUrl='https://lunary.app/grimoire/transits'
      additionalSchemas={[transitsListSchema]}
      faqs={faqs}
      intro='Transits are the moving planets making angles to your natal placements. This hub catalogues their influence, timing, and practical meaning. Transits gain meaning through relationship, not isolation.'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Transits', href: '/grimoire/transits' },
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
          sections={cosmicSections}
        />
      }
    >
      <section className='mb-12 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6'>
        <h2 className='text-2xl font-semibold text-zinc-100 mb-3'>
          Start here
        </h2>
        <p className='text-sm text-zinc-400 mb-5'>
          Use this quick guide to find the most relevant transit now, plus the
          top resources for retrogrades and timing.
        </p>
        <div className='grid gap-3 md:grid-cols-3'>
          <Link
            href='/grimoire/transits/transit-of-the-day'
            className='rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-300 hover:border-lunary-primary-500 transition-colors'
          >
            <span className='block text-zinc-100 font-medium'>
              Transit of the Day
            </span>
            <span className='text-zinc-400'>
              Daily timing highlights and key shifts.
            </span>
          </Link>
          <Link
            href={`/grimoire/events/${currentYear}`}
            className='rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-300 hover:border-lunary-primary-500 transition-colors'
          >
            <span className='block text-zinc-100 font-medium'>
              Current Astrological Events
            </span>
            <span className='text-zinc-400'>
              Track retrogrades and eclipses.
            </span>
          </Link>
          <Link
            href={`/grimoire/moon/${currentYear}`}
            className='rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-300 hover:border-lunary-primary-500 transition-colors'
          >
            <span className='block text-zinc-100 font-medium'>
              Lunar Phases & Full Moons Calender
            </span>
            <span className='text-zinc-400'>Track all new and full moons.</span>
          </Link>
        </div>
      </section>

      <section className='mb-12'>
        <h2 className='text-2xl text-zinc-100 mb-4'>Transit timing by year</h2>
        <div className='grid gap-4 grid-cols-4 md:grid-cols-8'>
          {years.map((year) => (
            <Link
              key={year}
              href={`/grimoire/transits#year-${year}-transits`}
              className='p-2 rounded-lg border border-zinc-800 bg-zinc-900/40 text-sm text-center text-zinc-300 transition hover:border-lunary-primary-600'
            >
              {year}
            </Link>
          ))}
        </div>
      </section>

      <section className='mb-12'>
        <h2 className='text-2xl text-zinc-100 mb-4'>Saturn cycle and timing</h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {SATURN_CYCLE_STEPS.map((step) => (
            <div
              key={step.label}
              className='rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-zinc-300'
            >
              <p className='text-xs uppercase tracking-[0.3em] text-zinc-500'>
                {step.label}
              </p>
              <h3 className='text-lg my-1 font-light text-zinc-100'>
                {step.years}
              </h3>
              <p className='text-sm text-zinc-500 my-2'>
                Ages: {step.ages} · Birth years: {step.birthYears}
              </p>
              <p className='text-sm leading-relaxed'>{step.notes}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='mb-12 grid gap-4'>
        {years.map((year) => {
          const yearTransits = getTransitsForYear(year);
          if (yearTransits.length === 0) return null;
          return (
            <div key={year} id={`year-${year}`} className='space-y-4'>
              <h2
                id={`year-${year}-transits`}
                className='text-xl font-semibold text-lunary-primary-300'
              >
                {year} Transits
              </h2>
              <div className='grid gap-4 md:grid-cols-2'>
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
  );
}
