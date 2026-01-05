'use client';

'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface UsagePattern {
  date: string;
  [key: string]: number | string | undefined;
}

export interface UsageChartSeries {
  dataKey: string;
  name: string;
  stroke: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

interface UsageChartProps {
  data: UsagePattern[];
  series?: UsageChartSeries[];
  height?: number;
}

const defaultSeries: UsageChartSeries[] = [
  { dataKey: 'tarotReadings', name: 'Tarot', stroke: '#a855f7' },
  { dataKey: 'journalEntries', name: 'Journal', stroke: '#ec4899' },
  { dataKey: 'rituals', name: 'Rituals', stroke: '#f59e0b' },
];

export default function UsageChart({
  data,
  series,
  height = 192,
}: UsageChartProps) {
  const chartSeries = series ?? defaultSeries;

  return (
    <div className='w-full' style={{ height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray='3 3' stroke='#3f3f46' opacity={0.2} />
          <XAxis
            dataKey='date'
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis tick={{ fill: '#a1a1aa', fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              color: '#e4e4e7',
            }}
            labelFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString();
            }}
          />
          {chartSeries.map((seriesConfig) => (
            <Line
              key={seriesConfig.dataKey}
              type='monotone'
              dataKey={seriesConfig.dataKey}
              stroke={seriesConfig.stroke}
              strokeWidth={seriesConfig.strokeWidth ?? 2}
              dot={false}
              strokeDasharray={seriesConfig.strokeDasharray}
              name={seriesConfig.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
