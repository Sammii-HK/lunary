import { sql } from '@vercel/postgres';
import { WeeklyInsights } from './engine';

export async function getWeeklyInsights(
  userId: string,
): Promise<WeeklyInsights> {
  const defaultInsights: WeeklyInsights = {
    mainTransits: [],
    moonPhases: [],
    energyThemes: [],
    dominantTheme: 'reflection',
  };

  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const snapshotsResult = await sql`
      SELECT cosmic_data, created_at
      FROM cosmic_snapshots
      WHERE user_id = ${userId}
        AND created_at >= ${weekAgoStr}::date
      ORDER BY created_at DESC
      LIMIT 7
    `;

    const transits: string[] = [];
    const moonPhases: string[] = [];
    const energyThemes: string[] = [];
    const themeCount: Record<string, number> = {};

    for (const row of snapshotsResult.rows) {
      const data = row.cosmic_data;
      if (!data) continue;

      if (data.currentTransits && Array.isArray(data.currentTransits)) {
        for (const transit of data.currentTransits.slice(0, 2)) {
          const transitStr = `${transit.from || transit.planet1} ${transit.aspect} ${transit.to || transit.planet2}`;
          if (!transits.includes(transitStr)) {
            transits.push(transitStr);
          }
        }
      }

      if (data.moonPhase?.name) {
        const phase = data.moonPhase.name;
        if (!moonPhases.includes(phase)) {
          moonPhases.push(phase);
        }
      }

      if (data.energyTheme) {
        const theme = data.energyTheme;
        if (!energyThemes.includes(theme)) {
          energyThemes.push(theme);
        }
        themeCount[theme] = (themeCount[theme] || 0) + 1;
      }
    }

    let dominantTheme = 'reflection';
    let maxCount = 0;
    for (const [theme, count] of Object.entries(themeCount)) {
      if (count > maxCount) {
        maxCount = count;
        dominantTheme = theme;
      }
    }

    if (transits.length === 0) {
      const globalResult = await sql`
        SELECT cosmic_data
        FROM global_cosmic_cache
        WHERE date >= ${weekAgoStr}::date
        ORDER BY date DESC
        LIMIT 7
      `;

      for (const row of globalResult.rows) {
        const data = row.cosmic_data;
        if (!data) continue;

        if (data.generalTransits && Array.isArray(data.generalTransits)) {
          for (const transit of data.generalTransits.slice(0, 2)) {
            const transitStr =
              transit.name ||
              `${transit.planet1} ${transit.aspect} ${transit.planet2}`;
            if (!transits.includes(transitStr) && transits.length < 3) {
              transits.push(transitStr);
            }
          }
        }

        if (data.moonPhase?.name && moonPhases.length < 4) {
          const phase = data.moonPhase.name;
          if (!moonPhases.includes(phase)) {
            moonPhases.push(phase);
          }
        }
      }
    }

    if (dominantTheme === 'reflection' && energyThemes.length > 0) {
      dominantTheme = energyThemes[0];
    }

    return {
      mainTransits: transits.slice(0, 3),
      moonPhases: moonPhases.slice(0, 3),
      energyThemes: energyThemes.slice(0, 3),
      dominantTheme: dominantTheme.toLowerCase(),
    };
  } catch (error) {
    console.error('Failed to fetch weekly insights:', error);
    return defaultInsights;
  }
}

export async function getWeeklyInsightsFromClient(): Promise<WeeklyInsights> {
  try {
    const response = await fetch('/api/rituals/weekly-insights');
    if (!response.ok) {
      throw new Error('Failed to fetch weekly insights');
    }
    return await response.json();
  } catch {
    return {
      mainTransits: [],
      moonPhases: [],
      energyThemes: [],
      dominantTheme: 'reflection',
    };
  }
}
