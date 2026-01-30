'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer, Cell } from 'recharts';
import { formatPercentage } from '@/lib/patterns/utils/pattern-formatters';
import { interpretArcanaBalance } from '@/lib/patterns/utils/arcana-weighting';

interface ArcanaBalanceRadialProps {
  majorCount: number;
  minorCount: number;
  showInterpretation?: boolean;
}

export function ArcanaBalanceRadial({
  majorCount,
  minorCount,
  showInterpretation = true,
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
  const interpretation = interpretArcanaBalance(majorCount, minorCount);

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[ArcanaBalanceRadial] Data:', {
      majorCount,
      minorCount,
      total,
      majorPercentage,
      minorPercentage,
    });
  }

  // Sort data so larger percentage is outer ring (better visualization)
  const chartData = [
    {
      name: 'Major Arcana',
      value: majorPercentage,
      count: majorCount,
      fill: 'hsl(256, 64%, 60%)', // Nebula Violet
    },
    {
      name: 'Minor Arcana',
      value: minorPercentage,
      count: minorCount,
      fill: 'hsl(240, 74%, 68%)', // Comet Trail blue
    },
  ].sort((a, b) => b.value - a.value);

  // Add hidden scale reference point to establish 0-100 scale
  const dataWithScale = [
    ...chartData,
    {
      name: '_hidden_scale',
      value: 100,
      count: 0,
      fill: 'transparent',
    },
  ];

  return (
    <div className='w-full space-y-3'>
      <div className='h-[160px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <RadialBarChart
            cx='50%'
            cy='50%'
            innerRadius='30%'
            outerRadius='90%'
            data={dataWithScale}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              isAnimationActive={false}
              cornerRadius={6}
              {...({
                minAngle: 15,
                background: { fill: 'rgba(255, 255, 255, 0.05)' },
                dataKey: 'value',
              } as any)}
            >
              {dataWithScale.map((entry, index) => (
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

      {/* Legend below chart */}
      <div className='flex flex-col gap-2 px-2'>
        {chartData.map((item) => (
          <div key={item.name} className='flex items-center gap-2'>
            <div
              className='w-3 h-3 rounded-full'
              style={{ backgroundColor: item.fill }}
            />
            <span className='text-xs text-zinc-300'>
              {item.name}: {item.count} ({formatPercentage(item.value)})
            </span>
          </div>
        ))}
      </div>

      {showInterpretation && (
        <div className='text-xs space-y-1 px-2 pt-2 border-t border-zinc-800'>
          <p className='text-zinc-300 font-medium'>
            {interpretation.interpretation}
          </p>
          <p className='text-zinc-500'>{interpretation.focus}</p>
          <p className='text-zinc-600 text-[10px] mt-2'>
            Expected: ~28% Major, ~72% Minor
          </p>
        </div>
      )}
    </div>
  );
}
