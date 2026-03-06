import type { TTSProvider, TTSOptions } from './types';
import { OpenAITTSProvider } from './openai';
import { KokoroTTSProvider } from './kokoro';

export interface WhisperWord {
  word: string;
  start: number; // seconds
  end: number; // seconds
}

const TTS_PROVIDER: 'kokoro' | 'openai' = 'kokoro';

function getTTSProvider(): TTSProvider {
  switch (TTS_PROVIDER) {
    case 'kokoro':
      return new KokoroTTSProvider();
    case 'openai':
      return new OpenAITTSProvider();
    default:
      throw new Error(`Unknown TTS provider: ${TTS_PROVIDER}`);
  }
}

// Export a unified interface
export async function generateVoiceover(
  text: string,
  options: TTSOptions = {},
): Promise<ArrayBuffer> {
  const provider = getTTSProvider();
  return provider.generateVoiceover(text, options);
}

export async function getAvailableVoices() {
  const provider = getTTSProvider();
  if (provider.getAvailableVoices) {
    return provider.getAvailableVoices();
  }
  return [];
}

export function getTTSContentType(): string {
  const provider = getTTSProvider();
  return provider.contentType;
}

const WHISPER_API_URL = process.env.WHISPER_API_URL || 'http://localhost:9001';

/**
 * Transcribe audio and return word-level timestamps.
 * Uses local faster-whisper (free) with OpenAI fallback.
 */
export async function transcribeWithWhisper(
  audioBuffer: ArrayBuffer,
): Promise<WhisperWord[]> {
  try {
    const health = await fetch(`${WHISPER_API_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!health.ok) throw new Error('unhealthy');

    const formData = new FormData();
    formData.append(
      'file',
      new Blob([audioBuffer], { type: 'audio/mpeg' }),
      'audio.mp3',
    );

    const response = await fetch(`${WHISPER_API_URL}/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok)
      throw new Error(`Local whisper error: ${await response.text()}`);

    const result = (await response.json()) as { words: WhisperWord[] };
    return result.words ?? [];
  } catch {
    console.log('[TTS] Local whisper unavailable, falling back to OpenAI');
    const { default: OpenAI } = await import('openai');
    const { toFile } = await import('openai/uploads');

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const file = await toFile(Buffer.from(audioBuffer), 'audio.mp3', {
      type: 'audio/mpeg',
    });

    const response = await client.audio.transcriptions.create({
      model: 'whisper-1',
      file,
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    });

    const words = (
      response as unknown as {
        words?: Array<{ word: string; start: number; end: number }>;
      }
    ).words;
    if (!words?.length) return [];

    return words.map((w) => ({
      word: w.word.trim(),
      start: w.start,
      end: w.end,
    }));
  }
}
