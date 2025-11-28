import { NextRequest, NextResponse } from 'next/server';
import {
  generateVoiceover,
  checkQuota,
  MYSTICAL_VOICES,
} from '@/lib/tts/elevenlabs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (text.length > 500) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 500 characters for free tier.' },
        { status: 400 },
      );
    }

    const audioBuffer = await generateVoiceover(text, { voiceId });

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="voiceover.mp3"',
      },
    });
  } catch (error) {
    console.error('Voiceover generation error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate voiceover',
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      message: 'ELEVENLABS_API_KEY not set. Add it to environment variables.',
    });
  }

  try {
    const quota = await checkQuota();

    return NextResponse.json({
      configured: true,
      voices: MYSTICAL_VOICES,
      quota: {
        used: quota.character_count,
        limit: quota.character_limit,
        remaining: quota.remaining,
        percentUsed: Math.round(
          (quota.character_count / quota.character_limit) * 100,
        ),
      },
    });
  } catch {
    return NextResponse.json({
      configured: true,
      voices: MYSTICAL_VOICES,
      message:
        'API key configured. Quota info not available (limited permissions).',
    });
  }
}
