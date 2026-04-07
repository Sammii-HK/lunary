/**
 * grimoire-email-copy.ts
 *
 * Generates personalised email copy from the grimoire zodiac data.
 * Uses a seed (week number + user ID hash) so copy rotates over time
 * and differs between users even on the same sign.
 *
 * 10+ template angles per placement so variety is genuine, not simulated.
 */

import zodiacSignsData from '@/data/zodiac-signs.json';

type ZodiacSign = {
  name: string;
  element: string;
  modality: string;
  rulingPlanet: string;
  keywords: string[];
  strengths: string[];
  weaknesses: string[];
  description: string;
  mysticalProperties: string;
  affirmation: string;
  loveTrait: string;
  careerTrait: string;
};

function getSignData(sign: string): ZodiacSign | null {
  const key = sign.toLowerCase();
  const data = (zodiacSignsData as Record<string, ZodiacSign>)[key];
  return data ?? null;
}

/** Seeded pick — deterministic but varies with seed */
function seededPick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

export function getWeekSeed(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek);
}

/** Hash a user ID to get per-user seed variation */
function hashUserId(userId: string): number {
  let h = 5381;
  for (let i = 0; i < userId.length; i++) {
    h = (h << 5) + h + userId.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Combined seed: varies by week AND by user so two Aries users
 * on the same week see different copy.
 */
export function getCombinedSeed(userId?: string): number {
  const week = getWeekSeed();
  const user = userId ? hashUserId(userId) : 0;
  return week * 31 + user;
}

// ─── Sun sign copy templates ────────────────────────────────────────────────
// 10 distinct angles. Each uses different grimoire data fields.
// No em dashes. UK English.

function buildSunTemplates(d: ZodiacSign): string[] {
  const kw1 = d.keywords[0]?.toLowerCase() ?? 'unique';
  const kw2 = d.keywords[1]?.toLowerCase() ?? 'purposeful';
  const kw3 = d.keywords[2]?.toLowerCase() ?? 'driven';
  const str1 = d.strengths[0]?.toLowerCase() ?? 'capable';
  const str2 = d.strengths[1]?.toLowerCase() ?? 'focused';
  const weak1 = d.weaknesses[0]?.toLowerCase() ?? 'cautious';
  const planet = d.rulingPlanet;
  const element = d.element;
  const modality = d.modality;

  return [
    // Angle 1: keyword + what to do this week
    `Your ${d.name} Sun brings ${kw1} energy, and this week that quality is particularly active. Notice where your natural ${str1} instinct is pulling you — it is probably pointing at something real.`,

    // Angle 2: element + modality + specific invitation
    `As a ${modality} ${element} sign, your ${d.name} Sun processes the world through action and ${kw2}. This week there is a specific invitation in that energy — what has been waiting for you to move on it?`,

    // Angle 3: ruling planet angle
    `${planet} rules your chart, which means your drive and direction are tied to ${planet}'s current position. This week that influence is worth paying attention to. Your ${kw1} instinct is accurate.`,

    // Angle 4: strength as the week's asset
    `Your natural ${str1} and ${str2} are your greatest assets this week. ${d.name} energy tends to ${kw3} forward, and right now the conditions are supporting that impulse rather than blocking it.`,

    // Angle 5: mystical properties angle
    `${d.mysticalProperties.split(';')[0]}. This week that quality is live in your chart — you will feel it in how you approach things if you slow down enough to notice.`,

    // Angle 6: weakness as something to be aware of
    `Your ${d.name} Sun is powerful, and this week especially so. The one thing worth watching: your tendency toward ${weak1}. Channel the ${kw1} energy deliberately rather than reactively.`,

    // Angle 7: affirmation framing
    `This week your chart is asking you to remember something: ${d.affirmation.toLowerCase()} That is not just an affirmation — it is the literal energy available to you right now.`,

    // Angle 8: career/ambition angle
    `${d.careerTrait.split('.')[0]}. This week that same quality is active in how you are moving through your goals. Something that felt stuck may start to shift.`,

    // Angle 9: description excerpt
    `${d.name} ${d.description.split('.').slice(1, 2).join('.').trim()}. This week that comes through clearly — lean into what makes you distinctly ${d.name}.`,

    // Angle 10: short, direct, punchy
    `${d.name} Sun. ${element} energy. ${kw1}, ${kw2}, ${str1}. This week all of that is pointed in the right direction. Trust it.`,
  ];
}

// ─── Moon sign copy templates ────────────────────────────────────────────────
// 10 angles, all focused on the emotional/inner world dimension.

function buildMoonTemplates(d: ZodiacSign): string[] {
  const kw1 = d.keywords[0]?.toLowerCase() ?? 'aware';
  const kw2 = d.keywords[1]?.toLowerCase() ?? 'perceptive';
  const str1 = d.strengths[0]?.toLowerCase() ?? 'capable';
  const weak1 = d.weaknesses[0]?.toLowerCase() ?? 'cautious';
  const element = d.element;

  return [
    // Angle 1: keyword + emotional observation
    `With your Moon in ${d.name}, your emotional world runs through ${kw1} and ${kw2}. What you are feeling this week is data — it is telling you something specific if you sit with it.`,

    // Angle 2: element + inner world
    `Your ${d.name} Moon processes emotion through ${element} energy: ${kw1}, ${str1}, and often more intense than you let on. This week there is an emotional current worth acknowledging rather than pushing past.`,

    // Angle 3: strength angle for emotional intelligence
    `Moon in ${d.name} gives you an emotional intelligence rooted in ${str1}. This week that quality is sharper than usual. Trust what you are sensing, even if you cannot fully articulate it yet.`,

    // Angle 4: weakness angle — gentle heads up
    `Your ${d.name} Moon is a gift, and it also carries a familiar challenge: the tendency toward ${weak1}. This week that pattern may surface emotionally. Noticing it is half the work.`,

    // Angle 5: mystical properties
    `${d.mysticalProperties.split(';')[0]}. In your Moon placement, this translates to your emotional life this week. Something you feel is more accurate than it might seem from the outside.`,

    // Angle 6: love/connection angle
    `${d.loveTrait.split('.')[0]}. With Moon in ${d.name}, that same quality shapes how you are feeling in your close relationships this week. Something worth acknowledging there.`,

    // Angle 7: what the Moon in this sign needs
    `Moon in ${d.name} needs ${kw1} to feel settled. This week, give yourself the conditions your emotional nature actually asks for — not what you think you should need.`,

    // Angle 8: affirmation as emotional anchor
    `This week your inner world is asking you to hold onto something: ${d.affirmation.toLowerCase()} As a ${d.name} Moon, that is not abstract — it is the emotional truth available to you right now.`,

    // Angle 9: modality angle
    `As a ${d.modality} Moon sign, your emotions tend to ${d.modality === 'Cardinal' ? 'initiate and move quickly' : d.modality === 'Fixed' ? 'run deep and hold steady' : 'adapt and shift'}. This week that quality is working for you. Follow it.`,

    // Angle 10: direct and honest
    `${d.name} Moon. Your feelings are real this week, even the ones that feel too big or too quiet. ${element} energy does not do things in half measures. Let yourself feel it properly.`,
  ];
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns a personalised Sun sign paragraph.
 * Pass userId to get per-user variation even within the same week and sign.
 */
export function getSunSignEmailCopy(sign: string, userId?: string): string {
  const data = getSignData(sign);
  if (!data) return '';
  const seed = getCombinedSeed(userId);
  const templates = buildSunTemplates(data);
  return seededPick(templates, seed);
}

/**
 * Returns a personalised Moon sign paragraph.
 * Pass userId to get per-user variation even within the same week and sign.
 */
export function getMoonSignEmailCopy(sign: string, userId?: string): string {
  const data = getSignData(sign);
  if (!data) return '';
  const seed = getCombinedSeed(userId);
  const templates = buildMoonTemplates(data);
  // Offset seed so sun and moon don't pick same index
  return seededPick(templates, seed + 7);
}

/**
 * Returns the week label, e.g. "7-13 April 2026"
 * Uses a hyphen not an en dash per writing rules.
 */
export function getCurrentWeekLabel(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const mondayStr = `${monday.getDate()}`;
  const sundayStr = `${sunday.getDate()} ${months[sunday.getMonth()]} ${sunday.getFullYear()}`;

  if (monday.getMonth() === sunday.getMonth()) {
    return `${mondayStr}-${sundayStr}`;
  }
  return `${mondayStr} ${months[monday.getMonth()]}-${sundayStr}`;
}

/** Returns the affirmation for a sign */
export function getSignAffirmation(sign: string): string | null {
  const data = getSignData(sign);
  return data?.affirmation ?? null;
}
