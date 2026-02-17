import type { TTSProvider, TTSOptions, TTSVoice } from './types';
import {
  ensureLinePunctuation,
  preprocessTextForTTS,
  splitTextIntoChunks,
} from './normalize-script';

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

// OpenAI-compatible TTS endpoint — properly respects the voice parameter
const DEEPINFRA_API_URL = 'https://api.deepinfra.com/v1/openai/audio/speech';

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
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'hexgrad/Kokoro-82M',
      input: text,
      voice,
      response_format: 'wav',
      speed,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `DeepInfra Kokoro API error ${response.status}: ${errorText}`,
    );
  }

  // OpenAI-compatible endpoint returns raw audio bytes directly
  return response.arrayBuffer();
}

/**
 * Split script into breath-group segments at line breaks.
 * Each segment is a paragraph or line that should have silence after it.
 * Returns [text, pauseMs] pairs.
 */
function splitIntoBreathGroups(
  text: string,
): Array<{ text: string; pauseMs: number }> {
  // First ensure every line has punctuation
  const punctuated = ensureLinePunctuation(text);

  const groups: Array<{ text: string; pauseMs: number }> = [];
  const parts = punctuated.split(/\n/);

  for (let i = 0; i < parts.length; i++) {
    const trimmed = parts[i].trim();
    if (!trimmed) {
      // Empty line = extra pause on previous group
      if (groups.length > 0) {
        groups[groups.length - 1].pauseMs += 400;
      }
      continue;
    }

    // Check if next line is empty (paragraph break = longer pause)
    const nextIsEmpty = i + 1 < parts.length && !parts[i + 1].trim();
    const isLastLine = i === parts.length - 1;

    groups.push({
      text: preprocessTextForTTS(trimmed),
      pauseMs: isLastLine ? 0 : nextIsEmpty ? 600 : 350,
    });
  }

  return groups;
}

/**
 * Generate silence as PCM data (16-bit, mono or stereo based on sample rate).
 * We read the sample rate and channels from the first WAV header.
 */
function generateSilence(
  durationMs: number,
  sampleRate: number,
  numChannels: number,
  bitsPerSample: number,
): Uint8Array {
  const bytesPerSample = bitsPerSample / 8;
  const numSamples = Math.round((sampleRate * durationMs) / 1000);
  const dataLength = numSamples * numChannels * bytesPerSample;
  return new Uint8Array(dataLength); // All zeros = silence
}

/**
 * Read WAV header info from an ArrayBuffer
 */
function readWavInfo(buf: ArrayBuffer): {
  sampleRate: number;
  numChannels: number;
  bitsPerSample: number;
} {
  const view = new DataView(buf);
  return {
    numChannels: view.getUint16(22, true),
    sampleRate: view.getUint32(24, true),
    bitsPerSample: view.getUint16(34, true),
  };
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

    // Split into breath groups with pause durations between them
    const groups = splitIntoBreathGroups(text);

    // If only one group or very short, just generate directly
    if (groups.length <= 1) {
      const processed = preprocessTextForTTS(ensureLinePunctuation(text));
      // Still handle long single-group text
      if (processed.length > 4096) {
        const chunks = splitTextIntoChunks(processed, 3500);
        const wavBuffers: ArrayBuffer[] = [];
        for (const chunk of chunks) {
          wavBuffers.push(await generateChunk(chunk, voice, speed));
        }
        return concatenateWavBuffers(wavBuffers);
      }
      return generateChunk(processed, voice, speed);
    }

    console.log(
      `Kokoro: ${groups.length} breath groups, generating with pauses`,
    );

    // Only merge very tiny fragments (under 40 chars) to avoid losing pauses
    // between lines. Each group = separate API call with silence after it.
    const merged = mergeSmallGroups(groups, 40);

    // Generate audio for each merged group
    const wavBuffers: ArrayBuffer[] = [];
    for (let i = 0; i < merged.length; i++) {
      const group = merged[i];
      console.log(
        `Kokoro group ${i + 1}/${merged.length} (${group.text.length} chars, ${group.pauseMs}ms pause)`,
      );

      // Handle long groups by further splitting
      if (group.text.length > 4096) {
        const subChunks = splitTextIntoChunks(group.text, 3500);
        for (const sub of subChunks) {
          wavBuffers.push(await generateChunk(sub, voice, speed));
        }
      } else {
        wavBuffers.push(await generateChunk(group.text, voice, speed));
      }

      // Insert silence after this group (except the last)
      if (group.pauseMs > 0 && i < merged.length - 1 && wavBuffers.length > 0) {
        const info = readWavInfo(wavBuffers[0]);
        const silence = generateSilence(
          group.pauseMs,
          info.sampleRate,
          info.numChannels,
          info.bitsPerSample,
        );
        wavBuffers.push(silenceToWav(silence, info));
      }
    }

    return concatenateWavBuffers(wavBuffers);
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
 * Merge adjacent small groups to reduce API calls.
 * Groups under minChars get combined with the next group.
 * Pause from the merged group is preserved as the combined pause.
 */
function mergeSmallGroups(
  groups: Array<{ text: string; pauseMs: number }>,
  minChars: number,
): Array<{ text: string; pauseMs: number }> {
  const merged: Array<{ text: string; pauseMs: number }> = [];

  let current = { text: '', pauseMs: 0 };

  for (const group of groups) {
    if (current.text && current.text.length + group.text.length < minChars) {
      // Merge: combine text with a sentence break, keep the later pause
      current.text = `${current.text} ${group.text}`;
      current.pauseMs = group.pauseMs;
    } else if (!current.text) {
      current = { ...group };
    } else {
      merged.push(current);
      current = { ...group };
    }
  }

  if (current.text) {
    merged.push(current);
  }

  return merged;
}

/**
 * Wrap raw PCM silence data in a minimal WAV container
 */
function silenceToWav(
  pcmData: Uint8Array,
  info: { sampleRate: number; numChannels: number; bitsPerSample: number },
): ArrayBuffer {
  const dataLength = pcmData.byteLength;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  const bytesPerSample = info.bitsPerSample / 8;
  const byteRate = info.sampleRate * info.numChannels * bytesPerSample;
  const blockAlign = info.numChannels * bytesPerSample;

  // RIFF header
  bytes.set([0x52, 0x49, 0x46, 0x46]); // "RIFF"
  view.setUint32(4, 36 + dataLength, true);
  bytes.set([0x57, 0x41, 0x56, 0x45], 8); // "WAVE"

  // fmt chunk
  bytes.set([0x66, 0x6d, 0x74, 0x20], 12); // "fmt "
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, info.numChannels, true);
  view.setUint32(24, info.sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, info.bitsPerSample, true);

  // data chunk
  bytes.set([0x64, 0x61, 0x74, 0x61], 36); // "data"
  view.setUint32(40, dataLength, true);
  bytes.set(pcmData, 44);

  return buffer;
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
