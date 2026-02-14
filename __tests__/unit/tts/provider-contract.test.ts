import type { TTSProvider } from '@/lib/tts/types';
import { KokoroTTSProvider } from '@/lib/tts/kokoro';
import { OpenAITTSProvider } from '@/lib/tts/openai';

// Mock kokoro-js module (model + tokenizer)
jest.mock('kokoro-js', () => ({
  KokoroTTS: {
    from_pretrained: jest.fn().mockResolvedValue({
      tokenizer: jest.fn().mockReturnValue({
        input_ids: { dims: [1, 10] },
      }),
      model: jest.fn().mockResolvedValue({
        waveform: {
          data: new Float32Array([0.1, 0.2, 0.3, -0.1, -0.2]),
        },
      }),
    }),
  },
}));

// Mock phonemizer (espeak WASM is too heavy for Jest)
jest.mock('phonemizer', () => ({
  phonemize: jest.fn().mockResolvedValue(['hˈɛloʊ wˈɜːld']),
}));

// Mock @huggingface/transformers (for Tensor class)
jest.mock('@huggingface/transformers', () => ({
  Tensor: jest.fn().mockImplementation((type, data, dims) => ({
    type,
    data,
    dims,
  })),
}));

// Mock fetch for voice downloads
const mockVoiceData = new Float32Array(130560); // Same size as real voices
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  arrayBuffer: jest.fn().mockResolvedValue(mockVoiceData.buffer),
}) as any;

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

// Set env for OpenAI constructor
process.env.OPENAI_API_KEY = 'test-key';

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
