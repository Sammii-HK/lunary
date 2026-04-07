'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function TarotGalleryPage() {
  const [selectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // All tarot cards organized by suit
  const tarotSuits = {
    'Major Arcana': [
      {
        name: 'The Fool',
        archetype: 'New Beginnings',
        keywords: ['Adventure', 'Spontaneity', 'Faith'],
      },
      {
        name: 'The Magician',
        archetype: 'Manifestation',
        keywords: ['Power', 'Focus', 'Skill'],
      },
      {
        name: 'The High Priestess',
        archetype: 'Intuition',
        keywords: ['Mystery', 'Wisdom', 'Subconscious'],
      },
      {
        name: 'The Empress',
        archetype: 'Abundance',
        keywords: ['Fertility', 'Nature', 'Nurturing'],
      },
      {
        name: 'The Emperor',
        archetype: 'Authority',
        keywords: ['Structure', 'Control', 'Leadership'],
      },
      {
        name: 'The Lovers',
        archetype: 'Choice',
        keywords: ['Love', 'Union', 'Values'],
      },
      {
        name: 'The Chariot',
        archetype: 'Victory',
        keywords: ['Control', 'Determination', 'Success'],
      },
      {
        name: 'Strength',
        archetype: 'Inner Power',
        keywords: ['Courage', 'Patience', 'Compassion'],
      },
    ],
    'Cups (Water)': [
      {
        name: 'Ace of Cups',
        archetype: 'New Love',
        keywords: ['Emotion', 'Intuition', 'Spirituality'],
      },
      {
        name: 'Two of Cups',
        archetype: 'Partnership',
        keywords: ['Union', 'Connection', 'Harmony'],
      },
    ],
    'Wands (Fire)': [
      {
        name: 'Ace of Wands',
        archetype: 'Creative Spark',
        keywords: ['Inspiration', 'Growth', 'Potential'],
      },
      {
        name: 'Two of Wands',
        archetype: 'Planning',
        keywords: ['Future', 'Discovery', 'Decisions'],
      },
    ],
    'Swords (Air)': [
      {
        name: 'Ace of Swords',
        archetype: 'Mental Clarity',
        keywords: ['Truth', 'Justice', 'Clarity'],
      },
      {
        name: 'Two of Swords',
        archetype: 'Difficult Choice',
        keywords: ['Indecision', 'Balance', 'Stalemate'],
      },
    ],
    'Pentacles (Earth)': [
      {
        name: 'Ace of Pentacles',
        archetype: 'Material Opportunity',
        keywords: ['Prosperity', 'Manifestation', 'Resources'],
      },
      {
        name: 'Two of Pentacles',
        archetype: 'Balance',
        keywords: ['Adaptability', 'Time Management', 'Priorities'],
      },
    ],
  };

  const getSuitColor = (suitName: string) => {
    const colors = {
      'Major Arcana': '#F59E0B',
      'Cups (Water)': '#2563EB',
      'Wands (Fire)': '#DC2626',
      'Swords (Air)': '#7C3AED',
      'Pentacles (Earth)': '#059669',
    };
    return colors[suitName as keyof typeof colors] || '#F59E0B';
  };

  return (
    <div className='min-h-screen bg-surface-base text-content-primary p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-4'>Tarot Card Gallery</h1>
          <p className='text-content-muted mb-6'>
            Preview all tarot cards with their suit-based color variations. Each
            suit has its own color theme and 5 daily background variations.
          </p>
        </div>

        {/* Suits */}
        {Object.entries(tarotSuits).map(([suitName, cards]) => {
          const suitColor = getSuitColor(suitName);

          return (
            <div key={suitName} className='mb-12'>
              <div className='flex items-center gap-3 mb-6'>
                <div
                  className='w-4 h-4 rounded-full'
                  style={{ backgroundColor: suitColor }}
                ></div>
                <h2 className='text-2xl font-bold'>{suitName}</h2>
                <div className='text-sm text-content-muted'>
                  ({cards.length} cards)
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {cards.map((card, cardIndex) => {
                  // Calculate the card's position in the full deck for the seed
                  const allCards = Object.values(tarotSuits).flat();
                  const globalIndex = allCards.findIndex(
                    (c) => c.name === card.name,
                  );

                  // Use card name as parameter to show specific card
                  const imageUrl = `/api/og/tarot?date=${selectedDate}&card=${encodeURIComponent(card.name)}`;

                  return (
                    <div
                      key={card.name}
                      className='bg-surface-elevated rounded-lg border border-stroke-default overflow-hidden hover:border-lunary-primary transition-colors'
                    >
                      {/* Card Header */}
                      <div className='p-4 border-b border-stroke-default'>
                        <h3 className='text-lg font-bold text-content-primary mb-1'>
                          {card.name}
                        </h3>
                        <p className='text-content-muted text-sm mb-2'>
                          {card.archetype}
                        </p>
                        <div className='flex flex-wrap gap-1'>
                          {card.keywords.map((keyword) => (
                            <span
                              key={keyword}
                              className='px-2 py-1 bg-surface-card rounded text-xs text-content-secondary'
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Image Preview */}
                      <div className='p-4'>
                        <div className='relative aspect-square rounded-lg overflow-hidden border border-stroke-strong'>
                          <Image
                            src={imageUrl}
                            alt={card.name}
                            fill
                            style={{ objectFit: 'cover' }}
                            className='hover:scale-105 transition-transform duration-300'
                          />
                        </div>

                        {/* Note about daily rotation */}
                        <div className='mt-2 text-xs text-content-muted'>
                          Daily rotation: Card {globalIndex + 1} of{' '}
                          {allCards.length}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Navigation */}
        <div className='mt-8 flex gap-4 justify-center'>
          <a
            href='/admin/daily-posts-preview'
            className='px-6 py-3 bg-lunary-primary-600 hover:bg-layer-high rounded-md text-white font-medium transition-colors'
          >
            ← Daily Posts Preview
          </a>
          <a
            href='/admin/crystal-gallery'
            className='px-6 py-3 bg-lunary-success-600 hover:bg-lunary-success-700 rounded-md text-white font-medium transition-colors'
          >
            View Crystal Gallery →
          </a>
        </div>
      </div>
    </div>
  );
}
