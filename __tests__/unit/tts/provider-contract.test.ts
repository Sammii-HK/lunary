import type { TTSProvider } from '@/lib/tts/types';
import { KokoroTTSProvider } from '@/lib/tts/kokoro';
import { OpenAITTSProvider } from '@/lib/tts/openai';

// Mock DeepInfra API for Kokoro
const mockWavHeader = new ArrayBuffer(44 + 10); // minimal WAV
const mockWavView = new DataView(mockWavHeader);
// Write RIFF header so concatenation logic works
new Uint8Array(mockWavHeader).set(
  [0x52, 0x49, 0x46, 0x46], // "RIFF"
  0,
);
mockWavView.setUint32(4, 36 + 10, true);
new Uint8Array(mockWavHeader).set(
  [0x57, 0x41, 0x56, 0x45], // "WAVE"
  8,
);

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue({
    audio: Buffer.from(new Uint8Array(mockWavHeader)).toString('base64'),
  }),
}) as any;

// Set env for providers
process.env.DEEPINFRA_API_KEY = 'test-key';
process.env.OPENAI_API_KEY = 'test-key';

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    audio: {
      speech: {
        create: jest.fn().mockResolvedValue({
          arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
        }),
      },
    },
  }));
});

describe('TTSProvider contract', () => {
  const providers: { name: string; create: () => TTSProvider }[] = [
    { name: 'Kokoro', create: () => new KokoroTTSProvider() },
    { name: 'OpenAI', create: () => new OpenAITTSProvider() },
  ];

  describe.each(providers)('$name provider', ({ create }) => {
    let provider: TTSProvider;

    beforeEach(() => {
      provider = create();
    });

    it('has a name property that is a string', () => {
      expect(typeof provider.name).toBe('string');
      expect(provider.name.length).toBeGreaterThan(0);
    });

    it('generateVoiceover returns an ArrayBuffer with byteLength > 0', async () => {
      const result = await provider.generateVoiceover('Hello world', {});
      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBeGreaterThan(0);
    });

    it('generateVoiceover with voiceName does not throw', async () => {
      await expect(
        provider.generateVoiceover('Hello world', { voiceName: 'shimmer' }),
      ).resolves.not.toThrow();
    });

    it('has a contentType property', () => {
      expect(typeof provider.contentType).toBe('string');
      expect(provider.contentType.length).toBeGreaterThan(0);
    });
  });

  describe('Kokoro provider', () => {
    it('getAvailableVoices returns TTSVoice objects', async () => {
      const provider = new KokoroTTSProvider();
      const voices = await provider.getAvailableVoices();
      expect(Array.isArray(voices)).toBe(true);
      expect(voices.length).toBeGreaterThan(0);
      for (const voice of voices) {
        expect(voice).toHaveProperty('id');
        expect(voice).toHaveProperty('name');
        expect(voice).toHaveProperty('language');
        expect(typeof voice.id).toBe('string');
        expect(typeof voice.name).toBe('string');
        expect(typeof voice.language).toBe('string');
      }
    });
  });

  describe('OpenAI provider', () => {
    it('getAvailableVoices returns TTSVoice objects', async () => {
      const provider = new OpenAITTSProvider();
      const voices = await provider.getAvailableVoices();
      expect(Array.isArray(voices)).toBe(true);
      expect(voices.length).toBeGreaterThan(0);
      for (const voice of voices) {
        expect(voice).toHaveProperty('id');
        expect(voice).toHaveProperty('name');
        expect(voice).toHaveProperty('language');
      }
    });
  });
});
