// Engagement hooks for Threads posts
// Threads rewards conversational content with questions that invite replies

/**
 * General transit hooks - for any cosmic event
 */
export const generalTransitHooks = [
  'How are you feeling this shift?',
  "What's coming up for you?",
  'Notice anything different today?',
  'How does this land for you?',
  'What are you releasing today?',
  'What needs your attention right now?',
  'Where is this showing up in your life?',
  'Anyone else feeling this energy?',
  "What's stirring for you?",
  'How are you navigating this?',
  "What's asking for your attention?",
  'How is this landing?',
  "What's shifting for you today?",
  'Where do you feel this most?',
  "What's ready to move?",
];

/**
 * Ingress hooks - for planet entering a new sign
 */
export const ingressHooks = [
  'Ready for this new chapter?',
  'What themes are emerging for you?',
  'How are you welcoming this change?',
  'What are you curious about?',
  'What do you want to explore?',
  'Where do you need fresh energy?',
  "What's ready to begin?",
  'What new direction calls to you?',
  'How does this shift feel?',
  "What's opening up for you?",
  'Where is this energy taking you?',
  'What are you ready to start?',
  'How are you greeting this transition?',
  "What's calling for renewal?",
  'Where do you sense possibility?',
];

/**
 * Aspect hooks - for planet-to-planet connections
 * Split by type: tension (square, opposition) vs harmony (trine, sextile, conjunction)
 */
export const tensionAspectHooks = [
  "What's creating friction today?",
  "What's pushing your buttons?",
  'Where do you feel the pull?',
  'What needs balancing?',
  "What's testing your patience?",
  'Where are you feeling stuck?',
  "What's demanding attention?",
  'What tension are you holding?',
  'Where do you feel resistance?',
  "What's asking you to stretch?",
  'What conflict is surfacing?',
  'Where are you being challenged?',
];

export const harmonyAspectHooks = [
  "What's flowing easily right now?",
  'What connections are lighting up?',
  'Where do you feel supported?',
  'What collaboration is calling?',
  "What's clicking into place?",
  'Where is momentum building?',
  "What's aligning for you?",
  'What feels effortless today?',
  'Where is energy flowing?',
  "What's coming together?",
  'What opportunities are opening?',
  'Where do you feel expansion?',
];

/**
 * Retrograde hooks - for retrograde stations
 */
export const retrogradeHooks = [
  "What's asking for review?",
  'What old patterns are surfacing?',
  'What deserves a second look?',
  'Where can you slow down?',
  "What's ready to be released?",
  "What's returning for resolution?",
  'Where do you need to revisit?',
  "What's being reconsidered?",
  'What past themes are emerging?',
  'Where is reflection calling you?',
  "What's ready to be let go?",
  'What needs another pass?',
];

/**
 * Egress hooks - for planet leaving a sign (final day)
 */
export const egressHooks = [
  'What are you ready to release?',
  'What chapter is closing?',
  'What are you leaving behind?',
  'What lessons are you taking with you?',
  'What cycle is completing?',
  'What no longer serves you?',
  'What closure is arriving?',
  'How are you honoring this ending?',
  'What are you grateful for from this cycle?',
  'What wisdom have you gathered?',
  'What are you ready to let go of?',
  'How are you saying goodbye?',
];

/**
 * Supermoon hooks - for supermoon full moons (extra close)
 */
export const supermoonHooks = [
  'What emotions are amplified tonight?',
  "What's coming to light for you?",
  'What illumination are you receiving?',
  'What are you ready to release under this light?',
  'What feelings are rising to the surface?',
  'What is being revealed?',
  'How does this brightness affect you?',
  'What truth is emerging?',
  'What needs to be seen?',
  'What culmination is arriving?',
  'What is reaching its peak?',
  'How are you honoring this fullness?',
];

/**
 * Eclipse hooks - for solar and lunar eclipses
 */
export const eclipseHooks = [
  'How are you preparing for this portal?',
  'What are you ready to transform?',
  'What doors are opening or closing?',
  'What shadow work is emerging?',
  'What is being eclipsed in your life?',
  'What fate-level shifts are you sensing?',
  'What is this cosmic reset stirring?',
  'What transformation is calling?',
  'What needs to be released for growth?',
  'What destiny is unfolding?',
  'What unexpected changes are arriving?',
  'How are you welcoming this shift?',
];

/**
 * New Moon hooks - for new moon phases (new beginnings)
 */
export const newMoonHooks = [
  'What seeds are you planting?',
  'What intentions are you setting?',
  'What new beginning is calling?',
  'What do you want to create?',
  'What fresh start awaits you?',
  'What are you ready to manifest?',
  'What dreams are you nurturing?',
  'What new chapter begins now?',
  'What would you like to invite in?',
  'What vision is taking shape?',
  'What possibilities excite you?',
  'How are you embracing this reset?',
];

/**
 * Full Moon hooks - for full moon phases (illumination/release)
 */
export const fullMoonHooks = [
  "What's coming to light for you?",
  'What are you ready to release?',
  'What has reached completion?',
  'What emotions are surfacing?',
  'What truth is being revealed?',
  'What are you celebrating?',
  'What needs to be acknowledged?',
  'What culmination is arriving?',
  'What are you grateful for?',
  'What clarity are you receiving?',
  'What is illuminated tonight?',
  'What fullness are you experiencing?',
];

/**
 * First Quarter Moon hooks - for first quarter phase (action/commitment)
 */
export const firstQuarterHooks = [
  'What decision is calling you?',
  'What action are you taking?',
  'What obstacles are you facing?',
  'What commitment are you making?',
  'What step are you taking today?',
  'What challenge are you meeting?',
  'What momentum is building?',
  'What requires your focus now?',
  'What are you pushing through?',
  'What is asking for your effort?',
  'How are you showing up?',
  'What growth is emerging?',
];

/**
 * Last Quarter Moon hooks - for last quarter phase (reflection/release)
 */
export const lastQuarterHooks = [
  'What adjustment needs to be made?',
  'What are you ready to release?',
  'What lesson is landing?',
  'What needs to be forgiven?',
  'What perspective is shifting?',
  'What wisdom are you integrating?',
  'What cycle is completing?',
  'What no longer serves you?',
  'What gratitude is arising?',
  'What are you letting go of?',
  'How are you finding closure?',
  'What healing is happening?',
];

/**
 * Get a deterministic hook based on date and event type
 * Uses date string to ensure consistent selection per day
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export type HookType =
  | 'general'
  | 'ingress'
  | 'egress'
  | 'tension'
  | 'harmony'
  | 'retrograde'
  | 'supermoon'
  | 'eclipse'
  | 'newMoon'
  | 'fullMoon'
  | 'firstQuarter'
  | 'lastQuarter';

export function getEngagementHook(type: HookType, seed: string): string {
  const hooks: Record<HookType, string[]> = {
    general: generalTransitHooks,
    ingress: ingressHooks,
    egress: egressHooks,
    tension: tensionAspectHooks,
    harmony: harmonyAspectHooks,
    retrograde: retrogradeHooks,
    supermoon: supermoonHooks,
    eclipse: eclipseHooks,
    newMoon: newMoonHooks,
    fullMoon: fullMoonHooks,
    firstQuarter: firstQuarterHooks,
    lastQuarter: lastQuarterHooks,
  };

  const hookList = hooks[type];
  const index = simpleHash(seed) % hookList.length;
  return hookList[index];
}

/**
 * Aspect type classification
 */
export const TENSION_ASPECTS = ['square', 'opposition'];
export const HARMONY_ASPECTS = ['trine', 'sextile', 'conjunction'];

export function isHarmonyAspect(aspect: string): boolean {
  return HARMONY_ASPECTS.includes(aspect.toLowerCase());
}

export function isTensionAspect(aspect: string): boolean {
  return TENSION_ASPECTS.includes(aspect.toLowerCase());
}

/**
 * Get aspect hook based on aspect type
 */
export function getAspectHook(aspect: string, seed: string): string {
  const type = isTensionAspect(aspect) ? 'tension' : 'harmony';
  return getEngagementHook(type, seed);
}
