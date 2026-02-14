import { pcmToWav } from '@/lib/tts/kokoro';

describe('pcmToWav', () => {
  const sampleRate = 24000;

  function createTestPCM(length: number): Float32Array {
    const pcm = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      pcm[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate); // 440Hz sine wave
    }
    return pcm;
  }

  it('output starts with RIFF header', () => {
    const pcm = createTestPCM(100);
    const wav = pcmToWav(pcm, sampleRate);
    const view = new DataView(wav);
    // 'RIFF' = 0x52494646
    expect(String.fromCharCode(view.getUint8(0))).toBe('R');
    expect(String.fromCharCode(view.getUint8(1))).toBe('I');
    expect(String.fromCharCode(view.getUint8(2))).toBe('F');
    expect(String.fromCharCode(view.getUint8(3))).toBe('F');
  });

  it('contains WAVE format identifier', () => {
    const pcm = createTestPCM(100);
    const wav = pcmToWav(pcm, sampleRate);
    const view = new DataView(wav);
    // 'WAVE' at offset 8
    const wave = String.fromCharCode(
      view.getUint8(8),
      view.getUint8(9),
      view.getUint8(10),
      view.getUint8(11),
    );
    expect(wave).toBe('WAVE');
  });

  it('contains fmt subchunk', () => {
    const pcm = createTestPCM(100);
    const wav = pcmToWav(pcm, sampleRate);
    const view = new DataView(wav);
    // 'fmt ' at offset 12
    const fmt = String.fromCharCode(
      view.getUint8(12),
      view.getUint8(13),
      view.getUint8(14),
      view.getUint8(15),
    );
    expect(fmt).toBe('fmt ');
  });

  it('contains data subchunk', () => {
    const pcm = createTestPCM(100);
    const wav = pcmToWav(pcm, sampleRate);
    const view = new DataView(wav);
    // 'data' at offset 36
    const data = String.fromCharCode(
      view.getUint8(36),
      view.getUint8(37),
      view.getUint8(38),
      view.getUint8(39),
    );
    expect(data).toBe('data');
  });

  it('encodes sample rate correctly', () => {
    const pcm = createTestPCM(100);
    const wav = pcmToWav(pcm, sampleRate);
    const view = new DataView(wav);
    // Sample rate at offset 24 (little-endian uint32)
    const encodedRate = view.getUint32(24, true);
    expect(encodedRate).toBe(sampleRate);
  });

  it('output size equals 44 header bytes plus pcm length times 2 (16-bit)', () => {
    const pcmLength = 200;
    const pcm = createTestPCM(pcmLength);
    const wav = pcmToWav(pcm, sampleRate);
    expect(wav.byteLength).toBe(44 + pcmLength * 2);
  });

  it('handles empty PCM data', () => {
    const pcm = new Float32Array(0);
    const wav = pcmToWav(pcm, sampleRate);
    expect(wav.byteLength).toBe(44); // Header only
  });

  it('encodes as 16-bit mono PCM (format code 1)', () => {
    const pcm = createTestPCM(100);
    const wav = pcmToWav(pcm, sampleRate);
    const view = new DataView(wav);
    // Audio format at offset 20 (little-endian uint16) — 1 = PCM
    expect(view.getUint16(20, true)).toBe(1);
    // Number of channels at offset 22 (little-endian uint16) — 1 = mono
    expect(view.getUint16(22, true)).toBe(1);
    // Bits per sample at offset 34 (little-endian uint16) — 16
    expect(view.getUint16(34, true)).toBe(16);
  });
});
