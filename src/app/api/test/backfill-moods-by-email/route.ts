import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { detectMoods } from '@/lib/journal/mood-detector';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Test endpoint to backfill moods for a specific user by email
 * WARNING: For testing only - production should use authenticated endpoint
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { email, daysBack = 90, method = 'keyword', dryRun = true } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email required in body' },
        { status: 400 },
      );
    }

    console.log(
      `🔄 Starting mood backfill for ${email} (${daysBack} days, method: ${method}, dryRun: ${dryRun})`,
    );

    // Get user ID
    const userResult = await sql`
      SELECT id FROM "user" WHERE email = ${email} LIMIT 1
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userResult.rows[0].id;

    // Get journal entries
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const entriesResult = await sql`
      SELECT id, content, created_at
      FROM collections
      WHERE user_id = ${userId}
      AND category = 'journal'
      AND created_at >= ${cutoffDate.toISOString()}
      ORDER BY created_at DESC
    `;

    console.log(`📝 Found ${entriesResult.rows.length} journal entries`);

    const updates: Array<{
      id: string;
      date: string;
      oldMoods: string[];
      newMoods: string[];
      text: string;
      detectedMoods: string[];
    }> = [];

    let processed = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of entriesResult.rows) {
      const content =
        typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
      const text = content.text || '';
      const existingMoods = content.moodTags || [];

      processed++;

      // Skip if text is too short
      if (text.length < 20) {
        skipped++;
        continue;
      }

      // Skip if already has 3+ mood tags (well-tagged)
      if (existingMoods.length >= 3) {
        skipped++;
        continue;
      }

      // Detect moods
      const detection = await detectMoods(text, method === 'ai');

      if (detection.moods.length === 0) {
        skipped++;
        continue;
      }

      // Merge with existing moods
      const mergedMoods = [
        ...existingMoods,
        ...detection.moods.filter((m: string) => !existingMoods.includes(m)),
      ].slice(0, 5);

      updates.push({
        id: row.id,
        date: new Date(row.created_at).toISOString().split('T')[0],
        oldMoods: existingMoods,
        newMoods: mergedMoods,
        text: text.substring(0, 100),
        detectedMoods: detection.moods,
      });

      // Apply update (unless dry run)
      if (!dryRun) {
        const updatedContent = { ...content, moodTags: mergedMoods };
        await sql`
          UPDATE collections
          SET content = ${JSON.stringify(updatedContent)}::jsonb
          WHERE id = ${row.id}
        `;
        updated++;
      }

      // Progress logging
      if (processed % 10 === 0) {
        console.log(
          `⏳ Processed ${processed}/${entriesResult.rows.length} entries...`,
        );
      }
    }

    console.log(
      `✅ Mood backfill complete: ${updated} updated, ${skipped} skipped`,
    );

    return NextResponse.json({
      success: true,
      email,
      userId,
      dryRun,
      method,
      stats: {
        totalEntries: entriesResult.rows.length,
        processed,
        updated: dryRun ? 0 : updated,
        skipped,
        moodsAdded: updates.reduce(
          (sum, u) => sum + (u.newMoods.length - u.oldMoods.length),
          0,
        ),
      },
      updates,
      message: dryRun
        ? 'Dry run complete - no changes made. Set dryRun=false to apply updates.'
        : `Successfully updated ${updated} journal entries with mood tags`,
    });
  } catch (error) {
    console.error('❌ Mood backfill error:', error);
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
