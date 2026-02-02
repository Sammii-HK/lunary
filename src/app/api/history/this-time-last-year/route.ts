import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';

/**
 * GET /api/history/this-time-last-year
 *
 * Fetches user's historical data from approximately one year ago (±7 days)
 * Returns: journal entries, tarot readings from that time period
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userId = user.id;

    // Calculate date range: 1 year ago ±7 days
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const startDate = new Date(oneYearAgo);
    startDate.setDate(startDate.getDate() - 7);

    const endDate = new Date(oneYearAgo);
    endDate.setDate(endDate.getDate() + 7);

    // Fetch journal entries from this time last year
    const journalResult = await sql`
      SELECT
        id,
        category,
        content,
        created_at
      FROM collections
      WHERE user_id = ${userId}
        AND category IN ('journal', 'dream', 'ritual')
        AND created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    // Fetch tarot readings from this time last year
    const tarotResult = await sql`
      SELECT
        id,
        spread_slug,
        cards,
        summary,
        highlights,
        created_at
      FROM tarot_readings
      WHERE user_id = ${userId}
        AND created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    // Parse journal entries (content is JSON with text, moodTags, etc.)
    const journalEntries = journalResult.rows.map((row) => {
      const contentData =
        typeof row.content === 'string' ? JSON.parse(row.content) : row.content;

      return {
        id: row.id,
        content: contentData?.text || '',
        moodTags: contentData?.moodTags || [],
        cardReferences: contentData?.cardReferences || [],
        moonPhase: contentData?.moonPhase || null,
        category: row.category || 'journal',
        createdAt: row.created_at,
      };
    });

    // Parse tarot readings
    const tarotReadings = tarotResult.rows.map((row) => {
      let cards = [];
      try {
        cards =
          typeof row.cards === 'string' ? JSON.parse(row.cards) : row.cards;
      } catch {
        cards = [];
      }

      let highlights = [];
      try {
        highlights =
          typeof row.highlights === 'string'
            ? JSON.parse(row.highlights)
            : row.highlights || [];
      } catch {
        highlights = [];
      }

      return {
        id: row.id,
        spreadSlug: row.spread_slug,
        cards,
        summary: row.summary,
        highlights,
        createdAt: row.created_at,
      };
    });

    // Extract card names for frequency analysis
    const cardFrequency: Record<string, number> = {};
    tarotReadings.forEach((reading) => {
      if (Array.isArray(reading.cards)) {
        reading.cards.forEach((card: any) => {
          const cardName = card?.card?.name || card?.name;
          if (cardName) {
            cardFrequency[cardName] = (cardFrequency[cardName] || 0) + 1;
          }
        });
      }
    });

    const frequentCards = Object.entries(cardFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Extract mood themes
    const moodFrequency: Record<string, number> = {};
    journalEntries.forEach((entry) => {
      if (Array.isArray(entry.moodTags)) {
        entry.moodTags.forEach((mood: string) => {
          moodFrequency[mood] = (moodFrequency[mood] || 0) + 1;
        });
      }
    });

    const dominantMoods = Object.entries(moodFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([mood, count]) => ({ mood, count }));

    // Check if we have any data
    const hasData = journalEntries.length > 0 || tarotReadings.length > 0;

    return NextResponse.json({
      hasData,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        centerDate: oneYearAgo.toISOString(),
      },
      summary: {
        journalCount: journalEntries.length,
        tarotCount: tarotReadings.length,
        frequentCards,
        dominantMoods,
      },
      journalEntries: journalEntries.slice(0, 3), // Return top 3 for preview
      tarotReadings: tarotReadings.slice(0, 3), // Return top 3 for preview
    });
  } catch (error) {
    console.error('[ThisTimeLastYear] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 },
    );
  }
}
