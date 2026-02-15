import { NextRequest, NextResponse } from 'next/server';
import {
  generateVoiceover,
  getAvailableVoices,
  getTTSContentType,
} from '@/lib/tts';
import { checkQuota, MYSTICAL_VOICES } from '@/lib/tts/elevenlabs'; // Deprecated but kept for compatibility

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { text, voice } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (text.length > 500) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 500 characters for free tier.' },
        { status: 400 },
      );
    }

    const audioBuffer = await generateVoiceover(text, {
      voiceName: voice || 'shimmer',
      speed: 1.0,
    });

    const contentType = getTTSContentType();
    const ext = contentType === 'audio/wav' ? 'wav' : 'mp3';

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="voiceover.${ext}"`,
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
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      message: 'OPENAI_API_KEY not set. Add it to environment variables.',
    });
  }

  try {
    const voices = await getAvailableVoices();
    const quota = await checkQuota(); // Returns mock data for OpenAI

    return NextResponse.json({
      configured: true,
      voices: voices.length > 0 ? voices : MYSTICAL_VOICES, // Use new voices if available
      quota: {
        used: quota.character_count,
        limit: quota.character_limit,
        remaining: quota.remaining,
        percentUsed:
          quota.character_limit === Infinity
            ? 0
            : Math.round((quota.character_count / quota.character_limit) * 100),
      },
      provider: 'openai',
    });
  } catch {
    return NextResponse.json({
      configured: true,
      voices: MYSTICAL_VOICES,
      message: 'API key configured. Using OpenAI TTS (pay-as-you-go pricing).',
      provider: 'openai',
    });
  }
}
