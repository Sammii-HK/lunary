/**
 * TTS Presets with voice variety for different content types
 *
 * Voice Options (tts-1-hd):
 * - nova: Female, British accent, clear and energetic (great for hooks)
 * - shimmer: Female, natural, warm (good for spiritual content)
 * - onyx: Male, British accent, deep and authoritative (perfect for long-form)
 * - alloy: Neutral, versatile (legacy default)
 */
export const TTS_PRESETS = {
  // Short-form (TikTok/Stories): energetic, engaging, slightly faster pace
  short: { model: 'tts-1-hd', voiceName: 'nova', speed: 1.1 },
  short_energetic: { model: 'tts-1-hd', voiceName: 'nova', speed: 1.1 },
  short_mystical: { model: 'tts-1-hd', voiceName: 'shimmer', speed: 1.05 },

  // Medium-form (Reels/TikTok): balanced, warm
  medium: { model: 'tts-1-hd', voiceName: 'shimmer', speed: 1.0 },

  // Long-form (YouTube): authoritative, trustworthy
  long: { model: 'tts-1-hd', voiceName: 'onyx', speed: 0.96 },
  long_authoritative: { model: 'tts-1-hd', voiceName: 'onyx', speed: 0.96 },
} as const;

/**
 * Content-aware tone instructions for different segment types
 * These are passed to OpenAI TTS to guide the voice delivery
 */
export const TONE_INSTRUCTIONS = {
  hook: 'Energetic and attention-grabbing. Speak with enthusiasm to hook the listener immediately. Clear articulation, slightly elevated pitch.',
  planetary:
    'Mystical and thoughtful. Build anticipation for cosmic events. Measured pace with dramatic pauses before key revelations.',
  moon_phase:
    'Gentle and reflective. Create a sense of wonder and connection to lunar cycles. Soft, contemplative delivery.',
  retrograde:
    'Calm but informative. Reassure while explaining. Steady, grounded tone that provides clarity without alarm.',
  seasonal:
    'Celebratory and warm. Mark the significance of seasonal transitions. Uplifting energy with reverence for natural cycles.',
  conclusion:
    'Warm and hopeful. Leave the listener feeling inspired and connected. Gentle uplift in the final sentences.',
  default:
    'Natural, conversational, and engaging. Calm, steady, neutral-warm. Clear articulation with appropriate emphasis on astrological terms.',
} as const;

export type TTSPresetKey = keyof typeof TTS_PRESETS;
export type ToneInstructionKey = keyof typeof TONE_INSTRUCTIONS;
