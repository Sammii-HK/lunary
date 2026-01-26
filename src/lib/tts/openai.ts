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
    const pauseToken = '__LUNARY_PAUSE__';
    let processed = text.replace(/\n{2,}/g, ` ${pauseToken} `);

    // Remove duplicate consecutive words (TTS stuttering fix)
    // e.g., "Sagitta-Sagittarius" or "the the" -> single word
    processed = processed.replace(/\b(\w+)[-\s]+\1\b/gi, '$1');

    // Clean up any double spaces
    processed = processed.replace(/\s+/g, ' ').trim();

    // Re-insert pause markers as ellipses to encourage a natural break.
    processed = processed.replace(new RegExp(pauseToken, 'g'), '...');

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
    // Use provided voice or default to 'shimmer' (warm, natural for spiritual content)
    const voice = options.voiceName || 'shimmer';
    // Use provided model or default to 'tts-1-hd' for higher quality
    const model = options.model || 'tts-1-hd';
    // Use provided speed or default to 1.0
    const speed = options.speed || 1.0;

    // Enhanced tone instruction for engaging, professional astrology narration
    const toneInstruction = `Speak as a warm, knowledgeable astrology guide. Your tone should be:
- Confident and clear, like a trusted friend sharing cosmic wisdom
- Slightly mysterious and intriguing when discussing planetary movements
- Warm and reassuring, especially during challenging transits
- Use natural pauses for emphasis before key astrological terms
- Vary your pace: slower for important revelations, slightly faster for lists
- Pronounce astrological terms clearly: zodiac signs, planets, aspects
- End sentences with gentle downward inflection, not upward questioning
- Overall: professional podcast host meets mystical storyteller`;

    console.log(
      `🎙️ Generating voiceover with model: ${model}, voice: ${voice}, speed: ${speed}`,
    );

    // Preprocess text to help with pronunciation
    const processedText = this.preprocessTextForTTS(text);

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
          instructions: toneInstruction,
          speed,
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
      instructions: toneInstruction,
      speed,
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
