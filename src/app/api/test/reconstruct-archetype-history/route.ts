/**
 * Reconstruct archetype evolution history
 * Goes through user history week by week, detecting archetypes and saving when they change
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import dayjs from 'dayjs';
import { encryptJSON } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email') || 'kellow.sammii@gmail.com';

    const userResult = await sql`
      SELECT id, "createdAt" FROM "user" WHERE email = ${email} LIMIT 1
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    const accountCreated = dayjs(user.createdAt);
    const today = dayjs();

    // Import archetype detector
    const { detectArchetypes, hasEnoughDataForArchetypes } =
      await import('@/lib/archetypes/detector');

    const results = [];
    let previousArchetype: string | null = null;
    let snapshotsSaved = 0;

    // Go through history week by week
    let currentDate = accountCreated;
    let weekCount = 0;

    while (currentDate.isBefore(today)) {
      weekCount++;
      const checkDate = currentDate.add(1, 'week');

      // Use a 60-day window looking back from this date
      const windowStart = checkDate.subtract(60, 'days');
      const windowEnd = checkDate;

      console.log(`\n📅 Week ${weekCount}: ${checkDate.format('YYYY-MM-DD')}`);
      console.log(
        `   Window: ${windowStart.format('YYYY-MM-DD')} to ${windowEnd.format('YYYY-MM-DD')}`,
      );

      // Fetch data for this time window
      const journalResult = await sql`
        SELECT content, tags
        FROM collections
        WHERE user_id = ${user.id}
          AND category = 'journal'
          AND created_at >= ${windowStart.toISOString()}
          AND created_at <= ${windowEnd.toISOString()}
        ORDER BY created_at DESC
        LIMIT 30
      `;

      const dreamsResult = await sql`
        SELECT tags
        FROM collections
        WHERE user_id = ${user.id}
          AND category = 'dream'
          AND created_at >= ${windowStart.toISOString()}
          AND created_at <= ${windowEnd.toISOString()}
        ORDER BY created_at DESC
        LIMIT 20
      `;

      const tarotResult = await sql`
        SELECT cards
        FROM tarot_readings
        WHERE user_id = ${user.id}
          AND created_at >= ${windowStart.toISOString()}
          AND created_at <= ${windowEnd.toISOString()}
        ORDER BY created_at DESC
      `;

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

      // Extract tarot cards with frequency counting (match ArchetypeBar logic)
      const cardFrequency = new Map<string, number>();
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

          if (cardName) {
            cardFrequency.set(cardName, (cardFrequency.get(cardName) || 0) + 1);
          }
          suitCounts.set(suit, (suitCounts.get(suit) || 0) + 1);
        }
      }

      // Filter to frequent cards only (2+ appearances) and major arcana
      const tarotMajors = Array.from(cardFrequency.entries())
        .filter(([cardName, count]) => count >= 2 && majors.includes(cardName))
        .map(([cardName]) => cardName);

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
        `   Data: ${journalEntries.length} journals, ${dreamTags.length} dream tags, ${tarotMajors.length} tarot majors`,
      );

      // Check if enough data
      if (!hasEnoughDataForArchetypes(input)) {
        console.log(`   ⏭️  Skipped: Not enough data`);
        results.push({
          week: weekCount,
          date: checkDate.format('YYYY-MM-DD'),
          status: 'insufficient_data',
        });
        currentDate = checkDate;
        continue;
      }

      // Detect archetypes
      const archetypes = detectArchetypes(input, 3);
      const dominantArchetype = archetypes[0]?.name;
      const strength = archetypes[0]?.score;

      console.log(`   🎭 Detected: ${dominantArchetype} (${strength})`);

      // Check if archetype changed
      const archetypeChanged = previousArchetype !== dominantArchetype;

      if (archetypeChanged && dominantArchetype) {
        console.log(
          `   ✨ CHANGE: ${previousArchetype || 'none'} → ${dominantArchetype}`,
        );

        // Save snapshot
        const snapshot = {
          type: 'archetype',
          archetypes: archetypes.map((a) => ({
            name: a.name,
            strength: a.score,
            basedOn: [
              ...tarotMajors.slice(0, 5),
              ...journalEntries.flatMap((e) => e.moodTags).slice(0, 5),
            ],
          })),
          dominantArchetype,
          timestamp: checkDate.toISOString(),
        };

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
            ${checkDate.toISOString()},
            ${expiresAt.toISOString()}
          )
          ON CONFLICT DO NOTHING
        `;

        snapshotsSaved++;

        results.push({
          week: weekCount,
          date: checkDate.format('YYYY-MM-DD'),
          status: 'saved',
          previousArchetype: previousArchetype || 'none',
          newArchetype: dominantArchetype,
          strength,
          allArchetypes: archetypes.map((a) => ({
            name: a.name,
            strength: a.score,
          })),
        });

        previousArchetype = dominantArchetype;
      } else {
        console.log(`   → Same: ${dominantArchetype}`);
        results.push({
          week: weekCount,
          date: checkDate.format('YYYY-MM-DD'),
          status: 'unchanged',
          archetype: dominantArchetype,
          strength,
        });
      }

      currentDate = checkDate;
    }

    console.log(`\n✅ Reconstruction complete!`);
    console.log(`📸 Snapshots saved: ${snapshotsSaved}`);
    console.log(`📊 Weeks analyzed: ${weekCount}`);

    return NextResponse.json({
      success: true,
      email,
      summary: {
        weeksAnalyzed: weekCount,
        snapshotsSaved,
        archetypeShifts: results.filter((r) => r.status === 'saved'),
      },
      evolution: results,
    });
  } catch (error) {
    console.error('Error reconstructing archetype history:', error);
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
