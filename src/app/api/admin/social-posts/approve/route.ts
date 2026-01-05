import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const toIntArrayLiteral = (values: number[]) =>
  `{${values.map((value) => Number(value)).join(',')}}`;

type YouTubeUploadResult = {
  success: boolean;
  videoId?: string;
  error?: string;
};

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(request: NextRequest) {
  try {
    const {
      postId,
      action,
      feedback,
      editedContent,
      improvementNotes,
      groupPostIds,
    } = await request.json();

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
    try {
      await sql`
        ALTER TABLE social_posts 
        ADD COLUMN IF NOT EXISTS youtube_video_id TEXT
      `;
    } catch (alterError) {
      // Column might already exist, that's fine
    }
    try {
      await sql`
        ALTER TABLE social_posts 
        ADD COLUMN IF NOT EXISTS quote_id INTEGER
      `;
    } catch (alterError) {
      // Column might already exist, that's fine
    }

    const parsedPostId = Number(postId);
    if (!Number.isFinite(parsedPostId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid postId' },
        { status: 400 },
      );
    }
    const groupIds = Array.isArray(groupPostIds)
      ? groupPostIds
          .map((id: unknown) => Number(id))
          .filter((id: number) => Number.isFinite(id))
      : [];

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
          WHERE id = ${parsedPostId}
        `;
        // Verify it was saved
        const verify = await sql`
          SELECT rejection_feedback FROM social_posts WHERE id = ${parsedPostId}
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
          WHERE id = ${parsedPostId}
        `;
      }
    } else if (action === 'approve') {
      const idsToUpdate =
        groupIds.length > 0
          ? Array.from(new Set([...groupIds, parsedPostId]))
          : [parsedPostId];
      // Save edited content and improvement notes if provided
      if (editedContent) {
        if (improvementNotes) {
          await sql`
            UPDATE social_posts
            SET status = ${status}, 
                content = ${editedContent},
                improvement_notes = ${improvementNotes},
                updated_at = NOW()
            WHERE id = ${parsedPostId}
          `;
        } else {
          await sql`
            UPDATE social_posts
            SET status = ${status}, 
                content = ${editedContent},
                updated_at = NOW()
            WHERE id = ${parsedPostId}
          `;
        }
      } else if (improvementNotes) {
        await sql`
          UPDATE social_posts
          SET status = ${status}, 
              improvement_notes = ${improvementNotes},
              updated_at = NOW()
          WHERE id = ${parsedPostId}
        `;
      } else {
        const idsArrayLiteral = toIntArrayLiteral(idsToUpdate);
        await sql`
          UPDATE social_posts
          SET status = ${status}, updated_at = NOW()
          WHERE id = ANY(${idsArrayLiteral}::int[])
        `;
      }

      if (editedContent || improvementNotes) {
        const remainingIds = idsToUpdate.filter((id) => id !== parsedPostId);
        if (remainingIds.length > 0) {
          const remainingIdsArrayLiteral = toIntArrayLiteral(remainingIds);
          await sql`
          UPDATE social_posts
          SET status = ${status}, updated_at = NOW()
          WHERE id = ANY(${remainingIdsArrayLiteral}::int[])
        `;
        }
      }

      const postResult = await sql`
        SELECT id, content, platform, post_type, topic, scheduled_date, video_url, week_theme, week_start, youtube_video_id, quote_id
        FROM social_posts
        WHERE id = ${parsedPostId}
      `;

      const post = postResult.rows[0];
      const videoPlatforms = ['instagram', 'tiktok', 'threads', 'twitter'];

      if (
        post?.post_type === 'video' &&
        post?.video_url &&
        videoPlatforms.includes(String(post.platform || '').toLowerCase())
      ) {
        const dateValue = post.scheduled_date
          ? new Date(post.scheduled_date)
          : null;
        const dateKey = dateValue
          ? dateValue.toISOString().split('T')[0]
          : null;

        if (dateKey) {
          await sql`
            CREATE TABLE IF NOT EXISTS youtube_uploads (
              id SERIAL PRIMARY KEY,
              topic TEXT NOT NULL,
              scheduled_date DATE NOT NULL,
              video_url TEXT NOT NULL,
              youtube_video_id TEXT,
              status TEXT NOT NULL DEFAULT 'pending',
              error TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(topic, scheduled_date)
            )
          `;

          const existing = await sql`
            SELECT youtube_video_id, status
            FROM youtube_uploads
            WHERE topic = ${post.topic}
              AND scheduled_date = ${dateKey}
            LIMIT 1
          `;

          if (!existing.rows.length) {
            const scriptResult = await sql`
              SELECT full_script, part_number, theme_name
              FROM video_scripts
              WHERE platform = 'tiktok'
                AND scheduled_date = ${dateKey}
                AND facet_title = ${post.topic}
              ORDER BY id DESC
              LIMIT 1
            `;

            const script = scriptResult.rows[0]?.full_script || '';
            const partNumber = scriptResult.rows[0]?.part_number || 1;
            const themeName =
              scriptResult.rows[0]?.theme_name || post.week_theme || 'Lunary';

            const weekStart = getWeekStart(dateValue as Date);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            const countResult = await sql`
              SELECT COUNT(*)::int AS count
              FROM video_scripts
              WHERE platform = 'tiktok'
                AND scheduled_date >= ${weekStart.toISOString().split('T')[0]}
                AND scheduled_date <= ${weekEnd.toISOString().split('T')[0]}
            `;
            const totalParts = countResult.rows[0]?.count || 7;

            const toHashtag = (value: string): string | null => {
              const words = value
                .replace(/[^a-z0-9]+/gi, ' ')
                .trim()
                .split(/\s+/)
                .filter(Boolean);
              if (words.length === 0) return null;
              const tag = words
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join('');
              return tag ? `#${tag}` : null;
            };

            const themeTag = toHashtag(themeName);
            const topicTag = post.topic ? toHashtag(post.topic) : null;
            const titleTags = ['#astrology', themeTag, '#universe']
              .filter(Boolean)
              .join(' ');
            const titleBase = `${themeName} • Part ${partNumber} of ${totalParts} — ${post.topic}`;
            const titleSuffix = titleTags ? ` ${titleTags}` : '';
            const maxTitleLength = 100;
            let trimmedBase = titleBase;
            if (trimmedBase.length + titleSuffix.length > maxTitleLength) {
              trimmedBase = trimmedBase
                .substring(0, maxTitleLength - titleSuffix.length - 1)
                .replace(/[—•\s]+$/g, '')
                .trim();
            }
            const youtubeTitle = `${trimmedBase}${titleSuffix}`.trim();

            const descriptionTags = Array.from(
              new Set([
                '#Lunary',
                '#astrology',
                '#universe',
                themeTag,
                topicTag,
              ]),
            )
              .filter(Boolean)
              .join(' ');
            const youtubeDescription =
              `${post.content}\n\n${descriptionTags}`.trim();

            const publishDate = (() => {
              if (!dateValue) {
                return new Date(`${dateKey}T20:00:00.000Z`).toISOString();
              }
              if (
                dateValue.getUTCHours() === 0 &&
                dateValue.getUTCMinutes() === 0 &&
                dateValue.getUTCSeconds() === 0
              ) {
                return new Date(`${dateKey}T20:00:00.000Z`).toISOString();
              }
              return dateValue.toISOString();
            })();

            const baseUrl = process.env.VERCEL
              ? 'https://lunary.app'
              : 'http://localhost:3000';

            let uploadResult: YouTubeUploadResult;
            try {
              const response = await fetch(`${baseUrl}/api/youtube/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  videoUrl: post.video_url,
                  title: youtubeTitle,
                  description: youtubeDescription,
                  type: 'short',
                  script,
                  publishDate,
                }),
              });
              const data = await response.json().catch(() => ({}));
              if (response.ok) {
                uploadResult = { success: true, videoId: data.videoId };
              } else {
                uploadResult = {
                  success: false,
                  error: data?.message || data?.error || 'Upload failed',
                };
              }
            } catch (uploadError) {
              uploadResult = {
                success: false,
                error:
                  uploadError instanceof Error
                    ? uploadError.message
                    : 'Unknown error',
              };
            }

            await sql`
              INSERT INTO youtube_uploads (topic, scheduled_date, video_url, youtube_video_id, status, error)
              VALUES (
                ${post.topic},
                ${dateKey},
                ${post.video_url},
                ${uploadResult.videoId || null},
                ${uploadResult.success ? 'uploaded' : 'failed'},
                ${uploadResult.success ? null : uploadResult.error || null}
              )
              ON CONFLICT (topic, scheduled_date)
              DO UPDATE SET
                youtube_video_id = EXCLUDED.youtube_video_id,
                status = EXCLUDED.status,
                error = EXCLUDED.error
            `;

            if (uploadResult.videoId) {
              await sql`
                UPDATE social_posts
                SET youtube_video_id = ${uploadResult.videoId}
                WHERE topic = ${post.topic}
                  AND scheduled_date::date = ${dateKey}
                  AND youtube_video_id IS NULL
              `;
            }
          }
        }
      }

      if (post?.post_type === 'closing_ritual' && post.quote_id) {
        try {
          await sql`
            UPDATE social_quotes
            SET status = 'used', used_at = NOW(), use_count = use_count + 1
            WHERE id = ${post.quote_id}
              AND status = 'available'
          `;
        } catch (quoteError) {
          console.warn('Failed to mark quote as used:', quoteError);
        }
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
