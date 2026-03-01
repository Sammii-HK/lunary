/**
 * Test backfill archetypes only for specific user with detailed logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import dayjs from 'dayjs';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email') || 'kellow.sammii@gmail.com';
    const monthsBack = parseInt(searchParams.get('months') || '6');

    const userResult = await sql`
      SELECT id, "createdAt" FROM "user" WHERE email = ${email} LIMIT 1
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    const results = [];

    // Import archetype detector
    const { detectArchetypes, hasEnoughDataForArchetypes } =
      await import('@/lib/archetypes/detector');

    // Generate monthly archetype snapshots
    for (let month = 0; month < monthsBack; month++) {
      // For month 0 (current), use today's date; for historical months, use start of month
      const snapshotDate =
        month === 0
          ? dayjs()
          : dayjs().subtract(month, 'months').startOf('month');
      const periodStart = snapshotDate.subtract(60, 'days');
      const periodEnd = snapshotDate;

      console.log(`\n📅 Month ${month}: ${snapshotDate.format('YYYY-MM-DD')}`);
      console.log(
        `   Period: ${periodStart.format('YYYY-MM-DD')} to ${periodEnd.format('YYYY-MM-DD')}`,
      );

      // Skip if before user creation
      if (periodStart.isBefore(dayjs(user.createdAt))) {
        console.log(`   ⏭️  Skipped: Before user creation`);
        results.push({
          month,
          snapshotDate: snapshotDate.format('YYYY-MM-DD'),
          skipped: 'before_creation',
        });
        continue;
      }

      // Fetch data for this period
      const journalResult = await sql`
        SELECT content, tags
        FROM collections
        WHERE user_id = ${user.id}
          AND category = 'journal'
          AND created_at >= ${periodStart.toISOString()}
          AND created_at <= ${periodEnd.toISOString()}
        ORDER BY created_at DESC
        LIMIT 30
      `;

      const dreamsResult = await sql`
        SELECT tags
        FROM collections
        WHERE user_id = ${user.id}
          AND category = 'dream'
          AND created_at >= ${periodStart.toISOString()}
          AND created_at <= ${periodEnd.toISOString()}
        ORDER BY created_at DESC
        LIMIT 20
      `;

      const tarotResult = await sql`
        SELECT cards
        FROM tarot_readings
        WHERE user_id = ${user.id}
          AND created_at >= ${periodStart.toISOString()}
          AND created_at <= ${periodEnd.toISOString()}
        ORDER BY created_at DESC
      `;

      console.log(
        `   Data found: ${journalResult.rows.length} journals, ${dreamsResult.rows.length} dreams, ${tarotResult.rows.length} tarot`,
      );

      // Format data
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

      const dreamTags = dreamsResult.rows.flatMap((row) =>
        Array.isArray(row.tags) ? row.tags : [],
      );

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

      const input = {
        journalEntries,
        dreamTags,
        tarotMajors,
        tarotSuits,
      };

      console.log(
        `   Input: ${journalEntries.length} journals, ${dreamTags.length} dream tags, ${tarotMajors.length} tarot majors`,
      );

      // Check if enough data
      if (!hasEnoughDataForArchetypes(input)) {
        console.log(`   ⏭️  Skipped: Not enough data`);
        results.push({
          month,
          snapshotDate: snapshotDate.format('YYYY-MM-DD'),
          skipped: 'insufficient_data',
          data: {
            journals: journalEntries.length,
            dreamTags: dreamTags.length,
            tarotMajors: tarotMajors.length,
          },
        });
        continue;
      }

      // Detect archetypes
      const archetypes = detectArchetypes(input, 3);
      const snapshot = {
        type: 'archetype',
        archetypes,
        dominantArchetype: archetypes[0]?.name || 'Unknown',
        timestamp: snapshotDate.toISOString(),
      };

      console.log(
        `   ✅ Generated: ${snapshot.dominantArchetype} (${archetypes[0]?.strength})`,
      );

      // Save
      const { encryptJSON } = await import('@/lib/encryption');
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
          ${user.id},
          'archetype',
          ${jsonbData}::jsonb,
          ${snapshotDate.toISOString()},
          ${expiresAt.toISOString()}
        )
        ON CONFLICT DO NOTHING
      `;

      results.push({
        month,
        snapshotDate: snapshotDate.format('YYYY-MM-DD'),
        generated: true,
        dominantArchetype: snapshot.dominantArchetype,
        strength: archetypes[0]?.strength,
        allArchetypes: archetypes.map((a) => ({
          name: a.name,
          strength: a.strength,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      email,
      monthsBackfilled: monthsBack,
      results,
    });
  } catch (error) {
    console.error('Error backfilling archetypes:', error);
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
