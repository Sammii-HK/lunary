/**
 * Debug: Compare ArchetypeBar method vs Snapshot method
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { detectArchetypes } from '@/lib/archetypes/detector';
import type { ArchetypeDetectorInput } from '@/lib/archetypes/detector';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email') || 'kellow.sammii@gmail.com';

    const userResult =
      await sql`SELECT id FROM "user" WHERE email = ${email} LIMIT 1`;
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = userResult.rows[0].id;

    // METHOD 1: Snapshot approach (database queries)
    const journalResult = await sql`
      SELECT content, tags
      FROM collections
      WHERE user_id = ${userId}
        AND category = 'journal'
        AND created_at >= NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
      LIMIT 30
    `;

    const journalEntries = journalResult.rows.map((row) => {
      let content = '';
      if (typeof row.content === 'string') {
        content = row.content;
      } else if (
        row.content &&
        typeof row.content === 'object' &&
        'text' in row.content
      ) {
        content = String(row.content.text || '');
      }
      return {
        content,
        moodTags: Array.isArray(row.tags) ? row.tags : [],
      };
    });

    const dreamsResult = await sql`
      SELECT tags FROM collections
      WHERE user_id = ${userId} AND category = 'dream'
        AND created_at >= NOW() - INTERVAL '30 days'
      LIMIT 20
    `;
    const dreamTags = dreamsResult.rows.flatMap((row) =>
      Array.isArray(row.tags) ? row.tags : [],
    );

    const tarotResult = await sql`
      SELECT cards FROM tarot_readings
      WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '30 days'
    `;

    const tarotMajors: string[] = [];
    const suitCounts = new Map<string, number>();

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

    for (const row of tarotResult.rows) {
      const cards = Array.isArray(row.cards) ? row.cards : [];
      for (const cardData of cards) {
        const card = cardData.card || cardData;
        const cardName = card.name || '';
        const suit = card.suit || card.arcana || 'Major Arcana';

        if (majors.includes(cardName)) {
          tarotMajors.push(cardName);
        }
        suitCounts.set(suit, (suitCounts.get(suit) || 0) + 1);
      }
    }

    const tarotSuits = Array.from(suitCounts.entries())
      .map(([suit, count]) => ({ suit, count }))
      .sort((a, b) => b.count - a.count);

    const input: ArchetypeDetectorInput = {
      journalEntries,
      dreamTags,
      tarotMajors,
      tarotSuits,
    };

    const snapshotArchetypes = detectArchetypes(input, 3);

    return NextResponse.json({
      success: true,
      email,
      dataUsed: {
        journalEntries: journalEntries.length,
        journalContentSample: journalEntries.slice(0, 2).map((e) => ({
          contentLength: e.content.length,
          preview: e.content.substring(0, 100),
          moodTags: e.moodTags,
        })),
        dreamTags: dreamTags.length,
        tarotMajors: tarotMajors.length,
        tarotMajorsSample: tarotMajors.slice(0, 5),
        tarotSuits: tarotSuits,
      },
      archetypes: snapshotArchetypes,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
