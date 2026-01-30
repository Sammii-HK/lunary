'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import dayjs from 'dayjs';

interface ArchetypeSnapshot {
  generatedAt: string;
  data: {
    dominantArchetype: string;
    archetypes: Array<{
      name: string;
      strength: number;
    }>;
  };
}

interface ArchetypeEvolutionChartProps {
  snapshots: ArchetypeSnapshot[];
  className?: string;
}

const ARCHETYPE_COLORS: Record<string, string> = {
  'The Visionary': '#a78bfa', // purple-400
  'The Heart Opener': '#fb7185', // rose-400
  'The Grounded One': '#78716c', // stone-500
  'The Empath': '#60a5fa', // blue-400
  'The Shadow Dancer': '#818cf8', // indigo-400
  'The Protector': '#34d399', // emerald-400
  'The Alchemist': '#fbbf24', // amber-400
  'The Restorer': '#86efac', // green-300
  'The Seeker': '#c4b5fd', // violet-300
  'The Warrior': '#f87171', // red-400
  'The Lunar Weaver': '#cbd5e1', // slate-300
  'The Creator': '#fdba74', // orange-300
};

export function ArchetypeEvolutionChart({
  snapshots,
  className = '',
}: ArchetypeEvolutionChartProps) {
  const chartData = useMemo(() => {
    // Sort snapshots by date
    const sorted = [...snapshots].sort(
      (a, b) =>
        new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime(),
    );

    // Transform to chart format
    return sorted.map((snapshot) => {
      const dataPoint: any = {
        date: dayjs(snapshot.generatedAt).format('MMM D'),
        fullDate: dayjs(snapshot.generatedAt).format('YYYY-MM-DD'),
      };

      // Add each archetype's strength
      snapshot.data.archetypes.forEach((archetype) => {
        dataPoint[archetype.name] = archetype.strength;
      });

      return dataPoint;
    });
  }, [snapshots]);

  // Get all unique archetypes across all snapshots
  const allArchetypes = useMemo(() => {
    const archetypeSet = new Set<string>();
    snapshots.forEach((snapshot) => {
      snapshot.data.archetypes.forEach((archetype) => {
        archetypeSet.add(archetype.name);
      });
    });
    return Array.from(archetypeSet);
  }, [snapshots]);

  if (snapshots.length === 0) {
    return (
      <div
        className={`rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 ${className}`}
      >
        <p className='text-sm text-zinc-400'>
          No archetype history yet. Check back after patterns are detected!
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 ${className}`}
    >
      <h3 className='text-lg font-medium text-zinc-100 mb-4'>
        Archetype Evolution
      </h3>
      <ResponsiveContainer width='100%' height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray='3 3' stroke='#27272a' />
          <XAxis dataKey='date' stroke='#71717a' style={{ fontSize: '12px' }} />
          <YAxis
            stroke='#71717a'
            style={{ fontSize: '12px' }}
            label={{
              value: 'Strength',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#71717a', fontSize: '12px' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#e4e4e7' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} iconType='line' />
          {allArchetypes.map((archetype) => (
            <Line
              key={archetype}
              type='monotone'
              dataKey={archetype}
              stroke={ARCHETYPE_COLORS[archetype] || '#a1a1aa'}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
