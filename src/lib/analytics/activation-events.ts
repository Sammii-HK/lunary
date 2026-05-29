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
  'tarot_drawn',
  'chart_viewed',
  'grimoire_viewed',
  'daily_dashboard_viewed',
  'astral_chat_used',
  'ritual_started',
  'ritual_completed',
  // Personalised activation — the high-intent, trial-only payoff signals.
  // `personalized_value_revealed` is its own canonical event (see
  // canonical-events.ts) so it lands in conversion_events untouched and is
  // directly queryable as "did this trial user reach the personalised value
  // moment?". The two `personalized_*_viewed` names are listed for intent and
  // completeness, but note they are folded to `horoscope_viewed` / `tarot_drawn`
  // at write time by canonicaliseEvent, so they never appear verbatim in
  // conversion_events.event_type — the generic names above already cover them.
  // They are kept here so this set stays the single source of truth and so a
  // future un-fold would automatically count toward activation.
  'personalized_value_revealed',
  'personalized_horoscope_viewed',
  'personalized_tarot_viewed',
] as const;

/**
 * The subset of activation events that specifically signal a personalised,
 * trial-grade payoff (as opposed to any generic content view). Useful for
 * computing a "personalised activation rate" alongside the broad activation
 * rate. Only `personalized_value_revealed` survives canonicalisation verbatim,
 * so it is the reliable one to filter on in `conversion_events`.
 */
export const PERSONALIZED_ACTIVATION_EVENTS = [
  'personalized_value_revealed',
  'personalized_horoscope_viewed',
  'personalized_tarot_viewed',
] as const;

/** 7-day activation window (used by daily/monthly cron and the activation API) */
export const ACTIVATION_WINDOW_DAYS = 7;
