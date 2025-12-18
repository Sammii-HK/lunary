import OpenAI from 'openai';
import type { TTSProvider, TTSOptions, TTSVoice } from './types';

export class OpenAITTSProvider implements TTSProvider {
  name = 'openai';
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Preprocess text to help TTS with pronunciation of astrological terms
   * Fixes stuttering issues with duplicate words
   */
  private preprocessTextForTTS(text: string): string {
    // Remove duplicate consecutive words (TTS stuttering fix)
    // e.g., "Sagitta-Sagittarius" or "the the" -> single word
    let processed = text.replace(/\b(\w+)[-\s]+\1\b/gi, '$1');

    // Clean up any double spaces
    processed = processed.replace(/\s+/g, ' ');

    return processed;
  }

  /**
   * Split text into chunks that fit within OpenAI TTS character limit (4096)
   * Tries to split at sentence boundaries to avoid cutting mid-sentence
   */
  private splitTextIntoChunks(text: string, maxChars: number = 3500): string[] {
    const chunks: string[] = [];

    if (text.length <= maxChars) {
      return [text];
    }

    // Split by sentences first
    const sentences = text.split(/([.!?]+\s+)/);
    let currentChunk = '';

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const testChunk = currentChunk + sentence;

      if (testChunk.length <= maxChars) {
        currentChunk = testChunk;
      } else {
        // Current chunk is full, save it and start new one
        if (currentChunk.trim().length > 0) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;

        // If a single sentence is too long, split it by words
        if (currentChunk.length > maxChars) {
          const words = currentChunk.split(/\s+/);
          let wordChunk = '';
          for (const word of words) {
            if ((wordChunk + ' ' + word).length <= maxChars) {
              wordChunk = wordChunk ? wordChunk + ' ' + word : word;
            } else {
              if (wordChunk) chunks.push(wordChunk);
              wordChunk = word;
            }
          }
          if (wordChunk) currentChunk = wordChunk;
        }
      }
    }

    // Add final chunk
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  async generateVoiceover(
    text: string,
    options: TTSOptions = {},
  ): Promise<ArrayBuffer> {
    // Only use 'nova' - British female voice (as per requirements)
    const requestedVoice = options.voiceName || 'nova';

    // Enforce 'nova' if another voice is requested
    if (requestedVoice !== 'nova') {
      console.warn(
        `Voice '${requestedVoice}' requested, but only 'nova' (British female) is allowed. Using 'nova' instead.`,
      );
    }

    const voice = 'nova'; // Always use British female voice
    const model = options.model || 'tts-1-hd'; // High quality by default

    // Preprocess text to help with pronunciation
    const processedText = this.preprocessTextForTTS(text);

    console.log(
      `🎙️ Generating voiceover with voice: ${voice} (British female)`,
    );

    // Check if text exceeds character limit
    if (processedText.length > 4096) {
      console.log(
        `📝 Text is ${processedText.length} characters, splitting into chunks...`,
      );
      const chunks = this.splitTextIntoChunks(processedText, 3500);
      console.log(`📦 Split into ${chunks.length} chunks`);

      // Generate audio for each chunk
      const audioChunks: ArrayBuffer[] = [];
      for (let i = 0; i < chunks.length; i++) {
        console.log(
          `🎙️ Generating audio chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)...`,
        );
        const chunkAudio = await this.client.audio.speech.create({
          model,
          voice: voice as any,
          input: chunks[i],
          speed: options.speed || 1.0,
        });
        audioChunks.push(await chunkAudio.arrayBuffer());
      }

      // Concatenate audio chunks
      // Note: Simple byte concatenation works for MP3 files
      const totalLength = audioChunks.reduce(
        (sum, chunk) => sum + chunk.byteLength,
        0,
      );
      const concatenated = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of audioChunks) {
        concatenated.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      }

      console.log(
        `✅ Generated and concatenated ${chunks.length} audio chunks`,
      );
      return concatenated.buffer;
    }

    // Text fits in one request
    const response = await this.client.audio.speech.create({
      model,
      voice: voice as any,
      input: processedText,
      speed: options.speed || 1.1,
    });

    return await response.arrayBuffer();
  }

  async getAvailableVoices(): Promise<TTSVoice[]> {
    return [
      { id: 'alloy', name: 'Alloy', language: 'en', gender: 'neutral' },
      { id: 'echo', name: 'Echo', language: 'en', gender: 'male' },
      { id: 'fable', name: 'Fable', language: 'en', gender: 'male' },
      {
        id: 'onyx',
        name: 'Onyx',
        language: 'en',
        gender: 'male',
        accent: 'British',
      },
      {
        id: 'nova',
        name: 'Nova',
        language: 'en',
        gender: 'female',
        accent: 'British',
      },
      { id: 'shimmer', name: 'Shimmer', language: 'en', gender: 'female' },
    ];
  }
}
