import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { lifePathNumbers } from '@/constants/grimoire/numerology-data';
import { NumerologyProfileCalculator } from '@/components/grimoire/NumerologyProfileCalculator';
import { MasterNumbersCalculatorExtras } from '@/components/grimoire/MasterNumbersCalculatorExtras';

// 30-day ISR revalidation
export const revalidate = 2592000;
const masterNumberKeys = ['11', '22', '33'];

export const metadata: Metadata = {
  title: 'Master Numbers 11, 22, 33: Meanings & Spiritual Power | Lunary',
  description:
    'Complete guide to Master Numbers in numerology. Discover the spiritual power of 11 (The Intuitive), 22 (The Master Builder), and 33 (The Master Teacher).',
  keywords: [
    'master numbers',
    'master number 11',
    'master number 22',
    'master number 33',
    'numerology master numbers',
    '11 meaning',
    '22 meaning',
    '33 meaning',
  ],
  openGraph: {
    title: 'Master Numbers 11, 22, 33 Guide | Lunary',
    description:
      'Discover the spiritual power of Master Numbers 11, 22, and 33.',
    url: 'https://lunary.app/grimoire/numerology/master-numbers',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/numerology',
        width: 1200,
        height: 630,
        alt: 'Master Numbers Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Master Numbers 11, 22, 33 Guide | Lunary',
    description:
      'Discover the spiritual power of Master Numbers in numerology.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/numerology/master-numbers',
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
    question: 'What are Master Numbers in numerology?',
    answer:
      'Master Numbers (11, 22, and 33) are special double-digit numbers that are not reduced to a single digit in numerology because they carry intensified spiritual vibrations. They represent higher octaves of their base numbers (2, 4, and 6) and indicate souls with significant spiritual potential and responsibility.',
  },
  {
    question: 'How do I know if I have a Master Number?',
    answer:
      'Check your Life Path, Expression, or Soul Urge calculations. If the result is 11, 22, or 33 BEFORE any reduction, you have a Master Number. For example, if your Life Path calculation equals 29, it reduces to 11 (2+9), which is kept as a Master Number.',
  },
  {
    question: 'Is having a Master Number good or bad?',
    answer:
      "Master Numbers bring both gifts and challenges. They indicate extraordinary potential for spiritual growth and impact, but also come with heightened sensitivity, intensity, and responsibility. They're neither good nor bad — they're powerful and require conscious work.",
  },
  {
    question: 'Can Master Numbers also be read as their base number?',
    answer:
      "Yes, Master Numbers carry the energy of both the double digit AND their reduced base (11/2, 22/4, 33/6). When you're not living up to your Master Number potential, you may experience life more as the base number. Both influences are always present.",
  },
  {
    question: 'Why are only 11, 22, and 33 Master Numbers?',
    answer:
      "These three numbers are Master Numbers because they're composed of the same digit repeated (1+1, 2+2, 3+3), amplifying that digit's energy. Some numerologists also recognize 44, 55, etc., but 11, 22, and 33 are the traditional and most significant Master Numbers.",
  },
];

export default function MasterNumbersIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Master Numbers | Lunary'
        h1='Master Numbers: 11, 22, and 33 in Numerology'
        description='Master Numbers carry intensified spiritual energy and represent higher octaves of consciousness. They bring both extraordinary potential and significant challenges.'
        keywords={[
          'master numbers',
          'master number 11',
          'master number 22',
          'master number 33',
        ]}
        canonicalUrl='https://lunary.app/grimoire/numerology/master-numbers'
        whatIs={{
          question: 'What are Master Numbers?',
          answer:
            'Master Numbers (11, 22, and 33) are special numbers in numerology that are not reduced to a single digit because they carry intensified spiritual vibrations. They represent higher octaves of their base numbers (2, 4, and 6) and indicate souls who have chosen challenging paths with extraordinary potential for impact and spiritual growth.',
        }}
        tldr='Master Numbers 11, 22, and 33 carry amplified spiritual energy. 11 is the Intuitive Messenger, 22 is the Master Builder, and 33 is the Master Teacher. They bring great gifts but require conscious development.'
        meaning={`Master Numbers are considered the most powerful numbers in numerology. While most calculations reduce to single digits 1-9, the numbers 11, 22, and 33 are kept whole because they carry special significance.

**Why These Three Numbers?**

Master Numbers are created when the same digit is repeated:
- 1 + 1 = 11 (double 1 energy, reduced base 2)
- 2 + 2 = 22 (double 2 energy, reduced base 4)
- 3 + 3 = 33 (double 3 energy, reduced base 6)

This repetition amplifies the single digit's energy to a higher octave.

**The Three Master Numbers:**

**11 - The Intuitive Messenger**
The most intuitive of all numbers. Carries heightened spiritual awareness, psychic abilities, and the potential to inspire others. Often found in spiritual teachers, healers, and visionaries. Challenges: anxiety, self-doubt, nervous tension.

**22 - The Master Builder**
The most powerful number for manifestation. Can turn dreams into reality on a grand scale. Found in world leaders, great architects, and visionary entrepreneurs. Challenges: overwhelm, perfectionism, inability to delegate.

**33 - The Master Teacher**
The rarest and most spiritually evolved. Embodies unconditional love and serves as a beacon for humanity. Found in great healers, teachers, and compassionate leaders. Challenges: extreme self-sacrifice, boundary issues, martyrdom.

**Living as a Master Number:**

People with Master Numbers often feel "different" from an early age. They may struggle to fit in, feel an inexplicable calling, or experience life with unusual intensity. The key is learning to channel this energy constructively while staying grounded.`}
        howToWorkWith={[
          'Ground yourself daily through meditation, nature, or physical activity',
          'Accept that your path involves greater challenges AND greater rewards',
          'Develop your intuition and spiritual practices consciously',
          'Use your gifts in service to others, not just personal gain',
          'Be patient — mastering this energy takes a lifetime',
          'Connect with others who understand Master Number experiences',
        ]}
        tables={[
          {
            title: 'Master Numbers Overview',
            headers: ['Number', 'Title', 'Base', 'Key Gifts', 'Key Challenges'],
            rows: [
              [
                '11',
                'The Intuitive',
                '2',
                'Intuition, inspiration',
                'Anxiety, self-doubt',
              ],
              [
                '22',
                'The Master Builder',
                '4',
                'Manifestation, vision',
                'Overwhelm, perfectionism',
              ],
              [
                '33',
                'The Master Teacher',
                '6',
                'Unconditional love, healing',
                'Self-sacrifice, boundaries',
              ],
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
            name: 'Karmic Debt Numbers',
            href: '/grimoire/numerology/karmic-debt',
            type: 'Numerology',
          },
          {
            name: 'Core Numbers',
            href: '/grimoire/numerology/core-numbers',
            type: 'Numerology',
          },
        ]}
        childrenPosition='before-faqs'
        internalLinks={[
          { text: 'Numerology Overview', href: '/grimoire/numerology' },
          { text: 'Life Path Calculator', href: '/grimoire/life-path' },
          { text: 'Birth Chart', href: '/birth-chart' },
          { text: 'Daily Horoscope', href: '/horoscope' },
        ]}
        ctaText='Want to understand your complete numerology chart?'
        ctaHref='/pricing'
        faqs={faqs}
      >
        <section className='mb-12'>
          <NumerologyProfileCalculator>
            <MasterNumbersCalculatorExtras />
          </NumerologyProfileCalculator>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            The Three Master Numbers
          </h2>
          <p className='text-zinc-400 mb-6'>
            Each Master Number represents a different form of spiritual mastery.
            Click on your number to explore its full meaning and guidance.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {masterNumberKeys.map((number) => {
              const data =
                lifePathNumbers[number as keyof typeof lifePathNumbers];
              const baseNumber =
                number === '11' ? '2' : number === '22' ? '4' : '6';
              return (
                <Link
                  key={number}
                  href={`/grimoire/numerology/master-numbers/${number}`}
                  className='group rounded-xl border border-amber-900/50 bg-amber-950/20 p-6 hover:bg-amber-950/30 hover:border-amber-600 transition-all'
                >
                  <div className='flex items-center justify-between mb-4'>
                    <span className='text-4xl font-light text-amber-400'>
                      {number}
                    </span>
                    <span className='px-3 py-1 text-xs bg-amber-900/50 text-amber-300 rounded-full'>
                      Base: {baseNumber}
                    </span>
                  </div>
                  <h3 className='text-xl font-medium text-zinc-100 group-hover:text-amber-300 transition-colors mb-2'>
                    {data?.meaning || 'Master ' + number}
                  </h3>
                  <p className='text-sm text-zinc-400 mb-4'>
                    {data?.description
                      ? data.description.slice(0, 150) + '...'
                      : ''}
                  </p>
                  {data?.keywords && (
                    <div className='flex flex-wrap gap-1'>
                      {data.keywords.slice(0, 3).map((kw) => (
                        <span
                          key={kw}
                          className='text-xs px-2 py-0.5 bg-amber-900/30 text-amber-300/70 rounded'
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

        <section className='mb-12 bg-amber-950/20 border border-amber-900/50 rounded-xl p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Signs You Might Have a Master Number
          </h2>
          <ul className='space-y-3 text-zinc-400'>
            <li className='flex gap-3'>
              <span className='text-amber-400'>•</span>
              <span>You've always felt "different" or out of place</span>
            </li>
            <li className='flex gap-3'>
              <span className='text-amber-400'>•</span>
              <span>You experience life with unusual intensity</span>
            </li>
            <li className='flex gap-3'>
              <span className='text-amber-400'>•</span>
              <span>You feel called to make a significant impact</span>
            </li>
            <li className='flex gap-3'>
              <span className='text-amber-400'>•</span>
              <span>You have strong intuition or psychic abilities</span>
            </li>
            <li className='flex gap-3'>
              <span className='text-amber-400'>•</span>
              <span>You've faced significant challenges and growth</span>
            </li>
            <li className='flex gap-3'>
              <span className='text-amber-400'>•</span>
              <span>People often come to you for guidance</span>
            </li>
          </ul>
        </section>

        <section className='mb-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Working with Master Number Energy
          </h2>
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <h3 className='font-medium text-zinc-200 mb-3'>
                Essential Practices:
              </h3>
              <ul className='space-y-2 text-zinc-400'>
                <li className='flex gap-2'>
                  <span className='text-amber-400'>•</span>
                  Daily grounding and meditation
                </li>
                <li className='flex gap-2'>
                  <span className='text-amber-400'>•</span>
                  Regular time in nature
                </li>
                <li className='flex gap-2'>
                  <span className='text-amber-400'>•</span>
                  Creative expression outlets
                </li>
                <li className='flex gap-2'>
                  <span className='text-amber-400'>•</span>
                  Service to others
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-medium text-zinc-200 mb-3'>
                Common Pitfalls:
              </h3>
              <ul className='space-y-2 text-zinc-400'>
                <li className='flex gap-2'>
                  <span className='text-red-400'>•</span>
                  Ignoring your spiritual calling
                </li>
                <li className='flex gap-2'>
                  <span className='text-red-400'>•</span>
                  Escaping through substances
                </li>
                <li className='flex gap-2'>
                  <span className='text-red-400'>•</span>
                  Using gifts for ego/gain only
                </li>
                <li className='flex gap-2'>
                  <span className='text-red-400'>•</span>
                  Becoming overwhelmed and shutting down
                </li>
              </ul>
            </div>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
