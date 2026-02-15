import { NextRequest, NextResponse } from 'next/server';
import { put, head } from '@vercel/blob';
import { generateVoiceover } from '@/lib/tts';
import { generateWeeklyContent } from '../../../../../utils/blog/weeklyContentGenerator';
import { generateVoiceoverScriptFromWeeklyData } from '@/lib/video/composition';
import {
  generateNarrativeFromWeeklyData,
  generateShortFormNarrative,
  generateMediumFormNarrative,
} from '@/lib/video/narrative-generator';
import { stripHtmlTags } from '@/lib/utils';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, week, blogContent } = body;

    if (!type || (type !== 'short' && type !== 'medium' && type !== 'long')) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "short", "medium", or "long"' },
        { status: 400 },
      );
    }

    let script: string;

    if (type === 'short') {
      if (week === undefined) {
        return NextResponse.json(
          { error: 'Week number is required for short-form videos' },
          { status: 400 },
        );
      }

      // Get weekly content
      const now = new Date();
      const targetDate = new Date(
        now.getTime() + week * 7 * 24 * 60 * 60 * 1000,
      );
      const dayOfWeek = targetDate.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(
        targetDate.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
      );
      weekStart.setHours(0, 0, 0, 0);

      const weeklyData = await generateWeeklyContent(weekStart);

      // Use OpenAI for short-form
      try {
        script = await generateShortFormNarrative(weeklyData);
      } catch (error) {
        console.warn(
          'Failed to generate OpenAI short-form, falling back:',
          error,
        );
        script = generateVoiceoverScriptFromWeeklyData(weeklyData, 'short');
      }
    } else if (type === 'medium') {
      if (week === undefined) {
        return NextResponse.json(
          { error: 'Week number is required for medium-form videos' },
          { status: 400 },
        );
      }

      // Get weekly content
      const now = new Date();
      const targetDate = new Date(
        now.getTime() + week * 7 * 24 * 60 * 60 * 1000,
      );
      const dayOfWeek = targetDate.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(
        targetDate.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
      );
      weekStart.setHours(0, 0, 0, 0);

      const weeklyData = await generateWeeklyContent(weekStart);

      // Use OpenAI for medium-form
      try {
        script = await generateMediumFormNarrative(weeklyData);
      } catch (error) {
        console.warn(
          'Failed to generate OpenAI medium-form, falling back:',
          error,
        );
        script = generateVoiceoverScriptFromWeeklyData(weeklyData, 'short');
      }
    } else {
      // Long-form: try weekly content first
      let weeklyData: Awaited<ReturnType<typeof generateWeeklyContent>> | null =
        null;
      try {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const weekStart = new Date(
          now.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
        );
        weekStart.setHours(0, 0, 0, 0);
        weeklyData = await generateWeeklyContent(weekStart);
      } catch (error) {
        console.warn('Could not generate weekly content:', error);
      }

      if (weeklyData) {
        // Use OpenAI to generate narrative for long-form
        try {
          script = await generateNarrativeFromWeeklyData(weeklyData);
        } catch (error) {
          console.warn(
            'Failed to generate OpenAI narrative, falling back:',
            error,
          );
          script = generateVoiceoverScriptFromWeeklyData(weeklyData, 'long');
        }
      } else if (blogContent?.body) {
        // Fallback to blog content
        const blogText = stripHtmlTags(blogContent.body, '')
          .replace(/\n{3,}/g, '\n\n')
          .replace(/#{1,6}\s+/g, '')
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
          .replace(/```[\s\S]*?```/g, '')
          .replace(/`[^`]+`/g, '');

        const sentences = blogText
          .split(/[.!?]+/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 10)
          .slice(0, 200)
          .join('. ');

        script = `${blogContent.title}. ${sentences}`;
      } else {
        return NextResponse.json(
          { error: 'Blog content or weekly data required for long-form' },
          { status: 400 },
        );
      }
    }

    // Check if audio already exists in cache (by script hash)
    const crypto = await import('crypto');
    const scriptHash = crypto.createHash('sha256').update(script).digest('hex');
    const audioCacheKey = `audio/preview/${type}/${scriptHash.substring(0, 16)}.mp3`;

    let audioBuffer: ArrayBuffer;

    try {
      // Check Vercel Blob for existing audio
      const existing = await head(audioCacheKey);
      if (existing) {
        // Download existing audio
        const audioResponse = await fetch(existing.url);
        if (audioResponse.ok) {
          audioBuffer = await audioResponse.arrayBuffer();
          console.log(`♻️ Using cached preview audio`);
        } else {
          throw new Error('Cached audio not accessible');
        }
      } else {
        throw new Error('Not found');
      }
    } catch {
      // Generate new audio
      console.log(`🎙️ Generating new preview audio for ${type}...`);
      audioBuffer = await generateVoiceover(script, {
        voiceName: 'alloy',
        speed: 1.0,
      });

      // Cache it
      await put(audioCacheKey, audioBuffer, {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'audio/mpeg',
      });
      console.log(`✅ Preview audio cached: ${audioCacheKey}`);
    }

    // Return audio as response
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Audio preview error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate audio preview',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
