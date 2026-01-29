/**
 * Pattern snapshot generator
 * Calculates Life Themes, Tarot Season, and Archetype snapshots from user data
 */

import { sql } from '@vercel/postgres';
import type {
  LifeThemeSnapshot,
  TarotSeasonSnapshot,
  PatternSnapshot,
} from './types';
import {
  analyzeLifeThemes,
  hasEnoughDataForThemes,
} from '@/lib/life-themes/engine';

/**
 * Generate life themes snapshot from user's journal, tarot, and dreams
 */
export async function generateLifeThemesSnapshot(
  userId: string,
): Promise<LifeThemeSnapshot | null> {
  try {
    // Fetch recent journal entries
    const journalResult = await sql`
      SELECT content, tags, created_at
      FROM collections
      WHERE user_id = ${userId}
        AND category = 'journal'
        AND created_at >= NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
      LIMIT 30
    `;

    // Fetch tarot patterns
    const patternsResult = await sql`
      SELECT pattern_data
      FROM journal_patterns
      WHERE user_id = ${userId}
        AND pattern_type LIKE '%tarot%'
        AND expires_at > NOW()
      ORDER BY generated_at DESC
      LIMIT 20
    `;

    // Fetch dream tags
    const dreamsResult = await sql`
      SELECT content, tags
      FROM collections
      WHERE user_id = ${userId}
        AND category = 'dream'
        AND created_at >= NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
      LIMIT 20
    `;

    // Extract mood tags from journal entries
    const journalEntries = journalResult.rows.map((row) => ({
      content: row.content || '',
      moodTags: Array.isArray(row.tags) ? row.tags : [],
      createdAt: row.created_at,
    }));

    // Extract dream tags
    const dreamTags = dreamsResult.rows.flatMap((row) =>
      Array.isArray(row.tags) ? row.tags : [],
    );

    // Build tarot patterns summary
    let tarotPatterns = null;
    if (patternsResult.rows.length > 0) {
      const dominantThemes = new Map<string, number>();
      const frequentCards = new Map<string, number>();
      const suitCounts = new Map<string, number>();

      for (const row of patternsResult.rows) {
        const pattern = row.pattern_data;
        // Extract themes, cards, suits from pattern data
        // This depends on the actual pattern structure
      }

      tarotPatterns = {
        dominantThemes: Array.from(dominantThemes.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([theme]) => theme),
        frequentCards: Array.from(frequentCards.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([card, count]) => ({ card, count })),
        suitDistribution: Array.from(suitCounts.entries())
          .map(([suit, count]) => ({ suit, count }))
          .sort((a, b) => b.count - a.count),
      };
    }

    const input = {
      journalEntries,
      tarotPatterns,
      dreamTags,
    };

    // Check if we have enough data
    if (!hasEnoughDataForThemes(input)) {
      return null;
    }

    // Analyze themes
    const themes = analyzeLifeThemes(input, 3);

    if (themes.length === 0) {
      return null;
    }

    // Build snapshot
    const snapshot: LifeThemeSnapshot = {
      type: 'life_themes',
      themes: themes.map((theme) => ({
        name: theme.name,
        confidence: theme.confidence,
        sources: {
          journalMentions: theme.sources.journalCount || 0,
          tarotCards: theme.sources.tarotCards || [],
          dreamTags: theme.sources.dreamTags || [],
        },
      })),
      dominantTheme: themes[0].name,
      timestamp: new Date().toISOString(),
    };

    return snapshot;
  } catch (error) {
    console.error('Error generating life themes snapshot:', error);
    return null;
  }
}

/**
 * Generate tarot season snapshot from user's tarot readings
 */
export async function generateTarotSeasonSnapshot(
  userId: string,
  period: number = 30,
): Promise<TarotSeasonSnapshot | null> {
  try {
    // Fetch recent tarot readings
    const result = await sql`
      SELECT cards, created_at
      FROM tarot_readings
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '${period} days'
      ORDER BY created_at DESC
    `;

    if (result.rows.length < 3) {
      return null; // Not enough data
    }

    // Analyze suit distribution
    const suitCounts = new Map<string, number>();
    const cardCounts = new Map<string, number>();
    const themeCounts = new Map<string, number>();

    for (const row of result.rows) {
      const cards = Array.isArray(row.cards) ? row.cards : [];

      for (const cardData of cards) {
        const card = cardData.card || cardData;
        const cardName = card.name || '';
        const suit = card.suit || card.arcana || 'Major Arcana';

        // Count suits
        suitCounts.set(suit, (suitCounts.get(suit) || 0) + 1);

        // Count cards
        cardCounts.set(cardName, (cardCounts.get(cardName) || 0) + 1);

        // Infer themes from keywords
        const keywords = card.keywords || [];
        for (const keyword of keywords) {
          const theme = inferThemeFromKeyword(keyword);
          if (theme) {
            themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1);
          }
        }
      }
    }

    // Calculate suit distribution
    const totalCards = Array.from(suitCounts.values()).reduce(
      (sum, count) => sum + count,
      0,
    );
    const suitDistribution = Array.from(suitCounts.entries())
      .map(([suit, count]) => ({
        suit,
        count,
        percentage: (count / totalCards) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // Get top suit
    const topSuit = suitDistribution[0];
    if (!topSuit) {
      return null;
    }

    // Map suit to season
    const seasonMap: Record<string, { name: string; description: string }> = {
      Cups: {
        name: 'Emotional Depth',
        description: 'feelings, relationships, intuition',
      },
      Wands: {
        name: 'Creative Fire',
        description: 'passion, action, inspiration',
      },
      Swords: {
        name: 'Mental Clarity',
        description: 'truth, communication, decisions',
      },
      Pentacles: {
        name: 'Grounded Growth',
        description: 'stability, resources, manifestation',
      },
      'Major Arcana': {
        name: 'Soul Journey',
        description: 'major life lessons and transitions',
      },
    };

    const season = seasonMap[topSuit.suit] || {
      name: 'Unfolding Journey',
      description: 'diverse energies at play',
    };

    // Get dominant theme
    const dominantTheme =
      Array.from(themeCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      'transformation';

    // Get frequent cards
    const frequentCards = Array.from(cardCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const snapshot: TarotSeasonSnapshot = {
      type: 'tarot_season',
      season: {
        name: season.name,
        suit: topSuit.suit,
        description: season.description,
      },
      dominantTheme,
      suitDistribution,
      frequentCards,
      period,
      timestamp: new Date().toISOString(),
    };

    return snapshot;
  } catch (error) {
    console.error('Error generating tarot season snapshot:', error);
    return null;
  }
}

/**
 * Infer theme from tarot card keyword
 */
function inferThemeFromKeyword(keyword: string): string | null {
  const lowerKeyword = keyword.toLowerCase();

  const themeMap: Record<string, string[]> = {
    healing: ['healing', 'recovery', 'restoration', 'peace', 'calm'],
    transformation: [
      'change',
      'transformation',
      'rebirth',
      'renewal',
      'evolution',
    ],
    creativity: ['creativity', 'inspiration', 'expression', 'art', 'creation'],
    action: ['action', 'movement', 'progress', 'momentum', 'energy'],
    reflection: [
      'reflection',
      'contemplation',
      'meditation',
      'introspection',
      'wisdom',
    ],
    truth: ['truth', 'clarity', 'honesty', 'revelation', 'insight'],
    abundance: [
      'abundance',
      'prosperity',
      'wealth',
      'success',
      'manifestation',
    ],
    connection: [
      'connection',
      'relationship',
      'love',
      'partnership',
      'community',
    ],
  };

  for (const [theme, keywords] of Object.entries(themeMap)) {
    if (keywords.some((kw) => lowerKeyword.includes(kw))) {
      return theme;
    }
  }

  return null;
}

/**
 * Generate all snapshots for a user
 */
export async function generateAllSnapshots(
  userId: string,
): Promise<PatternSnapshot[]> {
  const snapshots: PatternSnapshot[] = [];

  // Generate life themes
  const lifeThemes = await generateLifeThemesSnapshot(userId);
  if (lifeThemes) {
    snapshots.push(lifeThemes);
  }

  // Generate tarot season
  const tarotSeason = await generateTarotSeasonSnapshot(userId, 30);
  if (tarotSeason) {
    snapshots.push(tarotSeason);
  }

  return snapshots;
}
