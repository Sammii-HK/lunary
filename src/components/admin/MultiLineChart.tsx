import type { ActivityTrend } from '@/hooks/useAnalyticsData';

interface MultiLineChartProps {
  data: ActivityTrend[];
}

export function MultiLineChart({ data }: MultiLineChartProps) {
  if (!data.length) {
    return (
      <div className='flex h-48 items-center justify-center text-sm text-zinc-400'>
        Not enough data for this range.
      </div>
    );
  }

  const width = 640;
  const height = 220;
  const padding = 40;
  const values = data.flatMap((point) => [point.dau, point.wau, point.mau]);
  const max = Math.max(...values, 1);

  const createPath = (key: 'dau' | 'wau' | 'mau') =>
    data
      .map((point, index) => {
        const x =
          padding +
          (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
        const y =
          height - padding - (point[key] / max) * (height - padding * 2);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role='img'
      className='w-full'
      aria-label='Active user trends'
    >
      <defs>
        <linearGradient id='dauGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
          <stop offset='0%' stopColor='rgba(196,181,253,0.8)' />
          <stop offset='100%' stopColor='rgba(196,181,253,0)' />
        </linearGradient>
      </defs>
      <path
        d={createPath('dau')}
        fill='none'
        stroke='url(#dauGradient)'
        strokeWidth={3}
      />
      <path
        d={createPath('wau')}
        fill='none'
        stroke='rgba(129,140,248,0.9)'
        strokeWidth={2}
        strokeDasharray='6 4'
      />
      <path
        d={createPath('mau')}
        fill='none'
        stroke='rgba(56,189,248,0.9)'
        strokeWidth={2}
        strokeDasharray='4 2'
      />
      <g className='text-xs fill-zinc-500'>
        {data.map((point, index) => {
          const x =
            padding +
            (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
          const date = new Date(point.date);
          const label =
            data.length > 14
              ? date.getDate().toString()
              : `${date.getMonth() + 1}/${date.getDate()}`;
          return (
            <text key={point.date} x={x} y={height - 10} textAnchor='middle'>
              {label}
            </text>
          );
        })}
      </g>
    </svg>
  );
}
