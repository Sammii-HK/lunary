'use client';

import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatPercentage } from '@/lib/patterns/utils/pattern-formatters';

interface ArcanaBalanceRadialProps {
  majorCount: number;
  minorCount: number;
}

export function ArcanaBalanceRadial({
  majorCount,
  minorCount,
}: ArcanaBalanceRadialProps) {
  const total = majorCount + minorCount;

  if (total === 0) {
    return (
      <div className='flex items-center justify-center h-[200px] text-sm text-zinc-500'>
        No arcana data available
      </div>
    );
  }

  const majorPercentage = (majorCount / total) * 100;
  const minorPercentage = (minorCount / total) * 100;

  const data = [
    {
      name: 'Major Arcana',
      value: majorPercentage,
      count: majorCount,
      fill: 'hsl(var(--lunary-primary))',
    },
    {
      name: 'Minor Arcana',
      value: minorPercentage,
      count: minorCount,
      fill: 'hsl(var(--lunary-secondary))',
    },
  ];

  return (
    <div className='w-full h-[200px]'>
      <ResponsiveContainer width='100%' height='100%'>
        <RadialBarChart
          cx='50%'
          cy='50%'
          innerRadius='40%'
          outerRadius='100%'
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            {...({
              minAngle: 15,
              label: {
                position: 'insideStart',
                fill: '#fff',
                fontSize: 12,
                formatter: (value: number) => formatPercentage(value),
              },
              background: true,
              dataKey: 'value',
            } as any)}
          />
          <Legend
            iconSize={10}
            layout='vertical'
            verticalAlign='bottom'
            align='center'
            formatter={(value, entry: any) => (
              <span className='text-xs text-zinc-300'>
                {value}: {entry.payload.count} (
                {formatPercentage(entry.payload.value)})
              </span>
            )}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
