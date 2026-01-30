'use client';

import { useState } from 'react';
import { ChevronDown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PatternCard } from './PatternCard';
import { CardFrequencyTimeline } from './visualizations/CardFrequencyTimeline';
import type { FrequentCard } from '@/lib/patterns/tarot-pattern-types';
import dayjs from 'dayjs';

interface FrequentCardsSectionProps {
  cards: FrequentCard[];
  allowDrillDown?: boolean;
  locked?: boolean;
  onUpgradeClick?: () => void;
}

export function FrequentCardsSection({
  cards,
  allowDrillDown = false,
  locked = false,
  onUpgradeClick,
}: FrequentCardsSectionProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleCardClick = (cardName: string) => {
    if (!allowDrillDown) return;
    setExpandedCard(expandedCard === cardName ? null : cardName);
  };

  return (
    <PatternCard
      title='Frequent Cards'
      color='secondary'
      icon={<Star className='w-4 h-4' />}
      locked={locked}
      onUpgradeClick={onUpgradeClick}
    >
      <div className='space-y-3'>
        {cards.map((card) => (
          <div key={card.name} className='space-y-2'>
            <button
              onClick={() => handleCardClick(card.name)}
              disabled={!allowDrillDown}
              className={cn(
                'w-full flex items-center justify-between p-3 rounded-lg transition',
                'bg-zinc-800/40',
                allowDrillDown && 'hover:bg-zinc-800/60 cursor-pointer',
                !allowDrillDown && 'cursor-default',
              )}
            >
              <div className='flex items-center gap-3'>
                {card.emoji && <span className='text-2xl'>{card.emoji}</span>}
                <div className='text-left'>
                  <p className='text-sm font-medium text-zinc-200'>
                    {card.name}
                  </p>
                  <p className='text-xs text-zinc-500'>
                    Appeared {card.count}x
                  </p>
                </div>
              </div>
              {allowDrillDown && (
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform text-zinc-400',
                    expandedCard === card.name && 'rotate-180',
                  )}
                />
              )}
            </button>

            {allowDrillDown && expandedCard === card.name && (
              <div className='pl-4 pr-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200'>
                {card.appearances && card.appearances.length > 0 && (
                  <>
                    {/* Cosmic context for each appearance */}
                    <div className='space-y-2 max-h-64 overflow-y-auto'>
                      {card.appearances.slice(0, 10).map((appearance, idx) => (
                        <div
                          key={`${appearance.date}-${idx}`}
                          className='bg-zinc-900/50 rounded-lg p-3 space-y-1'
                        >
                          <div className='flex items-center justify-between'>
                            <span className='text-xs font-medium text-zinc-300'>
                              {dayjs(appearance.date).format('MMM D, YYYY')}
                            </span>
                            {appearance.moonPhase && (
                              <div className='flex items-center gap-1'>
                                <span className='text-lg'>
                                  {appearance.moonPhase.emoji}
                                </span>
                                <span className='text-xs text-zinc-500'>
                                  {appearance.moonPhase.name}
                                </span>
                              </div>
                            )}
                          </div>

                          {appearance.aspects &&
                            appearance.aspects.length > 0 && (
                              <div className='flex flex-wrap gap-1.5 mt-2'>
                                {appearance.aspects.map((aspect, aspectIdx) => (
                                  <Badge
                                    key={aspectIdx}
                                    variant='outline'
                                    className='text-xs'
                                  >
                                    {aspect.planet1} {aspect.aspectSymbol}{' '}
                                    {aspect.planet2}
                                  </Badge>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}

                      {card.appearances.length > 10 && (
                        <p className='text-xs text-zinc-500 text-center py-2'>
                          +{card.appearances.length - 10} more appearances
                        </p>
                      )}
                    </div>

                    <div className='bg-zinc-900/50 rounded-lg p-3'>
                      <p className='text-xs text-zinc-500 mb-2'>
                        Frequency over time
                      </p>
                      <CardFrequencyTimeline
                        cardName={card.name}
                        appearances={card.appearances}
                        height={80}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </PatternCard>
  );
}
