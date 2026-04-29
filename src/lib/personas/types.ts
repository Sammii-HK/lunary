/**
 * AI Astrologer Personas — voice/personality selection for Astral Chat.
 *
 * Same chart-aware backend, different system prompt + (optional) AudioNarrator
 * voice. Persona choice = retention.
 */

export type PersonaId = 'warm' | 'witchy' | 'savage' | 'scholarly';

export const PERSONA_IDS: readonly PersonaId[] = [
  'warm',
  'witchy',
  'savage',
  'scholarly',
] as const;

export const DEFAULT_PERSONA: PersonaId = 'warm';

/**
 * Allow-list helper — validates a possibly-untrusted string into a PersonaId.
 * Always returns a safe value; never returns undefined.
 */
export function isPersonaId(value: unknown): value is PersonaId {
  return (
    typeof value === 'string' &&
    (PERSONA_IDS as readonly string[]).includes(value)
  );
}

export interface PersonaConfig {
  /** Stable identifier persisted in user_profiles.personal_card.activePersona */
  id: PersonaId;
  /** Short display name shown in the picker and chat header */
  label: string;
  /** One-line teaser used on picker cards */
  blurb: string;
  /**
   * Voice-specific system prompt prepended to the existing Astral chat
   * system prompt. Each MUST insist on chart-grounded reasoning, no horoscope
   * generalities.
   */
  systemPrompt: string;
  /** Optional TTS voice key from the AudioNarrator allow-list */
  ttsVoice?: string;
  /**
   * Tailwind text/background accent class fragment used by the picker card.
   * Pre-validated brand colours only (no user-provided strings).
   */
  accent: {
    text: string;
    border: string;
    bg: string;
  };
}
