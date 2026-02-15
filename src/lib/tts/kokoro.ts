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

const VOICE_BASE_URL =
  'https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices';

// In-memory cache for voice embeddings (persists across requests in same process)
const voiceCache = new Map<string, Float32Array>();

/**
 * Fetch a voice embedding from HuggingFace and cache in memory.
 * Bypasses kokoro-js's broken local file resolution in bundled environments.
 */
async function loadVoice(voiceId: string): Promise<Float32Array> {
  const cached = voiceCache.get(voiceId);
  if (cached) return cached;

  const url = `${VOICE_BASE_URL}/${voiceId}.bin`;
  console.log(`📥 Downloading voice: ${voiceId} from HuggingFace...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download voice ${voiceId}: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  const voice = new Float32Array(buffer);
  voiceCache.set(voiceId, voice);
  console.log(`✅ Voice ${voiceId} cached (${voice.length} floats)`);
  return voice;
}

/**
 * Encode Float32Array PCM samples to a WAV ArrayBuffer.
 * Standard 44-byte header + 16-bit PCM data.
 */
export function pcmToWav(pcm: Float32Array, sampleRate: number): ArrayBuffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcm.length * (bitsPerSample / 8);
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // file size - 8
  writeString(view, 8, 'WAVE');

  // fmt subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // subchunk size (PCM = 16)
  view.setUint16(20, 1, true); // audio format (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples as 16-bit integers
  let offset = 44;
  for (let i = 0; i < pcm.length; i++) {
    const sample = Math.max(-1, Math.min(1, pcm[i]));
    const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  return buffer;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export class KokoroTTSProvider implements TTSProvider {
  name = 'kokoro';
  contentType = 'audio/wav';
  private tts: any = null;

  private async getTTS() {
    if (!this.tts) {
      const { KokoroTTS } = await import('kokoro-js');
      this.tts = await KokoroTTS.from_pretrained(
        'onnx-community/Kokoro-82M-v1.0-ONNX',
        { dtype: 'q8', device: 'cpu' },
      );
    }
    return this.tts;
  }

  /**
   * Generate speech by calling the model directly with pre-fetched voice data.
   *
   * kokoro-js's generate() tries to load voice .bin files via fs.readFile
   * with a path derived from import.meta.dirname, which breaks in Next.js
   * bundles. We bypass this by:
   * 1. Fetching voice embeddings from HuggingFace ourselves (cached in memory)
   * 2. Tokenizing text via tts.tokenizer (exposed on the instance)
   * 3. Constructing the style tensor manually
   * 4. Calling tts.model() directly
   */
  private async generateWithVoice(
    tts: any,
    text: string,
    voiceId: string,
    speed: number = 1.0,
  ): Promise<{ audio: Float32Array; sampling_rate: number }> {
    const { Tensor } = await import('@huggingface/transformers');
    const { phonemize } = await import('phonemizer');

    // Load voice embedding from HuggingFace (cached in memory after first fetch)
    const voiceData = await loadVoice(voiceId);

    // Phonemize: convert text to IPA representation
    const langCode = voiceId.startsWith('b') ? 'en' : 'en-us';
    const phonemes = await phonemize(text, langCode);
    let ipa = phonemes
      .join(' ')
      .replace(/kəkˈoːɹoʊ/g, 'kˈoʊkəɹoʊ')
      .replace(/kəkˈɔːɹəʊ/g, 'kˈəʊkəɹəʊ')
      .replace(/ʲ/g, 'j')
      .replace(/r/g, 'ɹ')
      .replace(/x/g, 'k')
      .replace(/ɬ/g, 'l')
      .replace(/(?<=[a-zɹː])(?=hˈʌndɹɪd)/g, ' ')
      .replace(/ z(?=[;:,.!?¡¿—…"«»"" ]|$)/g, 'z');
    if (langCode === 'en-us') {
      ipa = ipa.replace(/(?<=nˈaɪn)ti(?!ː)/g, 'di');
    }
    ipa = ipa.trim();

    // Tokenize the phonemes
    const { input_ids } = tts.tokenizer(ipa, { truncation: true });

    // Calculate style vector from voice embedding
    // (same logic as kokoro-js internal: offset based on token count)
    const tokenLength = input_ids.dims.at(-1);
    const sliceOffset = 256 * Math.min(Math.max(tokenLength - 2, 0), 509);
    const style = voiceData.slice(sliceOffset, sliceOffset + 256);

    // Run the ONNX model directly
    const { waveform } = await tts.model({
      input_ids,
      style: new Tensor('float32', style, [1, 256]),
      speed: new Tensor('float32', [speed], [1]),
    });

    return { audio: waveform.data as Float32Array, sampling_rate: 24000 };
  }

  async generateVoiceover(
    text: string,
    options: TTSOptions = {},
  ): Promise<ArrayBuffer> {
    const tts = await this.getTTS();
    const requestedVoice = options.voiceName || 'shimmer';
    const voice = VOICE_MAP[requestedVoice] || requestedVoice;

    const processed = preprocessTextForTTS(text);

    // Split long text into chunks for safety
    if (processed.length > 4096) {
      console.log(
        `📝 Text is ${processed.length} characters, splitting into chunks...`,
      );
      const chunks = splitTextIntoChunks(processed, 3500);
      console.log(`📦 Split into ${chunks.length} chunks`);

      const wavBuffers: ArrayBuffer[] = [];
      for (let i = 0; i < chunks.length; i++) {
        console.log(
          `🎙️ Generating Kokoro chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)...`,
        );
        const result = await this.generateWithVoice(tts, chunks[i], voice);
        wavBuffers.push(pcmToWav(result.audio, result.sampling_rate));
      }

      return concatenateWavBuffers(wavBuffers);
    }

    console.log(`🎙️ Generating Kokoro voiceover with voice: ${voice}`);
    const result = await this.generateWithVoice(tts, processed, voice);
    return pcmToWav(result.audio, result.sampling_rate);
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
