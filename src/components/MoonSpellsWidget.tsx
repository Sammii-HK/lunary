'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMoonPhase, MoonPhaseLabels } from '../../utils/moon/moonPhases';
import {
  getSpellsByMoonPhase,
  spellCategories,
  Spell,
} from '@/constants/spells';
import { ChevronDown, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';

export const MoonSpellsWidget = () => {
  const [currentMoonPhase, setCurrentMoonPhase] =
    useState<MoonPhaseLabels | null>(null);
  const [moonSpells, setMoonSpells] = useState<Spell[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const now = new Date();
    const phase = getMoonPhase(now);
    setCurrentMoonPhase(phase);

    const spells = getSpellsByMoonPhase(phase);
    setMoonSpells(spells.slice(0, 3)); // Show top 3 spells
  }, []);

  const getMoonPhaseDescription = (phase: MoonPhaseLabels) => {
    const descriptions: { [key: string]: string } = {
      'New Moon':
        'Perfect for new beginnings, setting intentions, and cleansing work',
      'Waxing Crescent':
        'Ideal for attraction spells, growth, and building energy',
      'First Quarter':
        'Time for taking action, overcoming obstacles, and decision-making',
      'Waxing Gibbous':
        'Focus on refinement, adjustment, and manifestation work',
      'Full Moon': 'Peak power for all magical work, healing, and divination',
      'Waning Gibbous':
        'Perfect for gratitude, sharing wisdom, and gentle release',
      'Last Quarter':
        'Time for banishing, breaking habits, and major release work',
      'Waning Crescent': 'Deep cleansing, rest, and preparation for new cycles',
    };
    return (
      descriptions[phase] || 'A time for magical work aligned with lunar energy'
    );
  };

  if (!currentMoonPhase) {
    return null;
  }

  return (
    <div className='bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-lg p-4 border border-indigo-700/30'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-lg font-semibold text-indigo-300'>
          {currentMoonPhase} Spells
        </h3>
        <Link
          href='/grimoire?item=moon'
          className='text-xs text-indigo-400 hover:text-indigo-300 transition-colors'
        >
          Moon Phases →
        </Link>
      </div>

      <div className='space-y-3'>
        <div>
          <p className='text-xs text-indigo-200 leading-relaxed'>
            {getMoonPhaseDescription(currentMoonPhase)}
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='w-full flex items-center justify-between text-sm font-medium text-purple-300 hover:text-purple-200 transition-colors py-2'
          >
            <span>Recommended for This Moon Phase</span>
            {isExpanded ? (
              <ChevronDown className='w-4 h-4' />
            ) : (
              <ChevronRight className='w-4 h-4' />
            )}
          </button>

          {isExpanded && (
            <div className='space-y-3 mt-2'>
              {moonSpells.length > 0 ? (
                <div className='space-y-2'>
                  {moonSpells.map((spell) => (
                    <Link
                      key={spell.id}
                      href={`/grimoire/spells/${spell.id}`}
                      className='block text-xs text-purple-200 hover:text-purple-100 transition-colors p-2 bg-purple-900/20 rounded border border-purple-800/30 hover:border-purple-700/50'
                    >
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='font-medium'>{spell.title}</span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-purple-300/80'>
                          {spell.type.replace('_', ' ')}
                        </span>
                        <span className='text-xs bg-purple-800/40 text-purple-300 px-2 py-0.5 rounded'>
                          {spell.difficulty}
                        </span>
                      </div>
                      <p className='text-purple-300/80 mt-1'>
                        {spell.purpose.slice(0, 60)}...
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className='text-center py-3'>
                  <p className='text-sm text-indigo-300 mb-2'>
                    No specific spells for this moon phase yet
                  </p>
                  <p className='text-xs text-indigo-400'>
                    This is still a powerful time for general magical work!
                  </p>
                </div>
              )}

              <div className='flex gap-2'>
                <Link
                  href='/grimoire?item=practices'
                  className='flex-1 text-center text-xs bg-indigo-700/30 hover:bg-indigo-700/50 text-indigo-200 px-3 py-2 rounded transition-colors border border-indigo-600/30'
                >
                  All Spells
                </Link>
                <Link
                  href='/grimoire?item=moon'
                  className='flex-1 text-center text-xs bg-purple-700/30 hover:bg-purple-700/50 text-purple-200 px-3 py-2 rounded transition-colors border border-purple-600/30'
                >
                  Moon Guide
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
