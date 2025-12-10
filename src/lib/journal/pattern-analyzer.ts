import { sql } from '@vercel/postgres';

export interface JournalPattern {
  type:
    | 'recurring_card'
    | 'mood_transit'
    | 'theme'
    | 'frequency'
    | 'season_correlation';
  title: string;
  description: string;
  data: Record<string, unknown>;
  confidence: number;
}

const ZODIAC_SEASONS: Array<{
  sign: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}> = [
  { sign: 'Capricorn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { sign: 'Aquarius', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { sign: 'Pisces', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
  { sign: 'Aries', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { sign: 'Taurus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { sign: 'Gemini', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { sign: 'Cancer', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { sign: 'Leo', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { sign: 'Virgo', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { sign: 'Libra', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { sign: 'Scorpio', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  {
    sign: 'Sagittarius',
    startMonth: 11,
    startDay: 22,
    endMonth: 12,
    endDay: 21,
  },
];

function getZodiacSeason(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const season of ZODIAC_SEASONS) {
    if (season.startMonth <= season.endMonth) {
      if (
        (month === season.startMonth && day >= season.startDay) ||
        (month === season.endMonth && day <= season.endDay) ||
        (month > season.startMonth && month < season.endMonth)
      ) {
        return season.sign;
      }
    } else {
      if (
        (month === season.startMonth && day >= season.startDay) ||
        (month === season.endMonth && day <= season.endDay) ||
        month > season.startMonth ||
        month < season.endMonth
      ) {
        return season.sign;
      }
    }
  }
  return 'Unknown';
}

export interface PatternAnalysisResult {
  patterns: JournalPattern[];
  generatedAt: string;
}

interface JournalEntryData {
  text: string;
  moodTags: string[];
  cardReferences: string[];
  moonPhase: string | null;
  transitHighlight: string | null;
  createdAt: string;
}

interface TarotReading {
  cards: Array<{ name: string }>;
  spreadName: string;
  createdAt: string;
}

export async function analyzeJournalPatterns(
  userId: string,
  daysBack: number = 30,
): Promise<PatternAnalysisResult> {
  const patterns: JournalPattern[] = [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const entriesResult = await sql`
    SELECT content, created_at
    FROM collections
    WHERE user_id = ${userId}
    AND category = 'journal'
    AND created_at >= ${cutoffDate.toISOString()}
    ORDER BY created_at DESC
  `;

  const entries: JournalEntryData[] = entriesResult.rows.map((row) => {
    const content =
      typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
    return {
      text: content.text || '',
      moodTags: content.moodTags || [],
      cardReferences: content.cardReferences || [],
      moonPhase: content.moonPhase || null,
      transitHighlight: content.transitHighlight || null,
      createdAt: row.created_at,
    };
  });

  const tarotResult = await sql`
    SELECT cards, spread_name, created_at
    FROM tarot_readings
    WHERE user_id = ${userId}
    AND created_at >= ${cutoffDate.toISOString()}
    ORDER BY created_at DESC
  `;

  const tarotReadings: TarotReading[] = tarotResult.rows.map((row) => ({
    cards: Array.isArray(row.cards) ? row.cards : [],
    spreadName: row.spread_name,
    createdAt: row.created_at,
  }));

  const recurringCardPatterns = findRecurringCards(entries, tarotReadings);
  patterns.push(...recurringCardPatterns);

  const moodPatterns = findMoodPatterns(entries);
  patterns.push(...moodPatterns);

  const themePatterns = findThemePatterns(entries);
  patterns.push(...themePatterns);

  const seasonPatterns = findSeasonPatterns(entries);
  patterns.push(...seasonPatterns);

  patterns.sort((a, b) => b.confidence - a.confidence);

  return {
    patterns: patterns.slice(0, 5),
    generatedAt: new Date().toISOString(),
  };
}

function findRecurringCards(
  entries: JournalEntryData[],
  tarotReadings: TarotReading[],
): JournalPattern[] {
  const patterns: JournalPattern[] = [];
  const cardCounts: Record<string, number> = {};

  for (const entry of entries) {
    for (const card of entry.cardReferences) {
      cardCounts[card] = (cardCounts[card] || 0) + 1;
    }
  }

  for (const reading of tarotReadings) {
    for (const card of reading.cards) {
      const cardName = card.name || card;
      if (typeof cardName === 'string') {
        cardCounts[cardName] = (cardCounts[cardName] || 0) + 1;
      }
    }
  }

  const sortedCards = Object.entries(cardCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]);

  for (const [cardName, count] of sortedCards.slice(0, 3)) {
    const contexts = entries
      .filter((e) => e.cardReferences.includes(cardName))
      .map((e) => e.text.substring(0, 100));

    patterns.push({
      type: 'recurring_card',
      title: `${cardName} recurring`,
      description: `${cardName} has appeared ${count} times this month`,
      data: {
        cardName,
        count,
        contexts: contexts.slice(0, 2),
      },
      confidence: Math.min(count / 5, 1),
    });
  }

  return patterns;
}

function findMoodPatterns(entries: JournalEntryData[]): JournalPattern[] {
  const patterns: JournalPattern[] = [];
  const moodCounts: Record<string, number> = {};

  for (const entry of entries) {
    for (const mood of entry.moodTags) {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    }
  }

  const dominantMood = Object.entries(moodCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];

  if (dominantMood && dominantMood[1] >= 3) {
    patterns.push({
      type: 'mood_transit',
      title: `Predominant ${dominantMood[0]} energy`,
      description: `You've been feeling ${dominantMood[0]} in ${dominantMood[1]} of your recent reflections`,
      data: {
        mood: dominantMood[0],
        count: dominantMood[1],
        total: entries.length,
      },
      confidence: Math.min(dominantMood[1] / entries.length, 1),
    });
  }

  const moonMoodCorrelation: Record<string, string[]> = {};
  for (const entry of entries) {
    if (entry.moonPhase) {
      if (!moonMoodCorrelation[entry.moonPhase]) {
        moonMoodCorrelation[entry.moonPhase] = [];
      }
      moonMoodCorrelation[entry.moonPhase].push(...entry.moodTags);
    }
  }

  for (const [phase, moods] of Object.entries(moonMoodCorrelation)) {
    if (moods.length >= 2) {
      const moodCount: Record<string, number> = {};
      for (const mood of moods) {
        moodCount[mood] = (moodCount[mood] || 0) + 1;
      }
      const topMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0];
      if (topMood && topMood[1] >= 2) {
        patterns.push({
          type: 'mood_transit',
          title: `${phase} brings ${topMood[0]} energy`,
          description: `You tend to feel ${topMood[0]} during ${phase}`,
          data: {
            moonPhase: phase,
            mood: topMood[0],
            count: topMood[1],
          },
          confidence: Math.min(topMood[1] / 3, 0.8),
        });
      }
    }
  }

  return patterns;
}

function findThemePatterns(entries: JournalEntryData[]): JournalPattern[] {
  const patterns: JournalPattern[] = [];

  const themeKeywords: Record<string, string[]> = {
    hope: ['hope', 'hopeful', 'optimistic', 'bright', 'looking forward'],
    transition: [
      'change',
      'changing',
      'transition',
      'moving',
      'shift',
      'transformation',
    ],
    reflection: [
      'thinking',
      'wondering',
      'contemplating',
      'introspective',
      'reflecting',
    ],
    growth: ['learning', 'growing', 'progress', 'development', 'evolving'],
    release: ['letting go', 'release', 'surrender', 'acceptance', 'peace'],
  };

  const themeCounts: Record<string, number> = {};

  for (const entry of entries) {
    const lowerText = entry.text.toLowerCase();
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          themeCounts[theme] = (themeCounts[theme] || 0) + 1;
          break;
        }
      }
    }
  }

  const sortedThemes = Object.entries(themeCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]);

  for (const [theme, count] of sortedThemes.slice(0, 2)) {
    patterns.push({
      type: 'theme',
      title: `${theme.charAt(0).toUpperCase() + theme.slice(1)} themes recurring`,
      description: `Themes of ${theme} appear in ${count} of your recent reflections`,
      data: {
        theme,
        count,
        percentage: Math.round((count / entries.length) * 100),
      },
      confidence: Math.min(count / entries.length + 0.3, 0.9),
    });
  }

  return patterns;
}

function findSeasonPatterns(entries: JournalEntryData[]): JournalPattern[] {
  const patterns: JournalPattern[] = [];

  const themeKeywords: Record<string, string[]> = {
    hope: [
      'hope',
      'hopeful',
      'optimistic',
      'bright',
      'looking forward',
      'star',
    ],
    transition: [
      'change',
      'changing',
      'transition',
      'moving',
      'shift',
      'transformation',
    ],
    reflection: [
      'thinking',
      'wondering',
      'contemplating',
      'introspective',
      'reflecting',
    ],
    growth: ['learning', 'growing', 'progress', 'development', 'evolving'],
    release: ['letting go', 'release', 'surrender', 'acceptance', 'peace'],
    love: ['love', 'relationship', 'heart', 'connection', 'partner'],
    creativity: ['creative', 'inspiration', 'art', 'create', 'express'],
    anxiety: ['anxious', 'worried', 'stress', 'overwhelm', 'uncertain'],
  };

  const seasonThemes: Record<string, Record<string, number>> = {};

  for (const entry of entries) {
    const entryDate = new Date(entry.createdAt);
    const season = getZodiacSeason(entryDate);
    const lowerText = entry.text.toLowerCase();

    if (!seasonThemes[season]) {
      seasonThemes[season] = {};
    }

    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          seasonThemes[season][theme] = (seasonThemes[season][theme] || 0) + 1;
          break;
        }
      }
    }

    for (const mood of entry.moodTags) {
      seasonThemes[season][mood] = (seasonThemes[season][mood] || 0) + 1;
    }
  }

  for (const [season, themes] of Object.entries(seasonThemes)) {
    const sortedThemes = Object.entries(themes)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1]);

    if (sortedThemes.length > 0) {
      const [topTheme, count] = sortedThemes[0];
      const themeLabel = topTheme.charAt(0).toUpperCase() + topTheme.slice(1);

      patterns.push({
        type: 'season_correlation',
        title: `${themeLabel} themes during ${season} season`,
        description: `${themeLabel} themes appear ${count} times during ${season} season in your reflections`,
        data: {
          season,
          theme: topTheme,
          count,
          allThemes: sortedThemes
            .slice(0, 3)
            .map(([t, c]) => ({ theme: t, count: c })),
        },
        confidence: Math.min(count / 4 + 0.2, 0.85),
      });
    }
  }

  return patterns;
}

export async function savePatterns(
  userId: string,
  patterns: JournalPattern[],
): Promise<void> {
  await sql`
    DELETE FROM journal_patterns WHERE user_id = ${userId}
  `;

  for (const pattern of patterns) {
    await sql`
      INSERT INTO journal_patterns (user_id, pattern_type, pattern_data, generated_at, expires_at)
      VALUES (
        ${userId},
        ${pattern.type},
        ${JSON.stringify({ ...pattern })}::jsonb,
        NOW(),
        NOW() + INTERVAL '7 days'
      )
    `;
  }
}

export async function getPatterns(userId: string): Promise<JournalPattern[]> {
  const result = await sql`
    SELECT pattern_data
    FROM journal_patterns
    WHERE user_id = ${userId}
    AND expires_at > NOW()
    ORDER BY (pattern_data->>'confidence')::float DESC
  `;

  return result.rows.map((row) => {
    const data =
      typeof row.pattern_data === 'string'
        ? JSON.parse(row.pattern_data)
        : row.pattern_data;
    return data as JournalPattern;
  });
}
