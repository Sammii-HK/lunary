/**
 * Backfill historical pattern snapshots
 *
 * Generates weekly snapshots going back in time to show pattern evolution:
 * - Life Themes (from journal + dreams + tarot)
 * - Tarot Season (from tarot suit distribution over time)
 *
 * Creates snapshots for each week, using data from that time period
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { encryptJSON } from '@/lib/encryption';
import {
  analyzeLifeThemes,
  hasEnoughDataForThemes,
} from '@/lib/life-themes/engine';
import type { LifeThemeInput } from '@/lib/life-themes/engine';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 },
        );
      }
    }

    // Get parameters
    const body = await request.json().catch(() => ({}));
    const weeksBack = body.weeksBack || 26; // Default to 6 months
    const batchSize = body.batchSize || 10;

    // Get all users with journal or tarot activity
    const usersResult = await sql`
      SELECT DISTINCT u.id, u.email, u."createdAt"
      FROM "user" u
      WHERE EXISTS (
        SELECT 1 FROM collections c
        WHERE c.user_id = u.id
          AND c.created_at >= NOW() - INTERVAL '180 days'
        LIMIT 1
      )
      OR EXISTS (
        SELECT 1 FROM tarot_readings tr
        WHERE tr.user_id = u.id
          AND tr.created_at >= NOW() - INTERVAL '180 days'
        LIMIT 1
      )
      ORDER BY u."createdAt" DESC
    `;

    const users = usersResult.rows;
    console.log(
      `🕐 Backfilling pattern snapshots for ${users.length} users (${weeksBack} weeks)`,
    );

    const results = {
      total: users.length,
      processed: 0,
      snapshotsGenerated: 0,
      errors: 0,
      details: [] as any[],
    };

    // Process users in batches
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      console.log(
        `\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(users.length / batchSize)}`,
      );

      await Promise.all(
        batch.map(async (user) => {
          try {
            let userSnapshots = 0;

            // Generate snapshots for each week going back in time
            for (let week = 0; week < weeksBack; week++) {
              const snapshotDate = dayjs()
                .subtract(week, 'weeks')
                .startOf('week'); // Sunday
              const periodStart = snapshotDate.subtract(30, 'days'); // Look back 30 days from that point
              const periodEnd = snapshotDate;

              // Skip if before user creation
              if (periodStart.isBefore(dayjs(user.createdAt))) {
                continue;
              }

              // Generate Tarot Season snapshot for this period
              const tarotSnapshot = await generateHistoricalTarotSeason(
                user.id,
                periodStart.toDate(),
                periodEnd.toDate(),
                snapshotDate.toISOString(),
              );

              if (tarotSnapshot) {
                await saveHistoricalSnapshot(
                  user.id,
                  tarotSnapshot,
                  snapshotDate.toISOString(),
                );
                userSnapshots++;
              }

              // Generate Life Themes snapshot for this period
              const lifeThemesSnapshot = await generateHistoricalLifeThemes(
                user.id,
                periodStart.toDate(),
                periodEnd.toDate(),
                snapshotDate.toISOString(),
              );

              if (lifeThemesSnapshot) {
                await saveHistoricalSnapshot(
                  user.id,
                  lifeThemesSnapshot,
                  snapshotDate.toISOString(),
                );
                userSnapshots++;
              }

              // Generate Archetype snapshot for this period
              const archetypeSnapshot = await generateHistoricalArchetype(
                user.id,
                periodStart.toDate(),
                periodEnd.toDate(),
                snapshotDate.toISOString(),
              );

              if (archetypeSnapshot) {
                await saveHistoricalSnapshot(
                  user.id,
                  archetypeSnapshot,
                  snapshotDate.toISOString(),
                );
                userSnapshots++;
              }
            }

            if (userSnapshots > 0) {
              results.processed++;
              results.snapshotsGenerated += userSnapshots;
              results.details.push({
                email: user.email,
                snapshots: userSnapshots,
                weeks: weeksBack,
              });
            }

            console.log(
              `✅ ${user.email}: ${userSnapshots} snapshots generated`,
            );
          } catch (error) {
            console.error(`❌ Error processing ${user.email}:`, error);
            results.errors++;
            results.details.push({
              email: user.email,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }),
      );

      // Small delay between batches
      if (i + batchSize < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const duration = Date.now() - startTime;

    console.log(`\n✅ Backfill complete in ${(duration / 1000).toFixed(1)}s`);
    console.log(`📊 Processed: ${results.processed}/${results.total}`);
    console.log(`📸 Snapshots generated: ${results.snapshotsGenerated}`);
    console.log(`❌ Errors: ${results.errors}`);

    return NextResponse.json({
      success: true,
      summary: {
        totalUsers: results.total,
        processed: results.processed,
        snapshotsGenerated: results.snapshotsGenerated,
        errors: results.errors,
        duration: `${(duration / 1000).toFixed(1)}s`,
        weeksBackfilled: weeksBack,
      },
      details: results.details.slice(0, 50),
    });
  } catch (error) {
    console.error('❌ Backfill failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * Generate Tarot Season snapshot for a specific historical period
 */
async function generateHistoricalTarotSeason(
  userId: string,
  startDate: Date,
  endDate: Date,
  timestamp: string,
): Promise<any | null> {
  try {
    // Fetch tarot readings from this period
    const result = await sql`
      SELECT cards, created_at
      FROM tarot_readings
      WHERE user_id = ${userId}
        AND created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
      ORDER BY created_at DESC
    `;

    if (result.rows.length < 3) {
      return null; // Not enough data for this period
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

        suitCounts.set(suit, (suitCounts.get(suit) || 0) + 1);
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

    // Calculate distribution
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

    const topSuit = suitDistribution[0];
    if (!topSuit) return null;

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

    const dominantTheme =
      Array.from(themeCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      'transformation';

    const frequentCards = Array.from(cardCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      type: 'tarot_season',
      season: {
        name: season.name,
        suit: topSuit.suit,
        description: season.description,
      },
      dominantTheme,
      suitDistribution,
      frequentCards,
      period: Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
      timestamp,
    };
  } catch (error) {
    console.error('Error generating historical tarot season:', error);
    return null;
  }
}

/**
 * Generate Life Themes snapshot for a specific historical period
 * Uses the REAL life themes engine with proper scoring
 */
async function generateHistoricalLifeThemes(
  userId: string,
  startDate: Date,
  endDate: Date,
  timestamp: string,
): Promise<any | null> {
  try {
    // Fetch journal entries from this period
    const journalResult = await sql`
      SELECT content, tags, created_at
      FROM collections
      WHERE user_id = ${userId}
        AND category = 'journal'
        AND created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
      ORDER BY created_at DESC
      LIMIT 30
    `;

    // Fetch dreams from this period
    const dreamsResult = await sql`
      SELECT content, tags
      FROM collections
      WHERE user_id = ${userId}
        AND category = 'dream'
        AND created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    // Fetch tarot readings from this period for pattern analysis
    const tarotResult = await sql`
      SELECT cards
      FROM tarot_readings
      WHERE user_id = ${userId}
        AND created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
      ORDER BY created_at DESC
    `;

    // Format journal entries with defensive type checking
    const journalEntries = journalResult.rows.map((row) => {
      // Ensure content is a string
      let content = '';
      if (typeof row.content === 'string') {
        content = row.content;
      } else if (row.content && typeof row.content === 'object') {
        // If it's stored as JSON with a 'text' field, extract it
        if ('text' in row.content) {
          content = String(row.content.text || '');
        } else {
          // Otherwise stringify the whole object
          content = JSON.stringify(row.content);
        }
      } else if (row.content) {
        // Try to convert to string
        content = String(row.content);
      }

      return {
        content,
        moodTags: Array.isArray(row.tags) ? row.tags : [],
        createdAt: row.created_at,
      };
    });

    // Extract dream tags
    const dreamTags = dreamsResult.rows.flatMap((row) =>
      Array.isArray(row.tags) ? row.tags : [],
    );

    // Build tarot patterns from readings
    let tarotPatterns = null;
    if (tarotResult.rows.length >= 5) {
      const cardCounts = new Map<string, number>();
      const suitCounts = new Map<string, number>();

      for (const row of tarotResult.rows) {
        const cards = Array.isArray(row.cards) ? row.cards : [];
        for (const cardData of cards) {
          const card = cardData.card || cardData;
          const cardName = card.name || '';
          const suit = card.suit || card.arcana || 'Major Arcana';

          cardCounts.set(cardName, (cardCounts.get(cardName) || 0) + 1);
          suitCounts.set(suit, (suitCounts.get(suit) || 0) + 1);
        }
      }

      const frequentCards = Array.from(cardCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      const suitDistribution = Array.from(suitCounts.entries())
        .map(([suit, count]) => ({ suit, count }))
        .sort((a, b) => b.count - a.count);

      tarotPatterns = {
        dominantThemes: [], // Can be inferred from keywords if needed
        frequentCards,
        suitDistribution,
      };
    }

    // Build input for Life Themes engine
    const input: LifeThemeInput = {
      journalEntries,
      tarotPatterns,
      dreamTags,
    };

    // Check if we have enough data
    if (!hasEnoughDataForThemes(input)) {
      return null;
    }

    // Use the REAL Life Themes engine!
    const themes = analyzeLifeThemes(input, 3);

    if (themes.length === 0) {
      return null;
    }

    // Convert to snapshot format
    return {
      type: 'life_themes',
      themes: themes.map((theme) => ({
        id: theme.id,
        name: theme.name,
        score: theme.score,
        shortSummary: theme.shortSummary,
        sources: {
          journalEntries: journalEntries.length,
          tarotCards:
            tarotPatterns?.frequentCards.slice(0, 5).map((c) => c.name) || [],
          dreamTags: dreamTags.slice(0, 10),
        },
      })),
      dominantTheme: themes[0].name,
      timestamp,
    };
  } catch (error) {
    console.error('Error generating historical life themes:', error);
    return null;
  }
}

/**
 * Save historical snapshot with custom timestamp
 */
async function saveHistoricalSnapshot(
  userId: string,
  snapshot: any,
  timestamp: string,
): Promise<void> {
  try {
    const encryptedData = encryptJSON(snapshot);
    const jsonbData = JSON.stringify({ encrypted: encryptedData });

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    await sql`
      INSERT INTO journal_patterns (
        user_id,
        pattern_type,
        pattern_data,
        generated_at,
        expires_at
      ) VALUES (
        ${userId},
        ${snapshot.type},
        ${jsonbData}::jsonb,
        ${timestamp},
        ${expiresAt.toISOString()}
      )
    `;
  } catch (error) {
    console.error('Error saving historical snapshot:', error);
    throw error;
  }
}

/**
 * Generate Archetype snapshot for a specific historical period
 */
async function generateHistoricalArchetype(
  userId: string,
  startDate: Date,
  endDate: Date,
  timestamp: string,
): Promise<any | null> {
  try {
    // Import archetype detector dynamically to avoid circular deps
    const { detectArchetypes, hasEnoughDataForArchetypes } =
      await import('@/lib/archetypes/detector');

    // Fetch journal entries from this period
    const journalResult = await sql`
      SELECT content, tags
      FROM collections
      WHERE user_id = ${userId}
        AND category = 'journal'
        AND created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
      ORDER BY created_at DESC
      LIMIT 30
    `;

    // Fetch dreams from this period
    const dreamsResult = await sql`
      SELECT tags
      FROM collections
      WHERE user_id = ${userId}
        AND category = 'dream'
        AND created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    // Fetch tarot readings from this period
    const tarotResult = await sql`
      SELECT cards
      FROM tarot_readings
      WHERE user_id = ${userId}
        AND created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
      ORDER BY created_at DESC
    `;

    // Format journal entries
    const journalEntries = journalResult.rows.map((row) => {
      let content = '';
      if (typeof row.content === 'string') {
        content = row.content;
      } else if (row.content && typeof row.content === 'object') {
        if ('text' in row.content) {
          content = String(row.content.text || '');
        } else {
          content = JSON.stringify(row.content);
        }
      } else if (row.content) {
        content = String(row.content);
      }

      return {
        content,
        moodTags: Array.isArray(row.tags) ? row.tags : [],
      };
    });

    // Extract dream tags
    const dreamTags = dreamsResult.rows.flatMap((row) =>
      Array.isArray(row.tags) ? row.tags : [],
    );

    // Extract tarot majors and suits
    const tarotMajors: string[] = [];
    const suitCounts = new Map<string, number>();

    for (const row of tarotResult.rows) {
      const cards = Array.isArray(row.cards) ? row.cards : [];
      for (const cardData of cards) {
        const card = cardData.card || cardData;
        const cardName = card.name || '';
        const suit = card.suit || card.arcana || 'Major Arcana';

        if (isMajorArcana(cardName)) {
          tarotMajors.push(cardName);
        }

        suitCounts.set(suit, (suitCounts.get(suit) || 0) + 1);
      }
    }

    const tarotSuits = Array.from(suitCounts.entries())
      .map(([suit, count]) => ({ suit, count }))
      .sort((a, b) => b.count - a.count);

    const input = {
      journalEntries,
      dreamTags,
      tarotMajors,
      tarotSuits,
    };

    // Check if we have enough data
    if (!hasEnoughDataForArchetypes(input)) {
      return null;
    }

    // Detect top 3 archetypes
    const archetypes = detectArchetypes(input, 3);

    if (archetypes.length === 0) {
      return null;
    }

    // Convert to snapshot format
    return {
      type: 'archetype',
      archetypes: archetypes.map((archetype) => ({
        name: archetype.name,
        strength: archetype.score,
        basedOn: [
          ...tarotMajors.slice(0, 5),
          ...journalEntries.flatMap((e) => e.moodTags).slice(0, 5),
        ],
      })),
      dominantArchetype: archetypes[0].name,
      timestamp,
    };
  } catch (error) {
    console.error('Error generating historical archetype:', error);
    return null;
  }
}

function isMajorArcana(cardName: string): boolean {
  const majors = [
    'The Fool',
    'The Magician',
    'The High Priestess',
    'The Empress',
    'The Emperor',
    'The Hierophant',
    'The Lovers',
    'The Chariot',
    'Strength',
    'The Hermit',
    'Wheel of Fortune',
    'Justice',
    'The Hanged Man',
    'Death',
    'Temperance',
    'The Devil',
    'The Tower',
    'The Star',
    'The Moon',
    'The Sun',
    'Judgement',
    'The World',
  ];
  return majors.includes(cardName);
}

/**
 * Infer theme from keyword
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
