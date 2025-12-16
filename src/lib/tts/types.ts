export interface TTSProvider {
  name: string;
  generateVoiceover(text: string, options: TTSOptions): Promise<ArrayBuffer>;
  getAvailableVoices?(): Promise<TTSVoice[]>;
}

export interface TTSOptions {
  voiceName?: string; // Human-readable name (e.g., "nova", "onyx", "shimmer")
  speed?: number; // 0.25 to 4.0
  model?: string; // Provider-specific model (e.g., "tts-1", "tts-1-hd")
}

export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  gender?: 'male' | 'female' | 'neutral';
  accent?: string;
}
