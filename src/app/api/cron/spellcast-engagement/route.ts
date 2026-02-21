import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { spellcastFetch, isSpellcastConfigured } from '@/lib/social/spellcast';

export const runtime = 'nodejs';
export const maxDuration = 120;

interface EngagementItem {
  id: string;
  platform: string;
  authorName?: string;
  commentText: string;
  postId?: string;
}

interface ReplySuggestion {
  reply: string;
}

/**
 * GET /api/cron/spellcast-engagement
 * Runs every 2 hours. Fetches unread comments via Spellcast,
 * generates AI reply suggestions, and stores them for admin review.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSpellcastConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Spellcast not configured, skipping',
      });
    }

    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS social_engagement_queue (
        id SERIAL PRIMARY KEY,
        platform TEXT NOT NULL,
        engagement_id TEXT NOT NULL UNIQUE,
        author_name TEXT,
        comment_text TEXT NOT NULL,
        post_id TEXT,
        suggested_reply TEXT,
        status TEXT NOT NULL DEFAULT 'pending_review',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        reviewed_at TIMESTAMPTZ
      )
    `;

    // Fetch unread engagement from Spellcast
    let engagementItems: EngagementItem[] = [];
    try {
      const res = await spellcastFetch(
        '/api/engagement?status=unread&limit=20',
      );
      if (res.ok) {
        const data = await res.json();
        engagementItems = (data.items ?? data.engagement ?? []).map(
          (item: Record<string, unknown>) => ({
            id: String(item.id),
            platform: String(item.platform ?? 'unknown'),
            authorName: item.authorName
              ? String(item.authorName)
              : item.author_name
                ? String(item.author_name)
                : undefined,
            commentText: String(
              item.commentText ?? item.comment_text ?? item.text ?? '',
            ),
            postId: item.postId
              ? String(item.postId)
              : item.post_id
                ? String(item.post_id)
                : undefined,
          }),
        );
      } else {
        console.warn(
          '[Spellcast Engagement] Failed to fetch engagement:',
          res.status,
        );
      }
    } catch (error) {
      console.error('[Spellcast Engagement] Fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch engagement from Spellcast' },
        { status: 500 },
      );
    }

    if (engagementItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No unread engagement items',
        processed: 0,
      });
    }

    let processed = 0;
    let skipped = 0;

    for (const item of engagementItems) {
      if (!item.commentText.trim()) {
        skipped++;
        continue;
      }

      // Check if already in queue
      const existing = await sql`
        SELECT id FROM social_engagement_queue
        WHERE engagement_id = ${item.id}
        LIMIT 1
      `;

      if (existing.rows.length > 0) {
        skipped++;
        continue;
      }

      // Get AI reply suggestion from Spellcast
      let suggestedReply = '';
      try {
        const suggestionRes = await spellcastFetch('/api/engagement/ai-reply', {
          method: 'POST',
          body: JSON.stringify({
            engagementId: item.id,
            tone: 'friendly',
          }),
        });

        if (suggestionRes.ok) {
          const suggestion = (await suggestionRes.json()) as ReplySuggestion;
          suggestedReply = suggestion.reply ?? '';
        }
      } catch (error) {
        console.warn(
          `[Spellcast Engagement] Failed to get AI suggestion for ${item.id}:`,
          error,
        );
      }

      // Store in queue
      await sql`
        INSERT INTO social_engagement_queue
          (platform, engagement_id, author_name, comment_text, post_id, suggested_reply, status)
        VALUES
          (${item.platform}, ${item.id}, ${item.authorName ?? null}, ${item.commentText}, ${item.postId ?? null}, ${suggestedReply || null}, 'pending_review')
        ON CONFLICT (engagement_id) DO NOTHING
      `;

      processed++;
    }

    console.log(
      `[Spellcast Engagement] Processed ${processed}, skipped ${skipped} of ${engagementItems.length} items`,
    );

    return NextResponse.json({
      success: true,
      processed,
      skipped,
      total: engagementItems.length,
    });
  } catch (error) {
    console.error('[Spellcast Engagement] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process engagement',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
