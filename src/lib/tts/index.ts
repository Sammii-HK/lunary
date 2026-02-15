import type { TTSProvider, TTSOptions } from './types';
import { OpenAITTSProvider } from './openai';
import { KokoroTTSProvider } from './kokoro';

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
