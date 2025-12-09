import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { lifePathNumbers } from '@/constants/grimoire/numerology-data';

const coreNumberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export const metadata: Metadata = {
  title: 'Core Numbers 1-9: Complete Numerology Meanings | Lunary',
  description:
    'Complete guide to Core Numbers 1-9 in numerology. Learn the meaning, energy, and traits of each foundational number from 1 (The Leader) to 9 (The Humanitarian).',
  keywords: [
    'core numbers',
    'numerology numbers 1-9',
    'basic numerology',
    'number 1 meaning',
    'number 9 meaning',
    'numerology foundation',
    'single digit numerology',
  ],
  openGraph: {
    title: 'Core Numbers 1-9 Guide | Lunary',
    description:
      'Complete guide to Core Numbers 1-9 in numerology and their meanings.',
    url: 'https://lunary.app/grimoire/numerology/core-numbers',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/numerology',
        width: 1200,
        height: 630,
        alt: 'Core Numbers Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Core Numbers 1-9 Guide | Lunary',
    description: 'Complete guide to Core Numbers 1-9 in numerology.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/numerology/core-numbers',
  },
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

const faqs = [
  {
    question: 'What are Core Numbers in numerology?',
    answer:
      'Core Numbers are the single-digit numbers 1-9 that form the foundation of all numerology. Every numerological calculation ultimately reduces to one of these nine numbers (unless it produces a Master Number 11, 22, or 33). Each core number carries unique vibrational energy and meaning.',
  },
  {
    question: 'How do Core Numbers relate to Life Path Numbers?',
    answer:
      'Your Life Path Number is calculated from your birth date and reduces to either a Core Number (1-9) or a Master Number (11, 22, 33). The Core Number of your Life Path determines your fundamental life purpose and characteristics.',
  },
  {
    question: 'Which Core Number is the best?',
    answer:
      'No Core Number is inherently better than another. Each number from 1-9 carries unique strengths and challenges. The "best" number is the one that aligns with your authentic self and life purpose. All numbers have positive expressions and shadow aspects.',
  },
  {
    question: 'Can I have multiple Core Numbers?',
    answer:
      'Yes, everyone has multiple Core Numbers in their chart. Your Life Path, Expression, Soul Urge, Personality, and Birthday numbers may all be different Core Numbers, each influencing different aspects of your life.',
  },
  {
    question: 'Why is 9 the highest Core Number?',
    answer:
      'In numerology, 9 represents completion of the numerical cycle before returning to 1. It embodies the wisdom gained through all previous numbers (1-8) and represents humanitarianism, universal love, and the culmination of spiritual development. After 9, the cycle begins again.',
  },
];

export default function CoreNumbersIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Core Numbers 1-9 | Lunary'
        h1='Core Numbers 1-9: The Foundation of Numerology'
        description='The foundation of numerology. Each core number carries a unique vibrational frequency that influences personality, behavior, and life experiences.'
        keywords={[
          'core numbers',
          'numerology 1-9',
          'basic numerology',
          'number meanings',
        ]}
        canonicalUrl='https://lunary.app/grimoire/numerology/core-numbers'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Numerology', href: '/grimoire/numerology' },
          { label: 'Core Numbers', href: '/grimoire/numerology/core-numbers' },
        ]}
        whatIs={{
          question: 'What are Core Numbers?',
          answer:
            'Core Numbers (1-9) are the fundamental building blocks of numerology. All numerological calculations eventually reduce to one of these nine single-digit numbers (unless they produce a Master Number). Each core number carries distinct vibrational energy, personality traits, challenges, and life themes that form the basis for interpreting any numerology chart.',
        }}
        tldr='Core Numbers 1-9 are the foundation of numerology. 1 is leadership, 2 is cooperation, 3 is creativity, 4 is stability, 5 is freedom, 6 is nurturing, 7 is spirituality, 8 is abundance, and 9 is humanitarianism.'
        meaning={`In numerology, the numbers 1-9 are called Core Numbers because they form the foundation of all numerological interpretation. While calculations can produce larger numbers, these always reduce to a single digit (1-9) unless they're Master Numbers (11, 22, 33).

**The Numerological Cycle:**

The numbers 1-9 represent a complete cycle of human experience:

1. **Beginning** (1) - The spark of creation, individuality
2. **Partnership** (2) - Duality, cooperation, balance
3. **Expression** (3) - Creativity, communication, joy
4. **Foundation** (4) - Structure, stability, hard work
5. **Change** (5) - Freedom, adventure, transformation
6. **Harmony** (6) - Love, responsibility, family
7. **Wisdom** (7) - Spirituality, introspection, analysis
8. **Power** (8) - Achievement, abundance, karma
9. **Completion** (9) - Humanitarianism, wisdom, endings

**How Core Numbers Apply:**

These meanings apply wherever the number appears in your chart:
- **Life Path**: Your life purpose and journey
- **Expression**: Your natural talents
- **Soul Urge**: Your inner desires
- **Birthday**: Your gifts to develop

Understanding Core Numbers is essential for interpreting any numerology reading.`}
        howToWorkWith={[
          'Calculate your main numerology numbers (Life Path, Expression, Soul Urge)',
          'Reduce each calculation to a single digit (unless 11, 22, or 33)',
          'Study the meaning of your core numbers',
          'Notice which numbers appear most often in your chart',
          'Work with the positive aspects while addressing shadow traits',
        ]}
        tables={[
          {
            title: 'Core Numbers Quick Reference',
            headers: ['Number', 'Archetype', 'Key Traits', 'Challenge'],
            rows: [
              ['1', 'The Leader', 'Independent, pioneering', 'Ego, isolation'],
              ['2', 'The Diplomat', 'Cooperative, sensitive', 'Dependency'],
              ['3', 'The Communicator', 'Creative, expressive', 'Scattered'],
              ['4', 'The Builder', 'Stable, hardworking', 'Rigidity'],
              ['5', 'The Freedom Seeker', 'Adventurous, versatile', 'Restless'],
              ['6', 'The Nurturer', 'Responsible, loving', 'Controlling'],
              ['7', 'The Seeker', 'Spiritual, analytical', 'Isolation'],
              ['8', 'The Powerhouse', 'Ambitious, material', 'Workaholism'],
              ['9', 'The Humanitarian', 'Compassionate, wise', 'Martyrdom'],
            ],
          },
        ]}
        relatedItems={[
          {
            name: 'Master Numbers',
            href: '/grimoire/numerology/master-numbers',
            type: 'Numerology',
          },
          {
            name: 'Life Path Numbers',
            href: '/grimoire/life-path',
            type: 'Numerology',
          },
          {
            name: 'Soul Urge Numbers',
            href: '/grimoire/numerology/soul-urge',
            type: 'Numerology',
          },
          {
            name: 'Expression Numbers',
            href: '/grimoire/numerology/expression',
            type: 'Numerology',
          },
          {
            name: 'Angel Numbers',
            href: '/grimoire/angel-numbers',
            type: 'Numerology',
          },
        ]}
        internalLinks={[
          { text: 'Numerology Overview', href: '/grimoire/numerology' },
          { text: 'Life Path Calculator', href: '/grimoire/life-path' },
          { text: 'Birth Chart', href: '/birth-chart' },
          { text: 'Daily Horoscope', href: '/horoscope' },
        ]}
        ctaText='Want to understand your complete numerology profile?'
        ctaHref='/pricing'
        faqs={faqs}
      >
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            All Core Numbers
          </h2>
          <p className='text-zinc-400 mb-6'>
            Each core number carries unique energy and meaning. Click on any
            number to explore its full interpretation.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {coreNumberKeys.map((number) => {
              const data =
                lifePathNumbers[number as keyof typeof lifePathNumbers];
              return (
                <Link
                  key={number}
                  href={`/grimoire/numerology/core-numbers/${number}`}
                  className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
                >
                  <div className='flex items-center gap-3 mb-3'>
                    <span className='text-3xl font-light text-lunary-primary-400'>
                      {number}
                    </span>
                  </div>
                  <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors mb-2'>
                    {data?.meaning || 'Number ' + number}
                  </h3>
                  <p className='text-sm text-zinc-500 line-clamp-2'>
                    {data?.description
                      ? data.description.slice(0, 100) + '...'
                      : ''}
                  </p>
                  {data?.keywords && (
                    <div className='mt-3 flex flex-wrap gap-1'>
                      {data.keywords.slice(0, 3).map((kw) => (
                        <span
                          key={kw}
                          className='text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded'
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        <section className='mb-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            The Numerical Journey
          </h2>
          <p className='text-zinc-400 mb-4'>
            The progression from 1 to 9 tells a story of soul evolution:
          </p>
          <div className='space-y-3 text-sm text-zinc-400'>
            <p>
              <span className='text-lunary-primary-300 font-medium'>1-3:</span>{' '}
              Individual expression — discovering self, others, and creative
              voice
            </p>
            <p>
              <span className='text-lunary-primary-300 font-medium'>4-6:</span>{' '}
              Building foundations — creating stability, embracing change,
              nurturing others
            </p>
            <p>
              <span className='text-lunary-primary-300 font-medium'>7-9:</span>{' '}
              Spiritual mastery — seeking wisdom, achieving success, serving
              humanity
            </p>
          </div>
        </section>

        <section className='mb-12 bg-gradient-to-r from-lunary-primary-900/20 to-lunary-accent-900/20 border border-lunary-primary-800 rounded-xl p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Quick Meanings
          </h2>
          <div className='grid grid-cols-3 gap-4 text-sm'>
            <div>
              <span className='font-medium text-lunary-primary-300'>1</span>
              <span className='text-zinc-400'> — Leadership</span>
            </div>
            <div>
              <span className='font-medium text-lunary-primary-300'>2</span>
              <span className='text-zinc-400'> — Partnership</span>
            </div>
            <div>
              <span className='font-medium text-lunary-primary-300'>3</span>
              <span className='text-zinc-400'> — Creativity</span>
            </div>
            <div>
              <span className='font-medium text-lunary-primary-300'>4</span>
              <span className='text-zinc-400'> — Stability</span>
            </div>
            <div>
              <span className='font-medium text-lunary-primary-300'>5</span>
              <span className='text-zinc-400'> — Freedom</span>
            </div>
            <div>
              <span className='font-medium text-lunary-primary-300'>6</span>
              <span className='text-zinc-400'> — Nurturing</span>
            </div>
            <div>
              <span className='font-medium text-lunary-primary-300'>7</span>
              <span className='text-zinc-400'> — Spirituality</span>
            </div>
            <div>
              <span className='font-medium text-lunary-primary-300'>8</span>
              <span className='text-zinc-400'> — Abundance</span>
            </div>
            <div>
              <span className='font-medium text-lunary-primary-300'>9</span>
              <span className='text-zinc-400'> — Completion</span>
            </div>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
