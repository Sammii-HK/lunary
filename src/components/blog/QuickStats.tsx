// Quick stats summary component for blog posts
// Shows key week highlights at a glance

import Image from 'next/image';
import {
  getPlanetSymbol,
  getZodiacSymbol,
  getMoonPhaseIcon,
} from '@/constants/symbols';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Moon, Sparkles, Calendar } from 'lucide-react';

interface QuickStatsProps {
  retrogradeCount: number;
  retrogradePlanets?: string[];
  majorMoonPhase?: {
    phase: string;
    sign: string;
  };
  bestDay?: {
    day: string;
    reason: string;
  };
  planetaryHighlightCount: number;
  aspectCount: number;
}

export function QuickStats({
  retrogradeCount,
  retrogradePlanets = [],
  majorMoonPhase,
  bestDay,
  planetaryHighlightCount,
  aspectCount,
}: QuickStatsProps) {
  return (
    <div className='rounded-xl border border-zinc-800 bg-gradient-to-r from-zinc-900/80 to-zinc-900/40 p-4 mb-8'>
      <div className='flex flex-wrap items-center justify-center gap-4 md:gap-6'>
        {/* Retrograde Alert */}
        {retrogradeCount > 0 && (
          <div className='flex items-center gap-2 text-amber-400'>
            <AlertTriangle className='h-4 w-4' />
            <span className='text-sm font-medium'>
              {retrogradeCount} Retrograde{retrogradeCount > 1 ? 's' : ''}
            </span>
            {retrogradePlanets.length > 0 && (
              <span className='text-xs text-zinc-400'>
                ({retrogradePlanets.map((p) => getPlanetSymbol(p)).join(' ')})
              </span>
            )}
          </div>
        )}

        {/* Moon Phase */}
        {majorMoonPhase && (
          <div className='flex items-center gap-2 text-zinc-200'>
            <Image
              src={getMoonPhaseIcon(majorMoonPhase.phase)}
              alt={majorMoonPhase.phase}
              width={20}
              height={20}
              className='opacity-90'
            />
            <span className='text-sm'>
              {majorMoonPhase.phase} in {getZodiacSymbol(majorMoonPhase.sign)}{' '}
              {majorMoonPhase.sign}
            </span>
          </div>
        )}

        {/* Planetary Events */}
        {planetaryHighlightCount > 0 && (
          <div className='flex items-center gap-2 text-purple-400'>
            <Sparkles className='h-4 w-4' />
            <span className='text-sm'>
              {planetaryHighlightCount} Planetary Event
              {planetaryHighlightCount > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Aspects */}
        {aspectCount > 0 && (
          <div className='flex items-center gap-2 text-teal-400'>
            <Moon className='h-4 w-4' />
            <span className='text-sm'>
              {aspectCount} Major Aspect{aspectCount > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Best Day */}
        {bestDay && (
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 text-emerald-400' />
            <span className='text-sm text-zinc-300'>
              Best day:{' '}
              <Badge
                variant='outline'
                className='ml-1 border-emerald-600 text-emerald-400'
              >
                {bestDay.day}
              </Badge>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Energy indicator component for showing intensity levels
interface EnergyIndicatorProps {
  level: 1 | 2 | 3 | 4 | 5;
  label?: string;
}

export function EnergyIndicator({ level, label }: EnergyIndicatorProps) {
  const colors = {
    1: 'bg-zinc-600',
    2: 'bg-emerald-600',
    3: 'bg-yellow-500',
    4: 'bg-orange-500',
    5: 'bg-red-500',
  };

  const labels = {
    1: 'Quiet',
    2: 'Gentle',
    3: 'Active',
    4: 'Intense',
    5: 'Powerful',
  };

  return (
    <div className='flex items-center gap-2'>
      <div className='flex gap-0.5'>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-2 w-1.5 rounded-sm ${
              i <= level ? colors[level] : 'bg-zinc-800'
            }`}
          />
        ))}
      </div>
      <span className='text-xs text-zinc-400'>{label || labels[level]}</span>
    </div>
  );
}

// Aspect nature badge with color coding
interface AspectNatureBadgeProps {
  aspect: string;
  showLabel?: boolean;
}

export function AspectNatureBadge({
  aspect,
  showLabel = true,
}: AspectNatureBadgeProps) {
  const aspectNature: Record<string, { color: string; label: string }> = {
    conjunction: {
      color: 'bg-purple-600/20 text-purple-300 border-purple-600/40',
      label: 'Powerful',
    },
    trine: {
      color: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/40',
      label: 'Flowing',
    },
    sextile: {
      color: 'bg-teal-600/20 text-teal-300 border-teal-600/40',
      label: 'Opportunity',
    },
    square: {
      color: 'bg-orange-600/20 text-orange-300 border-orange-600/40',
      label: 'Dynamic',
    },
    opposition: {
      color: 'bg-amber-600/20 text-amber-300 border-amber-600/40',
      label: 'Awareness',
    },
  };

  const nature = aspectNature[aspect.toLowerCase()] || {
    color: 'bg-zinc-600/20 text-zinc-300 border-zinc-600/40',
    label: aspect,
  };

  return (
    <Badge variant='outline' className={`${nature.color} text-xs`}>
      {showLabel ? nature.label : aspect}
    </Badge>
  );
}
