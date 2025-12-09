import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { correspondencesData } from '@/constants/grimoire/correspondences';

export const metadata: Metadata = {
  title: 'Number Correspondences: Magical Number Meanings 1-9 | Lunary',
  description:
    'Complete guide to magical number correspondences. Learn how numbers 1-9 connect to planets, elements, and magical timing in spellwork.',
  keywords: [
    'number correspondences',
    'number magic',
    'numerology correspondences',
    'magical numbers',
    'number meanings',
    'spell timing',
  ],
  openGraph: {
    title: 'Number Correspondences Guide | Lunary',
    description:
      'Complete guide to magical number correspondences and meanings.',
    url: 'https://lunary.app/grimoire/correspondences/numbers',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/correspondences',
        width: 1200,
        height: 630,
        alt: 'Number Correspondences Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Number Correspondences Guide | Lunary',
    description: 'Complete guide to magical numbers and their correspondences.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/correspondences/numbers',
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
    question: 'How do I use numbers in magic?',
    answer:
      'Numbers can be used to determine how many times to repeat an incantation, how many candles to use, what day of the month to perform a spell, or how many ingredients to include. Each number adds its specific energy to your magical work.',
  },
  {
    question: 'What number is best for love spells?',
    answer:
      'Two is best for partnership and romantic love (duality, union), while six governs harmony, family, and domestic love. Venus-associated numbers enhance all love magic. Using 2 or 6 candles or repeating your intention that many times adds power.',
  },
  {
    question: 'Which number is most powerful in magic?',
    answer:
      'Each number has power for different purposes. Seven is often considered most magical (sacred across traditions), nine represents completion and mastery, and one holds the power of focused will. Choose based on your intention.',
  },
  {
    question: 'How do numbers connect to planets?',
    answer:
      '1=Sun, 2=Moon, 3=Jupiter, 4=Uranus, 5=Mercury, 6=Venus, 7=Neptune, 8=Saturn, 9=Mars. Working on the corresponding planetary day and using that number of items creates alignment.',
  },
  {
    question: 'Should I use birth date numbers in spells?',
    answer:
      'Yes, incorporating your Life Path Number or Personal Day Number can personalize magic. Numbers from your birth chart carry your unique vibration and can strengthen spells when included thoughtfully.',
  },
];

export default function NumbersIndexPage() {
  const numbers = Object.entries(correspondencesData.numbers);

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Number Correspondences | Lunary'
        h1='Number Correspondences: Magical Number Guide'
        description='Numbers carry magical significance. Each has unique vibrations and correspondences useful in timing, repetition, and symbolism.'
        keywords={[
          'number correspondences',
          'number magic',
          'magical numbers',
          'numerology',
        ]}
        canonicalUrl='https://lunary.app/grimoire/correspondences/numbers'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Correspondences', href: '/grimoire/correspondences' },
          { label: 'Numbers', href: '/grimoire/correspondences/numbers' },
        ]}
        whatIs={{
          question: 'What are Number Correspondences?',
          answer:
            'Number correspondences are the magical associations of the digits 1-9, connecting each number to specific planets, elements, colors, and magical purposes. Understanding these correspondences allows practitioners to add numerical power to their spellwork through repetition, timing, and quantity.',
        }}
        tldr='1=beginnings (Sun), 2=partnership (Moon), 3=expansion (Jupiter), 4=foundation (Uranus), 5=change (Mercury), 6=harmony (Venus), 7=mystery (Neptune), 8=power (Saturn), 9=completion (Mars).'
        meaning={`Numbers have been considered magical since ancient times. Pythagoras believed numbers were the fundamental building blocks of reality. In magical practice, understanding number correspondences helps you align your work with cosmic forces.

**Using Numbers in Magic:**

Numbers can be incorporated into spellwork in many ways:

1. **Repetition**: Chant or write intentions a specific number of times
2. **Quantity**: Use that many candles, crystals, or ingredients
3. **Timing**: Work on the day of the month matching your intention
4. **Duration**: Perform rituals for that many minutes or days
5. **Groups**: Create groupings of items in meaningful numbers

**The Nine Core Numbers:**

**1 (Sun)**: New beginnings, independence, leadership, will
**2 (Moon)**: Partnership, balance, intuition, receptivity
**3 (Jupiter)**: Expansion, creativity, expression, abundance
**4 (Uranus)**: Foundation, stability, structure, practicality
**5 (Mercury)**: Change, communication, freedom, adventure
**6 (Venus)**: Harmony, love, beauty, domestic matters
**7 (Neptune)**: Mystery, spirituality, wisdom, introspection
**8 (Saturn)**: Power, manifestation, karma, material success
**9 (Mars)**: Completion, courage, endings, universal wisdom

**Compound Numbers:**

Numbers above 9 carry the energy of their reduced digit. 13 (1+3=4) has 4 energy with intensified transformation. 22 and 33 are Master Numbers with amplified power.`}
        howToWorkWith={[
          'Identify the number that corresponds to your magical intention',
          'Use that number of candles, herbs, or other ingredients',
          'Repeat your incantation or intention that many times',
          'Consider timing on the matching day of the month',
          'Combine with planetary days for additional power',
        ]}
        tables={[
          {
            title: 'Number-Planet Correspondences',
            headers: ['Number', 'Planet', 'Energy', 'Best For'],
            rows: [
              ['1', 'Sun', 'Masculine, Active', 'New beginnings, success'],
              ['2', 'Moon', 'Feminine, Receptive', 'Relationships, intuition'],
              ['3', 'Jupiter', 'Expansive', 'Growth, creativity'],
              ['4', 'Uranus', 'Stable', 'Foundation, structure'],
              ['5', 'Mercury', 'Changeable', 'Communication, travel'],
              ['6', 'Venus', 'Harmonious', 'Love, beauty, home'],
              ['7', 'Neptune', 'Mystical', 'Spirituality, wisdom'],
              ['8', 'Saturn', 'Powerful', 'Material success, karma'],
              ['9', 'Mars', 'Completing', 'Endings, courage'],
            ],
          },
        ]}
        relatedItems={[
          {
            name: 'Numerology',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
          {
            name: 'Angel Numbers',
            href: '/grimoire/angel-numbers',
            type: 'Numerology',
          },
          {
            name: 'Life Path Numbers',
            href: '/grimoire/life-path',
            type: 'Numerology',
          },
          {
            name: 'Days of the Week',
            href: '/grimoire/correspondences/days',
            type: 'Correspondences',
          },
          {
            name: 'All Correspondences',
            href: '/grimoire/correspondences',
            type: 'Guide',
          },
        ]}
        internalLinks={[
          {
            text: 'Correspondences Overview',
            href: '/grimoire/correspondences',
          },
          { text: 'Numerology Guide', href: '/grimoire/numerology' },
          { text: 'Angel Numbers', href: '/grimoire/angel-numbers' },
          { text: 'Planets', href: '/grimoire/planets' },
        ]}
        ctaText='Want personalized number insights based on your birth chart?'
        ctaHref='/pricing'
        faqs={faqs}
      >
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            All Magical Numbers
          </h2>
          <p className='text-zinc-400 mb-6'>
            Click on any number to explore its full correspondences, magical
            uses, and practical applications.
          </p>
          <div className='grid grid-cols-3 gap-4'>
            {numbers.map(([num, data]) => (
              <Link
                key={num}
                href={`/grimoire/correspondences/numbers/${num}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all text-center'
              >
                <div className='text-4xl font-light text-lunary-primary-400 mb-3'>
                  {num}
                </div>
                <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors mb-2'>
                  {data.correspondences[0]}
                </h3>
                <p className='text-xs text-zinc-500'>
                  {data.planets.join(', ')}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
