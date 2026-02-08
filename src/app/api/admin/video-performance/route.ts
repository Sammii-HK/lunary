import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';

/**
 * GET /api/admin/video-performance
 * Returns aggregated video performance metrics by hook_style, script_structure,
 * content_type, and has_loop_structure for the admin dashboard.
 */
export async function GET() {
  try {
    // Aggregated metrics by hook style
    const byHookStyle = await sql`
      SELECT
        hook_style,
        COUNT(*) as count,
        AVG(views) as avg_views,
        AVG(likes) as avg_likes,
        AVG(comments) as avg_comments,
        AVG(shares) as avg_shares,
        AVG(saves) as avg_saves,
        AVG(completion_rate) as avg_completion_rate
      FROM video_performance
      WHERE hook_style IS NOT NULL
      GROUP BY hook_style
      ORDER BY avg_views DESC
    `;

    // Aggregated metrics by script structure
    const byStructure = await sql`
      SELECT
        script_structure,
        COUNT(*) as count,
        AVG(views) as avg_views,
        AVG(likes) as avg_likes,
        AVG(comments) as avg_comments,
        AVG(shares) as avg_shares,
        AVG(saves) as avg_saves,
        AVG(completion_rate) as avg_completion_rate
      FROM video_performance
      WHERE script_structure IS NOT NULL
      GROUP BY script_structure
      ORDER BY avg_views DESC
    `;

    // Aggregated metrics by content type
    const byContentType = await sql`
      SELECT
        content_type,
        COUNT(*) as count,
        AVG(views) as avg_views,
        AVG(likes) as avg_likes,
        AVG(comments) as avg_comments,
        AVG(shares) as avg_shares,
        AVG(saves) as avg_saves,
        AVG(completion_rate) as avg_completion_rate
      FROM video_performance
      WHERE content_type IS NOT NULL
      GROUP BY content_type
      ORDER BY avg_views DESC
    `;

    // Loop vs non-loop comparison
    const byLoop = await sql`
      SELECT
        has_loop_structure,
        COUNT(*) as count,
        AVG(views) as avg_views,
        AVG(likes) as avg_likes,
        AVG(comments) as avg_comments,
        AVG(shares) as avg_shares,
        AVG(saves) as avg_saves,
        AVG(completion_rate) as avg_completion_rate
      FROM video_performance
      GROUP BY has_loop_structure
      ORDER BY has_loop_structure DESC
    `;

    // Performance by scheduled hour
    const byScheduledHour = await sql`
      SELECT
        scheduled_hour,
        COUNT(*) as count,
        AVG(views) as avg_views,
        AVG(saves) as avg_saves,
        AVG(completion_rate) as avg_completion_rate
      FROM video_performance
      WHERE scheduled_hour IS NOT NULL
      GROUP BY scheduled_hour
      ORDER BY scheduled_hour
    `;

    // Performance by day of week
    const byDayOfWeek = await sql`
      SELECT
        day_of_week,
        COUNT(*) as count,
        AVG(views) as avg_views,
        AVG(saves) as avg_saves,
        AVG(completion_rate) as avg_completion_rate
      FROM video_performance
      WHERE day_of_week IS NOT NULL
      GROUP BY day_of_week
      ORDER BY day_of_week
    `;

    // #1: Aggregated metrics by aspect
    const byAspect = await sql`
      SELECT
        aspect,
        COUNT(*) as count,
        AVG(views) as avg_views,
        AVG(likes) as avg_likes,
        AVG(comments) as avg_comments,
        AVG(shares) as avg_shares,
        AVG(saves) as avg_saves,
        AVG(completion_rate) as avg_completion_rate
      FROM video_performance
      WHERE aspect IS NOT NULL
      GROUP BY aspect
      ORDER BY avg_views DESC
    `;

    // #1: Aggregated metrics by angle
    const byAngle = await sql`
      SELECT
        angle,
        COUNT(*) as count,
        AVG(views) as avg_views,
        AVG(likes) as avg_likes,
        AVG(comments) as avg_comments,
        AVG(shares) as avg_shares,
        AVG(saves) as avg_saves,
        AVG(completion_rate) as avg_completion_rate
      FROM video_performance
      WHERE angle IS NOT NULL
      GROUP BY angle
      ORDER BY avg_views DESC
    `;

    // #10: Stitch-bait vs non-stitch-bait comparison
    const byStitchBait = await sql`
      SELECT
        has_stitch_bait,
        COUNT(*) as count,
        AVG(views) as avg_views,
        AVG(likes) as avg_likes,
        AVG(comments) as avg_comments,
        AVG(shares) as avg_shares,
        AVG(saves) as avg_saves,
        AVG(completion_rate) as avg_completion_rate
      FROM video_performance
      GROUP BY has_stitch_bait
      ORDER BY has_stitch_bait DESC
    `;

    // #13: Retention curve by script structure
    const byRetention = await sql`
      SELECT
        script_structure,
        COUNT(*) as count,
        AVG(retention_3s) as avg_retention_3s,
        AVG(retention_6s) as avg_retention_6s,
        AVG(retention_15s) as avg_retention_15s,
        AVG(retention_30s) as avg_retention_30s,
        AVG(retention_60s) as avg_retention_60s
      FROM video_performance
      WHERE script_structure IS NOT NULL
        AND retention_3s IS NOT NULL
      GROUP BY script_structure
      ORDER BY avg_retention_3s DESC
    `;

    return NextResponse.json({
      byHookStyle: byHookStyle.rows,
      byStructure: byStructure.rows,
      byContentType: byContentType.rows,
      byLoop: byLoop.rows,
      byScheduledHour: byScheduledHour.rows,
      byDayOfWeek: byDayOfWeek.rows,
      byAspect: byAspect.rows,
      byAngle: byAngle.rows,
      byStitchBait: byStitchBait.rows,
      byRetention: byRetention.rows,
    });
  } catch (error) {
    console.error('Video performance query error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch video performance data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
