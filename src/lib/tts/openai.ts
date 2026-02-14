import OpenAI from 'openai';
import type { TTSProvider, TTSOptions, TTSVoice } from './types';
import { preprocessTextForTTS, splitTextIntoChunks } from './normalize-script';

export class OpenAITTSProvider implements TTSProvider {
  name = 'openai';
  contentType = 'audio/mpeg';
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    this.client = new OpenAI({ apiKey });
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
    const processedText = preprocessTextForTTS(text);

    // Check if text exceeds character limit
    if (processedText.length > 4096) {
      console.log(
        `📝 Text is ${processedText.length} characters, splitting into chunks...`,
      );
      const chunks = splitTextIntoChunks(processedText, 3500);
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
