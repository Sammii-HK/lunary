import { Metadata } from 'next';
import Link from 'next/link';
import { Layers, Clock, Star, Lock } from 'lucide-react';
import { TAROT_SPREADS } from '@/constants/tarotSpreads';

export const metadata: Metadata = {
  title: 'Tarot Spreads: Reading Layouts & Techniques | Lunary',
  description:
    'Learn different tarot spreads for readings. From simple 3-card pulls to the Celtic Cross, find the perfect layout for your question.',
  keywords: [
    'tarot spreads',
    'tarot layouts',
    'celtic cross',
    'three card spread',
    'tarot reading',
    'how to read tarot',
  ],
  openGraph: {
    title: 'Tarot Spreads Guide | Lunary',
    description:
      'Learn different tarot spreads and reading layouts for every situation.',
    url: 'https://lunary.app/grimoire/tarot-spreads',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/tarot-spreads',
  },
};

const categoryColors: Record<string, string> = {
  'Quick Insight': 'text-emerald-400 bg-emerald-900/20',
  'Deep Dive': 'text-violet-400 bg-violet-900/20',
  'Growth & Career': 'text-amber-400 bg-amber-900/20',
  Relationships: 'text-rose-400 bg-rose-900/20',
  'Lunar Ritual': 'text-blue-400 bg-blue-900/20',
};

export default function TarotSpreadsIndexPage() {
  const categories = [...new Set(TAROT_SPREADS.map((s) => s.category))];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Layers className='w-16 h-16 text-violet-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Tarot Spreads
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Choose the right spread for your question. From quick daily pulls to
            in-depth yearly readings, each layout serves a different purpose.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Choosing a Spread
          </h2>
          <p className='text-zinc-400'>
            The number of cards and their positions shape the reading. Simpler
            spreads work well for daily guidance, while complex layouts reveal
            deeper patterns. Match your spread to your question&apos;s depth.
          </p>
        </div>

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
                    href={`/grimoire/tarot-spreads/${spread.slug}`}
                    className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-violet-700/50 transition-all'
                  >
                    <div className='flex items-center justify-between mb-3'>
                      <h3 className='font-medium text-zinc-100 group-hover:text-violet-300 transition-colors'>
                        {spread.name}
                      </h3>
                      {spread.minimumPlan !== 'free' && (
                        <Lock className='w-4 h-4 text-zinc-500' />
                      )}
                    </div>
                    <p className='text-sm text-zinc-400 mb-3 line-clamp-2'>
                      {spread.description}
                    </p>
                    <div className='flex items-center gap-4 text-xs text-zinc-500'>
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

        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Related Resources
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/tarot'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              All Tarot Cards
            </Link>
            <Link
              href='/grimoire/tarot-suits'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Tarot Suits
            </Link>
            <Link
              href='/grimoire/reversed-cards-guide'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Reversed Cards
            </Link>
            <Link
              href='/tarot'
              className='px-4 py-2 rounded-lg bg-violet-900/30 text-violet-300 hover:bg-violet-900/50 transition-colors'
            >
              Get a Reading
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
