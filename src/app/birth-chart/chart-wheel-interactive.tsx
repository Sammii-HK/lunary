'use client';

import { useState } from 'react';
import type { BirthChartData } from '../../../utils/astrology/birthChart';
import { BirthChart } from '@/components/BirthChart';
import { ChartControls } from '@/components/ChartControls';

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

  return (
    <div className='flex flex-col items-center gap-4'>
      <ChartControls
        showAspects={showAspects}
        onToggleAspects={() => setShowAspects(!showAspects)}
        aspectFilter={aspectFilter}
        onAspectFilterChange={setAspectFilter}
        showAsteroids={showAsteroids}
        onToggleAsteroids={() => setShowAsteroids(!showAsteroids)}
      />
      <BirthChart
        birthChart={birthChart}
        showAspects={showAspects}
        aspectFilter={aspectFilter}
        showAsteroids={showAsteroids}
      />
    </div>
  );
}
