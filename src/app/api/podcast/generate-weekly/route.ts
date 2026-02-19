import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/admin-activity';
import {
  selectPodcastTopics,
  buildEpisodeTitle,
  buildEpisodeContent,
  buildShowNotes,
  generateEpisodeSlug,
} from '@/lib/podcast/content-rotation';
import { getISOWeek, getISOWeekYear } from 'date-fns';

const PODIFY_API_URL = process.env.PODIFY_API_URL || 'http://localhost:3000';

function podifyHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (process.env.PODIFY_API_KEY) {
    headers['x-api-key'] = process.env.PODIFY_API_KEY;
  }
  return headers;
}

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes — podcast generation can be slow

/**
 * POST /api/podcast/generate-weekly
 *
 * Generates a weekly podcast episode:
 * 1. Selects grimoire topics (deterministic rotation)
 * 2. Builds script content
 * 3. Calls Podify API for audio generation
 * 4. Polls until complete
 * 5. Downloads audio → uploads to Vercel Blob
 * 6. Saves episode metadata to DB
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json().catch(() => ({}));
    const podifyUrl = body.podifyUrl || PODIFY_API_URL;
    const weekStart = body.weekStart ? new Date(body.weekStart) : new Date();

    // Determine episode number (count existing + 1)
    const latestEpisode = await prisma.podcastEpisode.findFirst({
      orderBy: { episodeNumber: 'desc' },
      select: { episodeNumber: true },
    });
    const episodeNumber = (latestEpisode?.episodeNumber ?? 0) + 1;

    // Check weekly limit (max 3 episodes per week)
    const weekNum = getISOWeek(weekStart);
    const yearNum = getISOWeekYear(weekStart);
    const existingThisWeek = await prisma.podcastEpisode.findMany({
      where: { weekNumber: weekNum, year: yearNum },
      select: { id: true, slug: true, title: true, grimoireSlugs: true },
    });
    if (existingThisWeek.length >= 3) {
      return NextResponse.json({
        success: true,
        message: 'Weekly limit reached (3 episodes)',
        episodes: existingThisWeek.map((ep) => ({
          id: ep.id,
          slug: ep.slug,
          title: ep.title,
        })),
      });
    }

    // Get ALL grimoire slugs ever covered to avoid repeats
    const allEpisodes = await prisma.podcastEpisode.findMany({
      select: { grimoireSlugs: true },
    });
    const recentSlugs = allEpisodes.flatMap((ep) => ep.grimoireSlugs);

    // 1. Select content
    const topics = selectPodcastTopics(episodeNumber, recentSlugs);
    if (topics.length === 0) {
      throw new Error('No suitable grimoire topics found for podcast');
    }

    // 2. Build script content
    const title = buildEpisodeTitle(topics);
    const content = buildEpisodeContent(topics);
    const showNotes = buildShowNotes(topics);
    const slug = generateEpisodeSlug(episodeNumber, title);
    const grimoireSlugs = topics.map((t) => t.slug);

    console.log(
      `🎙️ Generating podcast episode ${episodeNumber}: "${title}" (${topics.length} topics)`,
    );

    await logActivity({
      activityType: 'content_creation',
      activityCategory: 'content',
      status: 'pending',
      message: `Podcast episode ${episodeNumber} generation started: ${title}`,
      metadata: { episodeNumber, title, topics: grimoireSlugs },
    });

    // 3. Call Podify API
    const generateResponse = await fetch(`${podifyUrl}/api/podcast/generate`, {
      method: 'POST',
      headers: podifyHeaders(),
      body: JSON.stringify({
        content,
        title,
        source: 'grimoire',
        format: 'conversation',
        duration: '5min',
        tone: 'mystical',
        voices: 'luna_and_sol',
      }),
    });

    if (!generateResponse.ok) {
      const errorData = await generateResponse.json().catch(() => ({}));
      throw new Error(
        `Podify generation failed: ${generateResponse.status} - ${errorData.error || 'Unknown'}`,
      );
    }

    const { jobId } = await generateResponse.json();
    console.log(`🎙️ Podify job started: ${jobId}`);

    // 4. Poll for completion
    let podifyResult = null;
    const maxPolls = 150; // 5 minutes max at 2s intervals
    for (let i = 0; i < maxPolls; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const statusResponse = await fetch(
        `${podifyUrl}/api/podcast/status/${jobId}`,
        { headers: podifyHeaders() },
      );
      if (statusResponse.status === 404) {
        // Job may not be registered yet, keep polling
        continue;
      }
      if (!statusResponse.ok) {
        throw new Error(`Podify status check failed: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();

      if (statusData.status === 'complete') {
        podifyResult = statusData.result || statusData;
        console.log(
          `✅ Podify job complete:`,
          JSON.stringify(podifyResult, null, 2),
        );
        break;
      }

      if (statusData.status === 'error') {
        throw new Error(
          `Podify generation error: ${statusData.error || statusData.message}`,
        );
      }

      // Log progress periodically
      if (i % 10 === 0) {
        console.log(
          `🎙️ Podify progress: ${statusData.progress}% - ${statusData.message}`,
        );
      }
    }

    if (!podifyResult) {
      throw new Error('Podify generation timed out after 5 minutes');
    }

    // 5. Use audio URL from Podify result (already stored in their Blob)
    const audioUrl = podifyResult.audioUrl || podifyResult.blobUrl;
    if (!audioUrl) {
      throw new Error('Podify result missing audio URL');
    }

    console.log(`✅ Audio ready: ${audioUrl}`);

    // 6. Save to DB
    const description = topics
      .map((t) => t.summary)
      .filter(Boolean)
      .join(' ')
      .slice(0, 500);

    const episode = await prisma.podcastEpisode.create({
      data: {
        episodeNumber,
        slug,
        title,
        description,
        audioUrl,
        durationSecs: podifyResult.durationSeconds,
        publishedAt: new Date(),
        weekNumber: weekNum,
        year: yearNum,
        transcript: podifyResult.transcript || null,
        showNotes,
        grimoireSlugs,
        status: 'published',
        podifyJobId: jobId,
      },
    });

    const executionTime = Date.now() - startTime;

    await logActivity({
      activityType: 'content_creation',
      activityCategory: 'content',
      status: 'success',
      message: `Podcast episode ${episodeNumber} published: ${title}`,
      metadata: {
        episodeNumber,
        title,
        slug,
        durationSecs: podifyResult.durationSeconds,
        wordCount: podifyResult.wordCount,
        topics: grimoireSlugs,
        audioUrl,
      },
      executionTimeMs: executionTime,
    });

    console.log(`✅ Podcast episode ${episodeNumber} saved: /podcast/${slug}`);

    return NextResponse.json({
      success: true,
      episode: {
        id: episode.id,
        episodeNumber,
        slug,
        title,
        audioUrl,
        durationSecs: podifyResult.durationSeconds,
        grimoireSlugs,
      },
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    console.error('❌ Podcast generation failed:', errorMessage);

    await logActivity({
      activityType: 'content_creation',
      activityCategory: 'content',
      status: 'failed',
      message: 'Podcast episode generation failed',
      errorMessage,
      executionTimeMs: executionTime,
    });

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
