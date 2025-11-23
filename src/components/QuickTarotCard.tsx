'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { useAuthStatus } from './AuthStatus';
import { useAstronomyContext } from '@/context/AstronomyContext';

export function QuickTarotCard() {
  const router = useRouter();
  const authState = useAuthStatus();
  const { currentTarotCard } = useAstronomyContext();
  const [cardName, setCardName] = useState<string | null>(null);
  const [insight, setInsight] = useState<string | null>(null);

  useEffect(() => {
    const loadCard = async () => {
      let card: {
        name: string;
        keywords?: string[];
        information?: string;
      } | null = null;

      if (currentTarotCard?.name) {
        card = currentTarotCard;
        setCardName(currentTarotCard.name);
      } else {
        // Fallback to general tarot if no personalized card
        const {
          getGeneralTarotReading,
        } = require('../../utils/tarot/generalTarot');
        const generalTarot = getGeneralTarotReading();
        card = generalTarot.card;
        if (card) {
          setCardName(card.name);
        }
      }

      // Generate one-sentence insight
      if (card) {
        if (card.keywords && card.keywords.length > 0) {
          const primaryKeyword = card.keywords[0];
          const insightText = `Today invites ${primaryKeyword} energy into your journey.`;
          setInsight(insightText);
        } else if (card.information) {
          // Extract first sentence from information
          const firstSentence = card.information.split('.')[0];
          setInsight(
            firstSentence.length > 80
              ? `${firstSentence.substring(0, 77)}...`
              : firstSentence,
          );
        } else {
          setInsight('A card of guidance for your day.');
        }
      }
    };

    loadCard();
  }, [currentTarotCard]);

  if (!authState.isAuthenticated || !cardName) {
    return null;
  }

  const handleClick = () => {
    router.push('/tarot');
  };

  return (
    <button
      onClick={handleClick}
      className='w-full rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-4 hover:bg-zinc-900/60 transition-colors text-left'
    >
      <div className='flex items-center gap-3'>
        <div className='rounded-lg bg-purple-500/20 p-2'>
          <BookOpen className='w-5 h-5 text-purple-400' />
        </div>
        <div className='flex-1'>
          <h3 className='text-sm font-semibold text-zinc-100 mb-0.5'>
            Today's Card
          </h3>
          <p className='text-xs text-purple-300 font-medium mb-1'>{cardName}</p>
          {insight && (
            <p className='text-xs text-zinc-400 leading-relaxed'>{insight}</p>
          )}
        </div>
      </div>
    </button>
  );
}
