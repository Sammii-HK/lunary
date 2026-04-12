'use client';

import { useState } from 'react';
import type { BirthChartData } from '../../../utils/astrology/birthChart';
import { BirthChart } from '@/components/BirthChart';
import { ChartControls } from '@/components/ChartControls';

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

  return (
    <div className='flex flex-col items-center gap-4'>
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
    </div>
  );
}
