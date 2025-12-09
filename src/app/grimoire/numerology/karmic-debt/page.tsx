import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  karmicDebtNumbers,
  karmicDebtKeys,
} from '@/constants/grimoire/numerology-extended-data';

export const metadata: Metadata = {
  title: 'Karmic Debt Numbers 13, 14, 16, 19: Meanings & Healing | Lunary',
  description:
    'Complete guide to Karmic Debt Numbers in numerology. Discover the meaning of 13, 14, 16, and 19 — past life lessons your soul chose to master.',
  keywords: [
    'karmic debt numbers',
    'karmic debt 13',
    'karmic debt 14',
    'karmic debt 16',
    'karmic debt 19',
    'numerology karma',
    'past life numerology',
    'karmic lessons',
  ],
  openGraph: {
    title: 'Karmic Debt Numbers 13, 14, 16, 19 Guide | Lunary',
    description:
      'Discover Karmic Debt Numbers and the past life lessons they represent.',
    url: 'https://lunary.app/grimoire/numerology/karmic-debt',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/numerology',
        width: 1200,
        height: 630,
        alt: 'Karmic Debt Numbers Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Karmic Debt Numbers Guide | Lunary',
    description:
      'Discover Karmic Debt Numbers 13, 14, 16, 19 and their spiritual lessons.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/numerology/karmic-debt',
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
    question: 'What are Karmic Debt Numbers?',
    answer:
      'Karmic Debt Numbers (13, 14, 16, and 19) are special numbers in numerology that indicate unfinished business from past lives. They appear when your core numbers reduce through these values, signaling specific lessons your soul has chosen to master in this lifetime.',
  },
  {
    question: 'How do I know if I have a Karmic Debt Number?',
    answer:
      'Check your Life Path, Expression, or Soul Urge calculations. If any number reduces THROUGH 13, 14, 16, or 19 before reaching its final digit, you carry that karmic debt. For example, if your Life Path calculation shows 14 before becoming 5, you have Karmic Debt 14.',
  },
  {
    question: 'Is having a Karmic Debt Number bad?',
    answer:
      "No, Karmic Debt Numbers aren't punishments — they're opportunities for accelerated soul growth. Your soul chose these lessons to evolve. Working consciously with your karmic debt leads to profound spiritual development and healing.",
  },
  {
    question: 'Can I clear my Karmic Debt?',
    answer:
      'Yes, you can work through and eventually clear karmic debt by consciously addressing its lessons. This involves recognizing patterns, taking responsibility, making different choices, and healing the wounds associated with your specific number.',
  },
  {
    question: 'What is the difference between Karmic Debt and Karmic Lessons?',
    answer:
      'Karmic Debt Numbers (13, 14, 16, 19) indicate specific past life issues needing resolution. Karmic Lessons are found by looking at which numbers 1-9 are missing from your name, showing areas you need to develop in this life.',
  },
];

export default function KarmicDebtIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Karmic Debt Numbers | Lunary'
        h1='Karmic Debt Numbers: Past Life Lessons to Master'
        description='Karmic Debt Numbers (13, 14, 16, 19) indicate lessons your soul chose to master in this lifetime, often stemming from actions in past lives that require balancing.'
        keywords={[
          'karmic debt numbers',
          'karmic debt 13',
          'karmic debt 14',
          'numerology karma',
        ]}
        canonicalUrl='https://lunary.app/grimoire/numerology/karmic-debt'
        whatIs={{
          question: 'What are Karmic Debt Numbers?',
          answer:
            'Karmic Debt Numbers (13, 14, 16, and 19) are special numbers in numerology that indicate unfinished business from past lives. They appear when your core numbers reduce through these values before reaching a single digit. Rather than punishment, they represent lessons your soul has chosen to address for accelerated spiritual growth.',
        }}
        tldr='Karmic Debt Numbers 13, 14, 16, and 19 indicate past life lessons to work through. 13 teaches hard work, 14 teaches moderation, 16 teaches humility, and 19 teaches independence with compassion.'
        meaning={`Karmic Debt Numbers are among the most significant indicators in numerology of past life karma requiring attention in your current incarnation. Unlike other numbers that simply describe tendencies, karmic debt numbers point to specific patterns that need healing.

**The Four Karmic Debt Numbers:**

- **13 (reduces to 4)**: The Debt of Hard Work — Past life laziness or taking shortcuts now requires learning the value of persistent effort
- **14 (reduces to 5)**: The Debt of Freedom — Past abuse of freedom through excess now requires learning moderation and responsibility
- **16 (reduces to 7)**: The Debt of Ego — Past misuse of power or vanity now requires ego death and rebuilding with humility
- **19 (reduces to 1)**: The Debt of Independence — Past selfishness or abandonment now requires learning to stand alone while remaining connected

**How Karmic Debt Appears:**

You carry a karmic debt when your numerology calculations pass THROUGH these numbers. For example:
- Birthday March 13 → Karmic Debt 13
- Name totaling 14 before reducing to 5 → Karmic Debt 14
- Life Path calculation showing 16 → Karmic Debt 16

**Why This Matters:**

Understanding your karmic debt helps you:
1. Recognize recurring life patterns
2. Understand why certain challenges appear
3. Work consciously toward healing
4. Transform karma into dharma (right action)

Having karmic debt isn't a curse — souls with karmic debt often evolve faster because they're consciously working through profound lessons.`}
        howToWorkWith={[
          'Accept your karmic debt as a chosen growth opportunity, not punishment',
          'Identify the specific lesson associated with your number',
          'Notice repeating patterns in your life related to this theme',
          'Take full responsibility for your actions and their consequences',
          'Practice forgiveness — for yourself and others',
          'Make conscious choices that align with healing this karma',
        ]}
        tables={[
          {
            title: 'Karmic Debt Numbers Summary',
            headers: ['Number', 'Reduces To', 'Core Lesson', 'Past Life Issue'],
            rows: [
              ['13', '4', 'Hard Work', 'Laziness or shortcuts'],
              ['14', '5', 'Moderation', 'Excess or addiction'],
              ['16', '7', 'Humility', 'Ego or vanity'],
              ['19', '1', 'Independence', 'Selfishness or control'],
            ],
          },
        ]}
        relatedItems={[
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
            name: 'Master Numbers',
            href: '/grimoire/numerology/master-numbers',
            type: 'Numerology',
          },
          {
            name: 'Numerology Overview',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
        ]}
        internalLinks={[
          { text: 'Numerology Overview', href: '/grimoire/numerology' },
          { text: 'Life Path Calculator', href: '/grimoire/life-path' },
          { text: 'Birth Chart', href: '/birth-chart' },
          { text: 'Daily Horoscope', href: '/horoscope' },
        ]}
        ctaText='Want to understand your complete karmic picture?'
        ctaHref='/pricing'
        faqs={faqs}
      >
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            The Four Karmic Debt Numbers
          </h2>
          <p className='text-zinc-400 mb-6'>
            Each Karmic Debt Number carries specific lessons from past lives.
            Click on your number to explore its full meaning and how to heal.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {karmicDebtKeys.map((number) => {
              const data =
                karmicDebtNumbers[number as keyof typeof karmicDebtNumbers];
              return (
                <Link
                  key={number}
                  href={`/grimoire/numerology/karmic-debt/${number}`}
                  className='group rounded-xl border border-violet-900/50 bg-violet-950/20 p-6 hover:bg-violet-950/30 hover:border-violet-600 transition-all'
                >
                  <div className='flex items-center justify-between mb-4'>
                    <span className='text-4xl font-light text-violet-400'>
                      {number}
                    </span>
                    <span className='px-3 py-1 text-sm bg-violet-900/50 text-violet-300 rounded-full'>
                      Karmic Debt
                    </span>
                  </div>
                  <h3 className='text-xl font-medium text-zinc-100 group-hover:text-violet-300 transition-colors mb-2'>
                    {data.meaning}
                  </h3>
                  <p className='text-sm text-zinc-400 mb-4'>{data.lesson}</p>
                  <div className='flex flex-wrap gap-1'>
                    {data.keywords.map((kw) => (
                      <span
                        key={kw}
                        className='text-xs px-2 py-0.5 bg-violet-900/30 text-violet-300/70 rounded'
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className='mb-12 bg-violet-950/20 border border-violet-900/50 rounded-xl p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            How to Identify Your Karmic Debt
          </h2>
          <div className='space-y-4 text-zinc-400'>
            <p>
              To find karmic debt, calculate your core numbers and note if they
              pass through 13, 14, 16, or 19 before reducing:
            </p>
            <div className='bg-zinc-900/50 p-4 rounded-lg'>
              <p className='font-medium text-zinc-200 mb-2'>Example:</p>
              <p className='font-mono text-sm'>
                Birth date: April 13, 1985
                <br />
                Life Path: 4 + <span className='text-violet-300'>13</span> + 23
                = 40 → 4<br />
                <span className='text-violet-300'>
                  Karmic Debt 13 present (day 13)
                </span>
              </p>
            </div>
            <div className='bg-zinc-900/50 p-4 rounded-lg'>
              <p className='font-medium text-zinc-200 mb-2'>Another Example:</p>
              <p className='font-mono text-sm'>
                Name calculation: 32 → 5 (no karmic debt)
                <br />
                Name calculation: <span className='text-violet-300'>14</span> →
                5 <span className='text-violet-300'>(Karmic Debt 14)</span>
              </p>
            </div>
          </div>
        </section>

        <section className='mb-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Healing Your Karmic Debt
          </h2>
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <h3 className='font-medium text-zinc-200 mb-3'>Do:</h3>
              <ul className='space-y-2 text-zinc-400'>
                <li className='flex gap-2'>
                  <span className='text-green-400'>✓</span>
                  Accept responsibility for your patterns
                </li>
                <li className='flex gap-2'>
                  <span className='text-green-400'>✓</span>
                  Make conscious, different choices
                </li>
                <li className='flex gap-2'>
                  <span className='text-green-400'>✓</span>
                  Practice self-compassion while changing
                </li>
                <li className='flex gap-2'>
                  <span className='text-green-400'>✓</span>
                  Forgive yourself and others
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-medium text-zinc-200 mb-3'>Avoid:</h3>
              <ul className='space-y-2 text-zinc-400'>
                <li className='flex gap-2'>
                  <span className='text-red-400'>✗</span>
                  Blaming past lives for current problems
                </li>
                <li className='flex gap-2'>
                  <span className='text-red-400'>✗</span>
                  Using karma as an excuse for inaction
                </li>
                <li className='flex gap-2'>
                  <span className='text-red-400'>✗</span>
                  Repeating destructive patterns unconsciously
                </li>
                <li className='flex gap-2'>
                  <span className='text-red-400'>✗</span>
                  Viewing karmic debt as punishment
                </li>
              </ul>
            </div>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
