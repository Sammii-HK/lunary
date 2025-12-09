import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../utils/string';

export const metadata: Metadata = {
  title: 'Days of the Week Correspondences: Planetary Magic | Lunary',
  description:
    'Complete guide to magical correspondences for each day. Learn planetary rulers, best magic for Monday through Sunday, and timing your spells.',
  keywords: [
    'day correspondences',
    'planetary days',
    'monday magic',
    'friday magic',
    'weekly correspondences',
    'timing magic',
    'planetary hours',
  ],
  openGraph: {
    title: 'Days of the Week Correspondences | Lunary',
    description:
      'Learn the magical correspondences and planetary rulers for each day.',
    url: 'https://lunary.app/grimoire/correspondences/days',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/correspondences',
        width: 1200,
        height: 630,
        alt: 'Days of the Week Correspondences',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Days of the Week Correspondences | Lunary',
    description: 'Planetary magic timing for each day of the week.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/correspondences/days',
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
    question: 'Why are days named after planets?',
    answer:
      'The seven-day week originates from ancient Babylonian astronomy, which recognized seven celestial bodies visible to the naked eye (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn). Romans adopted this system, naming days after their corresponding deities, which evolved into our modern names.',
  },
  {
    question: 'What is the best day for love spells?',
    answer:
      'Friday, ruled by Venus, is the best day for love magic, romance, relationships, beauty, and self-care. Venus governs love in all forms — romantic, self-love, and friendship. Pink and green candles enhance Friday spells.',
  },
  {
    question: 'When should I do money magic?',
    answer:
      'Thursday (Jupiter) is best for abundance, expansion, and large financial goals. Sunday (Sun) works for success and prosperity. Saturday (Saturn) helps with long-term financial planning and debt reduction.',
  },
  {
    question: 'What are planetary hours?',
    answer:
      'Planetary hours divide each day into segments ruled by different planets. The day begins at sunrise with the ruling planet of that day. Combining the right day AND planetary hour creates the strongest magical timing.',
  },
  {
    question: 'Can I do magic on any day?',
    answer:
      'Yes, any magic can be done any day. However, timing your work to match the planetary ruler of the day adds extra power and alignment. If you cannot wait for the ideal day, work during the corresponding planetary hour instead.',
  },
];

export default function DaysIndexPage() {
  const days = Object.entries(correspondencesData.days);

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Days of the Week | Lunary'
        h1='Days of the Week: Planetary Correspondences'
        description='Each day is ruled by a planet, carrying unique energy perfect for specific types of magical work.'
        keywords={[
          'day correspondences',
          'planetary days',
          'timing magic',
          'weekly magic',
        ]}
        canonicalUrl='https://lunary.app/grimoire/correspondences/days'
        whatIs={{
          question: 'What are Day Correspondences?',
          answer:
            'Day correspondences connect each day of the week to its ruling planet and associated magical properties. This ancient system, dating back to Babylonian times, helps practitioners time their magic for maximum effectiveness. Each day carries the energy of its planetary ruler, making certain types of spellwork more powerful on specific days.',
        }}
        tldr='Sunday (Sun): success. Monday (Moon): intuition. Tuesday (Mars): courage. Wednesday (Mercury): communication. Thursday (Jupiter): abundance. Friday (Venus): love. Saturday (Saturn): protection and banishing.'
        meaning={`The seven-day week is a powerful magical framework that has been used for thousands of years. Understanding day correspondences allows you to align your magical work with planetary energies.

**The Seven Planetary Days:**

**Sunday (Sun)** ☉
Success, vitality, career, leadership, healing, confidence. Use gold/yellow candles.

**Monday (Moon)** ☽
Intuition, emotions, dreams, psychic work, fertility, home. Use silver/white candles.

**Tuesday (Mars)** ♂
Courage, strength, protection, competition, conflict resolution. Use red candles.

**Wednesday (Mercury)** ☿
Communication, travel, study, business, divination. Use orange/purple candles.

**Thursday (Jupiter)** ♃
Abundance, expansion, luck, legal matters, growth. Use blue/purple candles.

**Friday (Venus)** ♀
Love, beauty, friendship, pleasure, art, self-care. Use green/pink candles.

**Saturday (Saturn)** ♄
Banishing, protection, boundaries, endings, long-term goals. Use black candles.

**Using Day Correspondences:**

1. Identify your magical intention
2. Match it to the appropriate day
3. Plan your spellwork for that day
4. Enhance with matching colors, herbs, and crystals
5. Consider planetary hours for extra precision`}
        howToWorkWith={[
          'Identify which day best matches your magical intention',
          'Plan important spells or rituals for the corresponding day',
          'Use the planetary colors, herbs, and symbols',
          'Combine with planetary hours for maximum power',
          'Regular practice on the same day builds momentum',
        ]}
        tables={[
          {
            title: 'Weekly Magical Timing',
            headers: ['Day', 'Planet', 'Best Magic', 'Colors'],
            rows: [
              ['Sunday', 'Sun', 'Success, healing', 'Gold, Yellow'],
              ['Monday', 'Moon', 'Intuition, dreams', 'Silver, White'],
              ['Tuesday', 'Mars', 'Courage, protection', 'Red'],
              ['Wednesday', 'Mercury', 'Communication', 'Orange, Purple'],
              ['Thursday', 'Jupiter', 'Abundance, luck', 'Blue, Purple'],
              ['Friday', 'Venus', 'Love, beauty', 'Green, Pink'],
              ['Saturday', 'Saturn', 'Banishing, endings', 'Black'],
            ],
          },
        ]}
        relatedItems={[
          {
            name: 'Planets',
            href: '/grimoire/planets',
            type: 'Astrology',
          },
          {
            name: 'Planetary Days (Numerology)',
            href: '/grimoire/numerology/planetary-days',
            type: 'Numerology',
          },
          {
            name: 'Colors',
            href: '/grimoire/correspondences/colors',
            type: 'Correspondences',
          },
          {
            name: 'Moon Phases',
            href: '/grimoire/moon-phases',
            type: 'Guide',
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
          { text: 'Planets', href: '/grimoire/planets' },
          { text: 'Moon Phases', href: '/grimoire/moon-phases' },
          { text: 'Candle Magic', href: '/grimoire/candle-magic' },
        ]}
        ctaText='Want personalized timing for your magic based on your birth chart?'
        ctaHref='/pricing'
        faqs={faqs}
      >
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            All Days of the Week
          </h2>
          <p className='text-zinc-400 mb-6'>
            Click on any day to explore its full correspondences, magical uses,
            and practical applications.
          </p>
          <div className='space-y-3'>
            {days.map(([name, data]) => (
              <Link
                key={name}
                href={`/grimoire/correspondences/days/${stringToKebabCase(name)}`}
                className='group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-zinc-600 transition-all'
              >
                <div>
                  <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                    {name}
                  </h3>
                  <p className='text-sm text-zinc-500'>
                    {data.correspondences.slice(0, 3).join(' • ')}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-sm text-lunary-primary-400'>
                    {data.planet}
                  </p>
                  <p className='text-xs text-zinc-500'>{data.element}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
