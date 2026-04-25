import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/audio/narrate
 *
 * v1 implementation: returns `{ audioUrl: null, useBrowserSynthesis: true }`
 * to instruct the client to fall back to the browser's free Web Speech
 * Synthesis API. This keeps ongoing TTS cost at $0 while we validate that
 * users actually want narration.
 *
 * Request body:
 *   { text: string, voice?: string }
 *
 * Response:
 *   { audioUrl: string | null, useBrowserSynthesis: boolean, voice?: string }
 *
 * ---------------------------------------------------------------------------
 * FUTURE: server-side TTS upgrade path.
 *
 * If/when we want premium voices, swap the body of this handler with one of:
 *
 *   // OpenAI TTS (~$15 / 1M chars)
 *   // import OpenAI from 'openai'
 *   // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
 *   // const speech = await openai.audio.speech.create({
 *   //   model: 'tts-1',
 *   //   voice: voice ?? 'nova',
 *   //   input: text,
 *   // })
 *   // const buffer = Buffer.from(await speech.arrayBuffer())
 *   // ...upload to vercel blob, return blob.url
 *
 *   // ElevenLabs (premium, voice cloning, ~$30/mo+)
 *   // const res = await fetch(
 *   //   `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
 *   //   { method: 'POST', headers: { 'xi-api-key': process.env.ELEVENLABS_KEY!, ... },
 *   //     body: JSON.stringify({ text, model_id: 'eleven_turbo_v2' }) }
 *   // )
 *
 * On the client, `useAudioNarration` is already wired to prefer `audioUrl`
 * (file playback via <audio>) when present, and only falls back to
 * `speakText` when `useBrowserSynthesis` is true. So this upgrade is a pure
 * server-side change — no client edits needed.
 *
 * Cache the resulting URL via `setCachedAudioUrl(hashContent(text), voice, url)`
 * so we never pay twice for the same paragraph.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_TEXT_LENGTH = 5000;

interface NarrateBody {
  text?: unknown;
  voice?: unknown;
}

export async function POST(req: NextRequest) {
  let body: NarrateBody;
  try {
    body = (await req.json()) as NarrateBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const voice = typeof body.voice === 'string' ? body.voice : undefined;

  if (!text) {
    return NextResponse.json({ error: 'Missing text' }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `Text too long (max ${MAX_TEXT_LENGTH} chars)` },
      { status: 413 },
    );
  }

  // v1: tell the client to use the browser's Web Speech API.
  return NextResponse.json({
    audioUrl: null,
    useBrowserSynthesis: true,
    voice: voice ?? null,
  });
}
