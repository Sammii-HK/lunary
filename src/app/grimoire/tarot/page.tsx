import { Metadata } from 'next';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import { tarotCards } from '../../../../utils/tarot/tarot-cards';
import { tarotSuits } from '@/constants/tarot';
import { stringToKebabCase } from '../../../../utils/string';

export const metadata: Metadata = {
  title: 'Tarot Cards: Complete Guide to All 78 Cards | Lunary',
  description:
    'Explore all 78 tarot cards with detailed meanings. Learn the Major Arcana, Minor Arcana, and how to read tarot cards for guidance and insight.',
  keywords: [
    'tarot cards',
    'tarot meanings',
    'major arcana',
    'minor arcana',
    'tarot reading',
    'tarot guide',
    'learn tarot',
  ],
  openGraph: {
    title: 'Tarot Cards Guide | Lunary',
    description:
      'Explore all 78 tarot cards with detailed meanings and interpretations.',
    url: 'https://lunary.app/grimoire/tarot',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/tarot',
  },
};

export default function TarotIndexPage() {
  const majorArcanaCards = Object.values(tarotCards.majorArcana);

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Layers className='w-16 h-16 text-violet-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Tarot Cards
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Explore all 78 tarot cards — 22 Major Arcana representing life's
            spiritual lessons, and 56 Minor Arcana reflecting daily experiences.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Understanding the Tarot
          </h2>
          <p className='text-zinc-400 mb-4'>
            The tarot deck is divided into two main sections: the Major Arcana
            (22 cards) and the Minor Arcana (56 cards). The Major Arcana
            represents significant life events and spiritual lessons, while the
            Minor Arcana covers day-to-day experiences across four suits.
          </p>
          <p className='text-zinc-400'>
            Each card carries unique symbolism, meanings, and guidance. Whether
            you&apos;re a beginner or experienced reader, understanding each
            card deepens your connection to this powerful divination tool.
          </p>
        </div>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Major Arcana (22 Cards)
          </h2>
          <p className='text-zinc-400 mb-6'>
            The Major Arcana cards represent significant life events, karmic
            lessons, and the soul&apos;s journey through life.
          </p>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
            {majorArcanaCards.map((card, index) => (
              <Link
                key={card.name}
                href={`/grimoire/tarot/${stringToKebabCase(card.name)}`}
                className='group rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-violet-700/50 transition-all'
              >
                <div className='text-xs text-zinc-500 mb-1'>{index}</div>
                <h3 className='font-medium text-zinc-100 group-hover:text-violet-300 transition-colors text-sm'>
                  {card.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Minor Arcana (56 Cards)
          </h2>
          <p className='text-zinc-400 mb-6'>
            The Minor Arcana is divided into four suits, each associated with an
            element and aspect of life.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {Object.entries(tarotSuits).map(([key, suit]) => (
              <Link
                key={key}
                href={`/grimoire/tarot-suits/${key}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-violet-700/50 transition-all'
              >
                <h3 className='text-lg font-medium text-zinc-100 group-hover:text-violet-300 transition-colors mb-2'>
                  {suit.name}
                </h3>
                <p className='text-sm text-zinc-500 mb-2'>
                  Element: {suit.element}
                </p>
                <p className='text-sm text-zinc-400'>{suit.qualities}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Tarot Spreads
          </h2>
          <p className='text-zinc-400 mb-4'>
            Learn different card layouts for readings, from simple 3-card
            spreads to the comprehensive Celtic Cross.
          </p>
          <Link
            href='/grimoire/tarot/spreads'
            className='inline-block px-4 py-2 rounded-lg bg-violet-900/30 text-violet-300 hover:bg-violet-900/50 transition-colors'
          >
            Explore Tarot Spreads →
          </Link>
        </section>

        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Related Resources
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/tarot/spreads'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Tarot Spreads
            </Link>
            <Link
              href='/grimoire/reversed-cards-guide'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Reversed Cards
            </Link>
            <Link
              href='/grimoire/card-combinations'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Card Combinations
            </Link>
            <Link
              href='/grimoire/runes'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Runes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
