'use client';
import { SmartTrialButton } from './SmartTrialButton';
import { useAstronomyContext } from '@/context/AstronomyContext';
import { useSubscription } from '../hooks/useSubscription';
import { useUser } from '@/context/UserContext';
import { hasFeatureAccess } from '../../utils/pricing';
import { useState, useEffect } from 'react';
import type { GeneralTarotReading } from '../../utils/tarot/generalTarot';
import { calculateTransitAspects } from '@/lib/astrology/transit-aspects';
import { generateTarotTransitConnection } from '@/lib/tarot/generate-transit-connection';

export const TarotWidget = () => {
  const subscription = useSubscription();
  const { user } = useUser();
  const { currentTarotCard, currentAstrologicalChart } = useAstronomyContext();
  const [generalTarot, setGeneralTarot] = useState<GeneralTarotReading | null>(
    null,
  );
  const [transitConnection, setTransitConnection] = useState<{
    compact: string;
  } | null>(null);

  const hasPersonalTarotAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personal_tarot',
  );

  // Calculate transit connection if user has birth chart
  useEffect(() => {
    if (
      !hasPersonalTarotAccess ||
      !user?.birthChart ||
      !user.birthChart.length ||
      !currentTarotCard?.name ||
      !currentAstrologicalChart?.length
    ) {
      setTransitConnection(null);
      return;
    }

    // Calculate transit aspects
    const aspects = calculateTransitAspects(
      user.birthChart as any,
      currentAstrologicalChart as any,
    );

    if (aspects.length === 0) {
      setTransitConnection(null);
      return;
    }

    // Convert birth chart to snapshot format for the generator
    const birthChartSnapshot = user.birthday
      ? {
          date: user.birthday,
          time: '12:00',
          lat: 0,
          lon: 0,
          placements: user.birthChart.map((p: any) => ({
            planet: p.planet,
            sign: p.sign,
            house: p.house,
            degree: p.degree,
          })),
        }
      : null;

    // Generate transit connection
    if (birthChartSnapshot) {
      generateTarotTransitConnection(
        currentTarotCard.name,
        birthChartSnapshot,
        aspects,
      )
        .then((connection) => {
          if (connection) {
            setTransitConnection({ compact: connection.compact });
          } else {
            setTransitConnection(null);
          }
        })
        .catch((err) => {
          console.error('Failed to generate transit connection:', err);
          setTransitConnection(null);
        });
    }
  }, [
    hasPersonalTarotAccess,
    user?.birthChart,
    user?.birthday,
    currentTarotCard?.name,
    currentAstrologicalChart,
  ]);

  useEffect(() => {
    if (!hasPersonalTarotAccess && !generalTarot) {
      import('../../utils/tarot/generalTarot')
        .then(({ getGeneralTarotReading }) => {
          setGeneralTarot(getGeneralTarotReading());
        })
        .catch((err) => {
          console.error('Failed to load tarot reading:', err);
        });
    }
  }, [hasPersonalTarotAccess, generalTarot]);

  // If user doesn't have birth chart access, show general tarot reading
  if (!hasPersonalTarotAccess) {
    if (!generalTarot) {
      return (
        <div className='p-5 border border-stone-800 rounded-md w-full h-full flex flex-col min-w-0 overflow-hidden min-h-64'>
          <div className='h-full flex items-center justify-center'>
            <div className='w-5 h-5 border-2 border-lunary-primary border-t-transparent rounded-full animate-spin' />
          </div>
        </div>
      );
    }
    return (
      <div className='p-5 border border-stone-800 rounded-md w-full h-full flex flex-col min-w-0 overflow-hidden min-h-64'>
        <div className='space-y-3 flex-1 min-w-0 overflow-y-auto overflow-x-hidden'>
          <div className='text-center'>
            <h4 className='font-semibold text-lunary-accent-300 mb-2'>
              {generalTarot.daily.name}
            </h4>
            <p className='text-xs text-zinc-400 mb-3 break-words'>
              {generalTarot.daily.keywords.slice(0, 3).join(' • ')}
            </p>
          </div>

          <p className='text-sm text-zinc-300 leading-relaxed break-words'>
            {generalTarot.guidance.dailyMessage}
          </p>

          <div className='bg-gradient-to-r from-lunary-primary-900/20 to-lunary-highlight-900/20 rounded p-3 border border-lunary-primary-800'>
            <p className='text-xs text-lunary-accent-200 mb-1 font-medium'>
              Your personalized tarot pattern has been calculated
            </p>
            <p className='text-xs text-zinc-400 mb-2'>
              Unlock it now to see what's influencing you today based on your
              name and birthday. Discover what the cards reveal about you!
            </p>
            <SmartTrialButton size='sm' />
          </div>
        </div>
      </div>
    );
  }

  // For premium users, show personalized tarot
  return (
    <div className='p-5 border border-stone-800 rounded-md w-full h-full flex flex-col min-w-0 overflow-hidden min-h-64'>
      <div className='space-y-3 flex-1 min-w-0 overflow-y-auto overflow-x-hidden'>
        <div className='flex items-center justify-between'>
          <h3 className='font-bold'>Personal Tarot Card</h3>
          <span className='text-xs text-lunary-accent'>Personalised</span>
        </div>

        <div className='text-center'>
          <h4 className='font-semibold text-white mb-3'>
            {currentTarotCard.name}
          </h4>
          <p className='text-xs text-zinc-400 mb-3 break-words'>
            {currentTarotCard.keywords.join(' • ')}
          </p>
        </div>

        <p className='text-sm text-zinc-300 leading-relaxed break-words'>
          {currentTarotCard.information}
        </p>

        {/* Transit connection (if available) */}
        {transitConnection && (
          <div className='pt-2 mt-2 border-t border-zinc-800'>
            <p className='text-xs text-lunary-accent-300 leading-relaxed'>
              {transitConnection.compact}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
