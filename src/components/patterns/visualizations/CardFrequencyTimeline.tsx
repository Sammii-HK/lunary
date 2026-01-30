'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';

interface CardFrequencyTimelineProps {
  cardName: string;
  appearances: Array<{ date: string }>;
  height?: number;
}

interface TimelineData {
  date: string;
  count: number;
  displayDate: string;
}

function generateDailyFrequency(
  appearances: Array<{ date: string }>,
): TimelineData[] {
  if (appearances.length === 0) return [];

  // Sort appearances by date
  const sorted = [...appearances].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const firstDate = dayjs(sorted[0].date);
  const lastDate = dayjs(sorted[sorted.length - 1].date);
  const daysDiff = lastDate.diff(firstDate, 'day') + 1;

  // Create daily frequency map
  const frequencyMap = new Map<string, number>();
  sorted.forEach((appearance) => {
    const dateKey = dayjs(appearance.date).format('YYYY-MM-DD');
    frequencyMap.set(dateKey, (frequencyMap.get(dateKey) || 0) + 1);
  });

  // Generate data for all days in range
  const data: TimelineData[] = [];
  for (let i = 0; i < daysDiff; i++) {
    const currentDate = firstDate.add(i, 'day');
    const dateKey = currentDate.format('YYYY-MM-DD');
    data.push({
      date: dateKey,
      count: frequencyMap.get(dateKey) || 0,
      displayDate: currentDate.format('MMM D'),
    });
  }

  return data;
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className='bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs'>
        <p className='text-zinc-300'>{data.displayDate}</p>
        <p className='text-lunary-primary font-medium'>
          {data.count} {data.count === 1 ? 'appearance' : 'appearances'}
        </p>
      </div>
    );
  }
  return null;
}

export function CardFrequencyTimeline({
  cardName,
  appearances,
  height = 60,
}: CardFrequencyTimelineProps) {
  const timelineData = generateDailyFrequency(appearances);

  if (timelineData.length === 0) {
    return (
      <div
        className='flex items-center justify-center text-xs text-zinc-500'
        style={{ height }}
      >
        No timeline data
      </div>
    );
  }

  return (
    <ResponsiveContainer width='100%' height={height}>
      <LineChart data={timelineData}>
        <XAxis
          dataKey='displayDate'
          tick={{ fill: '#71717a', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval='preserveStartEnd'
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type='monotone'
          dataKey='count'
          stroke='hsl(var(--lunary-primary))'
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: 'hsl(var(--lunary-primary))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
