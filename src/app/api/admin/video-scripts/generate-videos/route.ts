import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { composeVideo } from '@/lib/video/compose-video';
import { generateVoiceover } from '@/lib/tts';
import {
  categoryThemes,
  type WeeklyTheme,
  type DailyFacet,
} from '@/lib/social/weekly-themes';
import {
  ensureVideoScriptsTable,
  getVideoScripts,
} from '@/lib/social/video-script-generator';
import { getThematicImageUrl } from '@/lib/social/educational-images';

export const runtime = 'nodejs';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(weekStart: Date): Date {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return weekEnd;
}

function getFacetInfo(
  theme: WeeklyTheme | undefined,
  facetTitle: string,
): { facet: DailyFacet | null; category: string; slug: string } {
  const fallbackSlug = facetTitle.toLowerCase().replace(/\s+/g, '-');

  if (!theme) {
    return { facet: null, category: 'lunar', slug: fallbackSlug };
  }

  const matchedFacet = theme.facets.find((f) => f.title === facetTitle);
  const slug = matchedFacet
    ? matchedFacet.grimoireSlug.split('/').pop() || fallbackSlug
    : fallbackSlug;

  return {
    facet: matchedFacet || null,
    category: theme.category,
    slug,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const weekStartParam = body?.weekStart as string | undefined;

    const baseUrl = process.env.VERCEL
      ? 'https://lunary.app'
      : 'http://localhost:3000';

    const weekStart = weekStartParam
      ? getWeekStart(new Date(weekStartParam))
      : getWeekStart(new Date());
    const weekEnd = getWeekEnd(weekStart);

    await ensureVideoScriptsTable();
    const scripts = await getVideoScripts({
      platform: 'tiktok',
      weekStart,
    });

    if (scripts.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No daily short scripts found for this week',
      });
    }

    const themeName = scripts[0]?.themeName;
    const theme = categoryThemes.find((t) => t.name === themeName);

    const videoPlatforms = ['instagram', 'tiktok', 'threads'];
    const scheduleResult = await sql.query(
      `SELECT topic, scheduled_date, platform, content
       FROM social_posts
       WHERE scheduled_date >= $1
         AND scheduled_date < $2
         AND platform = ANY($3::text[])
         AND post_type = $4`,
      [
        weekStart.toISOString(),
        weekEnd.toISOString(),
        videoPlatforms,
        'educational',
      ],
    );

    const publishDateByDay = new Map<string, string>();
    const postContentByKey = new Map<string, string>();
    for (const row of scheduleResult.rows) {
      const dateKey = new Date(row.scheduled_date).toISOString().split('T')[0];
      if (!publishDateByDay.has(dateKey)) {
        publishDateByDay.set(dateKey, row.scheduled_date);
      }
      const contentKey = `${dateKey}|${row.topic}`;
      if (row.content && !postContentByKey.has(contentKey)) {
        postContentByKey.set(contentKey, row.content);
      }
    }

    const normalizePublishDate = (
      rawValue: string | Date | undefined,
      dateKey: string,
    ): string => {
      if (!rawValue) {
        return new Date(`${dateKey}T20:00:00.000Z`).toISOString();
      }

      const dateValue = new Date(rawValue);
      if (
        dateValue.getUTCHours() === 0 &&
        dateValue.getUTCMinutes() === 0 &&
        dateValue.getUTCSeconds() === 0
      ) {
        return new Date(`${dateKey}T20:00:00.000Z`).toISOString();
      }

      return dateValue.toISOString();
    };

    let generated = 0;
    for (const script of scripts) {
      const dateKey = script.scheduledDate.toISOString().split('T')[0];
      const publishDate = normalizePublishDate(
        publishDateByDay.get(dateKey) || script.scheduledDate,
        dateKey,
      );

      const { category, slug } = getFacetInfo(theme, script.facetTitle);
      const partNumber = script.partNumber || 1;
      const partLabel = `Part ${partNumber} of ${scripts.length}`;
      const imageUrl = getThematicImageUrl(
        category,
        script.facetTitle,
        baseUrl,
        'tiktok',
        slug,
        partLabel,
        'tiktok',
      );

      const audioBuffer = await generateVoiceover(script.fullScript, {
        voiceName: 'nova',
        model: 'tts-1-hd',
        speed: 1.1,
      });

      const videoBuffer = await composeVideo({
        imageUrl,
        audioBuffer,
        format: 'story',
        outputFilename: `short-${slug}-${dateKey}.mp4`,
        subtitlesText: script.fullScript,
      });

      const blobKey = `videos/shorts/daily/manual-${dateKey}-${slug}-${Date.now()}.mp4`;
      const { url: videoUrl } = await put(blobKey, videoBuffer, {
        access: 'public',
        contentType: 'video/mp4',
      });

      await sql.query(
        `UPDATE social_posts
         SET video_url = $1
         WHERE platform = ANY($2::text[])
           AND post_type = $3
           AND topic = $4
           AND scheduled_date::date = $5`,
        [videoUrl, videoPlatforms, 'educational', script.facetTitle, dateKey],
      );

      const totalParts = scripts.length;
      const youtubeTitleBase = `Weekly Theme: ${theme?.name || themeName || 'Lunary'} • Part ${partNumber} of ${totalParts} — ${script.facetTitle}`;
      const youtubeTitle =
        youtubeTitleBase.length > 90
          ? youtubeTitleBase.substring(0, 87) + '...'
          : youtubeTitleBase;
      const contentKey = `${dateKey}|${script.facetTitle}`;
      const postContent =
        postContentByKey.get(contentKey) ||
        script.writtenPostContent ||
        `This is part ${partNumber} of ${totalParts} in our weekly theme series: ${theme?.name || themeName || 'Lunary'}.`;
      const youtubeDescription = `${postContent}\n\nFrom Lunary's Grimoire — explore deeper rituals, meanings, and correspondences inside the full Grimoire.\n\n#Lunary #Grimoire`;

      await fetch(`${baseUrl}/api/youtube/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          title: youtubeTitle,
          description: youtubeDescription,
          type: 'short',
          script: script.fullScript,
          publishDate,
        }),
      });

      generated += 1;
    }

    return NextResponse.json({
      success: true,
      weekStart: weekStart.toISOString(),
      generated,
    });
  } catch (error) {
    console.error('Failed to generate videos from scripts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
