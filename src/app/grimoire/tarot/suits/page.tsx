import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { Layers } from 'lucide-react';
import { tarotSuits } from '@/constants/tarot';

import { createBreadcrumbSchema, renderJsonLd } from '@/lib/schema';
export const metadata: Metadata = {
  title: 'Tarot Suits: Wands, Cups, Swords & Pentacles Meanings | Lunary',
  description:
    'Explore the four suits of the Minor Arcana: Wands, Cups, Swords, and Pentacles. Learn their elements, meanings, and how they reflect daily life experiences.',
  keywords: [
    'tarot suits',
    'minor arcana',
    'wands tarot',
    'cups tarot',
    'swords tarot',
    'pentacles tarot',
    'tarot elements',
  ],
  openGraph: {
    title: 'Tarot Suits Guide | Lunary',
    description:
      'Explore the four suits of the Minor Arcana and their meanings.',
    url: 'https://lunary.app/grimoire/tarot/suits',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/tarot/suits',
  },
};

const suitDetails: Record<
  string,
  { color: string; cards: string[]; themes: string[] }
> = {
  wands: {
    color: 'text-orange-400',
    cards: [
      'Ace',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Page',
      'Knight',
      'Queen',
      'King',
    ],
    themes: ['Creativity', 'Passion', 'Ambition', 'Energy', 'Willpower'],
  },
  cups: {
    color: 'text-blue-400',
    cards: [
      'Ace',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Page',
      'Knight',
      'Queen',
      'King',
    ],
    themes: ['Emotions', 'Relationships', 'Love', 'Intuition', 'Dreams'],
  },
  swords: {
    color: 'text-cyan-400',
    cards: [
      'Ace',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Page',
      'Knight',
      'Queen',
      'King',
    ],
    themes: ['Intellect', 'Conflict', 'Truth', 'Communication', 'Decisions'],
  },
  pentacles: {
    color: 'text-emerald-400',
    cards: [
      'Ace',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Page',
      'Knight',
      'Queen',
      'King',
    ],
    themes: ['Material', 'Finances', 'Career', 'Health', 'Stability'],
  },
};

export default function TarotSuitsIndexPage() {
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Grimoire', url: '/grimoire' },
    { name: 'Tarot', url: '/grimoire/tarot' },
    { name: 'Suits', url: '/grimoire/tarot/suits' },
  ]);

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(breadcrumbSchema)}
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Layers className='w-16 h-16 text-violet-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Tarot Suits
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            The Minor Arcana consists of 56 cards divided into four suits, each
            associated with an element and reflecting different aspects of daily
            life.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Understanding the Suits
          </h2>
          <p className='text-zinc-400 mb-4'>
            Each suit contains 14 cards: Ace through Ten, plus four court cards
            (Page, Knight, Queen, King). The suits correspond to the four
            elements and represent different domains of human experience.
          </p>
          <p className='text-zinc-400'>
            When a suit dominates a reading, it indicates which area of life is
            most relevant to your question or situation.
          </p>
        </div>

        <div className='space-y-8'>
          {Object.entries(tarotSuits).map(([key, suit]) => (
            <section
              key={key}
              className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-6'
            >
              <Link
                href={`/grimoire/tarot/suits/${key}`}
                className='group block'
              >
                <div className='flex items-center gap-4 mb-4'>
                  <h2
                    className={`text-2xl font-medium ${suitDetails[key].color} group-hover:opacity-80 transition-opacity`}
                  >
                    {suit.name}
                  </h2>
                  <span className='px-3 py-1 text-sm bg-zinc-800 text-zinc-400 rounded'>
                    {suit.element}
                  </span>
                </div>
              </Link>
              <p className='text-zinc-400 mb-4'>{suit.qualities}</p>
              <div className='flex flex-wrap gap-2 mb-4'>
                {suitDetails[key].themes.map((theme) => (
                  <span
                    key={theme}
                    className='px-2 py-1 text-xs bg-zinc-800/50 text-zinc-400 rounded'
                  >
                    {theme}
                  </span>
                ))}
              </div>
              <Link
                href={`/grimoire/tarot/suits/${key}`}
                className={`text-sm ${suitDetails[key].color} hover:underline`}
              >
                View all {suit.name} cards →
              </Link>
            </section>
          ))}
        </div>

        <div className='border-t border-zinc-800 pt-8 mt-12'>
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
          </div>
        </div>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
