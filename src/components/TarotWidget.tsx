'use client';
import { SmartTrialButton } from './SmartTrialButton';
import { useTarotCard, usePlanetaryChart } from '@/context/AstronomyContext';
import { useSubscription } from '../hooks/useSubscription';
import { useUser } from '@/context/UserContext';
import { hasFeatureAccess } from '../../utils/pricing';
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { calculateTransitAspects } from '@/lib/astrology/transit-aspects';
import { generateTarotTransitConnection } from '@/lib/tarot/generate-transit-connection';

export const TarotWidget = () => {
  const subscription = useSubscription();
  const { user } = useUser();
  const { currentTarotCard } = useTarotCard();
  const { currentAstrologicalChart } = usePlanetaryChart();
  const [transitConnection, setTransitConnection] = useState<{
    compact: string;
  } | null>(null);

  const hasPersonalTarotAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personal_tarot',
  );

  // Calculate transit connection for paid users with birth chart
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

    const aspects = calculateTransitAspects(
      user.birthChart as any,
      currentAstrologicalChart as any,
    );

    if (aspects.length === 0) {
      setTransitConnection(null);
      return;
    }

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

  // Free users: show their real card with blurred interpretation
  if (!hasPersonalTarotAccess) {
    return (
      <div className='p-5 border border-stone-800 rounded-md w-full h-full flex flex-col min-w-0 overflow-hidden min-h-64'>
        <div className='space-y-3 flex-1 min-w-0 overflow-y-auto overflow-x-hidden'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-bold'>Personal Tarot Card</h3>
            <span className='inline-flex items-center gap-1 rounded border border-lunary-primary-700/50 bg-lunary-primary-900/80 px-2 py-0.5 text-[10px] text-lunary-primary-300'>
              <Sparkles className='h-2.5 w-2.5' />
              Lunary+
            </span>
          </div>

          <div className='text-center'>
            <h4 className='mb-2 font-semibold text-lunary-accent-300'>
              {currentTarotCard?.name ?? '—'}
            </h4>
            <p className='mb-3 break-words text-xs text-zinc-400'>
              {currentTarotCard?.keywords?.slice(0, 3).join(' • ')}
            </p>
          </div>

          <div className='locked-preview'>
            <p className='locked-preview-text break-words text-sm leading-relaxed text-zinc-300'>
              {currentTarotCard?.information}
            </p>
          </div>

          <SmartTrialButton size='sm' />
        </div>
      </div>
    );
  }

  // Paid users: full personalised tarot with transit connection
  return (
    <div className='p-5 border border-stone-800 rounded-md w-full h-full flex flex-col min-w-0 overflow-hidden min-h-64'>
      <div className='space-y-3 flex-1 min-w-0 overflow-y-auto overflow-x-hidden'>
        <div className='flex items-center justify-between'>
          <h3 className='font-bold'>Personal Tarot Card</h3>
          <span className='text-xs text-lunary-accent'>Personalised</span>
        </div>

        <div className='text-center'>
          <h4 className='mb-3 font-semibold text-white'>
            {currentTarotCard.name}
          </h4>
          <p className='mb-3 break-words text-xs text-zinc-400'>
            {currentTarotCard.keywords.join(' • ')}
          </p>
        </div>

        <p className='break-words text-sm leading-relaxed text-zinc-300'>
          {currentTarotCard.information}
        </p>

        {transitConnection && (
          <div className='mt-2 border-t border-zinc-800 pt-2'>
            <p className='text-xs leading-relaxed text-lunary-accent-300'>
              {transitConnection.compact}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
