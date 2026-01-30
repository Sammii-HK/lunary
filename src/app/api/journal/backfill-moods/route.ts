import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { detectMoods } from '@/lib/journal/mood-detector';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Backfill mood tags for existing journal entries
 * Can be run for specific user or all users
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { daysBack = 90, method = 'keyword', dryRun = false } = body;

    console.log(
      `🔄 Starting mood backfill for user ${userId} (${daysBack} days, method: ${method}, dryRun: ${dryRun})`,
    );

    // Get journal entries without mood tags (or with empty mood tags)
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

      // Merge with existing moods (keep existing, add new unique ones)
      const mergedMoods = [
        ...existingMoods,
        ...detection.moods.filter((m: string) => !existingMoods.includes(m)),
      ].slice(0, 5); // Max 5 total

      updates.push({
        id: row.id,
        date: new Date(row.created_at).toISOString().split('T')[0],
        oldMoods: existingMoods,
        newMoods: mergedMoods,
        text: text.substring(0, 100),
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
      dryRun,
      stats: {
        totalEntries: entriesResult.rows.length,
        processed,
        updated: dryRun ? 0 : updated,
        skipped,
      },
      updates: updates.slice(0, 20), // Show first 20 examples
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

/**
 * GET endpoint to preview what would be updated
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const daysBack = parseInt(searchParams.get('days') || '90', 10);

    // Count entries without mood tags
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const result = await sql`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN content->>'moodTags' IS NULL OR jsonb_array_length(content->'moodTags') = 0 THEN 1 END) as without_moods,
             COUNT(CASE WHEN jsonb_array_length(content->'moodTags') < 3 THEN 1 END) as sparse_moods
      FROM collections
      WHERE user_id = ${userId}
      AND category = 'journal'
      AND created_at >= ${cutoffDate.toISOString()}
    `;

    const stats = result.rows[0];

    return NextResponse.json({
      success: true,
      userId,
      daysBack,
      stats: {
        totalEntries: parseInt(stats.total),
        withoutMoods: parseInt(stats.without_moods),
        sparseMoods: parseInt(stats.sparse_moods),
        wellTagged: parseInt(stats.total) - parseInt(stats.sparse_moods),
      },
      message: `Use POST with body: { "daysBack": ${daysBack}, "method": "keyword"|"ai", "dryRun": true }`,
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
