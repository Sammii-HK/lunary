'use client';

import { Button } from '@/components/ui/button';
import { InfoBottomSheet } from '@/components/ui/InfoBottomSheet';
import { Settings2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const DENSITY_SEEN_KEY = 'chart-density-seen-v1';
const DENSITY_BADGE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type HouseSystem =
  | 'placidus'
  | 'whole-sign'
  | 'koch'
  | 'porphyry'
  | 'alcabitius';

type ZodiacSystem = 'tropical' | 'sidereal' | 'equatorial';
type ChartDensityMode = 'guided' | 'pro' | 'custom';

interface ChartControlsProps {
  chartDensityMode?: ChartDensityMode;
  onChartDensityModeChange?: (
    mode: Exclude<ChartDensityMode, 'custom'>,
  ) => void;
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
  /**
   * Optional slot rendered at the top of the Chart Settings sheet (e.g.
   * `ChartModeToggle`). Folded into the sheet to keep the area above the
   * wheel compact on mobile.
   */
  sheetTopSlot?: ReactNode;
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
  chartDensityMode = 'custom',
  onChartDensityModeChange,
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
  sheetTopSlot,
}: ChartControlsProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showDensityBadge, setShowDensityBadge] = useState(false);

  useEffect(() => {
    if (!onChartDensityModeChange) return;
    if (typeof window === 'undefined') return;
    try {
      const seenAtRaw = window.localStorage.getItem(DENSITY_SEEN_KEY);
      if (!seenAtRaw) {
        setShowDensityBadge(true);
        return;
      }
      const seenAt = Number(seenAtRaw);
      if (
        !Number.isFinite(seenAt) ||
        Date.now() - seenAt < DENSITY_BADGE_TTL_MS
      ) {
        // Recently seen, keep hidden
        setShowDensityBadge(false);
      } else {
        setShowDensityBadge(false);
      }
    } catch {
      // localStorage unavailable, fail silent, no badge
    }
  }, [onChartDensityModeChange]);

  const dismissDensityBadge = () => {
    if (!showDensityBadge) return;
    setShowDensityBadge(false);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(DENSITY_SEEN_KEY, String(Date.now()));
    } catch {
      // Ignore, UI already hidden for this session
    }
  };

  const handleDensityModeClick = (
    mode: Exclude<ChartDensityMode, 'custom'>,
  ) => {
    dismissDensityBadge();
    onChartDensityModeChange?.(mode);
  };

  const densityModes: Array<{
    value: ChartDensityMode;
    label: string;
    selectable: boolean;
  }> = [
    { value: 'guided', label: 'Beginner', selectable: true },
    { value: 'pro', label: 'Pro', selectable: true },
    { value: 'custom', label: 'Custom', selectable: false },
  ];

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

  const hasSheetContent = Boolean(
    sheetTopSlot || onHouseSystemChange || onZodiacSystemChange,
  );

  return (
    <div className='flex flex-col items-center gap-3'>
      {onChartDensityModeChange && (
        <div className='relative w-full max-w-md rounded-2xl border border-stroke-subtle bg-surface-elevated/80 p-3 shadow-sm backdrop-blur'>
          {showDensityBadge && (
            <span
              aria-hidden='true'
              className='pointer-events-none absolute -top-2 -right-2 inline-flex items-center gap-1 rounded-full bg-lunary-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-lunary-primary/40'
            >
              <Sparkles className='h-2.5 w-2.5' />
              New
            </span>
          )}
          <div className='mb-2 flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2 text-content-primary'>
              <Sparkles className='h-4 w-4 text-content-brand' />
              <span className='text-sm font-semibold'>Reading mode</span>
            </div>
            {hasSheetContent && (
              <button
                type='button'
                onClick={() => setSettingsOpen(true)}
                aria-label='Open chart settings'
                className='shrink-0 rounded-xl border border-stroke-subtle bg-surface-card/70 p-2 text-content-secondary transition-colors hover:bg-surface-overlay/60 hover:text-content-primary'
              >
                <Settings2 className='h-4 w-4' />
              </button>
            )}
          </div>
          <div
            role='radiogroup'
            aria-label='Reading mode'
            className='flex items-center gap-2'
          >
            {densityModes.map(({ value, label, selectable }) => {
              const active = chartDensityMode === value;
              const isInteractive = selectable;
              return (
                <button
                  key={value}
                  type='button'
                  role='radio'
                  aria-checked={active}
                  aria-disabled={!isInteractive}
                  tabIndex={isInteractive ? 0 : -1}
                  onClick={
                    isInteractive
                      ? () =>
                          handleDensityModeClick(
                            value as Exclude<ChartDensityMode, 'custom'>,
                          )
                      : undefined
                  }
                  title={
                    isInteractive
                      ? undefined
                      : 'Custom lights up automatically when you change individual chart switches.'
                  }
                  className={cn(
                    'flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors',
                    active
                      ? 'border-lunary-primary/60 bg-lunary-primary/15 text-content-primary shadow-inner shadow-lunary-primary/20'
                      : 'border-stroke-subtle bg-surface-card/70 text-content-secondary hover:bg-surface-overlay/60 hover:text-content-primary',
                    !isInteractive && !active && 'cursor-default opacity-70',
                    !isInteractive && 'cursor-default',
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className='mt-2 text-xs leading-relaxed text-content-muted'>
            {chartDensityMode === 'pro'
              ? 'Pro shows aspects, asteroids, and points for the full reading.'
              : chartDensityMode === 'guided'
                ? 'Beginner hides aspects, asteroids, and points. Tap Pro for everything.'
                : 'Custom: your manual switches drift from the presets.'}
          </p>
        </div>
      )}

      {!onChartDensityModeChange && hasSheetContent && (
        <Button
          onClick={() => setSettingsOpen(true)}
          variant='ghost'
          size='sm'
          aria-label='Open chart settings'
        >
          <Settings2 className='h-4 w-4' />
          Chart settings
        </Button>
      )}

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
                        borderColor: 'rgb(var(--stroke-subtle, 63 63 70))',
                        color: 'rgb(var(--content-muted, 113 113 122))',
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

      {hasSheetContent && (
        <InfoBottomSheet
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          title='Chart settings'
          subtitle='Switch chart mode, house system, and zodiac.'
          leading={<Settings2 className='h-5 w-5' />}
        >
          <div className='flex flex-col gap-5'>
            {sheetTopSlot && (
              <div className='flex flex-col gap-2'>
                <span className='text-xs font-medium uppercase tracking-[0.18em] text-content-muted'>
                  Chart mode
                </span>
                <div className='flex justify-start'>{sheetTopSlot}</div>
              </div>
            )}

            {onHouseSystemChange && (
              <div className='flex flex-col gap-2'>
                <span className='text-xs font-medium uppercase tracking-[0.18em] text-content-muted'>
                  House system
                  {isFreeTier && freeTierSwitchesRemaining <= 0
                    ? ' (limit reached today)'
                    : isFreeTier
                      ? ` (${freeTierSwitchesRemaining} switch${freeTierSwitchesRemaining === 1 ? '' : 'es'} left today)`
                      : ''}
                </span>
                <div className='flex flex-wrap gap-2'>
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
              <div className='flex flex-col gap-2'>
                <span className='text-xs font-medium uppercase tracking-[0.18em] text-content-muted'>
                  Zodiac system
                </span>
                <div className='flex flex-wrap gap-2'>
                  {(
                    ['tropical', 'sidereal', 'equatorial'] as ZodiacSystem[]
                  ).map((system) => (
                    <Button
                      key={system}
                      onClick={() => onZodiacSystemChange(system)}
                      variant={
                        zodiacSystem === system ? 'lunary-soft' : 'ghost'
                      }
                      size='xs'
                    >
                      {zodiacSystemLabels[system]}
                      {zodiacSystem === system && ' ✓'}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </InfoBottomSheet>
      )}
    </div>
  );
}
