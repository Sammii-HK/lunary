import { Metadata } from 'next';
import Link from 'next/link';
import { tarotCards } from '../../../../utils/tarot/tarot-cards';
import { tarotSuits } from '@/constants/tarot';
import { stringToKebabCase } from '../../../../utils/string';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'All 78 Tarot Cards: Major & Minor Arcana Meanings | Lunary',
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
    images: [
      {
        url: '/api/og/grimoire/tarot',
        width: 1200,
        height: 630,
        alt: 'Tarot Cards Guide - All 78 Cards',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All 78 Tarot Cards: Major & Minor Arcana Meanings | Lunary',
    description:
      'Explore all 78 tarot cards with detailed meanings. Learn the Major Arcana, Minor Arcana, and how to read tarot cards.',
    images: ['/api/og/grimoire/tarot'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/tarot',
  },
};

export default function TarotIndexPage() {
  const majorArcanaCards = Object.values(tarotCards.majorArcana);

  const tarotListSchema = createItemListSchema({
    name: 'Complete Tarot Card Guide',
    description:
      'All 78 tarot cards with meanings, symbolism, and interpretations for readings.',
    url: 'https://lunary.app/grimoire/tarot',
    items: [
      ...majorArcanaCards.map((card) => ({
        name: card.name,
        url: `https://lunary.app/grimoire/tarot/${stringToKebabCase(card.name)}`,
        description: `${card.name} tarot card meaning and interpretation`,
      })),
      ...Object.entries(tarotSuits).map(([key, suit]) => ({
        name: suit.name,
        url: `https://lunary.app/grimoire/tarot/suits/${key}`,
        description: suit.qualities,
      })),
    ],
  });

  return (
    <>
      {renderJsonLd(tarotListSchema)}
      <SEOContentTemplate
        title='All 78 Tarot Cards: Major & Minor Arcana Meanings'
        h1='Tarot Cards'
        description="Explore all 78 tarot cards — 22 Major Arcana representing life's spiritual lessons, and 56 Minor Arcana reflecting daily experiences."
        keywords={[
          'tarot cards',
          'tarot meanings',
          'major arcana',
          'minor arcana',
          'tarot reading',
          'tarot guide',
        ]}
        canonicalUrl='https://lunary.app/grimoire/tarot'
        whatIs={{
          question: 'What are tarot cards?',
          answer:
            'Tarot cards are a 78-card divination deck used for spiritual guidance and self-reflection. The deck consists of 22 Major Arcana cards representing significant life events and spiritual lessons, and 56 Minor Arcana cards divided into four suits (Wands, Cups, Swords, Pentacles) that reflect everyday experiences. Each card carries unique symbolism, meanings, and guidance for readings.',
        }}
        tldr='A tarot deck has 78 cards: 22 Major Arcana for big life themes and spiritual lessons, and 56 Minor Arcana across four suits for daily life. Major Arcana = significant events; Minor Arcana = everyday experiences. The suits represent different elements and life areas.'
        intro="The tarot deck is divided into two main sections: the Major Arcana (22 cards) and the Minor Arcana (56 cards). The Major Arcana represents significant life events and spiritual lessons, while the Minor Arcana covers day-to-day experiences across four suits. Each card carries unique symbolism, meanings, and guidance. Whether you're a beginner or experienced reader, understanding each card deepens your connection to this powerful divination tool."
        faqs={[
          {
            question: 'How many cards are in a tarot deck?',
            answer:
              'A standard tarot deck contains 78 cards: 22 Major Arcana cards and 56 Minor Arcana cards. The Minor Arcana is divided into four suits of 14 cards each.',
          },
          {
            question: 'What is the difference between Major and Minor Arcana?',
            answer:
              "Major Arcana cards represent significant life events, karmic lessons, and the soul's journey. Minor Arcana cards reflect everyday situations, emotions, and experiences across four suits representing different elements and life areas.",
          },
          {
            question: 'What do the four tarot suits represent?',
            answer:
              'Wands (Fire) = passion, creativity, action. Cups (Water) = emotions, relationships, intuition. Swords (Air) = thoughts, communication, conflict. Pentacles (Earth) = material matters, career, health.',
          },
        ]}
        relatedItems={[
          {
            name: 'Yes or No Tarot',
            href: '/grimoire/tarot/yes-or-no',
            type: 'guide',
          },
          {
            name: 'Tarot Spreads',
            href: '/grimoire/tarot/spreads',
            type: 'guide',
          },
          {
            name: 'Tarot Suits',
            href: '/grimoire/tarot/suits',
            type: 'guide',
          },
          {
            name: 'Reversed Cards Guide',
            href: '/grimoire/reversed-cards-guide',
            type: 'guide',
          },
          {
            name: 'Card Combinations',
            href: '/grimoire/card-combinations',
            type: 'guide',
          },
          { name: 'Runes', href: '/grimoire/runes', type: 'divination' },
        ]}
      >
        <div className='space-y-12'>
          <section>
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
                  <div className='text-xs text-zinc-400 mb-1'>{index}</div>
                  <h3 className='font-medium text-zinc-100 group-hover:text-violet-300 transition-colors text-sm'>
                    {card.name}
                  </h3>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              Minor Arcana (56 Cards)
            </h2>
            <p className='text-zinc-400 mb-6'>
              The Minor Arcana is divided into four suits, each associated with
              an element and aspect of life.
            </p>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {Object.entries(tarotSuits).map(([key, suit]) => (
                <Link
                  key={key}
                  href={`/grimoire/tarot/suits/${key}`}
                  className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-violet-700/50 transition-all'
                >
                  <h3 className='text-lg font-medium text-zinc-100 group-hover:text-violet-300 transition-colors mb-2'>
                    {suit.name}
                  </h3>
                  <p className='text-sm text-zinc-400 mb-2'>
                    Element: {suit.element}
                  </p>
                  <p className='text-sm text-zinc-400'>{suit.qualities}</p>
                </Link>
              ))}
            </div>
            <Link
              href='/grimoire/tarot/suits'
              className='inline-block mt-5 text-sm text-violet-300 hover:text-violet-200 transition-colors'
            >
              Explore the full tarot suits guide →
            </Link>
          </section>

          <section>
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
        </div>
      </SEOContentTemplate>
    </>
  );
}
