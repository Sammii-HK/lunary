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
  // Prepare chart data with colors
  const chartData = data
    .filter((suit) => suit.count > 0)
    .map((suit) => ({
      name: suit.suit,
      value: suit.percentage,
      fill: getSuitColorHSL(suit.suit as any),
    }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <div className='flex items-center justify-center h-[250px] text-sm text-zinc-500'>
        No suit data available
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
            {...({
              minAngle: 15,
              label: { position: 'insideStart', fill: '#fff', fontSize: 12 },
              background: true,
              clockWise: true,
              dataKey: 'value',
            } as any)}
          />
          <Legend
            iconSize={10}
            layout='vertical'
            verticalAlign='middle'
            align='right'
            formatter={(value, entry: any) => (
              <span className='text-xs text-zinc-300'>
                {value} ({formatPercentage(entry.payload.value)})
              </span>
            )}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
