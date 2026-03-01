/**
 * Debug endpoint to see why Life Themes aren't being generated
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  analyzeLifeThemes,
  hasEnoughDataForThemes,
} from '@/lib/life-themes/engine';
import type { LifeThemeInput } from '@/lib/life-themes/engine';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email') || 'kellow.sammii@gmail.com';
    const daysBack = parseInt(searchParams.get('days') || '30');

    // Get user ID
    const userResult = await sql`
      SELECT id FROM "user" WHERE email = ${email} LIMIT 1
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userResult.rows[0].id;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Fetch journal entries
    const journalResult = await sql`
      SELECT content, tags, created_at
      FROM collections
      WHERE user_id = ${userId}
        AND category = 'journal'
        AND created_at >= ${startDate.toISOString()}
      ORDER BY created_at DESC
      LIMIT 30
    `;

    // Fetch dreams
    const dreamsResult = await sql`
      SELECT content, tags
      FROM collections
      WHERE user_id = ${userId}
        AND category = 'dream'
        AND created_at >= ${startDate.toISOString()}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    // Fetch tarot readings
    const tarotResult = await sql`
      SELECT cards
      FROM tarot_readings
      WHERE user_id = ${userId}
        AND created_at >= ${startDate.toISOString()}
      ORDER BY created_at DESC
    `;

    // Format data with defensive type checking
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

    const dreamTags = dreamsResult.rows.flatMap((row) =>
      Array.isArray(row.tags) ? row.tags : [],
    );

    // Build tarot patterns
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
        dominantThemes: [],
        frequentCards,
        suitDistribution,
      };
    }

    const input: LifeThemeInput = {
      journalEntries,
      tarotPatterns,
      dreamTags,
    };

    const hasEnoughData = hasEnoughDataForThemes(input);
    const themes = hasEnoughData ? analyzeLifeThemes(input, 3) : [];

    return NextResponse.json({
      success: true,
      email,
      daysBack,
      dataAvailable: {
        journalEntries: journalEntries.length,
        tarotReadings: tarotResult.rows.length,
        tarotFrequentCards: tarotPatterns?.frequentCards.length || 0,
        dreamTags: dreamTags.length,
      },
      hasEnoughData,
      themesDetected: themes.length,
      themes: themes.map((t) => ({
        id: t.id,
        name: t.name,
        score: t.score,
        shortSummary: t.shortSummary,
      })),
      // Sample data for debugging
      sampleJournal: journalEntries.slice(0, 3).map((e) => ({
        contentPreview: e.content.substring(0, 100),
        moodTags: e.moodTags,
      })),
      sampleTarotCards: tarotPatterns?.frequentCards.slice(0, 5) || [],
      sampleDreamTags: dreamTags.slice(0, 10),
    });
  } catch (error) {
    console.error('Error debugging life themes:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
