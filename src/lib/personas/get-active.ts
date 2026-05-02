import { DEFAULT_PERSONA, isPersonaId, type PersonaId } from './types';

/**
 * Pure helper — extracts the active persona id from a `personal_card` jsonb
 * blob (or from anything shaped like one). Always returns a safe value.
 *
 * The persona is stored alongside the existing personal-tarot-card data at
 * `user_profiles.personal_card.activePersona` so we don't need a schema
 * migration for an experimental feature.
 */
export function getActivePersona(personalCard: unknown): PersonaId {
  if (!personalCard || typeof personalCard !== 'object') {
    return DEFAULT_PERSONA;
  }

  const candidate = (personalCard as Record<string, unknown>).activePersona;
  return isPersonaId(candidate) ? candidate : DEFAULT_PERSONA;
}
