'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { tarotSpreads, tarotSuits } from '@/constants/tarot';
import { tarotCards } from '../../../../utils/tarot/tarot-cards';
import { TarotCard } from '@/components/TarotCard';
import { stringToKebabCase } from '../../../../utils/string';

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
          {Object.keys(tarotSpreads).map((spread: string) => {
            const spreadSlug = stringToKebabCase(spread);
            return (
              <Link
                key={spread}
                href={`/grimoire/tarot-spreads/${spreadSlug}`}
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-purple-500/50 transition-all group'
              >
                <h3 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-purple-400 transition-colors'>
                  {tarotSpreads[spread as keyof typeof tarotSpreads].name}
                </h3>
                <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
                  {
                    tarotSpreads[spread as keyof typeof tarotSpreads]
                      .description
                  }
                </p>
                {Array.isArray(
                  tarotSpreads[spread as keyof typeof tarotSpreads]
                    .instructions,
                ) &&
                tarotSpreads[spread as keyof typeof tarotSpreads].instructions
                  .length > 0 ? (
                  <ul className='list-disc list-inside text-sm text-zinc-400 space-y-1'>
                    {tarotSpreads[
                      spread as keyof typeof tarotSpreads
                    ].instructions
                      .slice(0, 3)
                      .map((instruction: string, index: number) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    {tarotSpreads[spread as keyof typeof tarotSpreads]
                      .instructions.length > 3 && (
                      <li className='text-purple-400'>...and more</li>
                    )}
                  </ul>
                ) : (
                  <p className='text-sm text-zinc-400'>
                    {tarotSpreads[spread as keyof typeof tarotSpreads]
                      .instructions || 'Instructions coming soon.'}
                  </p>
                )}
              </Link>
            );
          })}
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
          {suits.map((suit: string) => {
            const suitSlug = stringToKebabCase(suit);
            return (
              <Link
                key={suit}
                href={`/grimoire/tarot-suits/${suitSlug}`}
                className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-purple-500/50 transition-all group'
              >
                <h3 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-purple-400 transition-colors'>
                  {tarotSuits[suit as keyof typeof tarotSuits].name}
                </h3>
                <p className='text-xs text-zinc-400 mb-2'>
                  Element: {tarotSuits[suit as keyof typeof tarotSuits].element}
                </p>
                <p className='text-sm text-zinc-300 leading-relaxed'>
                  {
                    tarotSuits[suit as keyof typeof tarotSuits]
                      .mysticalProperties
                  }
                </p>
              </Link>
            );
          })}
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

      {/* Reversed Cards Section */}
      <section id='reversed-cards' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            <Link
              href='/grimoire/reversed-cards-guide'
              className='hover:text-purple-400 transition-colors'
            >
              Reversed Cards Guide
            </Link>
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Reversed cards (cards that appear upside down) add depth and nuance
            to tarot readings. They don't always mean the opposite of the
            upright meaning—often they indicate internal processes, delays, or
            blocked energy.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Understanding Reversed Cards
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-3'>
              Reversed cards can mean several things depending on context:
            </p>
            <ul className='list-disc list-inside text-sm text-zinc-300 space-y-2 mb-3'>
              <li>
                <strong>Blocked energy:</strong> The card's energy is present
                but not flowing freely
              </li>
              <li>
                <strong>Internal process:</strong> The meaning is happening
                within rather than externally
              </li>
              <li>
                <strong>Delay:</strong> The energy is coming but not yet
                manifesting
              </li>
              <li>
                <strong>Opposite meaning:</strong> Sometimes the reversed card
                represents the opposite of its upright meaning
              </li>
              <li>
                <strong>Shadow aspect:</strong> The darker or less conscious
                side of the card's energy
              </li>
            </ul>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Always consider the card's position in the spread, surrounding
              cards, and your intuition when interpreting reversals.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              How to Read Reversed Cards
            </h3>
            <div className='space-y-3 text-sm text-zinc-300'>
              <div>
                <strong>1. Check the context:</strong> What question are you
                asking? What position is the card in?
              </div>
              <div>
                <strong>2. Look at surrounding cards:</strong> Do other cards
                support or contradict the reversal?
              </div>
              <div>
                <strong>3. Consider the element:</strong> Reversed Cups might
                mean blocked emotions; reversed Swords might mean mental
                confusion.
              </div>
              <div>
                <strong>4. Trust your intuition:</strong> What does the reversal
                feel like to you?
              </div>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Common Reversed Patterns
            </h3>
            <div className='space-y-3 text-sm text-zinc-300'>
              <div>
                <strong>Major Arcana reversed:</strong> Often indicates internal
                spiritual work or shadow aspects of major life themes
              </div>
              <div>
                <strong>Court cards reversed:</strong> May represent blocked
                expression of that personality type or its shadow side
              </div>
              <div>
                <strong>Pip cards reversed:</strong> Usually indicate delays,
                internal processes, or blocked energy in that area of life
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Card Combinations Section */}
      <section id='card-combinations' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            <Link
              href='/grimoire/card-combinations'
              className='hover:text-purple-400 transition-colors'
            >
              Reading Card Combinations
            </Link>
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Cards don't exist in isolation. Learning to read cards together
            creates richer, more nuanced interpretations. Here are common
            combination patterns.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Element Combinations
            </h3>
            <div className='space-y-3 text-sm text-zinc-300'>
              <div>
                <strong>Fire + Air:</strong> Action and ideas combine for
                inspired action and communication
              </div>
              <div>
                <strong>Water + Earth:</strong> Emotions grounded in reality,
                practical emotional work
              </div>
              <div>
                <strong>Fire + Water:</strong> Passionate emotions, intense
                feelings driving action
              </div>
              <div>
                <strong>Air + Earth:</strong> Ideas made practical, mental
                planning with tangible results
              </div>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Number Patterns
            </h3>
            <div className='space-y-3 text-sm text-zinc-300'>
              <div>
                <strong>Multiple Aces:</strong> New beginnings in multiple areas
                of life
              </div>
              <div>
                <strong>Multiple Court Cards:</strong> People and personalities
                influencing the situation
              </div>
              <div>
                <strong>Sequential Numbers:</strong> A progression or journey
                through that energy
              </div>
              <div>
                <strong>Same Number Different Suits:</strong> The same theme
                playing out in different life areas
              </div>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Major Arcana Combinations
            </h3>
            <div className='space-y-3 text-sm text-zinc-300'>
              <div>
                <strong>The Fool + The World:</strong> Beginning and ending of a
                cycle, completion leading to new start
              </div>
              <div>
                <strong>The Magician + The Star:</strong> Manifestation with
                hope and inspiration
              </div>
              <div>
                <strong>Death + The Tower:</strong> Major transformation and
                sudden change
              </div>
              <div>
                <strong>The Sun + The Moon:</strong> Balance of conscious and
                unconscious, clarity and mystery
              </div>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              How to Read Combinations
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                1. <strong>Look for themes:</strong> What do the cards have in
                common?
              </p>
              <p>
                2. <strong>Notice contrasts:</strong> How do the cards differ or
                balance each other?
              </p>
              <p>
                3. <strong>Consider position:</strong> Cards near each other
                interact more directly
              </p>
              <p>
                4. <strong>Find the story:</strong> How do these cards create a
                narrative together?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tarot Ethics Section */}
      <section id='tarot-ethics' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Tarot Ethics & Best Practices
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Reading tarot for others comes with responsibility. Here are ethical
            guidelines and best practices for tarot readers.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              When to Read for Others
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                Reading for others can be rewarding but requires skill and
                sensitivity. Consider reading for others when:
              </p>
              <ul className='list-disc list-inside space-y-1 ml-4'>
                <li>You feel confident in your interpretation skills</li>
                <li>The querent is open and consenting</li>
                <li>You can maintain boundaries and objectivity</li>
                <li>You're prepared to handle difficult or emotional topics</li>
              </ul>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Ethical Guidelines
            </h3>
            <div className='space-y-3 text-sm text-zinc-300'>
              <div>
                <strong>Consent:</strong> Always get permission before reading
                for someone
              </div>
              <div>
                <strong>Confidentiality:</strong> Keep readings private unless
                given permission to share
              </div>
              <div>
                <strong>Empowerment:</strong> Focus on guidance and empowerment,
                not fear or dependency
              </div>
              <div>
                <strong>Boundaries:</strong> Don't read about third parties
                without their consent
              </div>
              <div>
                <strong>Medical/Legal:</strong> Never replace professional
                medical or legal advice
              </div>
              <div>
                <strong>Honesty:</strong> If you're unsure, say so. Don't make
                up meanings
              </div>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Self-Reading Best Practices
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                Reading for yourself is valuable but requires awareness of bias:
              </p>
              <ul className='list-disc list-inside space-y-1 ml-4'>
                <li>Take time to reflect before interpreting</li>
                <li>Journal your readings for deeper insight</li>
                <li>Be honest about emotional attachment to outcomes</li>
                <li>Consider getting a second opinion for major decisions</li>
                <li>Don't read the same question repeatedly</li>
              </ul>
            </div>
          </div>
        </div>
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
              reading. See the Reversed Cards Guide section above for detailed
              information.
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

      {/* Related Topics Section */}
      <section className='mt-12 pt-8 border-t border-zinc-800/50'>
        <h2 className='text-xl font-medium text-zinc-100 mb-4'>
          Related Topics
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <a
            href='/grimoire/divination'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-purple-300'
          >
            Other Divination Methods
          </a>
          <a
            href='/grimoire/practices#spellcraft-fundamentals'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-purple-300'
          >
            Spellcraft & Magic
          </a>
          <a
            href='/grimoire/birth-chart'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-purple-300'
          >
            Birth Chart Reading
          </a>
          <a
            href='/grimoire/crystals'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-purple-300'
          >
            Crystals for Divination
          </a>
          <a
            href='/grimoire/numerology'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-purple-300'
          >
            Numerology
          </a>
          <a
            href='/grimoire/runes'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-purple-300'
          >
            Runes
          </a>
        </div>
      </section>
    </div>
  );
};

export default Tarot;
