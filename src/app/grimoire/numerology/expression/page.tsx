import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { NumerologyCalculator } from '@/components/grimoire/NumerologyCalculator';
import {
  expressionNumbers,
  expressionKeys,
} from '@/constants/grimoire/numerology-extended-data';

export const metadata: Metadata = {
  title: 'Expression Number Calculator & Meanings | Lunary',
  description:
    'Calculate your Expression (Destiny) Number and discover your natural talents and abilities. Complete guide to Expression Numbers 1-9 and Master Numbers.',
  keywords: [
    'expression number',
    'expression number calculator',
    'destiny number',
    'expression numerology',
    'calculate destiny number',
    'pythagorean numerology',
    'name numerology',
  ],
  openGraph: {
    title: 'Expression Number Calculator & Meanings | Lunary',
    description:
      'Calculate your Expression Number from your name and discover your natural talents.',
    url: 'https://lunary.app/grimoire/numerology/expression',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/numerology',
        width: 1200,
        height: 630,
        alt: 'Expression Numbers Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Expression Number Calculator & Meanings | Lunary',
    description:
      'Calculate your Expression Number and discover your natural talents.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/numerology/expression',
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
    question: 'How do I calculate my Expression Number?',
    answer:
      'To calculate your Expression Number, write out your full birth name and convert each letter to its Pythagorean number value (A=1, B=2, C=3... I=9, J=1, K=2... and so on). Add all values together and reduce to a single digit unless you get 11, 22, or 33.',
  },
  {
    question:
      'What is the difference between Expression and Soul Urge Numbers?',
    answer:
      'Your Expression Number uses ALL letters in your birth name and reveals your natural talents and how you express yourself externally. Your Soul Urge Number uses only the VOWELS and reveals your inner desires and private motivations.',
  },
  {
    question: 'Should I use nicknames or my full birth name?',
    answer:
      'Always use your complete birth name as it appears on your birth certificate for the most accurate Expression Number calculation. This includes your first, middle, and last names. Nicknames carry different vibrations.',
  },
  {
    question: 'What are Master Expression Numbers?',
    answer:
      'Master Numbers (11, 22, 33) in the Expression position indicate extraordinary potential. Expression 11 has intuitive messenger gifts, 22 can build on a grand scale, and 33 has master teaching and healing abilities.',
  },
  {
    question: 'Can my Expression Number change?',
    answer:
      'Your core Expression Number from your birth name never changes. However, if you legally change your name, that new name creates an additional vibrational influence. Many numerologists recommend analyzing both names.',
  },
];

export default function ExpressionIndexPage() {
  const coreNumbers = expressionKeys.filter(
    (k) => !['11', '22', '33'].includes(k),
  );
  const masterNumbers = expressionKeys.filter((k) =>
    ['11', '22', '33'].includes(k),
  );

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Expression Numbers | Lunary'
        h1='Expression Numbers: Discover Your Natural Talents'
        description='Your Expression Number, also known as your Destiny Number, reveals your natural talents, abilities, and the unique gifts you bring to the world.'
        keywords={[
          'expression number',
          'destiny number',
          'expression calculator',
          'numerology',
        ]}
        canonicalUrl='https://lunary.app/grimoire/numerology/expression'
        whatIs={{
          question: 'What is an Expression Number?',
          answer:
            'Your Expression Number, also called your Destiny Number, is calculated from ALL the letters in your full birth name using the Pythagorean system. It reveals your natural talents, abilities, and the tools you have at your disposal to achieve your life purpose. Think of it as your personal toolkit — the innate skills and characteristics that define how you express yourself and fulfill your destiny.',
        }}
        tldr='Your Expression Number reveals your natural talents and how you express yourself in the world. Calculate it from all letters in your birth name using the Pythagorean system, then reduce to a single digit (unless 11, 22, or 33).'
        meaning={`The Expression Number is one of the most important numbers in your numerology chart. While your Life Path Number shows your life's journey and purpose, your Expression Number reveals the natural abilities and talents you can use along that journey.

**How Expression Differs from Other Core Numbers:**

- **Life Path** (from birth date): Your life's purpose and lessons
- **Expression** (from all letters): Your natural talents and abilities  
- **Soul Urge** (from vowels): Your inner desires and motivations
- **Personality** (from consonants): How others perceive you

Your Expression Number acts as your destiny — it shows what you're naturally equipped to become. People who align their careers and life choices with their Expression Number often find greater success and fulfillment.

**The Pythagorean System:**

This ancient system assigns numbers 1-9 to the 26 letters of the alphabet in a repeating cycle:

- A, J, S = 1
- B, K, T = 2
- C, L, U = 3
- D, M, V = 4
- E, N, W = 5
- F, O, X = 6
- G, P, Y = 7
- H, Q, Z = 8
- I, R = 9

By converting your full name to numbers and reducing to a single digit (or Master Number), you discover your Expression vibration.`}
        howToWorkWith={[
          'Write out your full birth name (first, middle, and last)',
          'Convert each letter to its Pythagorean number (A=1, B=2, C=3... see chart)',
          'Add all the numbers from your entire name together',
          'Reduce to a single digit by adding digits (unless 11, 22, or 33)',
          'Study your Expression Number to understand your natural gifts',
        ]}
        tables={[
          {
            title: 'Pythagorean Letter Values',
            headers: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
            rows: [
              ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
              ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
              ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '—'],
            ],
          },
        ]}
        relatedItems={[
          {
            name: 'Soul Urge Numbers',
            href: '/grimoire/numerology/soul-urge',
            type: 'Numerology',
          },
          {
            name: 'Life Path Numbers',
            href: '/grimoire/life-path',
            type: 'Numerology',
          },
          {
            name: 'Karmic Debt Numbers',
            href: '/grimoire/numerology/karmic-debt',
            type: 'Numerology',
          },
          {
            name: 'Master Numbers',
            href: '/grimoire/numerology/master-numbers',
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
          { text: 'Calculate Life Path', href: '/grimoire/life-path' },
          { text: 'Birth Chart', href: '/birth-chart' },
          { text: 'Daily Horoscope', href: '/horoscope' },
        ]}
        ctaText='Want personalized numerology insights based on your complete chart?'
        ctaHref='/pricing'
        faqs={faqs}
      >
        <NumerologyCalculator type='expression' />

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Core Expression Numbers (1-9)
          </h2>
          <p className='text-zinc-400 mb-6'>
            Each core number reveals unique talents and the way you naturally
            express yourself. Click on your number to explore its full meaning.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {coreNumbers.map((number) => {
              const data =
                expressionNumbers[number as keyof typeof expressionNumbers];
              return (
                <Link
                  key={number}
                  href={`/grimoire/numerology/expression/${number}`}
                  className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
                >
                  <div className='flex items-center gap-3 mb-3'>
                    <span className='text-2xl font-light text-lunary-primary-400'>
                      {number}
                    </span>
                    <span className='text-zinc-400 text-sm'>Expression</span>
                  </div>
                  <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors mb-2'>
                    {data.meaning}
                  </h3>
                  <p className='text-sm text-zinc-400 line-clamp-2'>
                    {data.talents[0]}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Master Expression Numbers
          </h2>
          <p className='text-zinc-400 mb-6'>
            Master Numbers (11, 22, 33) in your Expression indicate
            extraordinary potential and heightened abilities, along with greater
            responsibility to use your gifts.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {masterNumbers.map((number) => {
              const data =
                expressionNumbers[number as keyof typeof expressionNumbers];
              return (
                <Link
                  key={number}
                  href={`/grimoire/numerology/expression/${number}`}
                  className='group rounded-xl border border-amber-900/50 bg-amber-950/20 p-5 hover:bg-amber-950/30 hover:border-amber-600 transition-all'
                >
                  <div className='flex items-center gap-3 mb-3'>
                    <span className='text-2xl font-light text-amber-400'>
                      {number}
                    </span>
                    <span className='px-2 py-0.5 text-xs bg-amber-900/50 text-amber-300 rounded'>
                      Master
                    </span>
                  </div>
                  <h3 className='font-medium text-zinc-100 group-hover:text-amber-300 transition-colors mb-2'>
                    {data.meaning}
                  </h3>
                  <p className='text-sm text-zinc-400 line-clamp-2'>
                    {data.talents[0]}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className='mb-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Example Calculation
          </h2>
          <div className='space-y-4 text-zinc-300'>
            <p>
              <strong>Name:</strong> JOHN DAVID SMITH
            </p>
            <div className='bg-zinc-800/50 p-4 rounded-lg font-mono text-sm'>
              <p className='text-zinc-400 mb-2'>Convert each letter:</p>
              <p>J=1, O=6, H=8, N=5 → 1+6+8+5 = 20</p>
              <p>D=4, A=1, V=4, I=9, D=4 → 4+1+4+9+4 = 22</p>
              <p>S=1, M=4, I=9, T=2, H=8 → 1+4+9+2+8 = 24</p>
              <p className='mt-2 text-zinc-400'>Total: 20 + 22 + 24 = 66</p>
              <p className='text-zinc-400'>Reduce: 6 + 6 = 12 → 1 + 2 = 3</p>
              <p className='mt-2 text-lunary-primary-300'>
                Expression Number: 3 (The Communicator)
              </p>
            </div>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
