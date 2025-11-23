'use client';

import { useEffect, useState } from 'react';
import { Cloud } from 'lucide-react';
import { useAuthStatus } from './AuthStatus';
import { useAstronomyContext } from '@/context/AstronomyContext';

interface CosmicWeather {
  moonPhase: string;
  moonSign: string;
  mainTransit?: string;
}

export function QuickCosmicWeather() {
  const authState = useAuthStatus();
  const { currentMoonPhase, currentMoonConstellationPosition } =
    useAstronomyContext();
  const [weather, setWeather] = useState<CosmicWeather | null>(null);

  useEffect(() => {
    const loadTransits = async () => {
      if (!currentMoonPhase || !currentMoonConstellationPosition) return;

      try {
        const response = await fetch('/api/cosmic/snapshot', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          const transits = data.snapshot?.currentTransits || [];

          // Find the strongest transit (conjunction, opposition, or square)
          const significantTransit =
            transits.find(
              (t: any) =>
                ['conjunction', 'opposition', 'square'].includes(t.aspect) &&
                t.strength > 0.7,
            ) || transits[0];

          const mainTransit = significantTransit
            ? `${significantTransit.from} ${significantTransit.aspect} ${significantTransit.to}`
            : undefined;

          setWeather({
            moonPhase: currentMoonPhase,
            moonSign: currentMoonConstellationPosition,
            mainTransit,
          });
        } else {
          setWeather({
            moonPhase: currentMoonPhase,
            moonSign: currentMoonConstellationPosition,
          });
        }
      } catch (error) {
        setWeather({
          moonPhase: currentMoonPhase,
          moonSign: currentMoonConstellationPosition,
        });
      }
    };

    if (currentMoonPhase && currentMoonConstellationPosition) {
      loadTransits();
    }
  }, [currentMoonPhase, currentMoonConstellationPosition]);

  if (!authState.isAuthenticated || !weather) {
    return null;
  }

  return (
    <div className='w-full rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-4'>
      <div className='flex items-center gap-3'>
        <div className='rounded-lg bg-purple-500/20 p-2'>
          <Cloud className='w-5 h-5 text-purple-400' />
        </div>
        <div className='flex-1'>
          <h3 className='text-sm font-semibold text-zinc-100 mb-0.5'>
            Cosmic Weather
          </h3>
          <p className='text-xs text-zinc-300 mb-1'>
            {weather.moonPhase} in {weather.moonSign}
          </p>
          {weather.mainTransit && (
            <p className='text-xs text-zinc-400 leading-relaxed'>
              {weather.mainTransit}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
