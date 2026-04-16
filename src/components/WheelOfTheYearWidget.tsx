'use client';

import { useState, useEffect } from 'react';
import { wheelOfTheYearSabbats } from '@/constants/sabbats';
import { getSpellsBySabbat } from '@/lib/spells';
import {
  getUpcomingSabbat,
  getSeasonalSabbat,
} from '@/lib/grimoire/data-accessor';

export const WheelOfTheYearWidget = () => {
  const [currentSabbat, setCurrentSabbat] = useState<string | null>(null);
  const [_nextSabbat, setNextSabbat] = useState<string | null>(null);
  const [_relevantSpells, setRelevantSpells] = useState<any[]>([]);

  useEffect(() => {
    const resolveSabbats = () => {
      const now = new Date();

      // Use the shared seasonal sabbat logic — matches how the rest of the
      // app (cosmic-recommender, spell API) decides what's "current". Only
      // treat as current if it's active (±7 days); recently-passed sabbats
      // are NOT shown as current here because the widget is a "what's
      // happening now" surface, not a retrospective.
      const seasonal = getSeasonalSabbat(now);
      const current =
        seasonal && Math.abs(seasonal.daysOffset) <= 7
          ? seasonal.sabbat.name
          : null;

      // Next upcoming sabbat (strictly after today).
      const upcoming = getUpcomingSabbat(now);
      const next = upcoming?.name ?? null;

      setCurrentSabbat(current);
      setNextSabbat(next);

      if (current) {
        const spells = getSpellsBySabbat(current);
        setRelevantSpells(spells.slice(0, 2));
      }
    };

    resolveSabbats();
  }, []);

  const getSabbatInfo = (sabbatName: string) => {
    return wheelOfTheYearSabbats.find((sabbat) => sabbat.name === sabbatName);
  };

  // Only show widget if there's a current sabbat happening soon
  if (!currentSabbat) {
    return null;
  }

  const displaySabbat = currentSabbat;
  const sabbatInfo = getSabbatInfo(displaySabbat);
  const _isApproaching = false;

  return (
    <div className='bg-gradient-to-br from-lunary-secondary-900/20 to-lunary-accent-900/20 rounded-lg p-4 border border-lunary-secondary-700'>
      <div className='flex items-center justify-between mb-1'>
        <h3 className='text-md text-content-brand-secondary'>
          Wheel of the Year
        </h3>
      </div>

      <div className='space-y-3'>
        <div>
          <div className='flex items-center gap-2 justify-between align-middle mb-2'>
            <div className='flex items-center gap-2'>
              <h4 className='text-content-brand-secondary'>Current Season</h4>
              <span className='text-sm text-lunary-secondary'>
                {displaySabbat}
              </span>
            </div>
            {sabbatInfo && (
              <p className='text-sm text-content-brand-secondary'>
                {sabbatInfo.date}
              </p>
            )}
          </div>

          {sabbatInfo && (
            <>
              <p className='text-xs text-content-brand-secondary leading-relaxed'>
                {sabbatInfo.description}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
