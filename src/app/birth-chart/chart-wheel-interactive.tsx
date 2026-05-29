'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { BirthChartData } from '../../../utils/astrology/birthChart';

// These chart widgets are heavy (motion-driven SVG, ~3k LOC combined) and sit
// below the hero on the marketing page. Lazy-load them so they stay out of the
// initial JS bundle and don't block first paint / interactivity.
const BirthChart = dynamic(
  () => import('@/components/BirthChart').then((m) => m.BirthChart),
  {
    ssr: false,
    loading: () => (
      <div className='h-80 w-full max-w-md rounded-lg bg-surface-elevated/50 animate-pulse' />
    ),
  },
);
const ChartControls = dynamic(
  () => import('@/components/ChartControls').then((m) => m.ChartControls),
  {
    ssr: false,
    loading: () => (
      <div className='h-10 w-full max-w-md rounded-lg bg-surface-elevated/40 animate-pulse' />
    ),
  },
);
// Only mounts when the visitor switches to the "Today's transits" tab.
const TransitScrubber = dynamic(
  () =>
    import('@/components/charts/TransitScrubber').then(
      (m) => m.TransitScrubber,
    ),
  {
    ssr: false,
    loading: () => (
      <div className='h-96 w-full max-w-md rounded-lg bg-surface-elevated/50 animate-pulse' />
    ),
  },
);

type HouseSystem =
  | 'placidus'
  | 'whole-sign'
  | 'koch'
  | 'porphyry'
  | 'alcabitius';

type ZodiacSystem = 'tropical' | 'sidereal' | 'equatorial';

export function ChartWheelInteractive({
  birthChart,
}: {
  birthChart: BirthChartData[];
}) {
  const [showAspects, setShowAspects] = useState(false);
  const [aspectFilter, setAspectFilter] = useState<
    'all' | 'harmonious' | 'challenging'
  >('all');
  const [showAsteroids, setShowAsteroids] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [clockwise, setClockwise] = useState(false);
  const [showSymbols, setShowSymbols] = useState(true);
  const [houseSystem, setHouseSystem] = useState<HouseSystem>('whole-sign');
  const [zodiacSystem, setZodiacSystem] = useState<ZodiacSystem>('tropical');
  const [view, setView] = useState<'natal' | 'transits'>('natal');

  return (
    <div className='flex flex-col items-center gap-4'>
      <div className='flex w-full max-w-md justify-center'>
        <div className='inline-flex rounded-full border border-stroke-subtle bg-surface-elevated/60 p-1 text-xs'>
          <button
            onClick={() => setView('natal')}
            className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
              view === 'natal'
                ? 'bg-lunary-primary text-white shadow-[0_0_10px_rgba(138,107,255,0.45)]'
                : 'text-content-muted hover:text-content-primary'
            }`}
          >
            Your chart
          </button>
          <button
            onClick={() => setView('transits')}
            className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
              view === 'transits'
                ? 'bg-lunary-primary text-white shadow-[0_0_10px_rgba(138,107,255,0.45)]'
                : 'text-content-muted hover:text-content-primary'
            }`}
          >
            + Today&apos;s transits
          </button>
        </div>
      </div>

      {view === 'transits' ? (
        <TransitScrubber birthChart={birthChart} />
      ) : (
        <>
          <ChartControls
            showAspects={showAspects}
            onToggleAspects={() => setShowAspects(!showAspects)}
            aspectFilter={aspectFilter}
            onAspectFilterChange={setAspectFilter}
            showAsteroids={showAsteroids}
            onToggleAsteroids={() => setShowAsteroids(!showAsteroids)}
            showPoints={showPoints}
            onTogglePoints={() => setShowPoints(!showPoints)}
            clockwise={clockwise}
            onToggleClockwise={() => setClockwise(!clockwise)}
            houseSystem={houseSystem}
            onHouseSystemChange={setHouseSystem}
            zodiacSystem={zodiacSystem}
            onZodiacSystemChange={setZodiacSystem}
          />
          <BirthChart
            birthChart={birthChart}
            showAspects={showAspects}
            aspectFilter={aspectFilter}
            showAsteroids={showAsteroids}
            showPoints={showPoints}
            clockwise={clockwise}
            showSymbols={showSymbols}
            onToggleSymbols={() => setShowSymbols(!showSymbols)}
            houseSystem={houseSystem}
            zodiacSystem={zodiacSystem}
          />
        </>
      )}
    </div>
  );
}
