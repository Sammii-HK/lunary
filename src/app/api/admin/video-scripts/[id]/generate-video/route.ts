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
import { getVideoScripts } from '@/lib/social/video-script-generator';
import { getThematicImageUrl } from '@/lib/social/educational-images';

export const runtime = 'nodejs';

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

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const scriptId = Number(id);
    if (!Number.isFinite(scriptId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid script id' },
        { status: 400 },
      );
    }

    const baseUrl = process.env.VERCEL
      ? 'https://lunary.app'
      : 'http://localhost:3000';

    const scripts = await getVideoScripts();
    const script = scripts.find((s) => s.id === scriptId);
    if (!script) {
      return NextResponse.json(
        { success: false, error: 'Script not found' },
        { status: 404 },
      );
    }

    const theme = categoryThemes.find((t) => t.name === script.themeName);
    const { category, slug } = getFacetInfo(theme, script.facetTitle);
    const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '-');

    const totalParts = theme?.facets.length || 7;
    const partNumber = Number.isFinite(script.partNumber)
      ? script.partNumber
      : 1;
    const partLabel = `Part ${partNumber} of ${totalParts}`;
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

    const dateKey = script.scheduledDate.toISOString().split('T')[0];
    const videoBuffer = await composeVideo({
      imageUrl,
      audioBuffer,
      format: 'story',
      outputFilename: `short-${safeSlug}-${dateKey}.mp4`,
      subtitlesText: script.fullScript,
    });

    const blobKey = `videos/shorts/daily/manual-${dateKey}-${safeSlug}-${Date.now()}.mp4`;
    const { url: videoUrl } = await put(blobKey, videoBuffer, {
      access: 'public',
      contentType: 'video/mp4',
    });

    const videoPlatforms = ['instagram', 'tiktok', 'threads'];
    try {
      await sql`
        ALTER TABLE social_posts
        ADD COLUMN IF NOT EXISTS video_url TEXT
      `;
    } catch (alterError) {
      console.warn('Could not add video_url column:', alterError);
    }
    await sql.query(
      `UPDATE social_posts
       SET video_url = $1
       WHERE platform = ANY($2::text[])
         AND post_type = $3
         AND topic = $4
         AND scheduled_date::date = $5`,
      [videoUrl, videoPlatforms, 'educational', script.facetTitle, dateKey],
    );

    const scheduleResult = await sql.query(
      `SELECT scheduled_date, content
       FROM social_posts
       WHERE platform = ANY($1::text[])
         AND post_type = $2
         AND topic = $3
         AND scheduled_date::date = $4
       ORDER BY scheduled_date ASC
       LIMIT 1`,
      [videoPlatforms, 'educational', script.facetTitle, dateKey],
    );
    const rawPublishDate =
      scheduleResult.rows[0]?.scheduled_date || script.scheduledDate;
    const publishDate = (() => {
      if (!rawPublishDate) {
        return new Date(`${dateKey}T20:00:00.000Z`).toISOString();
      }
      const dateValue = new Date(rawPublishDate);
      if (
        dateValue.getUTCHours() === 0 &&
        dateValue.getUTCMinutes() === 0 &&
        dateValue.getUTCSeconds() === 0
      ) {
        return new Date(`${dateKey}T20:00:00.000Z`).toISOString();
      }
      return dateValue.toISOString();
    })();

    return NextResponse.json({
      success: true,
      videoUrl,
    });
  } catch (error) {
    console.error('Failed to generate video from script:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
