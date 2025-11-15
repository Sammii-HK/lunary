import { LunaryContext } from '../ai/types';
import { getCachedSnapshot } from './cache';
import { sql } from '@vercel/postgres';

export type WeeklyReport = {
  weekStart: Date;
  weekEnd: Date;
  keyTransits: Array<{
    date: string;
    transit: string;
    description: string;
  }>;
  moonPhases: Array<{
    date: string;
    phase: string;
    emoji: string;
  }>;
  tarotPatterns: {
    dominantThemes: string[];
    frequentCards: Array<{ name: string; count: number }>;
  };
  summary: string;
};

export type MonthlyReport = {
  month: number;
  year: number;
  transitSummary: string;
  moodTrends?: Array<{
    date: string;
    tag: string;
  }>;
  cosmicHighlights: string[];
  summary: string;
};

export async function generateWeeklyReport(
  userId: string,
  weekStart: Date,
): Promise<WeeklyReport | null> {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const snapshots: LunaryContext[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const snapshot = await getCachedSnapshot(userId, date);
    if (snapshot) {
      snapshots.push(snapshot);
    }
  }

  if (snapshots.length === 0) {
    return null;
  }

  const keyTransits: Array<{
    date: string;
    transit: string;
    description: string;
  }> = [];
  const moonPhases: Array<{ date: string; phase: string; emoji: string }> = [];
  const transitCounts: Map<string, number> = new Map();

  snapshots.forEach((snapshot, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    const dateStr = date.toISOString().split('T')[0];

    if (snapshot.moon) {
      moonPhases.push({
        date: dateStr,
        phase: snapshot.moon.phase,
        emoji: snapshot.moon.emoji,
      });
    }

    snapshot.currentTransits?.forEach((transit) => {
      const transitKey = `${transit.from}-${transit.aspect}-${transit.to}`;
      transitCounts.set(transitKey, (transitCounts.get(transitKey) || 0) + 1);

      if (transit.strength > 0.7) {
        keyTransits.push({
          date: dateStr,
          transit: `${transit.from} ${transit.aspect} ${transit.to}`,
          description: `Strong ${transit.aspect} aspect`,
        });
      }
    });
  });

  const topTransits = Array.from(transitCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([transitKey]) => transitKey);

  const tarotPatterns = snapshots
    .map((s) => s.tarot?.patternAnalysis)
    .filter(Boolean)
    .reduce(
      (acc, pattern) => {
        if (pattern?.dominantThemes) {
          acc.dominantThemes.push(...pattern.dominantThemes);
        }
        if (pattern?.frequentCards) {
          pattern.frequentCards.forEach((card) => {
            const existing = acc.frequentCards.find(
              (c) => c.name === card.name,
            );
            if (existing) {
              existing.count += card.count;
            } else {
              acc.frequentCards.push({ ...card });
            }
          });
        }
        return acc;
      },
      {
        dominantThemes: [] as string[],
        frequentCards: [] as Array<{ name: string; count: number }>,
      },
    );

  const summary = `This week featured ${moonPhases.length} moon phases and ${keyTransits.length} significant transits. The dominant themes were ${tarotPatterns.dominantThemes.slice(0, 3).join(', ')}.`;

  return {
    weekStart,
    weekEnd,
    keyTransits: keyTransits.slice(0, 5),
    moonPhases,
    tarotPatterns: {
      dominantThemes: [...new Set(tarotPatterns.dominantThemes)].slice(0, 5),
      frequentCards: tarotPatterns.frequentCards
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    },
    summary,
  };
}

export async function generateMonthlyReport(
  userId: string,
  month: number,
  year: number,
): Promise<MonthlyReport | null> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const snapshots: LunaryContext[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const snapshot = await getCachedSnapshot(userId, new Date(currentDate));
    if (snapshot) {
      snapshots.push(snapshot);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (snapshots.length === 0) {
    return null;
  }

  const transitTypes: Map<string, number> = new Map();
  const cosmicHighlights: string[] = [];

  snapshots.forEach((snapshot) => {
    snapshot.currentTransits?.forEach((transit) => {
      const type = transit.aspect;
      transitTypes.set(type, (transitTypes.get(type) || 0) + 1);
    });

    if (
      snapshot.moon?.phase.includes('New') ||
      snapshot.moon?.phase.includes('Full')
    ) {
      cosmicHighlights.push(`${snapshot.moon.phase} in ${snapshot.moon.sign}`);
    }
  });

  const transitSummary = Array.from(transitTypes.entries())
    .map(([type, count]) => `${count} ${type} aspects`)
    .join(', ');

  const moodTrends = snapshots.flatMap((s) => s.mood?.last7d || []).slice(-30);

  const summary = `This month featured ${cosmicHighlights.length} significant moon phases and ${transitTypes.size} different transit types. ${transitSummary}.`;

  return {
    month,
    year,
    transitSummary,
    moodTrends: moodTrends.length > 0 ? moodTrends : undefined,
    cosmicHighlights: cosmicHighlights.slice(0, 5),
    summary,
  };
}
