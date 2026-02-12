'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getCurrentRetrogradeStatus,
  getActiveRetrogradeSpaceSlug,
  type RetrogradeStatus,
} from '@/lib/retrograde/mercury-periods';
import { RetrogradeSurvivalKit } from './RetrogradeSurvivalKit';

interface RetrogradePlanet {
  name: string;
  sign: string;
}

interface RetrogradeBannerProps {
  className?: string;
}

/**
 * Dashboard banner for retrograde planets.
 * Fetches real planetary data from /api/cosmic/global to show ALL retrograde planets.
 * Mercury gets the full survival kit treatment; others get a compact listing.
 */
export function RetrogradeBanner({ className }: RetrogradeBannerProps) {
  const [mercuryStatus, setMercuryStatus] = useState<RetrogradeStatus | null>(
    null,
  );
  const [spaceSlug, setSpaceSlug] = useState<string | null>(null);
  const [otherRetrogrades, setOtherRetrogrades] = useState<RetrogradePlanet[]>(
    [],
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Mercury status from hardcoded periods (for survival kit day count)
    const rxStatus = getCurrentRetrogradeStatus();
    setMercuryStatus(rxStatus);
    if (rxStatus.isActive) {
      setSpaceSlug(getActiveRetrogradeSpaceSlug());
    }

    // Fetch all planetary retrogrades from cosmic data
    fetch('/api/cosmic/global')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.planetaryPositions) return;
        const retros: RetrogradePlanet[] = [];
        for (const [planet, pos] of Object.entries(data.planetaryPositions)) {
          if (
            (pos as { retrograde: boolean }).retrograde &&
            planet !== 'Mercury'
          ) {
            retros.push({ name: planet, sign: (pos as { sign: string }).sign });
          }
        }
        setOtherRetrogrades(retros);
      })
      .catch(() => {
        // Silent fail — Mercury-only mode
      })
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return null;

  const isMercuryRx = mercuryStatus?.isActive;
  const hasOtherRetrogrades = otherRetrogrades.length > 0;

  // Nothing retrograde at all — hide the banner
  if (!isMercuryRx && !hasOtherRetrogrades) return null;

  const mercuryTotalDays = mercuryStatus?.period
    ? Math.floor(
        (new Date(mercuryStatus.period.endDate).getTime() -
          new Date(mercuryStatus.period.startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1
    : 21;

  const mercuryProgress = isMercuryRx
    ? Math.min(
        ((mercuryStatus?.survivalDays ?? 0) / mercuryTotalDays) * 100,
        100,
      )
    : 0;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Mercury Retrograde — full treatment */}
      {isMercuryRx && (
        <div className='rounded-xl border border-amber-700/50 bg-gradient-to-r from-amber-950/60 to-orange-950/40 p-4'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex items-center gap-2'>
              <AlertTriangle className='w-5 h-5 text-amber-400 flex-shrink-0' />
              <div>
                <h3 className='text-sm font-semibold text-amber-200'>
                  Mercury Retrograde
                  {mercuryStatus?.period?.sign
                    ? ` in ${mercuryStatus.period.sign}`
                    : ''}
                </h3>
                <p className='text-xs text-amber-300/70 mt-0.5'>
                  Day {mercuryStatus?.survivalDays} of {mercuryTotalDays}
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className='mt-3'>
            <div className='h-1.5 bg-amber-950/50 rounded-full overflow-hidden'>
              <div
                className='h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 rounded-full'
                style={{ width: `${mercuryProgress}%` }}
              />
            </div>
          </div>

          {/* CTA to check-in space */}
          {spaceSlug && (
            <Link
              href={`/community/${spaceSlug}`}
              className='flex items-center justify-between mt-3 px-3 py-2 rounded-lg bg-amber-900/30 border border-amber-800/40 hover:bg-amber-900/50 transition-colors group'
            >
              <span className='text-xs text-amber-200'>
                Join the Mercury Rx check-in
              </span>
              <ArrowRight className='w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform' />
            </Link>
          )}
        </div>
      )}

      {/* Other retrograde planets — compact listing */}
      {hasOtherRetrogrades && (
        <div className='rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4'>
          <div className='flex items-center gap-2 mb-2.5'>
            <RotateCcw className='w-4 h-4 text-zinc-400' />
            <span className='text-xs font-medium text-zinc-400 uppercase tracking-wide'>
              Also retrograde
            </span>
          </div>
          <div className='flex flex-wrap gap-2'>
            {otherRetrogrades.map((planet) => (
              <span
                key={planet.name}
                className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-zinc-800/50 border border-zinc-700/40 text-zinc-300'
              >
                <RotateCcw className='w-3 h-3 text-zinc-500' />
                <span className='font-medium'>{planet.name}</span>
                <span className='text-zinc-500'>in {planet.sign}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Survival Kit — Mercury only */}
      {isMercuryRx && mercuryStatus?.survivalDays && (
        <RetrogradeSurvivalKit dayNumber={mercuryStatus.survivalDays} />
      )}
    </div>
  );
}
