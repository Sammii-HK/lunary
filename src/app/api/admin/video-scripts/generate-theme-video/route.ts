import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { composeVideo } from '@/lib/video/compose-video';
import { generateVoiceover } from '@/lib/tts';
import {
  generateAndSaveWeeklyScripts,
  getVideoScripts,
} from '@/lib/social/video-script-generator';
import { categoryThemes } from '@/lib/social/weekly-themes';
import { getImageBaseUrl } from '@/lib/urls';
import { generateWeeklyContent } from '../../../../../../utils/blog/weeklyContentGenerator';
import {
  generateReelHashtags,
  generateVideoPostContent,
} from '@/lib/video/narrative-generator';

export const runtime = 'nodejs';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekOfYear(weekStart: Date): number {
  const yearStart = new Date(weekStart.getFullYear(), 0, 1);
  const daysSinceYearStart = Math.floor(
    (weekStart.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000),
  );
  return Math.floor(daysSinceYearStart / 7) + 1;
}

function stripHashtagLine(input: string) {
  const lines = input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const filtered = lines.filter((line) => !line.startsWith('#'));
  return filtered.join('\n\n').trim();
}

async function resolveThemeIndex(referenceDate: Date): Promise<number> {
  try {
    const result = await sql`
      SELECT item_id
      FROM content_rotation
      WHERE rotation_type = 'theme'
      ORDER BY last_used_at DESC NULLS LAST
      LIMIT 1
    `;
    const lastThemeId = result.rows[0]?.item_id as string | undefined;
    if (lastThemeId) {
      const matchedIndex = categoryThemes.findIndex(
        (theme) => theme.id === lastThemeId,
      );
      if (matchedIndex >= 0) {
        return matchedIndex;
      }
    }
  } catch (error) {
    console.warn('Failed to read latest theme rotation:', error);
  }

  const startOfYear = new Date(referenceDate.getFullYear(), 0, 1);
  const weekNumber = Math.floor(
    (referenceDate.getTime() - startOfYear.getTime()) /
      (7 * 24 * 60 * 60 * 1000),
  );
  return weekNumber % categoryThemes.length;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const weekOffset = Number(body?.weekOffset ?? 0);
    const weekStartParam = body?.weekStart as string | undefined;

    let weekStart: Date;
    if (weekStartParam) {
      weekStart = getWeekStart(new Date(weekStartParam));
    } else {
      const now = new Date();
      weekStart = getWeekStart(now);
      if (Number.isFinite(weekOffset) && weekOffset !== 0) {
        weekStart.setDate(weekStart.getDate() + weekOffset * 7);
      }
    }

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    let scripts = await getVideoScripts({
      platform: 'youtube',
      weekStart,
    });
    let script = scripts.find(
      (item) =>
        new Date(item.scheduledDate).getTime() >= weekStart.getTime() &&
        new Date(item.scheduledDate).getTime() < weekEnd.getTime(),
    );

    if (!script) {
      const themeIndex = await resolveThemeIndex(weekStart);
      await generateAndSaveWeeklyScripts(weekStart, themeIndex);
      scripts = await getVideoScripts({ platform: 'youtube', weekStart });
      script = scripts[0];
    }

    if (!script) {
      return NextResponse.json(
        { success: false, error: 'No YouTube script found for this week.' },
        { status: 404 },
      );
    }

    const baseUrl = getImageBaseUrl();
    const imageUrl =
      script.coverImageUrl ||
      `${baseUrl}/api/og/thematic?title=${encodeURIComponent(
        script.themeName,
      )}&subtitle=${encodeURIComponent('Weekly Deep Dive')}&format=landscape`;

    const audioBuffer = await generateVoiceover(script.fullScript, {
      voiceName: 'nova',
      model: 'tts-1-hd',
      speed: 1.0,
    });

    const videoBuffer = await composeVideo({
      imageUrl,
      audioBuffer,
      format: 'youtube',
      outputFilename: `theme-${script.themeId}-${Date.now()}.mp4`,
      subtitlesText: script.fullScript,
    });

    const blobKey = `videos/theme/${script.themeId}-${Date.now()}.mp4`;
    const { url: videoUrl } = await put(blobKey, videoBuffer, {
      access: 'public',
      contentType: 'video/mp4',
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const weekNumber = getWeekOfYear(weekStart);
    const title = script.facetTitle || `Weekly Deep Dive: ${script.themeName}`;
    const description = `Weekly thematic deep dive: ${script.themeName}.`;
    let postContent: string | null = null;

    try {
      const weeklyData = await generateWeeklyContent(weekStart);
      const baseCaption = await generateVideoPostContent(
        weeklyData,
        'long',
        undefined,
        'default',
      );
      const caption = stripHashtagLine(baseCaption);
      const theme = categoryThemes.find((t) => t.name === script.themeName);
      const themeCategory = theme?.category;
      const hashtags = await generateReelHashtags(weeklyData, themeCategory);
      postContent = `${caption}\n\n${hashtags.join(' ')}`.trim();
    } catch (error) {
      console.warn('Failed to generate reel caption/hashtags:', error);
    }

    let result;
    try {
      result = await sql`
        INSERT INTO videos (
          type,
          video_url,
          audio_url,
          script,
          title,
          description,
          post_content,
          week_number,
          blog_slug,
          status,
          created_at,
          expires_at
        ) VALUES (
          'long',
          ${videoUrl},
          ${null},
          ${script.fullScript},
          ${title},
          ${description},
          ${postContent},
          ${weekNumber},
          ${null},
          'pending',
          NOW(),
          ${expiresAt.toISOString()}
        )
        RETURNING id, video_url, created_at, expires_at
      `;
    } catch (error: any) {
      if (
        error?.code === '42703' ||
        error?.message?.includes('audio_url') ||
        error?.message?.includes('script')
      ) {
        result = await sql`
          INSERT INTO videos (
            type,
            video_url,
            title,
            description,
            post_content,
            week_number,
            blog_slug,
            status,
            created_at,
            expires_at
          ) VALUES (
            'long',
            ${videoUrl},
            ${title},
            ${description},
            ${postContent},
            ${weekNumber},
            ${null},
            'pending',
            NOW(),
            ${expiresAt.toISOString()}
          )
          RETURNING id, video_url, created_at, expires_at
        `;
      } else {
        throw error;
      }
    }

    const videoRecord = result?.rows?.[0];

    return NextResponse.json({
      success: true,
      video: {
        id: videoRecord?.id,
        url: videoUrl,
        theme: script.themeName,
        weekStart: weekStart.toISOString(),
        expiresAt: videoRecord?.expires_at,
      },
    });
  } catch (error) {
    console.error('Failed to generate theme video:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
