import type { TTSProvider, TTSOptions, TTSVoice } from './types';
import {
  ensureLinePunctuation,
  preprocessTextForTTS,
  splitTextIntoChunks,
} from './normalize-script';

// Map OpenAI voice names to Orpheus voice IDs so callers don't need to change
export const VOICE_MAP: Record<string, string> = {
  nova: 'jess',
  shimmer: 'tara',
  onyx: 'leo',
  alloy: 'mia',
  echo: 'dan',
  fable: 'zac',
};

export const DEFAULT_ORPHEUS_VOICE = 'jess';

// Allow-list of valid Orpheus voice IDs to prevent SSRF via arbitrary URLs
const ALLOWED_VOICE_IDS = new Set([
  'tara',
  'leah',
  'jess',
  'leo',
  'dan',
  'mia',
  'zac',
  'zoe',
]);

// Pronunciation fixes for astrology/pagan terms
const TTS_PRONUNCIATIONS: [RegExp, string][] = [
  [/\bgrimoire\b/gi, 'grim-wahr'],
  [/\bgibbous\b/gi, 'GIH-bus'],
  [/\bsamhain\b/gi, 'sow-in'],
  [/\bmabon\b/gi, 'may-bon'],
  [/\bimbolc\b/gi, 'im-olk'],
  [/\blitha\b/gi, 'lee-thah'],
  // Ostara: Orpheus handles this naturally — phonetic replacements make it worse
  [/\bbeltane\b/gi, 'bell-tayn'],
  [/\bathame\b/gi, 'ah-thah-may'],
  [/\bdeosil\b/gi, 'jess-ul'],
  [/\bwiddershins\b/gi, 'wid-er-shinz'],
];

// OpenAI-compatible TTS endpoint — properly respects the voice parameter
const DEEPINFRA_API_URL = 'https://api.deepinfra.com/v1/openai/audio/speech';

function validateVoiceId(voiceId: string): string {
  if (ALLOWED_VOICE_IDS.has(voiceId)) return voiceId;
  return DEFAULT_ORPHEUS_VOICE;
}

function applyPronunciations(text: string): string {
  let result = text;
  for (const [pattern, replacement] of TTS_PRONUNCIATIONS) {
    result = result.replace(pattern, replacement);
  }
  return result;
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
      model: 'canopylabs/orpheus-3b-0.1-ft',
      input: text,
      voice,
      response_format: 'mp3',
      speed,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `DeepInfra Orpheus API error ${response.status}: ${errorText}`,
    );
  }

  // OpenAI-compatible endpoint returns raw audio bytes directly
  return response.arrayBuffer();
}

/**
 * Split script into breath-group segments at line breaks.
 * Each segment is a paragraph or line that should be spoken as a unit.
 * Orpheus handles natural pauses from punctuation, so we just track
 * the text segments without explicit silence insertion.
 */
function splitIntoBreathGroups(text: string): Array<{ text: string }> {
  // First ensure every line has punctuation
  const punctuated = ensureLinePunctuation(text);

  const groups: Array<{ text: string }> = [];
  const parts = punctuated.split(/\n/);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    groups.push({
      text: applyPronunciations(preprocessTextForTTS(trimmed)),
    });
  }

  return groups;
}

/**
 * Concatenate MP3 buffers by appending raw bytes.
 * MP3 frames are self-contained, so simple concatenation works.
 */
function concatenateMp3Buffers(buffers: ArrayBuffer[]): ArrayBuffer {
  if (buffers.length === 0) return new ArrayBuffer(0);
  if (buffers.length === 1) return buffers[0];

  const totalLength = buffers.reduce((sum, buf) => sum + buf.byteLength, 0);
  const result = new Uint8Array(totalLength);

  let offset = 0;
  for (const buf of buffers) {
    result.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }

  return result.buffer;
}

export class OrpheusTTSProvider implements TTSProvider {
  name = 'orpheus';
  contentType = 'audio/mpeg';

  async generateVoiceover(
    text: string,
    options: TTSOptions = {},
  ): Promise<ArrayBuffer> {
    const requestedVoice = options.voiceName || 'shimmer';
    const voice = validateVoiceId(
      VOICE_MAP[requestedVoice] || DEFAULT_ORPHEUS_VOICE,
    );
    const speed = options.speed || 1.0;

    // Split into breath groups
    const groups = splitIntoBreathGroups(text);

    // If only one group or very short, just generate directly
    if (groups.length <= 1) {
      const processed = applyPronunciations(
        preprocessTextForTTS(ensureLinePunctuation(text)),
      );
      // Still handle long single-group text
      if (processed.length > 4096) {
        const chunks = splitTextIntoChunks(processed, 3500);
        const mp3Buffers: ArrayBuffer[] = [];
        for (const chunk of chunks) {
          mp3Buffers.push(await generateChunk(chunk, voice, speed));
        }
        return concatenateMp3Buffers(mp3Buffers);
      }
      return generateChunk(processed, voice, speed);
    }

    console.log(`Orpheus: ${groups.length} breath groups, generating`);

    // Merge very tiny fragments (under 40 chars) to reduce API calls
    const merged = mergeSmallGroups(groups, 40);

    // Generate audio for each merged group
    const mp3Buffers: ArrayBuffer[] = [];
    for (let i = 0; i < merged.length; i++) {
      const group = merged[i];
      console.log(
        `Orpheus group ${i + 1}/${merged.length} (${group.text.length} chars)`,
      );

      // Handle long groups by further splitting
      if (group.text.length > 4096) {
        const subChunks = splitTextIntoChunks(group.text, 3500);
        for (const sub of subChunks) {
          mp3Buffers.push(await generateChunk(sub, voice, speed));
        }
      } else {
        mp3Buffers.push(await generateChunk(group.text, voice, speed));
      }

      // No explicit silence insertion — Orpheus is an LLM-based model
      // with natural prosody that handles pauses from punctuation naturally
    }

    return concatenateMp3Buffers(mp3Buffers);
  }

  async getAvailableVoices(): Promise<TTSVoice[]> {
    return [
      { id: 'jess', name: 'Jess', language: 'en', gender: 'female' },
      { id: 'tara', name: 'Tara', language: 'en', gender: 'female' },
      { id: 'leah', name: 'Leah', language: 'en', gender: 'female' },
      { id: 'mia', name: 'Mia', language: 'en', gender: 'female' },
      { id: 'zoe', name: 'Zoe', language: 'en', gender: 'female' },
      { id: 'leo', name: 'Leo', language: 'en', gender: 'male' },
      { id: 'dan', name: 'Dan', language: 'en', gender: 'male' },
      { id: 'zac', name: 'Zac', language: 'en', gender: 'male' },
    ];
  }
}

/**
 * Merge adjacent small groups to reduce API calls.
 * Groups under minChars get combined with the next group.
 */
function mergeSmallGroups(
  groups: Array<{ text: string }>,
  minChars: number,
): Array<{ text: string }> {
  const merged: Array<{ text: string }> = [];

  let current = { text: '' };

  for (const group of groups) {
    if (current.text && current.text.length + group.text.length < minChars) {
      // Merge: combine text with a sentence break
      current.text = `${current.text} ${group.text}`;
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
