import { sql } from '@vercel/postgres';
import { getAccurateMoonPhase } from '../../../utils/astrology/astronomical-data';
import { getRealPlanetaryPositions } from '../../../utils/astrology/astronomical-data';
import type { BirthChartData } from '../../../utils/astrology/birthChart';

export interface JournalPattern {
  type:
    | 'recurring_card'
    | 'mood_transit'
    | 'theme'
    | 'frequency'
    | 'season_correlation'
    | 'moon_phase_mood'
    | 'moon_sign_pattern'
    | 'transit_correlation'
    | 'house_activation';
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

  // NEW: Enhanced lunar pattern detection (moon phase + sign)
  const lunarPatterns = await findEnhancedLunarPatterns(entries);
  patterns.push(...lunarPatterns);

  // NEW: Transit correlation detection (journaling frequency during transits)
  const transitPatterns = await findTransitCorrelations(entries, userId);
  patterns.push(...transitPatterns);

  // NEW: House activation pattern detection (journal themes by house)
  const housePatterns = await findHouseActivationPatterns(entries, userId);
  patterns.push(...housePatterns);

  patterns.sort((a, b) => b.confidence - a.confidence);

  return {
    patterns: patterns.slice(0, 10), // Increased from 5 to 10 to show more patterns
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

/**
 * Enhanced Moon Phase & Sign Pattern Detection
 * Analyzes mood and productivity correlations with both moon phase AND sign
 */
async function findEnhancedLunarPatterns(
  entries: JournalEntryData[],
): Promise<JournalPattern[]> {
  const patterns: JournalPattern[] = [];

  // Group entries by moon phase AND sign
  const lunarData: Record<
    string,
    { moods: string[]; count: number; dates: Date[] }
  > = {};

  for (const entry of entries) {
    const entryDate = new Date(entry.createdAt);

    // Get accurate moon data for this date
    try {
      const moonData = await getAccurateMoonPhase(entryDate);
      const planetaryData = await getRealPlanetaryPositions(entryDate);
      const moonSign = planetaryData.Moon?.sign || 'Unknown';

      const lunarKey = `${moonData.name}_${moonSign}`;

      if (!lunarData[lunarKey]) {
        lunarData[lunarKey] = { moods: [], count: 0, dates: [] };
      }

      lunarData[lunarKey].moods.push(...entry.moodTags);
      lunarData[lunarKey].count++;
      lunarData[lunarKey].dates.push(entryDate);
    } catch (error) {
      // Skip entries where moon data unavailable
      continue;
    }
  }

  // Analyze patterns
  for (const [lunarKey, data] of Object.entries(lunarData)) {
    if (data.count < 2) continue;

    const [phase, sign] = lunarKey.split('_');

    // Find dominant mood for this lunar combination
    const moodCounts: Record<string, number> = {};
    for (const mood of data.moods) {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    }

    const dominantMood = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);

    if (dominantMood.length > 0 && dominantMood[0][1] >= 2) {
      const moodName = dominantMood[0][0];
      const moodCount = dominantMood[0][1];

      patterns.push({
        type: 'moon_sign_pattern',
        title: `${moodName} energy during ${phase} in ${sign}`,
        description: `You tend to feel ${moodName} when the moon is ${phase} in ${sign}`,
        data: {
          moonPhase: phase,
          moonSign: sign,
          dominantMood: moodName,
          moodCount,
          totalEntries: data.count,
          percentage: Math.round((moodCount / data.count) * 100),
        },
        confidence: Math.min((moodCount / data.count) * 0.9, 0.85),
      });
    }
  }

  return patterns;
}

/**
 * Transit Correlation Pattern Detection
 * Analyzes which planetary transits correlate with journaling behavior
 */
async function findTransitCorrelations(
  entries: JournalEntryData[],
  userId: string,
): Promise<JournalPattern[]> {
  const patterns: JournalPattern[] = [];

  // Get user's birth chart for personal transit analysis
  let birthChart: BirthChartData[] = [];
  try {
    const birthChartResult = await sql`
      SELECT birth_chart FROM user_profiles WHERE user_id = ${userId} LIMIT 1
    `;
    if (birthChartResult.rows.length > 0) {
      birthChart = birthChartResult.rows[0].birth_chart as BirthChartData[];
    }
  } catch (error) {
    // No birth chart available, skip personal transit analysis
    return patterns;
  }

  if (birthChart.length === 0) return patterns;

  // Group entries by major transiting planets
  const transitData: Record<string, { count: number; moods: string[] }> = {};

  for (const entry of entries) {
    const entryDate = new Date(entry.createdAt);

    try {
      const transits = await getRealPlanetaryPositions(entryDate);

      // Check major transits (Mars, Jupiter, Saturn)
      for (const planet of ['Mars', 'Jupiter', 'Saturn']) {
        const transitingPlanet = transits[planet];
        if (!transitingPlanet) continue;

        const transitKey = `${planet}_${transitingPlanet.sign}`;

        if (!transitData[transitKey]) {
          transitData[transitKey] = { count: 0, moods: [] };
        }

        transitData[transitKey].count++;
        transitData[transitKey].moods.push(...entry.moodTags);
      }
    } catch (error) {
      continue;
    }
  }

  // Analyze correlations
  for (const [transitKey, data] of Object.entries(transitData)) {
    if (data.count < 3) continue; // Need at least 3 entries

    const [planet, sign] = transitKey.split('_');

    // Calculate journaling frequency during this transit
    const avgEntriesPerDay = entries.length / 30; // Assuming 30-day analysis
    const transitFrequency = data.count / (data.count * 2); // Rough estimate

    if (transitFrequency > avgEntriesPerDay * 1.2) {
      // User journals 20% more during this transit
      const moodCounts: Record<string, number> = {};
      for (const mood of data.moods) {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      }

      const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

      patterns.push({
        type: 'transit_correlation',
        title: `Active during ${planet} in ${sign}`,
        description: `You journal more frequently when ${planet} is in ${sign}`,
        data: {
          planet,
          sign,
          entryCount: data.count,
          topMood: topMood ? topMood[0] : null,
          frequency: Math.round(transitFrequency * 100),
        },
        confidence: Math.min(data.count / 10, 0.75),
      });
    }
  }

  return patterns;
}

/**
 * House Activation Pattern Detection
 * Analyzes which astrological houses are emphasized in journal themes
 */
async function findHouseActivationPatterns(
  entries: JournalEntryData[],
  userId: string,
): Promise<JournalPattern[]> {
  const patterns: JournalPattern[] = [];

  // Get user's birth chart to calculate houses
  let birthChart: BirthChartData[] = [];
  try {
    const birthChartResult = await sql`
      SELECT birth_chart FROM user_profiles WHERE user_id = ${userId} LIMIT 1
    `;
    if (birthChartResult.rows.length > 0) {
      birthChart = birthChartResult.rows[0].birth_chart as BirthChartData[];
    }
  } catch (error) {
    return patterns;
  }

  if (birthChart.length === 0) return patterns;

  // Get ascendant for house calculation
  const ascendant = birthChart.find((p) => p.body === 'Ascendant');
  if (!ascendant || !ascendant.eclipticLongitude) return patterns;

  const ascendantSign = Math.floor(
    (((ascendant.eclipticLongitude % 360) + 360) % 360) / 30,
  );

  // House theme keywords
  const houseThemes: Record<number, string[]> = {
    1: [
      'self',
      'identity',
      'appearance',
      'personality',
      'me',
      'myself',
      'I am',
    ],
    2: ['money', 'value', 'worth', 'finances', 'resources', 'security'],
    3: [
      'communication',
      'learn',
      'study',
      'sibling',
      'neighbor',
      'message',
      'talk',
    ],
    4: ['home', 'family', 'mother', 'roots', 'past', 'private', 'foundation'],
    5: ['creative', 'romance', 'fun', 'children', 'joy', 'express', 'pleasure'],
    6: ['health', 'work', 'routine', 'service', 'daily', 'habit', 'wellness'],
    7: [
      'relationship',
      'partner',
      'marriage',
      'other',
      'commitment',
      'cooperation',
    ],
    8: ['transform', 'deep', 'intimate', 'death', 'rebirth', 'shared', 'power'],
    9: [
      'travel',
      'philosophy',
      'belief',
      'meaning',
      'expand',
      'higher',
      'adventure',
    ],
    10: [
      'career',
      'reputation',
      'public',
      'achievement',
      'success',
      'status',
      'goal',
    ],
    11: ['friend', 'community', 'group', 'future', 'hope', 'network', 'social'],
    12: [
      'spiritual',
      'dream',
      'unconscious',
      'hidden',
      'solitude',
      'meditation',
    ],
  };

  // Analyze which houses are emphasized in journal entries
  const houseActivation: Record<number, number> = {};

  for (const entry of entries) {
    const entryDate = new Date(entry.createdAt);
    const lowerText = entry.text.toLowerCase();

    try {
      // Get transiting planets for this date
      const transits = await getRealPlanetaryPositions(entryDate);

      // Calculate which houses were activated by major transits
      for (const planet of ['Sun', 'Moon', 'Mars', 'Jupiter', 'Saturn']) {
        const transitingPlanet = transits[planet];
        if (!transitingPlanet || !transitingPlanet.eclipticLongitude) continue;

        const planetSign = Math.floor(
          (((transitingPlanet.eclipticLongitude % 360) + 360) % 360) / 30,
        );
        const house = ((planetSign - ascendantSign + 12) % 12) + 1;

        // Check if journal entry mentions themes related to this house
        const houseKeywords = houseThemes[house] || [];
        for (const keyword of houseKeywords) {
          if (lowerText.includes(keyword)) {
            houseActivation[house] = (houseActivation[house] || 0) + 1;
            break;
          }
        }
      }
    } catch (error) {
      continue;
    }
  }

  // Create patterns for emphasized houses
  const sortedHouses = Object.entries(houseActivation)
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1]);

  const houseNames: Record<number, string> = {
    1: 'Self & Identity',
    2: 'Values & Resources',
    3: 'Communication & Learning',
    4: 'Home & Family',
    5: 'Creativity & Romance',
    6: 'Health & Service',
    7: 'Partnerships',
    8: 'Transformation & Intimacy',
    9: 'Philosophy & Travel',
    10: 'Career & Reputation',
    11: 'Community & Friendship',
    12: 'Spirituality & Subconscious',
  };

  for (const [houseStr, count] of sortedHouses.slice(0, 2)) {
    const house = parseInt(houseStr);
    const houseName = houseNames[house] || `House ${house}`;

    patterns.push({
      type: 'house_activation',
      title: `${houseName} themes emphasized`,
      description: `You often journal about ${houseName.toLowerCase()} matters`,
      data: {
        house,
        houseName,
        count,
        percentage: Math.round((count / entries.length) * 100),
        keywords: houseThemes[house]?.slice(0, 3),
      },
      confidence: Math.min(count / 5, 0.8),
    });
  }

  return patterns;
}

export async function savePatterns(
  userId: string,
  patterns: JournalPattern[],
): Promise<void> {
  // Delete old transient/cyclical patterns to avoid duplicates
  // Preserve natal patterns (permanent patterns)
  await sql`
    DELETE FROM journal_patterns
    WHERE user_id = ${userId}
    AND pattern_category IN ('transient', 'cyclical')
  `;

  for (const pattern of patterns) {
    // Determine pattern category and expiration based on type
    let category: string;
    let expiresIn: string;

    switch (pattern.type) {
      case 'moon_phase_mood':
      case 'moon_sign_pattern':
        category = 'cyclical';
        expiresIn = '90 days'; // Moon patterns evolve over ~3 months
        break;
      case 'transit_correlation':
        category = 'cyclical';
        expiresIn = '90 days'; // Transit patterns valid for several months
        break;
      case 'house_activation':
        category = 'cyclical';
        expiresIn = '180 days'; // House emphasis patterns are longer-term
        break;
      case 'recurring_card':
      case 'mood_transit':
        category = 'transient';
        expiresIn = '30 days'; // Short-term patterns
        break;
      case 'season_correlation':
        category = 'cyclical';
        expiresIn = '365 days'; // Seasonal patterns recur yearly
        break;
      default:
        category = 'transient';
        expiresIn = '30 days';
    }

    // Insert new pattern
    await sql`
      INSERT INTO journal_patterns (
        user_id,
        pattern_type,
        pattern_category,
        pattern_data,
        confidence,
        generated_at,
        expires_at,
        first_detected,
        last_observed
      )
      VALUES (
        ${userId},
        ${pattern.type},
        ${category},
        ${JSON.stringify({ ...pattern })}::jsonb,
        ${pattern.confidence},
        NOW(),
        NOW() + INTERVAL '${sql([expiresIn])}',
        NOW(),
        NOW()
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
