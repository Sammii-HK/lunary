'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { TarotCard } from './TarotCard';
import { InfoBottomSheet } from './ui/InfoBottomSheet';
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

  if (!card) return null;

  const isMajorArcana = !card.name.includes(' of ');
  const cardSlug = stringToKebabCase(card.name);

  return (
    <InfoBottomSheet
      open={isOpen}
      onClose={onClose}
      title={card.name}
      subtitle={isMajorArcana ? 'Major Arcana' : 'Minor Arcana'}
      accentColor='text-lunary-primary'
      desktopPresentation='bottom'
      className='md:w-[560px]'
    >
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
            className='text-xs text-content-brand hover:text-content-secondary transition-colors'
          >
            Explore the Grimoire to learn more
          </button>
        ) : (
          <Link
            href={`/grimoire/tarot/${cardSlug}`}
            className='text-xs text-content-brand hover:text-content-secondary transition-colors'
          >
            Continue to the full {card.name} meaning
          </Link>
        )}
      </div>
    </InfoBottomSheet>
  );
}
