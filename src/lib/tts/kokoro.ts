import type { TTSProvider, TTSOptions, TTSVoice } from './types';
import { preprocessTextForTTS, splitTextIntoChunks } from './normalize-script';

// Map OpenAI voice names to Kokoro voice IDs so callers don't need to change
export const VOICE_MAP: Record<string, string> = {
  nova: 'af_bella',
  shimmer: 'af_heart',
  onyx: 'bf_emma',
  alloy: 'af_nicole',
  echo: 'am_fenrir',
  fable: 'am_puck',
};

export const DEFAULT_KOKORO_VOICE = 'af_heart';

// Allow-list of valid Kokoro voice IDs to prevent SSRF via arbitrary URLs
const ALLOWED_VOICE_IDS = new Set([
  ...Object.values(VOICE_MAP),
  DEFAULT_KOKORO_VOICE,
]);

const DEEPINFRA_API_URL =
  'https://api.deepinfra.com/v1/inference/hexgrad/Kokoro-82M';

function validateVoiceId(voiceId: string): string {
  if (ALLOWED_VOICE_IDS.has(voiceId)) return voiceId;
  return DEFAULT_KOKORO_VOICE;
}

async function generateChunk(
  text: string,
  voice: string,
  speed: number,
): Promise<ArrayBuffer> {
  const apiKey = process.env.DEEPINFRA_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPINFRA_API_KEY environment variable is not set');
  }

  const response = await fetch(DEEPINFRA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${apiKey}`,
    },
    body: JSON.stringify({
      text,
      preset_voice: voice,
      output_format: 'wav',
      speed,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `DeepInfra Kokoro API error ${response.status}: ${errorText}`,
    );
  }

  const data = await response.json();
  // DeepInfra returns base64-encoded audio
  const base64Audio = data.audio;
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export class KokoroTTSProvider implements TTSProvider {
  name = 'kokoro';
  contentType = 'audio/wav';

  async generateVoiceover(
    text: string,
    options: TTSOptions = {},
  ): Promise<ArrayBuffer> {
    const requestedVoice = options.voiceName || 'shimmer';
    const voice = validateVoiceId(
      VOICE_MAP[requestedVoice] || DEFAULT_KOKORO_VOICE,
    );
    const speed = options.speed || 1.0;

    const processed = preprocessTextForTTS(text);

    // Split long text into chunks for the API
    if (processed.length > 4096) {
      const chunks = splitTextIntoChunks(processed, 3500);
      console.log(
        `Kokoro: ${processed.length} chars, split into ${chunks.length} chunks`,
      );

      const wavBuffers: ArrayBuffer[] = [];
      for (let i = 0; i < chunks.length; i++) {
        console.log(
          `Kokoro chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`,
        );
        const result = await generateChunk(chunks[i], voice, speed);
        wavBuffers.push(result);
      }

      return concatenateWavBuffers(wavBuffers);
    }

    console.log(`Kokoro: generating voiceover with voice ${voice}`);
    return generateChunk(processed, voice, speed);
  }

  async getAvailableVoices(): Promise<TTSVoice[]> {
    return [
      { id: 'af_heart', name: 'Heart', language: 'en', gender: 'female' },
      { id: 'af_bella', name: 'Bella', language: 'en', gender: 'female' },
      { id: 'af_nicole', name: 'Nicole', language: 'en', gender: 'female' },
      {
        id: 'bf_emma',
        name: 'Emma',
        language: 'en',
        gender: 'female',
        accent: 'British',
      },
      { id: 'am_fenrir', name: 'Fenrir', language: 'en', gender: 'male' },
      { id: 'am_puck', name: 'Puck', language: 'en', gender: 'male' },
    ];
  }
}

/**
 * Concatenate multiple WAV buffers into a single WAV buffer.
 * Strips headers from all but the first buffer and recalculates sizes.
 */
function concatenateWavBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
  if (buffers.length === 0) return new ArrayBuffer(0);
  if (buffers.length === 1) return buffers[0];

  // Extract PCM data from each buffer (skip 44-byte headers)
  const pcmChunks = buffers.map((buf) => new Uint8Array(buf, 44));
  const totalPcmLength = pcmChunks.reduce(
    (sum, chunk) => sum + chunk.byteLength,
    0,
  );

  // Copy header from first buffer and update sizes
  const result = new ArrayBuffer(44 + totalPcmLength);
  const resultView = new Uint8Array(result);
  const headerView = new DataView(result);

  // Copy header from first buffer
  resultView.set(new Uint8Array(buffers[0], 0, 44));

  // Update RIFF chunk size (file size - 8)
  headerView.setUint32(4, 36 + totalPcmLength, true);
  // Update data subchunk size
  headerView.setUint32(40, totalPcmLength, true);

  // Concatenate PCM data
  let offset = 44;
  for (const chunk of pcmChunks) {
    resultView.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return result;
}
