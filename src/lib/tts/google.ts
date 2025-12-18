import type { TTSProvider, TTSOptions, TTSVoice } from './types';

export class GoogleCloudTTSProvider implements TTSProvider {
  name = 'google-cloud';

  async generateVoiceover(
    text: string,
    options: TTSOptions = {},
  ): Promise<ArrayBuffer> {
    // TODO: Implement Google Cloud TTS
    // Requires: @google-cloud/text-to-speech package
    throw new Error('Google Cloud TTS not yet implemented');
  }

  async getAvailableVoices(): Promise<TTSVoice[]> {
    // TODO: Fetch from Google Cloud TTS API
    return [];
  }
}
