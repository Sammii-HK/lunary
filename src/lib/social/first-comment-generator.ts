/**
 * First comment generator for Instagram and Threads.
 *
 * Generates contextual, engagement-driving first comments for Lunary
 * astrology posts. Uses deterministic selection (djb2 hash) so retries
 * always produce the same comment for a given piece of content.
 */

// ---------------------------------------------------------------------------
// Hash helper
// ---------------------------------------------------------------------------

/** djb2 string hash. Deterministic, fast, good distribution. */
export function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // unsigned 32-bit
}

// ---------------------------------------------------------------------------
// Keyword matchers
// ---------------------------------------------------------------------------

const TRANSIT_KEYWORDS = [
  'retrograde',
  'transit',
  'enters',
  'moves into',
  'ingress',
  'station',
  'direct',
  'conjunction',
  'square',
  'opposition',
  'trine',
  'sextile',
  'eclipse',
  'new moon',
  'full moon',
  'void of course',
];

const SIGN_KEYWORDS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
];

function contentContains(content: string, keywords: string[]): boolean {
  const lower = content.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

function extractSign(content: string): string | null {
  const lower = content.toLowerCase();
  return SIGN_KEYWORDS.find((s) => lower.includes(s)) ?? null;
}

// ---------------------------------------------------------------------------
// Instagram CTA pools
// ---------------------------------------------------------------------------

const IG_TRANSIT_CTAS: string[] = [
  'How are you feeling this energy? Drop your experience below.',
  'Have you noticed this shift yet? Tell us what came up for you.',
  'This transit hits different for every sign. How is it landing for you?',
  'Save this for when the transit peaks. What sign are you?',
  'Which area of your life is feeling this the most? Let us know.',
  'Tag someone who needs to hear this right now.',
  'Bookmark this one. You will want to come back to it.',
  'Is this energy showing up in your relationships or your career? Tell us.',
  'Drop your rising sign; we will tell you which house this lights up.',
  'Have you been feeling restless lately? This might be why.',
  'Notice any big realisations this week? This transit could be the reason.',
  'What has shifted for you since this started? We want to hear it.',
  'Save this and revisit it next week; the energy builds from here.',
  'Tell us your sun sign and we will share what to watch for.',
  'This is one of those transits you feel before you understand it. How is it hitting?',
];

const IG_SIGN_CTAS: string[] = [
  'Tag your favourite {sign} and see if they agree.',
  'Drop a {emoji} if you are a {sign}.',
  '{sign} placements, how accurate is this for you?',
  'Which {sign} in your life needs to see this? Tag them.',
  'Save this for the next time a {sign} says "that is so me".',
  'Any {sign} risings feeling this even harder? Let us know.',
  '{sign} season energy. Drop your sign below.',
  'Tell us your big three if {sign} is in there somewhere.',
  'This is peak {sign} energy. Who else relates?',
  'If your moon is in {sign}, this one is especially for you.',
  'Every {sign} knows this feeling. Tag one who gets it.',
  'Are you a {sign} sun, moon, or rising? Drop it below.',
  'Save this for the {sign} in your life who needs a reminder.',
  'We see you, {sign}. What would you add to this?',
  '{sign} energy in a nutshell. How did we do?',
];

const IG_GENERAL_CTAS: string[] = [
  'Save this for later; you will want to come back to it.',
  'Which sign resonated the most? Drop it below.',
  'Tag someone who needs this cosmic heads-up.',
  'Bookmark this one. Trust us.',
  'What is your big three? Drop it in the comments.',
  'Save and share with someone who would find this useful.',
  'Did this land for you? Tell us your sign.',
  'Which part felt the most spot on? Let us know.',
  'Drop your moon sign. We are curious who is reading this.',
  'Save this; the timing is going to matter soon.',
  'Tell us your sun sign and we will tell you what to watch for.',
  'Who else felt called out? Be honest.',
  'Share this with someone who always checks their horoscope.',
  'Which line made you stop scrolling? We want to know.',
  'Your birth chart has the full picture. What is your rising sign?',
];

// ---------------------------------------------------------------------------
// Threads CTA pools
// ---------------------------------------------------------------------------

const THREADS_TRANSIT_CTAS: string[] = [
  'Anyone else feeling completely thrown off this week? Genuinely curious.',
  'Has this energy been showing up for you yet, or is it still building?',
  'I keep hearing people say they feel "off" lately. Makes sense when you look at the sky.',
  'Which part of your life is getting the shake-up right now?',
  'The collective mood shift is real. What are you noticing?',
  'Drop your sign. I want to see who is feeling this the hardest.',
  'This is one of those transits that makes you rethink everything. Relate?',
  'Something big is shifting and I think a lot of us are feeling it.',
  'Is it just me or does everything feel like it is rearranging right now?',
  'Tell me your rising sign and I will tell you where this is hitting.',
  'Retrogrades get a bad reputation, but this one has a purpose. What is coming up for you?',
  'Has anyone else had a massive realisation in the last few days?',
  'The astrology is astroing. What has your week looked like?',
  'If you have been feeling stuck, this transit might explain it. What is going on for you?',
  'I love when the sky matches the vibes. Who else noticed?',
];

const THREADS_SIGN_CTAS: string[] = [
  '{sign} placements, how are we doing? Be honest.',
  'Every {sign} I know is going through it right now. Can you relate?',
  'Drop your sign if you are a {sign}. I want to see how many of us are in here.',
  '{sign} energy is unmatched. What is your hot take?',
  'If you have got a {sign} in your chart, this one is for you. What stood out?',
  'Okay but why is this so accurate for {sign} placements?',
  'I need all the {sign} moons to check in. How are you feeling?',
  '{sign}s always get this. Tell me I am wrong.',
  'Name a more relatable {sign} trait. I will wait.',
  'This is giving major {sign} energy and I am here for it.',
  'If your best friend is a {sign}, send them this. They will know.',
  'What do {sign} placements think about this? I want the unfiltered take.',
  'Any {sign} risings want to weigh in? I feel like this hits you different.',
  '{sign} season may be over but the energy lingers. Who is still feeling it?',
  'My timeline is full of {sign} content today and honestly, same.',
];

const THREADS_GENERAL_CTAS: string[] = [
  'What is your big three? I am trying to see something.',
  'Drop your sign. I want to know who resonated with this.',
  'Okay but which part called you out the most?',
  'Anyone else screenshot astrology posts for later? Just me?',
  'Tell me your moon sign without telling me your moon sign.',
  'The comments on astrology posts are always the best part. Prove me right.',
  'Which sign do you think relates to this the most?',
  'I need your hot takes on this one. Go.',
  'This just makes sense and I cannot explain why.',
  'Your birth chart has entered the chat. What is your rising?',
  'Be honest, did you send this to someone immediately?',
  'What would you add to this? I am curious.',
  'Is anyone else deep in their astrology era right now?',
  'Drop your placement that you think people underestimate the most.',
  'Real question: do you check your horoscope daily or pretend you do not?',
];

// ---------------------------------------------------------------------------
// Sign formatting helpers
// ---------------------------------------------------------------------------

const SIGN_EMOJIS: Record<string, string> = {
  aries: '\u2648',
  taurus: '\u2649',
  gemini: '\u264A',
  cancer: '\u264B',
  leo: '\u264C',
  virgo: '\u264D',
  libra: '\u264E',
  scorpio: '\u264F',
  sagittarius: '\u2650',
  capricorn: '\u2651',
  aquarius: '\u2652',
  pisces: '\u2653',
};

function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function fillSignTemplate(template: string, sign: string): string {
  const cap = capitalise(sign);
  const emoji = SIGN_EMOJIS[sign] ?? '';
  return template.replace(/\{sign\}/g, cap).replace(/\{emoji\}/g, emoji);
}

// ---------------------------------------------------------------------------
// Pool selection (deterministic)
// ---------------------------------------------------------------------------

function pick<T>(pool: T[], seed: number): T {
  return pool[seed % pool.length];
}

// ---------------------------------------------------------------------------
// Exported generators
// ---------------------------------------------------------------------------

export function generateInstagramFirstComment(context: {
  content: string;
  postType?: string;
  topic?: string;
}): string {
  const { content } = context;
  const seed = simpleHash(content);
  const sign = extractSign(content);

  let cta: string;

  if (contentContains(content, TRANSIT_KEYWORDS)) {
    cta = pick(IG_TRANSIT_CTAS, seed);
  } else if (sign) {
    cta = fillSignTemplate(pick(IG_SIGN_CTAS, seed), sign);
  } else {
    cta = pick(IG_GENERAL_CTAS, seed);
  }

  return `${cta}\n\nlunary.app`;
}

export function generateThreadsFirstComment(context: {
  content: string;
  pillar?: string;
  topicTag?: string;
}): string {
  const { content } = context;
  const seed = simpleHash(content);
  const sign = extractSign(content);

  if (contentContains(content, TRANSIT_KEYWORDS)) {
    return pick(THREADS_TRANSIT_CTAS, seed);
  }

  if (sign) {
    return fillSignTemplate(pick(THREADS_SIGN_CTAS, seed), sign);
  }

  return pick(THREADS_GENERAL_CTAS, seed);
}
