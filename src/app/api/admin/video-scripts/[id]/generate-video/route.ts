import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { requireAdminAuth } from '@/lib/admin-auth';
import { generateVoiceover, transcribeWithWhisper } from '@/lib/tts';
import {
  categoryThemes,
  type WeeklyTheme,
  type DailyFacet,
} from '@/lib/social/weekly-themes';
import { buildThematicVideoComposition } from '@/lib/video/thematic-video';
import { getImageBaseUrl } from '@/lib/urls';

export const dynamic = 'force-dynamic';

export const runtime = 'nodejs';

/**
 * Pick the best hook for a video first-frame overlay.
 * Prefers short, punchy hooks that are readable at a glance on a phone.
 * Scoring: shorter is better, but penalise if too vague (under 20 chars).
 * Bonus for pattern interrupts, bold claims, curiosity gaps.
 */
function pickBestVideoHook(
  hookSuggestions: string[] | undefined,
  facetTitle: string,
): string {
  if (!hookSuggestions || hookSuggestions.length === 0) {
    return facetTitle || 'Did you know?';
  }

  // Expand candidates: for long hooks, also consider their sub-clauses
  // e.g. "X AND Y. This is the Z" → also try "This is the Z"
  const candidates = [...hookSuggestions];
  for (const hook of hookSuggestions) {
    if (hook.length > 70) {
      // Split on sentence boundaries and try the second sentence
      const sentences = hook.split(/\.\s+/).filter((s) => s.length > 15);
      if (sentences.length >= 2) {
        candidates.push(
          sentences[sentences.length - 1].replace(/\.+$/, '') + '.',
        );
      }
    }
  }

  const scored = candidates.map((hook) => {
    let score = 0;
    const len = hook.length;

    // Sweet spot: 30-60 chars (readable on phone, enough context)
    if (len >= 30 && len <= 60) score += 30;
    else if (len >= 20 && len <= 80) score += 15;
    else if (len > 80) score -= 10;

    // Bonus for curiosity/engagement patterns
    if (/not what you think|here is why|hits different/i.test(hook))
      score += 15;
    if (/toughest|hardest|worst|biggest|rarest|first time/i.test(hook))
      score += 10;
    if (/\?$/.test(hook)) score += 5; // Questions create curiosity

    // Penalise hooks that start with technical details
    if (/^[A-Z][a-z]+ is in its/i.test(hook)) score -= 10;

    // Penalise sub-clauses that need context (start with "Here is", "What that", "That is")
    if (/^(Here is|What that|That is|That's|And |But )/i.test(hook))
      score -= 15;

    // Penalise hooks with too many clauses (AND, +, commas)
    const clauseCount = (hook.match(/\band\b|[\+,]/gi) || []).length;
    if (clauseCount >= 2) score -= clauseCount * 5;

    return { hook, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].hook;
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const scriptId = Number(id);
    if (!Number.isFinite(scriptId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid script id' },
        { status: 400 },
      );
    }

    const baseUrl = getImageBaseUrl();

    // Fetch script directly by ID instead of loading all scripts
    const scriptResult = await sql`
      SELECT * FROM video_scripts WHERE id = ${scriptId}
    `;
    if (scriptResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Script not found' },
        { status: 404 },
      );
    }

    const row = scriptResult.rows[0];
    const script = {
      id: row.id,
      themeId: row.theme_id,
      themeName: row.theme_name,
      facetTitle: row.facet_title,
      platform: row.platform,
      sections: row.sections,
      fullScript: row.full_script,
      wordCount: row.word_count,
      estimatedDuration: row.estimated_duration,
      scheduledDate: new Date(row.scheduled_date),
      status: row.status,
      metadata: row.metadata,
      coverImageUrl: row.cover_image_url,
      partNumber: row.part_number,
    };

    // Detect if this is an engagement video (not educational)
    const isEngagementVideo =
      script.themeName?.startsWith('Sign Check') ||
      script.themeName === 'Ranking' ||
      script.themeName === 'Hot Take' ||
      script.themeName?.startsWith('Quiz') ||
      script.themeName === 'Myth' ||
      script.themeName === 'Transit Alert';

    console.log(
      `🎯 Script theme: "${script.themeName}", facet: "${script.facetTitle}"`,
    );
    console.log(`🎯 Is engagement video: ${isEngagementVideo}`);

    const theme = categoryThemes.find((t) => t.name === script.themeName);
    const { slug, facet: matchedFacet } = getFacetInfo(
      theme,
      script.facetTitle,
    );
    const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '-');

    let images: Array<{ url: string; startTime: number; endTime: number }> = [];
    let overlays: Array<{
      text: string;
      startTime: number;
      endTime: number;
      style?:
        | 'hook'
        | 'hook_large'
        | 'cta'
        | 'stamp'
        | 'chapter'
        | 'series_badge';
    }> = [];
    let highlightTerms: string[] = [];
    let highlightColor = '#5AD7FF';
    let categoryVisuals: any;

    if (isEngagementVideo) {
      // Engagement videos: no OG images, just clean background with subtitles
      categoryVisuals = {
        gradientColors: ['#2a2f4a', '#3d4571', '#2a2f4a'], // Even brighter blue gradient for visibility
        particleTintColor: '#7ec8ff',
        accentColor: '#5AD7FF',
        backgroundAnimation: 'starfield' as const,
      };
      // Extract highlight terms from script (zodiac signs, planets)
      const scriptLower = script.fullScript.toLowerCase();
      const zodiacSigns = [
        'aries',
        'taurus',
        'gemini',
        'cancer',
        'leo',
        'virgo',
        'libra',
        'scorpio',
        'sagittarius',
        'capricorn',
        'aquarius',
        'pisces',
      ];
      const planets = [
        'sun',
        'moon',
        'mercury',
        'venus',
        'mars',
        'jupiter',
        'saturn',
        'uranus',
        'neptune',
        'pluto',
      ];
      highlightTerms = [...zodiacSigns, ...planets].filter((term) =>
        scriptLower.includes(term),
      );

      // Add hook overlay so the first frame shows readable hook text.
      // Pick the best hook for a video thumbnail: short, punchy, readable at a glance.
      const hookSuggestions = script.metadata?.hookSuggestions as
        | string[]
        | undefined;
      const hookText = pickBestVideoHook(hookSuggestions, script.facetTitle);
      // Calculate hook duration so all words animate in + 2.5s hold + 0.4s fade
      // wordEntranceDuration=4 frames at 30fps = 0.133s per word
      const wordCount = hookText.split(/\s+/).length;
      const entranceTime = wordCount * 0.133;
      const holdTime = 2.5;
      const fadeTime = 0.4;
      const hookDuration = Math.ceil(entranceTime + holdTime + fadeTime);
      overlays.push({
        text: hookText,
        startTime: 0,
        endTime: hookDuration,
        style:
          hookText.length <= 50 ? ('hook_large' as const) : ('hook' as const),
      });
    } else {
      // Educational videos: use thematic composition with OG images
      const composition = buildThematicVideoComposition({
        script: script.fullScript,
        facet: matchedFacet || {
          dayIndex: 0,
          title: script.facetTitle,
          grimoireSlug: slug,
          focus: script.facetTitle,
          shortFormHook: script.facetTitle,
          threads: {
            keyword: script.facetTitle,
            angles: [],
          },
        },
        theme,
        baseUrl,
        slug,
      });
      images = composition.images;
      overlays = composition.overlays;
      highlightTerms = composition.highlightTerms;
      highlightColor = composition.highlightColor;
      categoryVisuals = composition.categoryVisuals;
    }

    const audioBuffer = await generateVoiceover(script.fullScript, {
      voiceName: 'shimmer',
      speed: 1.0,
    });

    // Audio duration from Whisper timestamps or word count estimate
    // Content Creator will also get the true duration via ffprobe
    let wordTimestamps: Array<{ word: string; start: number; end: number }> =
      [];
    try {
      const whisperWords = await transcribeWithWhisper(audioBuffer);
      if (whisperWords.length > 0) {
        wordTimestamps = whisperWords;
        console.log(`🎙️ Whisper: ${whisperWords.length} word timestamps`);
      }
    } catch (whisperErr) {
      console.warn(
        `⚠️ Whisper transcription failed, render server will use fallback timing:`,
        whisperErr instanceof Error ? whisperErr.message : whisperErr,
      );
    }

    const audioDuration =
      wordTimestamps.length > 0
        ? wordTimestamps[wordTimestamps.length - 1].end
        : (script.fullScript?.split(/\s+/).length || 100) / 2.5;
    console.log(`🎵 Audio duration: ${audioDuration}s`);

    const dateKey = script.scheduledDate.toISOString().split('T')[0];
    let videoBuffer: Buffer | undefined;

    // Upload audio to Vercel Blob for content-creator to access
    const audioBlob = await put(`temp/audio-${Date.now()}.mp3`, audioBuffer, {
      access: 'public',
      addRandomSuffix: true,
    });

    const videoSeed = `${safeSlug}-${scriptId}-${Date.now()}`;
    const symbolContent = `${script.facetTitle || ''} ${script.fullScript?.substring(0, 200) || ''}`;

    // Primary: Content Creator (Hetzner). Fallback: local ffmpeg (dev only, never Vercel).
    const contentCreatorUrl = process.env.CONTENT_CREATOR_API_URL;
    if (contentCreatorUrl) {
      console.log(
        `🎬 Rendering via Content Creator at ${contentCreatorUrl}...`,
      );
      const renderSecret =
        process.env.LUNARY_RENDER_SECRET || process.env.CRON_SECRET;

      const renderResponse = await fetch(
        `${contentCreatorUrl}/api/lunary-render`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(renderSecret
              ? { Authorization: `Bearer ${renderSecret}` }
              : {}),
          },
          body: JSON.stringify({
            scriptText: script.fullScript,
            audioUrl: audioBlob.url,
            slug: safeSlug,
            facetTitle: script.facetTitle,
            dateKey,
            wordTimestamps:
              wordTimestamps.length > 0 ? wordTimestamps : undefined,
            audioDuration,
            overlays: overlays || [],
            highlightTerms: highlightTerms || [],
            categoryVisuals,
            seed: videoSeed,
            zodiacSign: symbolContent,
            backgroundMusicUrl:
              'https://lunary.app/audio/series/lunary-bed-v1.mp3',
          }),
        },
      );

      if (!renderResponse.ok) {
        const errorBody = await renderResponse.text();
        throw new Error(
          `Content Creator render failed (${renderResponse.status}): ${errorBody}`,
        );
      }

      const renderResult = await renderResponse.json();
      if (!renderResult.videoData) {
        throw new Error('Content Creator returned no video data');
      }

      videoBuffer = Buffer.from(renderResult.videoData, 'base64');
      console.log(
        `✅ Content Creator rendered ${(videoBuffer.length / 1024 / 1024).toFixed(1)}MB video`,
      );
    } else if (process.env.VERCEL) {
      throw new Error(
        'CONTENT_CREATOR_API_URL is not set. ' +
          'Video rendering is not allowed on Vercel. ' +
          'Set CONTENT_CREATOR_API_URL to your Hetzner server.',
      );
    } else {
      // Local dev fallback — ffmpeg compose
      console.log(
        `⚠️ No CONTENT_CREATOR_API_URL — using local FFmpeg fallback (dev only)`,
      );
      const { composeVideo } = await import('@/lib/video/compose-video');
      const localOverlays = overlays.filter((o) => o.style !== 'series_badge');
      videoBuffer = await composeVideo({
        images,
        audioBuffer,
        format: 'story',
        outputFilename: `short-${safeSlug}-${dateKey}.mp4`,
        subtitlesText: script.fullScript,
        subtitlesHighlightTerms: highlightTerms,
        subtitlesHighlightColor: highlightColor,
        overlays: localOverlays as any,
      });
    }

    const blobKey = `videos/shorts/daily/manual-${dateKey}-${safeSlug}-${Date.now()}.mp4`;
    const { url: videoUrl } = await put(blobKey, videoBuffer, {
      access: 'public',
      contentType: 'video/mp4',
    });

    const videoPlatforms = [
      'instagram',
      'tiktok',
      'threads',
      'twitter',
      'youtube',
    ];
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
      [videoUrl, videoPlatforms, 'video', script.facetTitle, dateKey],
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
      [videoPlatforms, 'video', script.facetTitle, dateKey],
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
