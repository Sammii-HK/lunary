'use client';

import { Badge } from '@/components/ui/badge';
import dayjs from 'dayjs';
import Image from 'next/image';
import { getTarotCardByName } from '@/utils/tarot/getCardByName';
import { monthlyMoonPhases } from '../../../utils/moon/monthlyPhases';

interface CosmicContextCardProps {
  date: string;
  moonPhase?: {
    emoji: string;
    name: string;
  };
  aspects?: Array<{
    planet1: string;
    planet2: string;
    aspectSymbol: string;
  }>;
  cardName?: string;
  showCardMeaning?: boolean;
}

// Helper to convert moon phase name to icon path
function getMoonPhaseIcon(moonPhaseName: string): string {
  const phaseKey = moonPhaseName.toLowerCase().replace(' ', '');
  const phaseData =
    monthlyMoonPhases[phaseKey as keyof typeof monthlyMoonPhases];
  return phaseData?.icon?.src || '/icons/moon-phases/new-moon.svg';
}

/**
 * Displays cosmic context (moon phase + aspects) for when a tarot card was pulled
 */
export function CosmicContextCard({
  date,
  moonPhase,
  aspects,
  cardName,
  showCardMeaning = false,
}: CosmicContextCardProps) {
  // Get card data if cardName is provided
  const card = cardName ? getTarotCardByName(cardName) : null;

  return (
    <div className='bg-zinc-900/50 rounded-lg p-3 space-y-2 border border-zinc-800/50'>
      {/* Header with Date and Moon Phase */}
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-xs font-medium text-zinc-400 mb-0.5'>
            When pulled
          </p>
          <p className='text-sm font-medium text-zinc-200'>
            {dayjs(date).format('MMM D, YYYY')}
          </p>
        </div>
        {moonPhase && (
          <div className='flex items-center gap-2'>
            <Image
              src={getMoonPhaseIcon(moonPhase.name)}
              alt={moonPhase.name}
              width={32}
              height={32}
              className='flex-shrink-0'
            />
            <div className='text-right'>
              <p className='text-xs font-medium text-lunary-secondary-300'>
                {moonPhase.name}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Card Meaning - shown first for context */}
      {showCardMeaning && card && (
        <div className='pt-2 border-t border-zinc-800/50'>
          <p className='text-xs font-medium text-zinc-300 mb-1'>Card Meaning</p>
          {card?.keywords && card.keywords.length > 0 && (
            <div className='flex flex-wrap gap-1.5 mb-2'>
              {card.keywords.slice(0, 3).map((keyword: string, idx: number) => (
                <span
                  key={idx}
                  className='text-xs px-2 py-0.5 rounded-full bg-lunary-primary-900/50 text-lunary-primary-300 border border-lunary-primary-800'
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
          <p className='text-xs text-zinc-400 leading-relaxed'>
            {card?.information}
          </p>
        </div>
      )}

      {/* Aspects */}
      {aspects && aspects.length > 0 && (
        <div className='pt-2 border-t border-zinc-800/50'>
          <p className='text-xs text-zinc-500 mb-2'>Active aspects</p>
          <div className='flex flex-wrap gap-1.5'>
            {aspects.map((aspect, idx) => (
              <Badge
                key={idx}
                variant='outline'
                className='text-xs bg-zinc-800/40 border-zinc-700'
              >
                {aspect.planet1} {aspect.aspectSymbol} {aspect.planet2}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
