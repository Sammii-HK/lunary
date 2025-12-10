import { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Star, Lock } from 'lucide-react';
import { TAROT_SPREADS } from '@/constants/tarotSpreads';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';
import { stringToKebabCase } from '../../../../../utils/string';

export const metadata: Metadata = {
  title: 'Tarot Spreads: 3 Card, Celtic Cross & Year Ahead Layouts | Lunary',
  description:
    'Master tarot spreads from simple 3-card pulls to the Celtic Cross. Learn which spread to use for love, career, and spiritual questions. Free tarot spread guide.',
  keywords: [
    'tarot spreads',
    'tarot layouts',
    'celtic cross spread',
    'three card spread',
    'tarot reading layouts',
    'how to read tarot',
    'tarot spread meanings',
    'best tarot spreads',
  ],
  openGraph: {
    title: 'Tarot Spreads: 3 Card, Celtic Cross & Year Ahead Layouts | Lunary',
    description:
      'Master tarot spreads from simple 3-card pulls to the Celtic Cross. Learn which spread to use for every question.',
    url: 'https://lunary.app/grimoire/tarot/spreads',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/tarot',
        width: 1200,
        height: 630,
        alt: 'Tarot Spreads Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarot Spreads Guide | Lunary',
    description: 'Master every tarot spread from beginner to advanced.',
    images: ['/api/og/tarot'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/tarot/spreads',
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
    question: 'What is the best tarot spread for beginners?',
    answer:
      "The 3-card spread (Past, Present, Future) is perfect for beginners. It's simple enough to learn card meanings while still providing meaningful insights. Once comfortable, try the 5-card spread or Celtic Cross.",
  },
  {
    question: 'How do I choose the right tarot spread?',
    answer:
      "Match your spread to your question's complexity. Simple yes/no questions work with 1-3 cards. Relationship or career questions benefit from 5-7 cards. Life overviews need 10+ cards like the Celtic Cross.",
  },
  {
    question: 'What is the Celtic Cross spread?',
    answer:
      "The Celtic Cross is a 10-card spread and one of the most popular layouts. It covers your current situation, challenges, past influences, future possibilities, hopes, fears, and likely outcomes. It's ideal for complex life questions.",
  },
  {
    question: 'Can I create my own tarot spread?',
    answer:
      'Absolutely! Many experienced readers create custom spreads for specific questions. Start with a clear intention, decide how many cards you need, and assign each position a meaning. Document what works for you.',
  },
  {
    question: 'How many cards should a tarot reading have?',
    answer:
      "There's no fixed rule. Daily guidance needs 1-3 cards. Specific questions work well with 3-5 cards. Complex situations benefit from 7-10+ cards. More cards isn't always better—choose based on depth needed.",
  },
];

export default function TarotSpreadsIndexPage() {
  const categories = [...new Set(TAROT_SPREADS.map((s) => s.category))];

  const spreadsListSchema = createItemListSchema({
    name: 'Tarot Spreads',
    description:
      'Complete guide to tarot spreads and reading layouts for every situation.',
    url: 'https://lunary.app/grimoire/tarot/spreads',
    items: TAROT_SPREADS.map((spread) => ({
      name: spread.name,
      url: `https://lunary.app/grimoire/tarot/spreads/${stringToKebabCase(spread.slug)}`,
      description: spread.description,
    })),
  });

  return (
    <>
      {renderJsonLd(spreadsListSchema)}
      <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
        <SEOContentTemplate
          title='Tarot Spreads | Lunary'
          h1='Tarot Spreads: Complete Reading Guide'
          description='Choose the right spread for your question. From quick daily pulls to in-depth yearly readings, each layout serves a different purpose.'
          keywords={[
            'tarot spreads',
            'tarot layouts',
            'celtic cross',
            'three card spread',
          ]}
          canonicalUrl='https://lunary.app/grimoire/tarot/spreads'
          breadcrumbs={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Tarot', href: '/grimoire/tarot' },
            { label: 'Spreads', href: '/grimoire/tarot/spreads' },
          ]}
          whatIs={{
            question: 'What is a tarot spread?',
            answer:
              'A tarot spread is a specific pattern or layout in which cards are dealt during a reading. Each position in the spread has a designated meaning (like "past," "present," or "outcome"), giving context to the card that lands there. Spreads range from single-card draws to complex 10+ card layouts like the Celtic Cross.',
          }}
          tldr='Start with 3-card spreads for daily guidance. Use 5-7 cards for specific questions. Master the Celtic Cross (10 cards) for deep life readings. Match spread complexity to question depth.'
          meaning={`Tarot spreads transform a random card draw into a structured reading with clear meaning. The spread you choose shapes the entire reading experience.

**Spread Categories:**

**Quick Insight (1-3 cards):** Perfect for daily guidance, yes/no questions, or quick check-ins. Great for beginners and busy practitioners.

**Deep Dive (5-10 cards):** Explores situations in detail. Reveals hidden influences, obstacles, and potential outcomes.

**Relationships (5-7 cards):** Examines dynamics between people. Shows each person's perspective, challenges, and relationship potential.

**Career & Growth (5-7 cards):** Focuses on professional path, obstacles, and opportunities. Helps with decisions and timing.

**Lunar Rituals (varies):** Designed for New Moon intentions and Full Moon releases. Aligns your practice with lunar energy.

**How to Use Spreads:**

1. Choose a spread matching your question's complexity
2. Shuffle while focusing on your question
3. Lay cards in the designated positions
4. Read each card in context of its position
5. Look for patterns and connections between cards
6. Trust your intuition alongside traditional meanings`}
          howToWorkWith={[
            'Match spread size to question complexity',
            'Learn position meanings before laying cards',
            'Focus your question while shuffling',
            'Read cards in context of their positions',
            'Look for patterns between cards',
            'Journal your readings for pattern recognition',
          ]}
          tables={[
            {
              title: 'Spread Selection Guide',
              headers: ['Question Type', 'Recommended Spread', 'Cards'],
              rows: [
                ['Daily guidance', 'One Card Draw', '1'],
                ['Quick insight', 'Three Card Spread', '3'],
                ['Yes/No questions', 'Three Card or Pendulum', '1-3'],
                ['Relationship dynamics', 'Relationship Spread', '5-7'],
                ['Career decisions', 'Career Path Spread', '5-6'],
                ['Life overview', 'Celtic Cross', '10'],
                ['New Moon intentions', 'New Moon Spread', '5-7'],
                ['Year ahead', 'Year Ahead Spread', '12-13'],
              ],
            },
          ]}
          relatedItems={[
            { name: 'All Tarot Cards', href: '/grimoire/tarot', type: 'Guide' },
            {
              name: 'Major Arcana',
              href: '/grimoire/tarot/the-fool',
              type: 'Cards',
            },
            {
              name: 'Tarot Suits',
              href: '/grimoire/tarot/suits',
              type: 'Guide',
            },
            {
              name: 'Reversed Cards',
              href: '/grimoire/reversed-cards-guide',
              type: 'Guide',
            },
          ]}
          internalLinks={[
            { text: 'All Tarot Cards', href: '/grimoire/tarot' },
            { text: 'Get a Reading', href: '/tarot' },
            { text: 'Tarot Suits Guide', href: '/grimoire/tarot/suits' },
            { text: 'Grimoire Home', href: '/grimoire' },
          ]}
          ctaText='Ready to try a spread? Get your reading now'
          ctaHref='/tarot'
          faqs={faqs}
        >
          {categories.map((category) => (
            <section key={category} className='mb-12'>
              <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
                {category}
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {TAROT_SPREADS.filter((s) => s.category === category).map(
                  (spread) => (
                    <Link
                      key={spread.slug}
                      href={`/grimoire/tarot/spreads/${stringToKebabCase(spread.slug)}`}
                      className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-violet-700/50 transition-all'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <h3 className='font-medium text-zinc-100 group-hover:text-violet-300 transition-colors'>
                          {spread.name}
                        </h3>
                        {spread.minimumPlan !== 'free' && (
                          <Lock className='w-4 h-4 text-zinc-400' />
                        )}
                      </div>
                      <p className='text-sm text-zinc-400 mb-3 line-clamp-2'>
                        {spread.description}
                      </p>
                      <div className='flex items-center gap-4 text-xs text-zinc-400'>
                        <span className='flex items-center gap-1'>
                          <Star className='w-3 h-3' />
                          {spread.cardCount} cards
                        </span>
                        <span className='flex items-center gap-1'>
                          <Clock className='w-3 h-3' />
                          {spread.estimatedTime}
                        </span>
                      </div>
                    </Link>
                  ),
                )}
              </div>
            </section>
          ))}
        </SEOContentTemplate>
      </div>
    </>
  );
}
