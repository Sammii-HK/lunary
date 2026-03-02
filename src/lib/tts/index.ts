import OpenAI from 'openai';
import { toFile } from 'openai/uploads';
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

/**
 * Transcribe audio via OpenAI Whisper and return word-level timestamps.
 * Cost: ~$0.006/min (~$0.003/video at current lengths).
 */
export async function transcribeWithWhisper(
  audioBuffer: ArrayBuffer,
): Promise<WhisperWord[]> {
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

  // verbose_json returns words at the top level
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
