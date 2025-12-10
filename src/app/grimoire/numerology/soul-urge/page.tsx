import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { NumerologyCalculator } from '@/components/grimoire/NumerologyCalculator';
import {
  soulUrgeNumbers,
  soulUrgeKeys,
} from '@/constants/grimoire/numerology-extended-data';

export const metadata: Metadata = {
  title: 'Soul Urge Number Calculator & Meanings | Lunary',
  description:
    "Calculate your Soul Urge Number and discover your heart's deepest desires. Complete guide to Soul Urge Numbers 1-9 and Master Numbers 11, 22, 33.",
  keywords: [
    'soul urge number',
    'soul urge calculator',
    "heart's desire number",
    'soul urge numerology',
    'calculate soul urge',
    'vowel numerology',
    'inner desire number',
  ],
  openGraph: {
    title: 'Soul Urge Number Calculator & Meanings | Lunary',
    description:
      "Calculate your Soul Urge Number from your name and discover your heart's deepest desires.",
    url: 'https://lunary.app/grimoire/numerology/soul-urge',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/numerology',
        width: 1200,
        height: 630,
        alt: 'Soul Urge Numbers Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Soul Urge Number Calculator & Meanings | Lunary',
    description:
      "Calculate your Soul Urge Number and discover your heart's deepest desires.",
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/numerology/soul-urge',
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
    question: 'How do I calculate my Soul Urge Number?',
    answer:
      'To calculate your Soul Urge Number, write out your full birth name and extract only the vowels (A, E, I, O, U). Assign each vowel its Pythagorean value: A=1, E=5, I=9, O=6, U=3. Add all values together and reduce to a single digit (unless you get 11, 22, or 33, which are Master Numbers).',
  },
  {
    question: 'What if my Soul Urge calculation equals 10?',
    answer:
      'If your Soul Urge calculation equals 10, you reduce it by adding the digits together: 1 + 0 = 1. Your Soul Urge Number would be 1. Only 11, 22, and 33 are kept as double digits because they are Master Numbers.',
  },
  {
    question: "What's the difference between Soul Urge and Life Path Numbers?",
    answer:
      "Your Life Path Number is calculated from your birth date and reveals your life's purpose and outer journey. Your Soul Urge Number is calculated from the vowels in your birth name and reveals your inner desires, motivations, and what truly fulfills you at a soul level.",
  },
  {
    question: 'Should I use my birth name or current name for Soul Urge?',
    answer:
      "Always use your full birth name as it appears on your birth certificate for Soul Urge calculations. This includes your first, middle, and last names. Your birth name carries your original soul vibration, even if you've legally changed your name.",
  },
  {
    question: 'What are Master Soul Urge Numbers?',
    answer:
      'Master Numbers (11, 22, 33) in Soul Urge position indicate heightened spiritual energy and deeper soul purposes. Soul Urge 11 craves spiritual enlightenment, 22 desires to build lasting legacies, and 33 yearns to heal and serve humanity through unconditional love.',
  },
];

export default function SoulUrgeIndexPage() {
  const coreNumbers = soulUrgeKeys.filter(
    (k) => !['11', '22', '33'].includes(k),
  );
  const masterNumbers = soulUrgeKeys.filter((k) =>
    ['11', '22', '33'].includes(k),
  );

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Soul Urge Numbers | Lunary'
        h1="Soul Urge Numbers: Discover Your Heart's Desire"
        description='Your Soul Urge Number reveals your innermost motivations, deepest desires, and what truly fulfills your soul. Calculate yours and understand what drives you.'
        keywords={[
          'soul urge number',
          'soul urge calculator',
          "heart's desire number",
          'numerology',
        ]}
        canonicalUrl='https://lunary.app/grimoire/numerology/soul-urge'
        whatIs={{
          question: 'What is a Soul Urge Number?',
          answer:
            "Your Soul Urge Number, also known as your Heart's Desire Number, is calculated from the vowels in your full birth name. It represents the private you — your deepest desires, innermost motivations, and what truly fulfills your soul. While your Life Path Number shows your outer journey, your Soul Urge reveals your inner yearnings and what you need to feel complete.",
        }}
        tldr='Your Soul Urge Number reveals what your heart truly craves. Calculate it from the vowels in your birth name using A=1, E=5, I=9, O=6, U=3, then reduce to a single digit (unless 11, 22, or 33).'
        meaning={`The Soul Urge Number is one of the five core numbers in numerology, representing the innermost self that you may not show to the world. It reveals your secret desires, motivations, and what you truly need to feel fulfilled.

Unlike your Life Path Number (calculated from your birth date) which shows your external life purpose, your Soul Urge Number shows what drives you internally. It's the voice of your inner self, often influencing your decisions without you even realizing it.

Understanding your Soul Urge helps you:
- Align your life choices with your true desires
- Understand why you're drawn to certain paths
- Find greater fulfillment in relationships and career
- Connect with your authentic self

**How Soul Urge Affects Your Life:**

In relationships, your Soul Urge reveals what you truly need from a partner and what kind of emotional connection satisfies you. In career, it shows the work that would feel most meaningful to your soul, not just practical.

Many people live disconnected from their Soul Urge, pursuing what society expects rather than what their heart desires. Learning your Soul Urge Number can be a powerful step toward authentic living.`}
        howToWorkWith={[
          'Write out your full birth name exactly as it appears on your birth certificate',
          'Identify all vowels: A, E, I, O, U (Y is not counted as a vowel in traditional numerology)',
          'Convert each vowel to its number: A=1, E=5, I=9, O=6, U=3',
          'Add all the vowel values together',
          'Reduce to a single digit by adding digits together (unless 11, 22, or 33)',
        ]}
        tables={[
          {
            title: 'Vowel Values in Numerology',
            headers: ['Vowel', 'Number Value', 'Energy'],
            rows: [
              ['A', '1', 'Independence, new beginnings'],
              ['E', '5', 'Freedom, change, experience'],
              ['I', '9', 'Completion, wisdom, humanitarianism'],
              ['O', '6', 'Responsibility, nurturing, harmony'],
              ['U', '3', 'Creativity, expression, joy'],
            ],
          },
        ]}
        relatedItems={[
          {
            name: 'Expression Numbers',
            href: '/grimoire/numerology/expression',
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
        <NumerologyCalculator type='soul-urge' />

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Core Soul Urge Numbers (1-9)
          </h2>
          <p className='text-zinc-400 mb-6'>
            Each core number from 1-9 carries unique soul desires and
            motivations. Click on your number to explore its full meaning.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {coreNumbers.map((number) => {
              const data =
                soulUrgeNumbers[number as keyof typeof soulUrgeNumbers];
              return (
                <Link
                  key={number}
                  href={`/grimoire/numerology/soul-urge/${number}`}
                  className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-rose-600 transition-all'
                >
                  <div className='flex items-center gap-3 mb-3'>
                    <span className='text-2xl font-light text-lunary-rose-400'>
                      {number}
                    </span>
                    <span className='text-zinc-400 text-sm'>Soul Urge</span>
                  </div>
                  <h3 className='font-medium text-zinc-100 group-hover:text-lunary-rose-300 transition-colors mb-2'>
                    {data.meaning}
                  </h3>
                  <p className='text-sm text-zinc-400 line-clamp-2'>
                    {data.desires[0]}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Master Soul Urge Numbers
          </h2>
          <p className='text-zinc-400 mb-6'>
            Master Numbers (11, 22, 33) carry intensified spiritual energy and
            deeper soul purposes. These numbers are not reduced and indicate
            souls with heightened missions.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {masterNumbers.map((number) => {
              const data =
                soulUrgeNumbers[number as keyof typeof soulUrgeNumbers];
              return (
                <Link
                  key={number}
                  href={`/grimoire/numerology/soul-urge/${number}`}
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
                    {data.desires[0]}
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
              <strong>Name:</strong> SAMANTHA LEE JONES
            </p>
            <div className='bg-zinc-800/50 p-4 rounded-lg font-mono text-sm'>
              <p className='text-zinc-400 mb-2'>Extract vowels:</p>
              <p>
                S<span className='text-lunary-primary-300'>A</span>M
                <span className='text-lunary-primary-300'>A</span>NTH
                <span className='text-lunary-primary-300'>A</span> L
                <span className='text-lunary-primary-300'>EE</span> J
                <span className='text-lunary-primary-300'>O</span>N
                <span className='text-lunary-primary-300'>E</span>S
              </p>
              <p className='mt-2 text-zinc-400'>Vowels: A, A, A, E, E, O, E</p>
              <p className='text-zinc-400'>
                Values: 1 + 1 + 1 + 5 + 5 + 6 + 5 = 24
              </p>
              <p className='text-zinc-400'>Reduce: 2 + 4 = 6</p>
              <p className='mt-2 text-lunary-primary-300'>
                Soul Urge Number: 6
              </p>
            </div>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
