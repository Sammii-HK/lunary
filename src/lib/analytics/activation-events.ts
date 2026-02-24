/**
 * Canonical list of activation events.
 *
 * A user is "activated" if they complete ANY of these events within
 * 7 days of signup. This list should be the single source of truth —
 * import it everywhere instead of defining inline arrays.
 *
 * Includes both content-viewing events AND interactive actions so that
 * users who engage with tarot, grimoire, birth charts, the dashboard,
 * or any core feature are counted as activated.
 */
export const ACTIVATION_EVENTS = [
  'horoscope_viewed',
  'personalized_horoscope_viewed',
  'tarot_viewed',
  'personalized_tarot_viewed',
  'birth_chart_viewed',
  'chart_viewed',
  'grimoire_viewed',
  'grimoire_save',
  'daily_dashboard_viewed',
  'tarot_pull',
  'moon_phase_view',
  'cosmic_pulse_opened',
  'astral_chat_used',
  'ritual_completed',
] as const;

/** 7-day activation window (used by daily/monthly cron and the activation API) */
export const ACTIVATION_WINDOW_DAYS = 7;
