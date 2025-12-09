import { Metadata } from 'next';
import Link from 'next/link';
import { Layers } from 'lucide-react';

const tarotSpreads = [
  {
    slug: 'celtic-cross',
    name: 'Celtic Cross',
    cards: 10,
    difficulty: 'Intermediate',
    description: 'Classic comprehensive spread for complex questions',
  },
  {
    slug: 'three-card',
    name: 'Three Card Spread',
    cards: 3,
    difficulty: 'Beginner',
    description: 'Past, present, future or situation, action, outcome',
  },
  {
    slug: 'one-card',
    name: 'One Card Draw',
    cards: 1,
    difficulty: 'Beginner',
    description: 'Daily guidance or quick answer',
  },
  {
    slug: 'horseshoe',
    name: 'Horseshoe Spread',
    cards: 7,
    difficulty: 'Intermediate',
    description: 'For gaining perspective on a situation',
  },
  {
    slug: 'relationship',
    name: 'Relationship Spread',
    cards: 6,
    difficulty: 'Intermediate',
    description: 'Understanding dynamics between two people',
  },
  {
    slug: 'career',
    name: 'Career Spread',
    cards: 5,
    difficulty: 'Intermediate',
    description: 'Work and professional guidance',
  },
  {
    slug: 'year-ahead',
    name: 'Year Ahead Spread',
    cards: 12,
    difficulty: 'Advanced',
    description: 'One card for each month of the year',
  },
  {
    slug: 'decision-making',
    name: 'Decision Making Spread',
    cards: 5,
    difficulty: 'Beginner',
    description: 'Weighing options and outcomes',
  },
];

export const metadata: Metadata = {
  title: 'Tarot Spreads: Complete Guide to Layouts | Lunary',
  description:
    'Learn tarot spreads from simple three-card layouts to the Celtic Cross. Find the perfect spread for your question.',
  keywords: [
    'tarot spreads',
    'tarot layouts',
    'celtic cross spread',
    'three card spread',
    'how to read tarot',
  ],
  openGraph: {
    title: 'Tarot Spreads Guide | Lunary',
    description: 'Learn tarot spreads from simple to complex layouts.',
    url: 'https://lunary.app/grimoire/tarot/spreads',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/tarot/spreads',
  },
};

export default function TarotSpreadsIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Layers className='w-16 h-16 text-violet-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Tarot Spreads
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            A tarot spread is the pattern in which cards are laid out. Each
            position in a spread has a specific meaning that adds context to the
            reading.
          </p>
        </div>

        {/* Introduction */}
        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Choosing a Spread
          </h2>
          <p className='text-zinc-400 mb-4'>
            The best spread depends on your question. Simple yes/no questions
            work well with one or three cards, while complex life situations
            benefit from larger spreads like the Celtic Cross.
          </p>
          <p className='text-zinc-400'>
            Start with simpler spreads and work your way up as you develop your
            reading skills.
          </p>
        </div>

        {/* Spreads Grid */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Popular Spreads
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {tarotSpreads.map((spread) => (
              <Link
                key={spread.slug}
                href={`/grimoire/tarot/spreads/${spread.slug}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-violet-700/50 transition-all'
              >
                <div className='flex items-center justify-between mb-2'>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      spread.difficulty === 'Beginner'
                        ? 'bg-emerald-900/50 text-emerald-300'
                        : spread.difficulty === 'Intermediate'
                          ? 'bg-amber-900/50 text-amber-300'
                          : 'bg-violet-900/50 text-violet-300'
                    }`}
                  >
                    {spread.difficulty}
                  </span>
                  <span className='text-xs text-zinc-500'>
                    {spread.cards} cards
                  </span>
                </div>
                <h3 className='text-lg font-medium text-zinc-100 group-hover:text-violet-300 transition-colors mb-2'>
                  {spread.name}
                </h3>
                <p className='text-sm text-zinc-400'>{spread.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Related Links */}
        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Explore More Tarot
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/tarot'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Tarot Cards
            </Link>
            <Link
              href='/grimoire/tarot/the-fool'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Major Arcana
            </Link>
            <Link
              href='/grimoire/tarot-suits/wands'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Minor Arcana
            </Link>
            <Link
              href='/grimoire/reversed-cards-guide'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Reversed Cards
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
