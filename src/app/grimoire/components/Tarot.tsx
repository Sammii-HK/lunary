'use client';

import { useEffect } from 'react';
import { tarotSpreads, tarotSuits } from '@/constants/tarot';
import { tarotCards } from '../../../../utils/tarot/tarot-cards';
import { TarotCard } from '@/components/TarotCard';

const Tarot = () => {
  const suits = Object.keys(tarotSuits);
  const majorArcanaCards = Object.values(tarotCards.majorArcana);

  // Get all minor arcana cards organized by suit
  const minorArcanaBySuit = Object.entries(tarotCards.minorArcana).map(
    ([suitKey, suitCards]) => ({
      suitKey,
      suitName: tarotSuits[suitKey as keyof typeof tarotSuits]?.name || suitKey,
      cards: Object.values(suitCards),
    }),
  );

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, []);

  return (
    <div className='space-y-8 pb-20'>
      <div className='mb-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Tarot
        </h1>
        <p className='text-sm text-zinc-400'>
          Comprehensive guide to tarot cards, suits, and spreads. Learn the
          meanings of all 78 tarot cards including the Major Arcana and Minor
          Arcana.
        </p>
      </div>

      {/* Spreads Section - Moved to Top */}
      <section id='spreads' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>Spreads</h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Tarot spreads are layouts that determine how cards are arranged and
            interpreted. Each spread has specific positions with unique
            meanings.
          </p>
        </div>
        <div className='space-y-4'>
          {Object.keys(tarotSpreads).map((spread: string) => (
            <div
              key={spread}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                {tarotSpreads[spread as keyof typeof tarotSpreads].name}
              </h3>
              <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
                {tarotSpreads[spread as keyof typeof tarotSpreads].description}
              </p>
              {Array.isArray(
                tarotSpreads[spread as keyof typeof tarotSpreads].instructions,
              ) &&
              tarotSpreads[spread as keyof typeof tarotSpreads].instructions
                .length > 0 ? (
                <ul className='list-disc list-inside text-sm text-zinc-400 space-y-1'>
                  {tarotSpreads[
                    spread as keyof typeof tarotSpreads
                  ].instructions.map((instruction: string, index: number) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ul>
              ) : (
                <p className='text-sm text-zinc-400'>
                  {tarotSpreads[spread as keyof typeof tarotSpreads]
                    .instructions || 'Instructions coming soon.'}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Major Arcana Section */}
      <section id='major-arcana' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Major Arcana
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            The 22 Major Arcana cards represent significant life themes, karmic
            lessons, and spiritual journeys. These cards hold the most profound
            meanings in a tarot reading.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {majorArcanaCards.map((card) => (
            <TarotCard
              key={card.name}
              name={card.name}
              keywords={card.keywords}
              information={card.information}
              variant='major'
            />
          ))}
        </div>
      </section>

      {/* Minor Arcana Section */}
      <section id='minor-arcana' className='space-y-8'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Minor Arcana
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            The 56 Minor Arcana cards are organized into four suits (Cups,
            Wands, Swords, Pentacles), each representing different aspects of
            daily life and experiences. Each suit corresponds to an element and
            has its own symbolic meaning.
          </p>
        </div>

        {/* Suit Information */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          {suits.map((suit: string) => (
            <div
              key={suit}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                {tarotSuits[suit as keyof typeof tarotSuits].name}
              </h3>
              <p className='text-xs text-zinc-400 mb-2'>
                Element: {tarotSuits[suit as keyof typeof tarotSuits].element}
              </p>
              <p className='text-sm text-zinc-300 leading-relaxed'>
                {tarotSuits[suit as keyof typeof tarotSuits].mysticalProperties}
              </p>
            </div>
          ))}
        </div>

        {/* All Minor Arcana Cards by Suit */}
        {minorArcanaBySuit.map(({ suitKey, suitName, cards }) => (
          <div key={suitKey} className='space-y-4'>
            <h3 className='text-lg font-medium text-zinc-100 border-b border-zinc-700 pb-2'>
              {suitName}
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {cards.map((card) => (
                <TarotCard
                  key={card.name}
                  name={card.name}
                  keywords={card.keywords}
                  information={card.information}
                  variant='minor'
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* FAQ Section */}
      <section id='faq' className='space-y-6'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Frequently Asked Questions
        </h2>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              What is the difference between Major and Minor Arcana?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              The Major Arcana consists of 22 cards representing significant
              life themes and spiritual lessons. The Minor Arcana has 56 cards
              organized into four suits (Cups, Wands, Swords, Pentacles) that
              represent everyday experiences and situations.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              How do I interpret reversed cards?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Reversed cards typically indicate blocked energy, internal
              processes, or a need to look within. They can also represent the
              opposite of the card's upright meaning or a delay in the energy's
              manifestation. Trust your intuition and the context of the
              reading.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              How often should I cleanse my tarot deck?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Cleansing frequency depends on usage. Cleanse after difficult
              readings, when the deck feels heavy, or monthly. Methods include
              placing crystals on the deck, smudging with sage, moonlight
              exposure, or visualization. Choose what resonates with you.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Can I read tarot for myself?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Yes, self-readings are valuable for personal growth and
              introspection. However, be mindful of bias and emotional
              attachment. Take time to reflect, journal your readings, and
              consider seeking another perspective for major decisions.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              What is the best spread for beginners?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              The three-card spread (Past, Present, Future) is ideal for
              beginners. It's simple, provides clear context, and helps develop
              card interpretation skills. As you gain confidence, try the Celtic
              Cross or other spreads for deeper insights.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tarot;
