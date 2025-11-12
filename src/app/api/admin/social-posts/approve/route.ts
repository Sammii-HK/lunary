import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { postId, action, feedback, editedContent, improvementNotes } =
      await request.json();

    if (!postId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing postId or action' },
        { status: 400 },
      );
    }

    const status = action === 'approve' ? 'approved' : 'rejected';

    // Check if columns exist, if not add them
    try {
      await sql`
        ALTER TABLE social_posts 
        ADD COLUMN IF NOT EXISTS rejection_feedback TEXT
      `;
    } catch (alterError) {
      // Column might already exist, that's fine
    }
    try {
      await sql`
        ALTER TABLE social_posts 
        ADD COLUMN IF NOT EXISTS edited_content TEXT
      `;
    } catch (alterError) {
      // Column might already exist, that's fine
    }
    try {
      await sql`
        ALTER TABLE social_posts 
        ADD COLUMN IF NOT EXISTS improvement_notes TEXT
      `;
    } catch (alterError) {
      // Column might already exist, that's fine
    }

    if (action === 'reject') {
      const trimmedFeedback = feedback?.trim();
      if (trimmedFeedback) {
        console.log('💾 Saving rejection feedback:', {
          postId,
          feedbackLength: trimmedFeedback.length,
          feedbackPreview: trimmedFeedback.substring(0, 100),
        });
        await sql`
          UPDATE social_posts
          SET status = ${status}, rejection_feedback = ${trimmedFeedback}, updated_at = NOW()
          WHERE id = ${postId}
        `;
        // Verify it was saved
        const verify = await sql`
          SELECT rejection_feedback FROM social_posts WHERE id = ${postId}
        `;
        console.log('✅ Rejection feedback saved:', {
          postId,
          saved: !!verify.rows[0]?.rejection_feedback,
          length: verify.rows[0]?.rejection_feedback?.length || 0,
        });
      } else {
        console.warn('⚠️ Rejecting post without feedback:', postId);
        await sql`
          UPDATE social_posts
          SET status = ${status}, updated_at = NOW()
          WHERE id = ${postId}
        `;
      }
    } else if (action === 'approve') {
      // Save edited content and improvement notes if provided
      if (editedContent) {
        if (improvementNotes) {
          await sql`
            UPDATE social_posts
            SET status = ${status}, 
                content = ${editedContent},
                improvement_notes = ${improvementNotes},
                updated_at = NOW()
            WHERE id = ${postId}
          `;
        } else {
          await sql`
            UPDATE social_posts
            SET status = ${status}, 
                content = ${editedContent},
                updated_at = NOW()
            WHERE id = ${postId}
          `;
        }
      } else if (improvementNotes) {
        await sql`
          UPDATE social_posts
          SET status = ${status}, 
              improvement_notes = ${improvementNotes},
              updated_at = NOW()
          WHERE id = ${postId}
        `;
      } else {
        await sql`
          UPDATE social_posts
          SET status = ${status}, updated_at = NOW()
          WHERE id = ${postId}
        `;
      }
    } else {
      await sql`
        UPDATE social_posts
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${postId}
      `;
    }

    return NextResponse.json({
      success: true,
      message: `Post ${action}d successfully`,
    });
  } catch (error) {
    console.error('Error updating post status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
