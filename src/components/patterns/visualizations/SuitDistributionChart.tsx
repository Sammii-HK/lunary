'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer, Cell } from 'recharts';
import { getSuitColorHSL } from '@/lib/patterns/utils/suit-colors';
import type { SuitPattern } from '@/lib/patterns/tarot-pattern-types';
import { formatPercentage } from '@/lib/patterns/utils/pattern-formatters';

interface SuitDistributionChartProps {
  data: SuitPattern[];
}

export function SuitDistributionChart({ data }: SuitDistributionChartProps) {
  // Debug: Log what data we're receiving
  if (process.env.NODE_ENV === 'development') {
    console.log('[SuitDistributionChart] Received data:', data);
  }

  // Prepare chart data with colors - ONLY minor arcana suits (no Major Arcana)
  const suitsOnly = data.filter(
    (suit) => suit.count > 0 && suit.suit !== 'Major Arcana',
  );

  // Recalculate percentages to total 100% among suits only
  const totalSuitCards = suitsOnly.reduce((sum, suit) => sum + suit.count, 0);

  const chartData = suitsOnly
    .map((suit) => {
      const color = getSuitColorHSL(suit.suit as any);
      const recalculatedPercentage =
        totalSuitCards > 0 ? (suit.count / totalSuitCards) * 100 : 0;
      console.log(
        `[SuitDistributionChart] ${suit.suit} -> ${recalculatedPercentage.toFixed(1)}%`,
      );
      return {
        name: suit.suit,
        value: recalculatedPercentage,
        count: suit.count,
        fill: color,
      };
    })
    .sort((a, b) => b.value - a.value);

  // Add hidden scale reference point (value 100, but invisible)
  const chartDataWithScale = [
    ...chartData,
    {
      name: '_hidden_scale',
      value: 100,
      count: 0,
      fill: 'none', // Use 'none' instead of 'transparent'
    },
  ];

  if (chartData.length === 0) {
    return (
      <div className='flex items-center justify-center h-[250px] text-sm text-zinc-500'>
        No suit data available
      </div>
    );
  }

  // Show data quality warning if only one suit
  if (chartData.length === 1) {
    return (
      <div className='flex flex-col items-center justify-center h-[250px] p-4 text-center'>
        <p className='text-sm text-zinc-400 mb-2'>
          Only {chartData[0].name} cards detected ({chartData[0].count} cards)
        </p>
        <p className='text-xs text-zinc-500'>
          This may indicate incomplete pattern data
        </p>
      </div>
    );
  }

  return (
    <div className='w-full space-y-3'>
      <div className='h-[200px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <RadialBarChart
            cx='50%'
            cy='50%'
            innerRadius='20%'
            outerRadius='90%'
            data={chartDataWithScale}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              isAnimationActive={false}
              cornerRadius={6}
              {...({
                minAngle: 15,
                background: { fill: 'rgba(255, 255, 255, 0.05)' },
                clockWise: true,
                dataKey: 'value',
              } as any)}
            >
              {chartDataWithScale.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.name === '_hidden_scale' ? 'transparent' : entry.fill
                  }
                  fillOpacity={entry.name === '_hidden_scale' ? 0 : 1}
                  stroke={
                    entry.name === '_hidden_scale' ? 'transparent' : undefined
                  }
                  strokeOpacity={entry.name === '_hidden_scale' ? 0 : 1}
                />
              ))}
            </RadialBar>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend below chart - exclude hidden scale point */}
      <div className='flex flex-wrap gap-x-4 gap-y-2 justify-center'>
        {chartData
          .filter((item) => !item.name.startsWith('_hidden'))
          .map((item) => (
            <div key={item.name} className='flex items-center gap-2'>
              <div
                className='w-3 h-3 rounded-full'
                style={{ backgroundColor: item.fill }}
              />
              <span className='text-xs text-zinc-300'>
                {item.name} ({formatPercentage(item.value)})
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
