'use client';

import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from 'recharts';
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

  // Prepare chart data with colors
  const chartData = data
    .filter((suit) => suit.count > 0)
    .map((suit, index) => {
      const color = getSuitColorHSL(suit.suit as any);
      console.log(`[SuitDistributionChart] ${suit.suit} -> ${color}`);
      return {
        name: suit.suit,
        value: suit.percentage,
        count: suit.count,
        fill: color,
      };
    })
    .sort((a, b) => b.value - a.value);

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
    <div className='w-full h-[250px]'>
      <ResponsiveContainer width='100%' height='100%'>
        <RadialBarChart
          cx='50%'
          cy='50%'
          innerRadius='20%'
          outerRadius='90%'
          data={chartData}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            isAnimationActive={false}
            {...({
              minAngle: 15,
              background: { fill: 'rgba(255, 255, 255, 0.05)' },
              clockWise: true,
              dataKey: 'value',
            } as any)}
          />
          <Legend
            iconSize={8}
            layout='vertical'
            verticalAlign='middle'
            align='right'
            wrapperStyle={{ paddingLeft: '20px' }}
            formatter={(value, entry: any) => {
              const color = entry.color || entry.payload?.fill || '#8458D8';
              return (
                <span className='text-xs text-zinc-300'>
                  {value} ({formatPercentage(entry.payload?.value || 0)})
                </span>
              );
            }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
