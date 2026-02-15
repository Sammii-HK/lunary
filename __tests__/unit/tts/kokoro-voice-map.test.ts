import { VOICE_MAP, DEFAULT_KOKORO_VOICE } from '@/lib/tts/kokoro';

describe('Kokoro voice mapping', () => {
  const openaiVoices = ['nova', 'shimmer', 'onyx', 'alloy', 'echo', 'fable'];

  it.each(openaiVoices)(
    'maps OpenAI voice "%s" to a valid Kokoro voice ID',
    (voice) => {
      const kokoroVoice = VOICE_MAP[voice];
      expect(kokoroVoice).toBeDefined();
      expect(typeof kokoroVoice).toBe('string');
      expect(kokoroVoice.length).toBeGreaterThan(0);
    },
  );

  it('all mapped Kokoro voices follow the expected naming pattern', () => {
    for (const voice of Object.values(VOICE_MAP)) {
      // Kokoro voices follow pattern: af_name, am_name, bf_name, bm_name
      expect(voice).toMatch(/^[a-z]{2}_[a-z]+$/);
    }
  });

  it('falls back to default voice for unknown voice name', () => {
    const unknownVoice = VOICE_MAP['unknown_voice'];
    expect(unknownVoice).toBeUndefined();
    expect(DEFAULT_KOKORO_VOICE).toBe('af_heart');
  });

  it('falls back to default voice for undefined', () => {
    const undefinedVoice = VOICE_MAP[undefined as unknown as string];
    expect(undefinedVoice).toBeUndefined();
    expect(DEFAULT_KOKORO_VOICE).toBe('af_heart');
  });

  it('uses top-rated voices in the mapping', () => {
    // af_heart is the only A-grade voice — should be default
    expect(DEFAULT_KOKORO_VOICE).toBe('af_heart');
    expect(VOICE_MAP['shimmer']).toBe('af_heart');
    // af_bella is A- grade
    expect(VOICE_MAP['nova']).toBe('af_bella');
  });
});
