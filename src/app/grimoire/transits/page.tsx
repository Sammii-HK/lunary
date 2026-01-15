export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import {
  YEARLY_TRANSITS,
  getTransitsForYear,
} from '@/constants/seo/yearly-transits';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title:
    'Yearly Astrological Transits 2025-2030: Major Planetary Movements | Lunary',
  description:
    'Complete guide to major astrological transits from 2025-2030. Saturn Return, Jupiter transits, Uranus ingresses, and more. Plan ahead with cosmic awareness.',
  keywords: [
    'astrological transits',
    'saturn return',
    'jupiter transit',
    'yearly astrology',
    '2025 transits',
    '2026 transits',
  ],
  openGraph: {
    title: 'Yearly Astrological Transits 2025-2030 | Lunary',
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
    title: 'Yearly Astrological Transits 2025-2030 | Lunary',
    description: 'Complete guide to major astrological transits.',
    images: ['/api/og/grimoire/transits'],
  },
  alternates: { canonical: 'https://lunary.app/grimoire/transits' },
};

const years = [2025, 2026, 2027, 2028, 2029, 2030];

const faqs = [
  {
    question: 'What is a planetary transit?',
    answer:
      'A transit occurs when a planet moves across the sky and forms an angle to a planet or point in your natal chart, activating themes tied to that area of life.',
  },
  {
    question: 'Why do we care about yearly transits?',
    answer:
      'Yearly transits highlight the cosmic weather affecting everyone—knowing them helps you plan growth, healing, and readiness for major shifts.',
  },
  {
    question: 'How do I use transits personally?',
    answer:
      'Track which houses your natal planets fall in. When a major transit touches them, expect energy in that life area—prepare intentionally rather than react.',
  },
];

const tableOfContents = [
  { label: 'Transit Overview', href: '#transit-overview' },
  ...years.map((year) => ({
    label: `${year} Transits`,
    href: `#year-${year}`,
  })),
  { label: 'Personal Transit Readings', href: '#personal-transits' },
  { label: 'FAQ', href: '#faq' },
];

const whatIs = {
  question: 'What are astrological transits?',
  answer:
    'Transits are moving planets interacting with your natal chart. They trigger growth, tension, opportunity, and lessons depending on the angle and planets involved.',
};

const intro =
  'Major planetary movements (Saturn, Jupiter, Pluto, Uranus) shift collective and personal attention each year. This guide tracks the 2025-2030 cycle so you can align with the cosmic weather.';

const howToWorkWith = [
  'Pinpoint which natal houses the transit touches—those life areas light up.',
  'Treat slower outer planet transits (Saturn, Uranus, Neptune, Pluto) as long-term themes and plan accordingly.',
  'Use faster inner planet activations (Mercury, Venus, Mars) for short-term launches and communications.',
  'Celebrate supportive transits and brace, plan, or heal during challenging ones rather than panic.',
];

const relatedItems = [
  {
    name: 'Birth Chart Blueprint',
    href: '/birth-chart',
    type: 'Chart reference',
  },
  { name: 'Weekly Horoscopes', href: '/horoscope', type: 'Current sky' },
  {
    name: 'Astrology Basics',
    href: '/grimoire/beginners',
    type: 'Foundations',
  },
];

const transitsListSchema = createItemListSchema({
  name: 'Yearly Astrological Transits 2025-2030',
  description:
    'Complete guide to major astrological transits including Saturn Return, Jupiter transits, and planetary ingresses.',
  url: 'https://lunary.app/grimoire/transits',
  items: YEARLY_TRANSITS.slice(0, 20).map((transit) => ({
    name: transit.title,
    url: `https://lunary.app/grimoire/transits/${transit.id}`,
    description: transit.description,
  })),
});

export default function TransitsIndexPage() {
  return (
    <>
      {renderJsonLd(transitsListSchema)}
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Yearly Astrological Transits'
        description={metadata.description as string}
        keywords={metadata.keywords as string[]}
        canonicalUrl={metadata.alternates?.canonical as string}
        tableOfContents={tableOfContents}
        whatIs={whatIs}
        intro={intro}
        tldr='Major transits set the collective tone. Track the year’s key dates, then check which house areas they activate in your own chart.'
        meaning={`Transits are the moving planets interacting with your natal chart. Outer planets describe long themes, while inner planets trigger short events.

Use this guide to plan around the biggest shifts, then personalize the timing by checking your chart. A single transit can show up as growth in one area and friction in another depending on the house it touches.

If you are new to transit work, track one or two major transits at a time. Fewer signals make the story easier to follow.

Over time, your notes become a personal transit reference.`}
        howToWorkWith={howToWorkWith}
        rituals={[
          'Mark the peak dates in a calendar and set a simple intention.',
          'Review the transit themes at the start of each month.',
          'Choose one action that aligns with a supportive transit.',
        ]}
        journalPrompts={[
          'Which life area is most activated this year?',
          'What does this transit ask me to build or release?',
          'How did the last similar transit show up in my life?',
        ]}
        tables={[
          {
            title: 'Transit Types',
            headers: ['Type', 'Focus'],
            rows: [
              ['Outer Planets', 'Long-term life themes'],
              ['Inner Planets', 'Short-term timing and events'],
              ['Angles', 'Personal visibility and direction'],
            ],
          },
          {
            title: 'Simple Tracking Habit',
            headers: ['Step', 'Frequency'],
            rows: [
              ['Note peak dates', 'Once per month'],
              ['Journal reactions', 'Weekly'],
              ['Review patterns', 'End of season'],
            ],
          },
        ]}
        internalLinks={[
          { text: 'Birth Chart', href: '/birth-chart' },
          { text: 'Planets', href: '/grimoire/astronomy/planets' },
          { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        faqs={faqs}
        relatedItems={relatedItems}
        cosmicConnections={
          <CosmicConnections
            entityType='hub-transits'
            entityKey='transits'
            title='Transits Connections'
          />
        }
      >
        <section id='transit-overview' className='mb-12'>
          <p className='text-zinc-300 leading-relaxed mb-4'>
            Major planetary movements guide the collective rhythm. Use this
            timeline to mark opportunities for discipline, expansion,
            innovation, and healing.
          </p>
          <div className='flex flex-wrap gap-3 mb-6'>
            {years.map((year) => (
              <a
                key={year}
                href={`#year-${year}`}
                className='px-4 py-2 rounded-lg bg-zinc-800/50 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors'
              >
                {year}
              </a>
            ))}
          </div>
        </section>

        {years.map((year) => {
          const yearTransits = getTransitsForYear(year);
          if (yearTransits.length === 0) return null;

          return (
            <section key={year} id={`year-${year}`} className='mb-12'>
              <h2 className='text-2xl font-light text-lunary-primary-300 mb-6'>
                {year} Transits
              </h2>
              <div className='grid md:grid-cols-2 gap-4'>
                {yearTransits.map((transit) => (
                  <Link
                    key={transit.id}
                    href={`/grimoire/transits/${transit.id}`}
                    className='group block rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-lunary-primary-600'
                  >
                    <div className='text-sm text-zinc-400 mb-1'>
                      {transit.dates}
                    </div>
                    <h3 className='text-lg font-medium mb-2 group-hover:text-lunary-primary-300'>
                      {transit.title}
                    </h3>
                    <p className='text-sm text-zinc-400 line-clamp-2'>
                      {transit.description}
                    </p>
                    <div className='flex flex-wrap gap-1 mt-3'>
                      {transit.signs.map((sign) => (
                        <span
                          key={sign}
                          className='text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300'
                        >
                          {sign}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <section id='personal-transits' className='mb-12'>
          <div className='rounded-xl border border-lunary-primary-700 bg-lunary-primary-900/10 p-6'>
            <h2 className='text-2xl font-light text-lunary-primary-300 mb-3'>
              Personal Transit Readings
            </h2>
            <p className='text-zinc-300 mb-4'>
              Want to know how these transits affect your chart? Focus on the
              houses and planets touched by each major transit.
            </p>
            <Link
              href='/horoscope'
              className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-700 px-6 py-3 text-sm text-lunary-primary-300 transition-colors hover:bg-lunary-primary-900/20'
            >
              View Your Personal Transits
            </Link>
          </div>
        </section>

        <section className='mb-12'></section>
      </SEOContentTemplate>
    </>
  );
}
