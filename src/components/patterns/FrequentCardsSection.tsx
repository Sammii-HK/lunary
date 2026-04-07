'use client';

import { useState } from 'react';
import { ChevronDown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PatternCard } from './PatternCard';
import { getTarotCardByName } from '@/utils/tarot/getCardByName';
import type { FrequentCard } from '@/lib/patterns/tarot-pattern-types';

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
        {cards.map((card) => {
          const cardData = getTarotCardByName(card.name);
          return (
            <div key={card.name} className='space-y-2'>
              <button
                onClick={() => handleCardClick(card.name)}
                disabled={!allowDrillDown}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg transition',
                  'bg-surface-card/40',
                  allowDrillDown && 'hover:bg-surface-card/60',
                  !allowDrillDown && 'cursor-default',
                )}
              >
                <div className='flex items-center gap-3'>
                  {card.emoji && <span className='text-2xl'>{card.emoji}</span>}
                  <div className='text-left'>
                    <p className='text-sm font-medium text-content-primary'>
                      {card.name}
                    </p>
                    <p className='text-xs text-content-muted'>
                      Appeared {card.count}x
                    </p>
                  </div>
                </div>
                {allowDrillDown && (
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform text-content-muted',
                      expandedCard === card.name && 'rotate-180',
                    )}
                  />
                )}
              </button>

              {allowDrillDown && expandedCard === card.name && (
                <div className='pl-4 pr-2 pb-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200'>
                  {cardData?.keywords?.length ? (
                    <p className='text-xs text-lunary-accent-300'>
                      {cardData.keywords.slice(0, 4).join(' · ')}
                    </p>
                  ) : null}
                  {cardData?.information ? (
                    <p className='text-xs text-content-secondary leading-relaxed'>
                      {cardData.information}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PatternCard>
  );
}
