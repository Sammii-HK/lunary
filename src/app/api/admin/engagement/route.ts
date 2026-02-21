import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';
import { spellcastFetch, isSpellcastConfigured } from '@/lib/social/spellcast';

/**
 * GET /api/admin/engagement — List engagement queue items
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const status =
      request.nextUrl.searchParams.get('status') ?? 'pending_review';

    const result = await sql`
      SELECT id, platform, engagement_id, author_name, comment_text, post_id,
             suggested_reply, status, created_at, reviewed_at
      FROM social_engagement_queue
      WHERE status = ${status}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    return NextResponse.json({
      success: true,
      items: result.rows,
    });
  } catch (error) {
    console.error('[Engagement Admin] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch engagement queue' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/engagement — Approve, dismiss, or edit an engagement reply
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id, action, editedReply } = await request.json();

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Missing id or action' },
        { status: 400 },
      );
    }

    const parsedId = Number(id);
    if (!Number.isFinite(parsedId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    if (action === 'dismiss') {
      await sql`
        UPDATE social_engagement_queue
        SET status = 'dismissed', reviewed_at = NOW()
        WHERE id = ${parsedId}
      `;
      return NextResponse.json({ success: true, message: 'Dismissed' });
    }

    if (action === 'approve') {
      // Get the item
      const itemResult = await sql`
        SELECT engagement_id, suggested_reply
        FROM social_engagement_queue
        WHERE id = ${parsedId}
        LIMIT 1
      `;

      const item = itemResult.rows[0];
      if (!item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      const replyText = editedReply?.trim() || item.suggested_reply;
      if (!replyText) {
        return NextResponse.json(
          { error: 'No reply text to send' },
          { status: 400 },
        );
      }

      // Send reply via Spellcast
      if (isSpellcastConfigured()) {
        try {
          const res = await spellcastFetch('/api/engagement/reply', {
            method: 'POST',
            body: JSON.stringify({
              engagementId: item.engagement_id,
              reply: replyText,
            }),
          });

          if (!res.ok) {
            const errorText = await res.text();
            return NextResponse.json(
              { error: `Spellcast reply failed: ${errorText}` },
              { status: 500 },
            );
          }
        } catch (error) {
          return NextResponse.json(
            {
              error: `Failed to send reply: ${error instanceof Error ? error.message : 'Unknown'}`,
            },
            { status: 500 },
          );
        }
      }

      // Update status
      await sql`
        UPDATE social_engagement_queue
        SET status = 'approved',
            suggested_reply = ${replyText},
            reviewed_at = NOW()
        WHERE id = ${parsedId}
      `;

      return NextResponse.json({ success: true, message: 'Reply sent' });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "approve" or "dismiss".' },
      { status: 400 },
    );
  } catch (error) {
    console.error('[Engagement Admin] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 },
    );
  }
}
