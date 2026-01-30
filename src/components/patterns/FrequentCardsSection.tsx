'use client';

import { useState } from 'react';
import { ChevronDown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PatternCard } from './PatternCard';
import { CardFrequencyTimeline } from './visualizations/CardFrequencyTimeline';
import { CosmicContextCard } from './CosmicContextCard';
import { TarotTransitConnection } from '@/components/tarot/TarotTransitConnection';
import type { FrequentCard } from '@/lib/patterns/tarot-pattern-types';
import type { BirthChartPlacement } from '@/context/UserContext';
import type { AstroChartInformation } from '../../../utils/astrology/astrology';

interface FrequentCardsSectionProps {
  cards: FrequentCard[];
  allowDrillDown?: boolean;
  locked?: boolean;
  onUpgradeClick?: () => void;
  // Optional props for TarotTransitConnection
  birthChart?: BirthChartPlacement[];
  userBirthday?: string;
  currentTransits?: AstroChartInformation[];
  userBirthLocation?: string;
}

export function FrequentCardsSection({
  cards,
  allowDrillDown = false,
  locked = false,
  onUpgradeClick,
  birthChart,
  userBirthday,
  currentTransits,
  userBirthLocation,
}: FrequentCardsSectionProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Check if we have the data needed for TarotTransitConnection
  const canShowTransitConnection =
    birthChart &&
    birthChart.length > 0 &&
    userBirthday &&
    currentTransits &&
    currentTransits.length > 0;

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
                    {/* Show first appearance with full details */}
                    {card.appearances.slice(0, 1).map((appearance, idx) => (
                      <div
                        key={`${appearance.date}-${idx}`}
                        className='space-y-3'
                      >
                        <CosmicContextCard
                          date={appearance.date}
                          moonPhase={appearance.moonPhase}
                          aspects={appearance.aspects}
                          cardName={card.name}
                          showCardMeaning={true}
                        />

                        {/* TarotTransitConnection for "When Pulled" info */}
                        {canShowTransitConnection && (
                          <TarotTransitConnection
                            cardName={card.name}
                            birthChart={birthChart}
                            userBirthday={userBirthday}
                            currentTransits={currentTransits!}
                            variant='inDepth'
                            historicalTimestamp={appearance.date}
                            readingCreatedAt={appearance.date}
                            userBirthLocation={userBirthLocation}
                          />
                        )}
                      </div>
                    ))}

                    {/* Show remaining appearances with just cosmic context */}
                    {card.appearances.length > 1 && (
                      <div className='space-y-2 max-h-64 overflow-y-auto'>
                        {card.appearances
                          .slice(1, 10)
                          .map((appearance, idx) => (
                            <CosmicContextCard
                              key={`${appearance.date}-${idx + 1}`}
                              date={appearance.date}
                              moonPhase={appearance.moonPhase}
                              aspects={appearance.aspects}
                            />
                          ))}
                      </div>
                    )}

                    {card.appearances.length > 10 && (
                      <p className='text-xs text-zinc-500 text-center py-2'>
                        +{card.appearances.length - 10} more appearances
                      </p>
                    )}

                    <div className='bg-zinc-900/50 rounded-lg p-3 border border-zinc-800/50'>
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
