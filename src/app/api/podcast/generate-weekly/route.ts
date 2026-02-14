import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
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
    const weekStart = body.weekStart ? new Date(body.weekStart) : new Date();

    // Determine episode number (count existing + 1)
    const latestEpisode = await prisma.podcastEpisode.findFirst({
      orderBy: { episodeNumber: 'desc' },
      select: { episodeNumber: true },
    });
    const episodeNumber = (latestEpisode?.episodeNumber ?? 0) + 1;

    // Check for duplicate week (prevent re-generation)
    const weekNum = getISOWeek(weekStart);
    const yearNum = getISOWeekYear(weekStart);
    const existing = await prisma.podcastEpisode.findFirst({
      where: { weekNumber: weekNum, year: yearNum },
    });
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Episode already exists for this week',
        episode: {
          id: existing.id,
          slug: existing.slug,
          title: existing.title,
        },
      });
    }

    // Get recent grimoire slugs to avoid repeats
    const recentEpisodes = await prisma.podcastEpisode.findMany({
      orderBy: { episodeNumber: 'desc' },
      take: 10,
      select: { grimoireSlugs: true },
    });
    const recentSlugs = recentEpisodes.flatMap((ep) => ep.grimoireSlugs);

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
    const generateResponse = await fetch(
      `${PODIFY_API_URL}/api/podcast/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.PODIFY_API_KEY && {
            Authorization: `Bearer ${process.env.PODIFY_API_KEY}`,
          }),
        },
        body: JSON.stringify({
          content,
          title,
          format: 'conversation',
          duration: '10min',
          tone: 'mystical',
          voices: 'luna_and_sol',
        }),
      },
    );

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
        `${PODIFY_API_URL}/api/podcast/status/${jobId}`,
        {
          headers: {
            ...(process.env.PODIFY_API_KEY && {
              Authorization: `Bearer ${process.env.PODIFY_API_KEY}`,
            }),
          },
        },
      );
      if (!statusResponse.ok) {
        throw new Error(`Podify status check failed: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();

      if (statusData.status === 'complete') {
        podifyResult = statusData.result;
        console.log(
          `✅ Podify job complete: ${podifyResult.durationSeconds}s audio`,
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

    // 5. Download audio & upload to Vercel Blob
    const audioResponse = await fetch(
      `${PODIFY_API_URL}/api/podcast/${jobId}/audio`,
      {
        headers: {
          ...(process.env.PODIFY_API_KEY && {
            Authorization: `Bearer ${process.env.PODIFY_API_KEY}`,
          }),
        },
      },
    );
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.status}`);
    }

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    const blobKey = `podcast/episode-${episodeNumber}.mp3`;

    const { url: audioUrl } = await put(blobKey, audioBuffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'audio/mpeg',
    });

    console.log(`✅ Audio uploaded to Blob: ${audioUrl}`);

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
