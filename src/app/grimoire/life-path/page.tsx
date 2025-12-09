import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { NumerologyCalculator } from '@/components/grimoire/NumerologyCalculator';
import { lifePathNumbers } from '@/constants/grimoire/numerology-data';

export const metadata: Metadata = {
  title: 'Life Path Number Calculator & Meanings | Lunary',
  description:
    "Calculate your Life Path Number from your birth date and discover your life's purpose. Complete guide to Life Path Numbers 1-9 and Master Numbers 11, 22, 33.",
  keywords: [
    'life path number',
    'life path calculator',
    'numerology life path',
    'calculate life path number',
    'birth date numerology',
    'life path 1',
    'life path 11',
    'master numbers',
  ],
  openGraph: {
    title: 'Life Path Number Calculator & Meanings | Lunary',
    description:
      "Calculate your Life Path Number and discover your life's purpose.",
    url: 'https://lunary.app/grimoire/life-path',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/numerology',
        width: 1200,
        height: 630,
        alt: 'Life Path Numbers Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Life Path Number Calculator & Meanings | Lunary',
    description:
      "Calculate your Life Path Number and discover your life's purpose.",
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/life-path',
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
    question: 'How do I calculate my Life Path Number?',
    answer:
      'To calculate your Life Path Number, add all digits of your birth date together and reduce to a single digit. For example, if you were born on March 15, 1990: 3 + 1 + 5 + 1 + 9 + 9 + 0 = 28, then 2 + 8 = 10, then 1 + 0 = 1. Your Life Path would be 1. Keep 11, 22, and 33 as Master Numbers.',
  },
  {
    question: 'What is the most powerful Life Path Number?',
    answer:
      'No Life Path Number is more powerful than another — each has unique strengths. However, Master Numbers (11, 22, 33) carry intensified energy and greater potential, along with greater challenges. Life Path 8 is often associated with material success, while 9 represents spiritual wisdom.',
  },
  {
    question: 'Can two people have the same Life Path Number?',
    answer:
      'Yes, many people share the same Life Path Number. However, your complete numerology chart includes multiple numbers (Expression, Soul Urge, Personality, etc.) that make your profile unique. Your Life Path shows your general path, but other numbers add nuance.',
  },
  {
    question: "What's the difference between Life Path and Destiny Number?",
    answer:
      "Your Life Path Number (from birth date) reveals your life's purpose and the path you're meant to walk. Your Destiny/Expression Number (from your name) reveals your natural talents and abilities. Life Path shows WHERE you're going; Expression shows HOW you'll get there.",
  },
  {
    question: 'What are Master Life Path Numbers?',
    answer:
      'Master Numbers (11, 22, 33) are not reduced to single digits because they carry special significance. Life Path 11 is the Intuitive, bringing spiritual insight. Life Path 22 is the Master Builder, manifesting grand visions. Life Path 33 is the Master Teacher, serving through love.',
  },
];

export default function LifePathIndexPage() {
  const numbers = Object.keys(lifePathNumbers).sort(
    (a, b) => parseInt(a) - parseInt(b),
  );

  const coreNumbers = numbers.filter((n) => !['11', '22', '33'].includes(n));
  const masterNumbers = numbers.filter((n) => ['11', '22', '33'].includes(n));

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Life Path Numbers | Lunary'
        h1="Life Path Numbers: Discover Your Life's Purpose"
        description="Your Life Path Number is the most important number in numerology. Calculated from your birth date, it reveals your life's purpose and the path you're meant to walk."
        keywords={[
          'life path number',
          'life path calculator',
          'numerology',
          'birth date numerology',
        ]}
        canonicalUrl='https://lunary.app/grimoire/life-path'
        whatIs={{
          question: 'What is a Life Path Number?',
          answer:
            "Your Life Path Number is the most significant number in your numerology chart. Calculated from your complete birth date, it reveals your life's purpose, the lessons you're here to learn, and the path you're destined to walk. Unlike other numerology numbers derived from your name, your Life Path is set from birth and never changes.",
        }}
        tldr="Your Life Path Number reveals your life's purpose and destiny. Calculate it by adding all digits of your birth date together and reducing to a single digit (unless 11, 22, or 33)."
        meaning={`The Life Path Number is considered the most important number in numerology because it represents the core of who you are and why you're here. It's calculated from your birth date — a number you cannot change — making it your fundamental life blueprint.

**What Your Life Path Reveals:**

Your Life Path Number shows:
- Your life's purpose and direction
- The lessons you're here to learn
- Your natural strengths and challenges
- The opportunities that will come your way
- How you'll evolve throughout life

**How Life Path Differs from Other Numbers:**

While your Expression Number (from your name) shows your talents, and your Soul Urge Number (from vowels) shows your inner desires, your Life Path Number shows your overall life direction and purpose. It's the foundation upon which all other numbers build.

**The Nine Paths:**

Each Life Path from 1-9 represents a distinct journey:
- **1**: Leadership and independence
- **2**: Cooperation and balance
- **3**: Creativity and self-expression
- **4**: Building and stability
- **5**: Freedom and change
- **6**: Responsibility and nurturing
- **7**: Spirituality and introspection
- **8**: Achievement and abundance
- **9**: Humanitarianism and completion

Plus three Master Numbers (11, 22, 33) with amplified spiritual potential.`}
        howToWorkWith={[
          'Write down your complete birth date (month, day, year)',
          'Add each digit separately: month + day + year',
          'Continue adding digits until you reach a single digit',
          'Exception: Keep 11, 22, or 33 as they are Master Numbers',
          'Study your Life Path Number to understand your purpose',
        ]}
        relatedItems={[
          {
            name: 'Expression Numbers',
            href: '/grimoire/numerology/expression',
            type: 'Numerology',
          },
          {
            name: 'Soul Urge Numbers',
            href: '/grimoire/numerology/soul-urge',
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
          {
            name: 'Personal Year',
            href: '/grimoire/numerology',
            type: 'Numerology',
          },
        ]}
        internalLinks={[
          { text: 'Numerology Overview', href: '/grimoire/numerology' },
          { text: 'Birth Chart', href: '/birth-chart' },
          { text: 'Daily Horoscope', href: '/horoscope' },
          { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
        ]}
        ctaText='Want personalized insights combining your Life Path with astrology?'
        ctaHref='/pricing'
        faqs={faqs}
      >
        <NumerologyCalculator type='life-path' />

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Core Life Path Numbers (1-9)
          </h2>
          <p className='text-zinc-400 mb-6'>
            Each Life Path Number represents a unique journey with its own
            purpose, lessons, and gifts. Click on your number to explore its
            full meaning.
          </p>
          <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4'>
            {coreNumbers.map((num) => {
              const data = lifePathNumbers[num as keyof typeof lifePathNumbers];
              return (
                <Link
                  key={num}
                  href={`/grimoire/life-path/${num}`}
                  className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all text-center'
                >
                  <span className='text-3xl font-light text-lunary-primary-400 group-hover:text-lunary-primary-300 transition-colors'>
                    {num}
                  </span>
                  <p className='text-xs text-zinc-500 mt-2 line-clamp-1'>
                    {data?.meaning || 'The ' + num}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Master Life Path Numbers
          </h2>
          <p className='text-zinc-400 mb-6'>
            Master Numbers carry intensified energy and greater spiritual
            potential. They're rare and indicate souls with special missions.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {masterNumbers.map((num) => {
              const data = lifePathNumbers[num as keyof typeof lifePathNumbers];
              return (
                <Link
                  key={num}
                  href={`/grimoire/life-path/${num}`}
                  className='group rounded-xl border border-amber-900/50 bg-amber-950/20 p-6 hover:bg-amber-950/30 hover:border-amber-600 transition-all text-center'
                >
                  <span className='text-4xl font-light text-amber-400 group-hover:text-amber-300 transition-colors'>
                    {num}
                  </span>
                  <span className='block px-2 py-0.5 text-xs bg-amber-900/50 text-amber-300 rounded mt-2 mx-auto w-fit'>
                    Master Number
                  </span>
                  <p className='text-sm text-zinc-400 mt-3'>
                    {data?.meaning || 'Master ' + num}
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
              <strong>Birth Date:</strong> March 15, 1990
            </p>
            <div className='bg-zinc-800/50 p-4 rounded-lg font-mono text-sm'>
              <p className='text-zinc-400 mb-2'>Add all digits:</p>
              <p>Month: 3</p>
              <p>Day: 1 + 5 = 6</p>
              <p>Year: 1 + 9 + 9 + 0 = 19 → 1 + 9 = 10 → 1 + 0 = 1</p>
              <p className='mt-2 text-zinc-400'>Total: 3 + 6 + 1 = 10</p>
              <p className='text-zinc-400'>Reduce: 1 + 0 = 1</p>
              <p className='mt-2 text-lunary-primary-300'>
                Life Path Number: 1 (The Leader)
              </p>
            </div>
          </div>
        </section>

        <section className='mb-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Master Number Example
          </h2>
          <div className='space-y-4 text-zinc-300'>
            <p>
              <strong>Birth Date:</strong> November 29, 1993
            </p>
            <div className='bg-zinc-800/50 p-4 rounded-lg font-mono text-sm'>
              <p className='text-zinc-400 mb-2'>Add all digits:</p>
              <p>Month: 1 + 1 = 2</p>
              <p>Day: 2 + 9 = 11 → Keep as Master Number</p>
              <p>Year: 1 + 9 + 9 + 3 = 22 → Keep as Master Number</p>
              <p className='mt-2 text-zinc-400'>Total: 2 + 11 + 22 = 35</p>
              <p className='text-zinc-400'>Reduce: 3 + 5 = 8</p>
              <p className='mt-2 text-amber-300'>
                Note: When reducing, 11 and 22 first become 2 and 4. Final Life
                Path: 8
              </p>
            </div>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
