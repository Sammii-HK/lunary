'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { TarotCard } from './TarotCard';
import { useModal } from '@/hooks/useModal';
import { stringToKebabCase } from '../../utils/string';
import { TarotTransitConnection } from './tarot/TarotTransitConnection';
import type { BirthChartPlacement } from '@/context/UserContext';
import type { AstroChartInformation } from '../../utils/astrology/astrology';
import { isInDemoMode } from '@/lib/demo-mode';
import { hapticService } from '@/services/native/haptic-service';

interface TarotCardModalProps {
  card: {
    name: string;
    keywords: string[];
    information: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  birthChart?: BirthChartPlacement[];
  userBirthday?: string;
  currentTransits?: AstroChartInformation[];
}

export function TarotCardModal({
  card,
  isOpen,
  onClose,
  birthChart,
  userBirthday,
  currentTransits,
}: TarotCardModalProps) {
  const hasTriggeredHaptic = useRef(false);

  useModal({
    isOpen,
    onClose,
    closeOnClickOutside: false,
  });

  // Trigger haptic when modal opens
  useEffect(() => {
    if (isOpen && card && !hasTriggeredHaptic.current) {
      hapticService.medium(); // Card reveal feeling
      hasTriggeredHaptic.current = true;
    }
    if (!isOpen) {
      hasTriggeredHaptic.current = false;
    }
  }, [isOpen, card]);

  if (!isOpen || !card) return null;

  const isMajorArcana = !card.name.includes(' of ');
  const cardSlug = stringToKebabCase(card.name);

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='relative w-full max-w-lg bg-zinc-900 rounded-lg border border-zinc-800/50 p-6 max-h-[90vh] overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className='absolute top-4 right-4 min-h-[48px] min-w-[48px] flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors'
          aria-label='Close tarot card modal'
        >
          <X className='w-5 h-5' />
        </button>

        <TarotCard
          name={card.name}
          keywords={card.keywords}
          information={card.information}
          variant={isMajorArcana ? 'major' : 'minor'}
          disableLink
        />

        {/* Transit connection */}
        {birthChart && userBirthday && currentTransits && (
          <TarotTransitConnection
            cardName={card.name}
            birthChart={birthChart}
            userBirthday={userBirthday}
            currentTransits={currentTransits}
            variant='inDepth'
          />
        )}

        <div className='mt-4'>
          {isInDemoMode() ? (
            <button
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('demo-action-blocked', {
                    detail: { action: 'Viewing Grimoire pages' },
                  }),
                );
              }}
              className='text-xs text-lunary-primary-300 hover:text-lunary-primary-200 transition-colors'
            >
              Explore the Grimoire to learn more
            </button>
          ) : (
            <Link
              href={`/grimoire/tarot/${cardSlug}`}
              className='text-xs text-lunary-primary-300 hover:text-lunary-primary-200 transition-colors'
            >
              Continue to the full {card.name} meaning
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
