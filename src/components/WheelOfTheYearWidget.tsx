'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { wheelOfTheYearSabbats } from '@/constants/sabbats';
import { getSpellsBySabbat } from '@/constants/spells';
import dayjs from 'dayjs';

export const WheelOfTheYearWidget = () => {
  const [currentSabbat, setCurrentSabbat] = useState<string | null>(null);
  const [nextSabbat, setNextSabbat] = useState<string | null>(null);
  const [relevantSpells, setRelevantSpells] = useState<any[]>([]);

  useEffect(() => {
    const getCurrentSabbat = () => {
      const now = dayjs();
      const currentMonth = now.month() + 1;
      const currentDay = now.date();

      // Define date ranges for each sabbat
      const sabbatDates = [
        { name: 'Samhain', month: 10, day: 31, season: 'autumn' },
        { name: 'Yule', month: 12, day: 21, season: 'winter' },
        { name: 'Imbolc', month: 2, day: 1, season: 'winter' },
        { name: 'Ostara', month: 3, day: 21, season: 'spring' },
        { name: 'Beltane', month: 5, day: 1, season: 'spring' },
        { name: 'Litha', month: 6, day: 21, season: 'summer' },
        { name: 'Lammas or Lughnasadh', month: 8, day: 1, season: 'summer' },
        { name: 'Mabon', month: 9, day: 21, season: 'autumn' },
      ];

      // Find current or approaching sabbat
      let current = null;
      let next = null;

      for (let i = 0; i < sabbatDates.length; i++) {
        const sabbat = sabbatDates[i];
        const sabbatDate = dayjs()
          .month(sabbat.month - 1)
          .date(sabbat.day);

        // Check if we're within 7 days of this sabbat
        const daysDiff = sabbatDate.diff(now, 'days');

        if (Math.abs(daysDiff) <= 7) {
          current = sabbat.name;
          break;
        }

        // Find next upcoming sabbat
        if (daysDiff > 0 && !next) {
          next = sabbat.name;
        }
      }

      // If no next sabbat found in this year, use first sabbat of next year
      if (!next) {
        next = sabbatDates[0].name;
      }

      setCurrentSabbat(current);
      setNextSabbat(next);

      // Get relevant spells for current sabbat
      if (current) {
        const spells = getSpellsBySabbat(current);
        setRelevantSpells(spells.slice(0, 2)); // Show top 2 spells
      }
    };

    getCurrentSabbat();
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
  const isApproaching = false;

  return (
    <div className='bg-gradient-to-br from-orange-900/20 to-yellow-900/20 rounded-lg p-4 border border-orange-700/30'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-lg font-semibold text-orange-300'>
          Wheel of the Year
        </h3>
      </div>

      <div className='space-y-3'>
        <div>
          <div className='flex items-center gap-2 mb-1'>
            <h4 className='font-medium text-orange-200'>Current Season</h4>
            <span className='text-sm text-orange-400'>{displaySabbat}</span>
          </div>

          {sabbatInfo && (
            <>
              <p className='text-sm text-orange-100 mb-2'>{sabbatInfo.date}</p>
              <p className='text-xs text-orange-200 leading-relaxed'>
                {sabbatInfo.description}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
