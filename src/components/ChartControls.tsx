'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

type HouseSystem =
  | 'placidus'
  | 'whole-sign'
  | 'koch'
  | 'porphyry'
  | 'alcabitius';

type ZodiacSystem = 'tropical' | 'sidereal' | 'equatorial';

interface ChartControlsProps {
  showAspects: boolean;
  onToggleAspects: () => void;
  aspectFilter: 'all' | 'harmonious' | 'challenging';
  onAspectFilterChange: (filter: 'all' | 'harmonious' | 'challenging') => void;
  showAsteroids: boolean;
  onToggleAsteroids: () => void;
  showPoints?: boolean;
  onTogglePoints?: () => void;
  clockwise?: boolean;
  onToggleClockwise?: () => void;
  houseSystem?: HouseSystem;
  onHouseSystemChange?: (system: HouseSystem) => void;
  zodiacSystem?: ZodiacSystem;
  onZodiacSystemChange?: (system: ZodiacSystem) => void;
  isFreeTier?: boolean;
  freeTierSwitchesRemaining?: number;
}

type ChipFilter = 'all' | 'harmonious' | 'challenging';

const CHIPS: Array<{
  value: ChipFilter;
  label: string;
  glyph: string;
  color: string;
}> = [
  { value: 'all', label: 'All', glyph: '✦', color: '#c8b4ff' },
  { value: 'harmonious', label: 'Harmonious', glyph: '△', color: '#7BFFB8' },
  { value: 'challenging', label: 'Challenging', glyph: '□', color: '#f87171' },
];

export function ChartControls({
  showAspects,
  onToggleAspects,
  aspectFilter,
  onAspectFilterChange,
  showAsteroids,
  onToggleAsteroids,
  showPoints = true,
  onTogglePoints,
  clockwise = false,
  onToggleClockwise,
  houseSystem = 'placidus',
  onHouseSystemChange,
  zodiacSystem = 'tropical',
  onZodiacSystemChange,
  isFreeTier = false,
  freeTierSwitchesRemaining = 3,
}: ChartControlsProps) {
  const houseSystemLabels: Record<HouseSystem, string> = {
    placidus: 'Placidus',
    'whole-sign': 'Whole Sign',
    koch: 'Koch',
    porphyry: 'Porphyry',
    alcabitius: 'Alcabitius',
  };

  const zodiacSystemLabels: Record<ZodiacSystem, string> = {
    tropical: 'Tropical',
    sidereal: 'Sidereal',
    equatorial: 'Equatorial',
  };

  return (
    <div className='flex flex-col items-center gap-3'>
      <div className='flex flex-wrap gap-2 items-center justify-center'>
        <Button onClick={onToggleAspects} variant='lunary-soft' size='sm'>
          {showAspects ? 'Hide Aspects' : 'Show Aspects'}
        </Button>
        <Button onClick={onToggleAsteroids} variant='lunary-soft' size='sm'>
          {showAsteroids ? 'Hide Asteroids' : 'Show Asteroids'}
        </Button>
        {onTogglePoints && (
          <Button onClick={onTogglePoints} variant='lunary-soft' size='sm'>
            {showPoints ? 'Hide Points' : 'Show Points'}
          </Button>
        )}
        {onToggleClockwise && (
          <Button onClick={onToggleClockwise} variant='lunary-soft' size='sm'>
            {clockwise ? 'Counter-Clockwise' : 'Clockwise'}
          </Button>
        )}
      </div>

      {showAspects && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex flex-wrap items-center justify-center gap-1.5'
        >
          {CHIPS.map((c) => {
            const active = aspectFilter === c.value;
            return (
              <motion.button
                key={c.value}
                onClick={() => onAspectFilterChange(c.value)}
                whileTap={{ scale: 0.94 }}
                className='flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors'
                style={
                  active
                    ? {
                        backgroundColor: `${c.color}22`,
                        borderColor: `${c.color}88`,
                        color: c.color,
                      }
                    : {
                        backgroundColor: 'transparent',
                        borderColor: 'var(--color-stroke-subtle, #3f3f46)',
                        color: 'var(--color-content-muted, #a1a1aa)',
                      }
                }
              >
                <span className='text-sm leading-none'>{c.glyph}</span>
                {c.label}
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {onHouseSystemChange && (
        <div className='flex flex-col gap-2 w-full'>
          <span className='text-xs text-content-muted text-center'>
            House System
            {isFreeTier && freeTierSwitchesRemaining <= 0
              ? ' (limit reached today)'
              : isFreeTier
                ? ` (${freeTierSwitchesRemaining} switch${freeTierSwitchesRemaining === 1 ? '' : 'es'} left today)`
                : ''}
          </span>
          <div className='flex flex-wrap gap-2 justify-center'>
            {(
              [
                'placidus',
                'whole-sign',
                'koch',
                'porphyry',
                'alcabitius',
              ] as HouseSystem[]
            ).map((system) => {
              const isActive = houseSystem === system;
              const isLocked =
                isFreeTier && !isActive && freeTierSwitchesRemaining <= 0;
              return (
                <Button
                  key={system}
                  onClick={() => !isLocked && onHouseSystemChange(system)}
                  variant={isActive ? 'lunary-soft' : 'ghost'}
                  size='xs'
                  disabled={isLocked}
                >
                  {houseSystemLabels[system]}
                  {isActive && ' ✓'}
                </Button>
              );
            })}
          </div>
        </div>
      )}
      {onZodiacSystemChange && (
        <div className='flex flex-col gap-2 w-full'>
          <span className='text-xs text-content-muted text-center'>
            Zodiac System
          </span>
          <div className='flex flex-wrap gap-2 justify-center'>
            {(['tropical', 'sidereal', 'equatorial'] as ZodiacSystem[]).map(
              (system) => (
                <Button
                  key={system}
                  onClick={() => onZodiacSystemChange(system)}
                  variant={zodiacSystem === system ? 'lunary-soft' : 'ghost'}
                  size='xs'
                >
                  {zodiacSystemLabels[system]}
                  {zodiacSystem === system && ' ✓'}
                </Button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
