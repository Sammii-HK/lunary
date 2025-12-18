import type { TTSProvider, TTSOptions } from './types';
import { OpenAITTSProvider } from './openai';
// import { GoogleCloudTTSProvider } from './google'; // For future use

const TTS_PROVIDER = (process.env.TTS_PROVIDER || 'openai').toLowerCase();

function getTTSProvider(): TTSProvider {
  switch (TTS_PROVIDER) {
    case 'openai':
      return new OpenAITTSProvider();
    // case 'google-cloud':
    //   return new GoogleCloudTTSProvider();
    default:
      throw new Error(
        `Unknown TTS provider: ${TTS_PROVIDER}. Set TTS_PROVIDER env var to 'openai' or 'google-cloud'`,
      );
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
