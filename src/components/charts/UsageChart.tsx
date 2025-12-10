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

interface UsagePattern {
  date: string;
  tarotReadings: number;
  journalEntries: number;
  aiChats: number;
  rituals: number;
}

interface UsageChartProps {
  data: UsagePattern[];
}

export default function UsageChart({ data }: UsageChartProps) {
  return (
    <div className='h-48'>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray='3 3' stroke='#3f3f46' opacity={0.3} />
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
          <Line
            type='monotone'
            dataKey='tarotReadings'
            stroke='#a855f7'
            strokeWidth={2}
            dot={false}
            name='Tarot'
          />
          <Line
            type='monotone'
            dataKey='journalEntries'
            stroke='#ec4899'
            strokeWidth={2}
            dot={false}
            name='Journal'
          />
          <Line
            type='monotone'
            dataKey='rituals'
            stroke='#f59e0b'
            strokeWidth={2}
            dot={false}
            name='Rituals'
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
