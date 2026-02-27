/**
 * TikTok metadata, cover image, and caption generation
 */

import type { DailyFacet, WeeklyTheme } from '../../weekly-themes';
import type { TikTokMetadata } from '../types';
import { THEME_DISPLAY_MAP } from '../constants';
import { capitalizeThematicTitle } from '../../../../../utils/og/text';

/**
 * Generate TikTok overlay metadata
 */
export function generateTikTokMetadata(
  facet: DailyFacet,
  theme: WeeklyTheme,
  partNumber: number,
  totalParts: number,
): TikTokMetadata {
  return {
    theme: THEME_DISPLAY_MAP[theme.category] || theme.category.toUpperCase(),
    title: facet.title,
    series: `Part ${partNumber} of ${totalParts}`,
    summary: facet.focus,
  };
}

/**
 * Generate cover image URL for TikTok video
 */
export function generateCoverImageUrl(
  facet: DailyFacet,
  theme: WeeklyTheme,
  partNumber: number,
  baseUrl: string = '',
  totalParts: number,
): string {
  const safePartNumber = Number.isFinite(partNumber) ? partNumber : 1;
  const safeTotalParts = Number.isFinite(totalParts) ? totalParts : 4;
  const slug =
    facet.grimoireSlug.split('/').pop() ||
    facet.title.toLowerCase().replace(/\s+/g, '-');
  const subtitle = encodeURIComponent(
    `Part ${safePartNumber} of ${safeTotalParts}`,
  );
  const title = encodeURIComponent(capitalizeThematicTitle(facet.title));

  // cover=tiktok triggers larger text sizes for TikTok thumbnail legibility
  // v=2 for cache busting
  return `${baseUrl}/api/og/thematic?category=${theme.category}&slug=${slug}&title=${title}&subtitle=${subtitle}&format=story&cover=tiktok&v=2`;
}

/**
 * Category-specific hashtag pools for TikTok discovery
 */
const CATEGORY_HASHTAGS: Record<string, string[]> = {
  tarot: [
    '#tarot',
    '#tarotreading',
    '#tarotcards',
    '#tarotreader',
    '#tarottok',
    '#tarotcommunity',
    '#divination',
    '#oraclecards',
    '#psychic',
    '#witchtok',
  ],
  zodiac: [
    '#astrology',
    '#zodiac',
    '#horoscope',
    '#zodiacsigns',
    '#astrologytiktok',
    '#zodiacmemes',
    '#astrologymemes',
    '#birthchart',
    '#astrologysigns',
    '#spiritualtiktok',
  ],
  lunar: [
    '#moon',
    '#moonphases',
    '#fullmoon',
    '#newmoon',
    '#moonmagic',
    '#moonphase',
    '#mooncycle',
    '#moonritual',
    '#moonenergy',
    '#witchtok',
  ],
  planetary: [
    '#astrology',
    '#zodiac',
    '#horoscope',
    '#astrologytiktok',
    '#zodiacsigns',
    '#birthchart',
    '#spiritualtiktok',
    '#witchtok',
    '#astrologysigns',
    '#astrologymemes',
  ],
  numerology: [
    '#numerology',
    '#angelnumbers',
    '#manifestation',
    '#1111',
    '#444',
    '#manifest',
    '#lifepath',
    '#spiritualawakening',
  ],
  crystals: [
    '#crystals',
    '#crystaltok',
    '#crystalhealing',
    '#healingcrystals',
    '#crystalcollection',
    '#amethyst',
    '#rosequartz',
    '#crystalenergy',
    '#witchtok',
    '#spiritualtiktok',
  ],
  spells: [
    '#witchtok',
    '#spells',
    '#witchcraft',
    '#witch',
    '#witchesoftiktok',
    '#magick',
    '#wicca',
    '#babywitch',
    '#spellwork',
    '#pagan',
  ],
  sabbat: [
    '#pagan',
    '#wicca',
    '#witchtok',
    '#witchcraft',
    '#paganism',
    '#witchesoftiktok',
    '#sabbat',
    '#spiritualtiktok',
  ],
  chakras: [
    '#chakras',
    '#spirituality',
    '#spiritual',
    '#spiritualawakening',
    '#meditation',
    '#healing',
    '#reiki',
    '#thirdeye',
    '#lightworker',
    '#spiritualtiktok',
  ],
  runes: [
    '#runes',
    '#norse',
    '#viking',
    '#norsemythology',
    '#elderfuthark',
    '#norsepagan',
    '#paganism',
    '#divination',
  ],
};

const COMMUNITY_HASHTAGS = [
  '#spiritualtiktok',
  '#spiritual',
  '#spiritualawakening',
  '#spirituality',
  '#witchtok',
  '#manifestation',
  '#meditation',
  '#healing',
];

const FORMAT_HASHTAGS = [
  '#learnontiktok',
  '#fyp',
  '#foryou',
  '#edutok',
  '#tiktoktaught',
  '#viral',
];

/**
 * Category-specific emoji pools (#4)
 */
const CATEGORY_EMOJI: Record<string, string[]> = {
  zodiac: ['✨', '🌟', '💫', '🔮', '⭐'],
  tarot: ['🃏', '🔮', '✨', '🌙', '🎴'],
  lunar: ['🌙', '🌕', '🌑', '🌗', '✨'],
  planetary: ['🪐', '✨', '💫', '🌟', '☄️'],
  crystals: ['💎', '✨', '🔮', '💜', '🪨'],
  numerology: ['🔢', '✨', '💫', '🌟', '🔮'],
  spells: ['🕯️', '✨', '🔮', '🌿', '🧿'],
  sabbat: ['🌿', '🕯️', '🍂', '✨', '🌸'],
  chakras: ['🧘', '✨', '💫', '🌈', '🔮'],
  runes: ['ᚱ', '✨', '🔮', '⚡', '🪨'],
  default: ['✨', '🌟', '💫', '🔮', '⭐'],
};

/**
 * Category-specific engagement questions (#3)
 * {topic} placeholder is replaced with the facet title
 */
const ENGAGEMENT_QUESTIONS: Record<string, string[]> = {
  zodiac: [
    'Which sign felt this the hardest?',
    'Tag the {topic} in your life.',
    'Does this match your experience?',
    'Which placement makes this worse?',
    'Who else noticed this pattern?',
    'Drop your sign and let me guess.',
    'Is this accurate for your chart?',
    'Which sign is this hitting different for?',
    'Agree or disagree for your sign?',
    'Save this for when {topic} comes up again.',
    'Save this for your next chart reading.',
    'Bookmark this. You will need it for {topic}.',
    'Pin this. Come back when {topic} makes sense.',
    'Save this breakdown. It changes everything.',
  ],
  tarot: [
    'Have you pulled this card recently?',
    'What was your first reaction to {topic}?',
    'Does this reading resonate today?',
    'Drop the last card you pulled.',
    'Who needs to hear this right now?',
    'Has {topic} ever shown up for you at the worst time?',
    'What do you think this card is really about?',
    'Save this for your next reading.',
    'Save this for the next time {topic} appears.',
    'Pin this for your tarot journal.',
    'Bookmark this. The card will return.',
    'Save this reading guide.',
  ],
  lunar: [
    'How are you feeling this moon phase?',
    'Who else feels the shift during {topic}?',
    'What ritual are you doing for this phase?',
    'Does the moon actually affect your mood?',
    'Save this for the next {topic}.',
    'Drop what you noticed during {topic}.',
    'Is your energy different right now?',
    'Who else tracks moon phases?',
    'Bookmark this moon phase guide.',
    'Pin this lunar breakdown.',
    'Save this for when the energy shifts again.',
    'Save this for the next lunar cycle.',
  ],
  numerology: [
    'Drop your life path number.',
    'Does this number keep showing up for you?',
    'What pattern are you seeing with {topic}?',
    'Who else sees this number everywhere?',
    'Is this accurate for your number?',
    'Save this if {topic} keeps appearing.',
    'Tag someone who needs to see this.',
    'When did {topic} first show up for you?',
    'Save this number guide.',
    'Bookmark this for when {topic} appears again.',
    'Pin this. You will see the number again.',
    'Save this breakdown. The pattern will repeat.',
  ],
  default: [
    'Who else noticed this pattern?',
    'Agree or disagree?',
    'Is this accurate for you?',
    'Drop your experience with {topic}.',
    'Save this for when you need it.',
    'When did you first notice this about {topic}?',
    'Who needs to hear this right now?',
    'Bookmark this one.',
    'Save this for later.',
    'Pin this one.',
    'Bookmark this reference.',
    'Save this. You will come back to it.',
  ],
};

/**
 * Category-specific soft CTA lines for brand awareness
 * Reuse app deep-link patterns from app-features and comparison content
 */
const SOFT_CTA_LINES: Record<string, string[]> = {
  zodiac: [
    'Get your free birth chart at lunary.app',
    'See how this shows up in YOUR chart — lunary.app',
  ],
  tarot: [
    "Explore this in Lunary's Grimoire — lunary.app/grimoire",
    'Track your tarot patterns at lunary.app',
  ],
  lunar: [
    'Work with the moon at lunary.app',
    'Track this moon phase at lunary.app',
  ],
  planetary: [
    'Get your personalized transits at lunary.app',
    'Track this transit in Lunary — link in bio',
  ],
  crystals: [
    'Explore crystal properties at lunary.app/grimoire',
    'Discover your crystals at lunary.app',
  ],
  numerology: [
    'Calculate your life path at lunary.app',
    'Discover your numbers at lunary.app',
  ],
  chakras: ['Explore chakra healing at lunary.app/grimoire'],
  sabbat: ['Explore seasonal rituals at lunary.app/grimoire'],
  default: [
    'Explore this deeper at lunary.app',
    'Discover your patterns at lunary.app',
  ],
};

/**
 * Save CTA lines for caption rotation (8+ items per category for variety)
 * {topic} placeholder is replaced with the facet title
 */
const SAVE_CTA_LINES: Record<string, string[]> = {
  zodiac: [
    'Save this for when your chart makes no sense.',
    'Bookmark this before you forget.',
    'Save this. You will need it later.',
    'Pin this for your next chart reading.',
    'Save this. Come back when the transit hits.',
    'Bookmark this for when someone asks about {topic}.',
    'Save this reference. You will use it.',
    'Pin this. You will thank yourself later.',
  ],
  tarot: [
    'Save this for your next reading.',
    'Bookmark this one. It will click later.',
    'Save this for when this card appears.',
    'Pin this for your tarot journal.',
    'Save this breakdown. It changes the reading.',
    'Bookmark this for when someone pulls {topic}.',
    'Save this. The card will show up again.',
    'Pin this for the next time {topic} appears.',
  ],
  lunar: [
    'Save this for the next {topic}.',
    'Pin this for your moon phase tracker.',
    'Bookmark this. The phase comes around again.',
    'Save this for the next lunar cycle.',
    'Pin this moon phase guide.',
    'Save this for when the energy shifts.',
    'Bookmark this for the next {topic}.',
    'Save this. You will feel this phase again.',
  ],
  planetary: [
    'Save this for the next transit.',
    'Bookmark this for when {topic} activates.',
    'Pin this transit guide.',
    'Save this. The cycle will repeat.',
    'Bookmark this for when you feel the shift.',
    'Save this reference for {topic}.',
  ],
  numerology: [
    'Save this. The number will appear again.',
    'Bookmark this for when {topic} shows up.',
    'Pin this number guide.',
    'Save this for the next time you see {topic}.',
    'Bookmark this breakdown.',
    'Save this. You will see it everywhere now.',
    'Pin this for your numerology notes.',
    'Save this reference.',
  ],
  crystals: [
    'Save this for your crystal toolkit.',
    'Bookmark this for your next crystal session.',
    'Pin this. You will need it.',
    'Save this crystal guide.',
    'Bookmark this for when you need {topic}.',
    'Save this for your collection notes.',
  ],
  default: [
    'Save this for later.',
    'Bookmark this one.',
    'Pin this for when you need it.',
    'Save this reference.',
    'Bookmark this. You will come back to it.',
    'Save this. Seriously.',
    'Pin this for when it clicks.',
    'Save this for the person who needs it.',
  ],
};

/**
 * Follow CTA lines for caption rotation (12 items for variety across 3x/week)
 */
const FOLLOW_CTA_LINES: string[] = [
  'Follow for more like this.',
  'Follow if this hit different.',
  'Follow - tomorrow is even better.',
  'Follow for the one nobody talks about.',
  'Follow. This is just the start.',
  'Follow for daily drops like this.',
  'Follow if you made it to the end.',
  'Follow - the next one goes deeper.',
  'Follow for the content nobody else makes.',
  'Follow if this changed how you see it.',
  'Follow. The best one drops this week.',
  'Follow for the version your friends will send you.',
];

/**
 * Share CTA lines for caption rotation (category-specific)
 * {topic} placeholder is replaced with the facet title
 */
const SHARE_CTA_LINES: Record<string, string[]> = {
  zodiac: [
    'Send this to the {topic} in your life.',
    'Tag someone who needs to hear this.',
    'Send this to your friend without context.',
    'DM this to the person you thought of.',
    'Share this with someone who will feel attacked.',
    'Send this to your group chat. Watch the chaos.',
    'Tag the friend who is exactly like this.',
    'Send this. No caption needed.',
  ],
  tarot: [
    'Send this to someone who just pulled this card.',
    'Share this with someone who needs it today.',
    'Send this to your tarot friend.',
    'Share this with someone who keeps pulling {topic}.',
    'DM this to the reader in your life.',
    'Send this to someone who will understand.',
  ],
  lunar: [
    'Send this to someone who felt the shift.',
    'Share this with someone tracking the moon.',
    'Send this to the person blaming the moon right now.',
    'Share this with your moon-tracking friend.',
    'DM this to the person who felt off today.',
    'Send this to someone who needs the explanation.',
  ],
  default: [
    'Send this to someone who needs to hear it.',
    'Share this with a friend.',
    'Someone you know needs this right now.',
    'DM this to the first person you thought of.',
    'Share this with someone who will get it.',
    'Send this to someone. You already know who.',
    'Tag someone who needs this today.',
    'Send this to the person you were just thinking about.',
  ],
};

/**
 * Content types that naturally drive shares (rankings, hot takes, zodiac identity)
 */
const SHARE_OPTIMIZED_TYPES = new Set<string>([
  'ranking',
  'hot_take',
  'sign_check',
  'quiz',
  'zodiac_sun',
  'zodiac_moon',
  'zodiac_rising',
]);

/**
 * CTA rotation by day-of-week: save, follow, brand, and share spread across the week
 * Mon+Fri = save (10 pts), Tue+Sat+Sun = follow, Wed = brand, Thu = share (7 pts)
 */
const CTA_ROTATION: Array<'save' | 'follow' | 'brand' | 'share'> = [
  'follow', // Sun=0
  'save', // Mon=1
  'follow', // Tue=2
  'brand', // Wed=3
  'share', // Thu=4
  'save', // Fri=5
  'follow', // Sat=6
];

/**
 * Series follow triggers for mid-series parts (category-aware)
 * {next} is replaced with the next part number
 */
const SERIES_FOLLOW_LINES: Record<string, string[]> = {
  zodiac: [
    'Follow - your sign is coming up next.',
    'Part {next} covers the sign everyone asks about. Follow.',
    'Follow for part {next}. It gets more specific.',
    'Your sign might be in part {next}. Follow to find out.',
    'Follow - part {next} is the one that starts arguments.',
    'Part {next} is the callout nobody is ready for. Follow.',
  ],
  tarot: [
    'Part {next} is the card nobody expects. Follow.',
    'Follow for the reading that changes everything.',
    'Part {next} goes deeper. Follow for the full series.',
    'Follow - part {next} is the card everyone fears.',
    'Part {next} flips the meaning. Follow.',
    'Follow for the card that will follow you home.',
  ],
  lunar: [
    'Part {next} covers the phase you are in now. Follow.',
    'Follow for the phase that changes everything.',
    'Part {next} is the one everyone skips. Follow.',
    'Follow - the next phase explains what you are feeling.',
    'Part {next} is the energy shift. Follow.',
    'Follow for the moon phase nobody talks about.',
  ],
  numerology: [
    'Part {next} is the number you keep seeing. Follow.',
    'Follow for part {next}. Your number is coming.',
    'Part {next} is the one that makes people screenshot. Follow.',
    'Follow - your number might be next.',
    'Part {next} changes the whole pattern. Follow.',
    'Follow for the number that explains everything.',
  ],
  default: [
    'Part {next} is the one nobody talks about. Follow.',
    'Follow for part {next} - it hits harder.',
    "Follow so you don't miss part {next}.",
    'Part {next} is where it gets interesting. Follow.',
    'Follow - part {next} changes the meaning of this one.',
    'Part {next} is the one people save. Follow.',
    'Follow for the part that makes this all click.',
    'Part {next} drops tomorrow. Follow.',
  ],
};

/**
 * Series completion triggers for the final part
 * Tease next topic to retain followers across series
 */
const SERIES_COMPLETE_LINES = [
  'Full series done. Follow - next topic starts tomorrow.',
  'Series complete. Follow for what drops next.',
  'That was the full breakdown. Follow for the next one.',
  'End of the series. Follow - the next one starts soon.',
  'Series complete. The next one is the one people have been requesting. Follow.',
  "That's the full breakdown. Follow for the next deep dive.",
];

/**
 * Urgency lines for time-sensitive content types
 */
const URGENCY_LINES: Record<string, string[]> = {
  retrogrades: [
    'This retrograde window closes soon',
    'Active now — use this energy',
  ],
  eclipses: ['This eclipse window is open NOW', 'Six-month window starts here'],
  moon_phases: [
    'This phase peaks in the next 48 hours',
    'Current phase — use this energy while it lasts',
  ],
};

// ─── Instagram Reel caption helpers ─────────────────────────────────────────

/**
 * IG-native format hashtag pool (no TikTok-specific tags)
 */
const IG_FORMAT_HASHTAGS = [
  '#reels',
  '#instareels',
  '#reelsinstagram',
  '#explore',
  '#instagramreels',
  '#viralreels',
];

/**
 * IG category-specific hashtag pools (spiritualinstagram / witchesofinstagram
 * replace TikTok equivalents; no #fyp or #learnontiktok)
 */
const IG_CATEGORY_HASHTAGS: Record<string, string[]> = {
  zodiac: [
    '#astrology',
    '#zodiac',
    '#zodiacsigns',
    '#birthchart',
    '#astrologymemes',
    '#spiritualinstagram',
    '#astrologyinstagram',
    '#horoscope',
    '#astrologer',
    '#cosmicenergy',
    '#sunmoon',
    '#astrologycommunity',
  ],
  tarot: [
    '#tarot',
    '#tarotreading',
    '#tarotcommunity',
    '#tarotcards',
    '#tarotreader',
    '#witchesofinstagram',
    '#spiritualinstagram',
    '#dailytarot',
    '#tarotreadersofinstagram',
    '#intuitivetarot',
  ],
  numerology: [
    '#numerology',
    '#angelnumbers',
    '#spiritualinstagram',
    '#numerologysigns',
    '#angelnumber',
    '#manifestation',
    '#spiritualawakening',
    '#numerologyreading',
    '#divinenumbers',
    '#lawofattraction',
  ],
  'angel-numbers': [
    '#angelnumbers',
    '#angelnumber',
    '#spiritualawakening',
    '#manifestation',
    '#spiritualinstagram',
    '#divinenumbers',
    '#numerology',
    '#lawofattraction',
    '#spiritualsigns',
    '#synchronicity',
  ],
  crystals: [
    '#crystals',
    '#crystalhealing',
    '#crystalcollection',
    '#witchesofinstagram',
    '#spiritualinstagram',
    '#chakra',
    '#gemstones',
    '#crystalmagic',
    '#healingcrystals',
    '#reiki',
  ],
  lunar: [
    '#moonphases',
    '#fullmoon',
    '#newmoon',
    '#moonmagic',
    '#spiritualinstagram',
    '#moonritual',
    '#moonenergy',
    '#witchesofinstagram',
    '#moonphase',
    '#lunarenergy',
  ],
  spells: [
    '#witchesofinstagram',
    '#spells',
    '#witchcraft',
    '#witch',
    '#magick',
    '#wicca',
    '#babywitch',
    '#spellwork',
    '#pagan',
    '#spiritualinstagram',
  ],
  chakras: [
    '#chakras',
    '#spirituality',
    '#spiritual',
    '#spiritualawakening',
    '#meditation',
    '#healing',
    '#reiki',
    '#thirdeye',
    '#lightworker',
    '#spiritualinstagram',
  ],
};

/** Save CTAs — the primary IG algorithmic signal */
const IG_SAVE_CTA_LINES = [
  'Save this for when you need it.',
  "Bookmark this — you'll come back to it.",
  'Save this for when Mercury goes retrograde.',
  'Save this to your collection.',
  'Save this and come back when the energy shifts.',
  'Save this. You will thank yourself later.',
  'Bookmark this for the next time it comes up.',
  'Save this reference. It comes in handy.',
];

/** Share/DM CTAs — the strongest IG reach signal (non-follower distribution) */
const IG_SHARE_CTA_LINES = [
  'Send this to a {sign} you know.',
  'Share this with whoever needs to hear it today.',
  'Tag the {sign} in your life.',
  'DM this to the person who needs it.',
  'Send this to your group chat.',
  'Tag a friend who needs to see this.',
  'Share this with someone you were just thinking about.',
  'DM this to the first person who came to mind.',
];

/**
 * IG CTA rotation by day-of-week:
 * Mon/Wed/Fri = save (drives saves), Tue/Thu = share (drives DM reach), Sat/Sun = follow
 */
const IG_CTA_ROTATION: Array<'save' | 'share' | 'follow'> = [
  'follow', // Sun=0
  'save', //   Mon=1
  'share', //  Tue=2
  'save', //   Wed=3
  'share', //  Thu=4
  'save', //   Fri=5
  'follow', // Sat=6
];

/**
 * Deterministic pick of N items from an array using a string seed
 */
function seededPickN<T>(items: T[], seed: string, n: number): T[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const start = Math.abs(hash) % items.length;
  const result: T[] = [];
  for (let i = 0; i < n && i < items.length; i++) {
    result.push(items[(start + i) % items.length]);
  }
  return result;
}

/**
 * Generate IG-native hashtag string: 7 category + 3 format tags (8-10 total)
 */
function generateInstagramHashtags(
  category: string,
  theme: string,
  facetTitle: string,
): string {
  const categoryPool =
    IG_CATEGORY_HASHTAGS[category] ?? IG_CATEGORY_HASHTAGS.zodiac;
  const categoryTags = seededPickN(categoryPool, `ig-cat-${theme}`, 7);
  const formatTags = seededPickN(IG_FORMAT_HASHTAGS, `ig-fmt-${theme}`, 3);
  const all = [...categoryTags, ...formatTags];
  return all.map((t) => (t.startsWith('#') ? t : `#${t}`)).join(' ');
}

export interface InstagramReelCaptionParams {
  category: string;
  themeName: string;
  facetTitle: string;
  hookText?: string;
  scheduledDate?: Date;
}

/**
 * Generate Instagram Reel caption
 *
 * Structure (IG-optimised):
 * [Hook line + emoji]
 * [Value teaser]
 * [Engagement question]
 * [CTA — save Mon/Wed/Fri, share Tue/Thu, follow Sat/Sun]
 * [Hashtags — 8-10 IG-native tags, no #fyp/#learnontiktok]
 */
export function generateInstagramReelCaption(
  params: InstagramReelCaptionParams,
): string {
  const { category, themeName, facetTitle, hookText, scheduledDate } = params;
  const date = scheduledDate || new Date();
  const day = date.getDay();

  const emojiPool = CATEGORY_EMOJI[category] || CATEGORY_EMOJI.default;
  const emoji = pickByDate(emojiPool, date);
  const hookLine = `${hookText || themeName} ${emoji}`;

  const teaserPool = SOFT_CTA_LINES[category] || SOFT_CTA_LINES.default;
  const teaser = pickByDate(teaserPool, date);

  const questionCategory =
    category in ENGAGEMENT_QUESTIONS ? category : 'default';
  const question = pickByDate(
    ENGAGEMENT_QUESTIONS[questionCategory],
    date,
  ).replace(/\{topic\}/g, facetTitle);

  const ctaType = IG_CTA_ROTATION[day];
  let cta: string;
  if (ctaType === 'save') {
    cta = pickByDate(IG_SAVE_CTA_LINES, date);
  } else if (ctaType === 'share') {
    cta = pickByDate(IG_SHARE_CTA_LINES, date).replace(/\{sign\}/g, facetTitle);
  } else {
    cta = pickByDate(FOLLOW_CTA_LINES, date);
  }

  const hashtags = generateInstagramHashtags(category, themeName, facetTitle);

  return [hookLine, '', teaser, '', question, '', cta, '', hashtags].join('\n');
}

// ─── End Instagram Reel helpers ───────────────────────────────────────────────

/**
 * Content types that are inherently time-sensitive
 */
const TIME_SENSITIVE_CONTENT_TYPES = new Set<string>([
  'retrogrades',
  'eclipses',
  'moon_phases',
]);

/**
 * Check if a content type is time-sensitive (retrogrades, eclipses, moon phases)
 */
export function isTimeSensitiveContent(
  contentTypeKey?: string,
): contentTypeKey is 'retrogrades' | 'eclipses' | 'moon_phases' {
  return !!contentTypeKey && TIME_SENSITIVE_CONTENT_TYPES.has(contentTypeKey);
}

/**
 * Deterministic day-of-week CTA gating
 *
 * Discovery (primary-educational): ~29% — Wednesday (3) + Saturday (6)
 * Consideration (secondary): ~57% — Mon (1), Wed (3), Fri (5), Sun (0)
 * Conversion (app-demo, comparison): 100% — always
 *
 * Deterministic (day-based) instead of random so we can A/B compare
 * CTA days vs non-CTA days for engagement impact measurement.
 */
export function shouldIncludeCta(
  targetAudience: 'discovery' | 'consideration' | 'conversion',
  scheduledDate?: Date,
): boolean {
  if (targetAudience === 'conversion') return true;

  const date = scheduledDate || new Date();
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  if (targetAudience === 'consideration') {
    // Mon, Wed, Fri, Sun
    return [0, 1, 3, 5].includes(dayOfWeek);
  }

  // Discovery: Wed + Sat (high-save days)
  return [3, 6].includes(dayOfWeek);
}

/**
 * Pick a deterministic item from an array based on a date seed
 */
function pickByDate<T>(items: T[], date: Date): T {
  const seed =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  return items[seed % items.length];
}

/**
 * Generate TikTok-optimized hashtags with date-based rotation (#5)
 */
export function generateTikTokHashtags(
  facet: DailyFacet,
  theme: WeeklyTheme,
  scheduledDate?: Date,
): string[] {
  const tags: string[] = [];
  const date = scheduledDate || new Date();
  const dayIndex =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

  // Niche tag from topic
  const topicTag = `#${facet.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  if (topicTag.length > 2 && topicTag.length < 30) {
    tags.push(topicTag);
  }

  // Category tags — rotate 2 (optimal: 3-5 total hashtags per 2026 research)
  const categoryTags = CATEGORY_HASHTAGS[theme.category] || [];
  if (categoryTags.length > 0) {
    const catStart = dayIndex % categoryTags.length;
    for (let i = 0; i < 2 && i < categoryTags.length; i++) {
      tags.push(categoryTags[(catStart + i) % categoryTags.length]);
    }
  }

  // Community tags — rotate 1
  const comStart = (dayIndex + 3) % COMMUNITY_HASHTAGS.length;
  tags.push(COMMUNITY_HASHTAGS[comStart % COMMUNITY_HASHTAGS.length]);

  // Format tags — rotate 1
  const fmtStart = (dayIndex + 5) % FORMAT_HASHTAGS.length;
  tags.push(FORMAT_HASHTAGS[fmtStart % FORMAT_HASHTAGS.length]);

  // Deduplicate (no brand tag — stunts TikTok reach)
  return [...new Set(tags)];
}

/**
 * Options for enhanced caption generation
 */
export interface TikTokCaptionOptions {
  targetAudience?: 'discovery' | 'consideration' | 'conversion';
  partNumber?: number;
  totalParts?: number;
  scheduledDate?: Date;
  contentTypeKey?: string;
  grimoireSlug?: string;
}

/**
 * Generate TikTok caption with engagement question + layered hashtags
 *
 * Caption structure:
 * [Hook line]
 * [Engagement question]          — always present
 * [Series follow trigger]        — mid-series or end-of-series
 * [Soft CTA line]                — when shouldIncludeCta() returns true
 * [Urgency line]                 — when content type is time-sensitive
 * [Hashtags]
 */
export function generateTikTokCaption(
  facet: DailyFacet,
  theme: WeeklyTheme,
  hookText?: string,
  options?: TikTokCaptionOptions,
): string {
  const date = options?.scheduledDate || new Date();

  // Category-aware engagement question rotation (#3)
  const questionCategory =
    theme.category in ENGAGEMENT_QUESTIONS ? theme.category : 'default';
  const questionPool = ENGAGEMENT_QUESTIONS[questionCategory];
  const question = pickByDate(questionPool, date).replace(
    /\{topic\}/g,
    facet.title,
  );

  const hashtags = generateTikTokHashtags(facet, theme, date);

  // Pick category-appropriate emoji (#4)
  const emojiPool = CATEGORY_EMOJI[theme.category] || CATEGORY_EMOJI.default;
  const emoji1 = pickByDate(emojiPool, date);
  // Shift seed for second emoji to avoid duplicates
  const shiftedDate = new Date(date.getTime() + 86400000);
  const emoji2 = pickByDate(emojiPool, shiftedDate);

  // Caption format: hook → emoji → engagement → series follow → CTA → urgency → hashtags
  const parts: string[] = [];

  if (hookText) {
    parts.push(`${hookText} ${emoji1}`);
  }
  parts.push('');
  parts.push(question);

  // Series follow trigger (category-aware)
  if (options?.partNumber && options?.totalParts && options.totalParts > 1) {
    if (options.partNumber < options.totalParts) {
      // Mid-series: tease next part with category-specific line
      const followCategory =
        theme.category in SERIES_FOLLOW_LINES ? theme.category : 'default';
      const followPool = SERIES_FOLLOW_LINES[followCategory];
      const line = pickByDate(followPool, date).replace(
        '{next}',
        String(options.partNumber + 1),
      );
      parts.push('');
      parts.push(line);
    } else if (options.partNumber === options.totalParts) {
      // End-of-series: tease next topic
      const line = pickByDate(SERIES_COMPLETE_LINES, date);
      parts.push('');
      parts.push(line);
    }
  }

  // Share trigger for high-share content types (before CTA)
  if (
    options?.contentTypeKey &&
    SHARE_OPTIMIZED_TYPES.has(options.contentTypeKey)
  ) {
    const shareCategory =
      questionCategory in SHARE_CTA_LINES ? questionCategory : 'default';
    const sharePool = SHARE_CTA_LINES[shareCategory];
    const shareLine = pickByDate(sharePool, shiftedDate).replace(
      /\{topic\}/g,
      facet.title,
    );
    parts.push('');
    parts.push(shareLine);
  }

  // CTA rotation by day-of-week (gated by audience tier)
  const audience = options?.targetAudience || 'discovery';
  if (shouldIncludeCta(audience, date)) {
    const ctaKind = CTA_ROTATION[date.getDay()];
    let ctaLine: string;

    if (ctaKind === 'save') {
      const saveCategory =
        theme.category in SAVE_CTA_LINES ? theme.category : 'default';
      const savePool = SAVE_CTA_LINES[saveCategory];
      ctaLine = pickByDate(savePool, date).replace(/\{topic\}/g, facet.title);
    } else if (ctaKind === 'follow') {
      ctaLine = pickByDate(FOLLOW_CTA_LINES, date);
    } else if (ctaKind === 'share') {
      const shareCategory =
        theme.category in SHARE_CTA_LINES ? theme.category : 'default';
      const sharePool = SHARE_CTA_LINES[shareCategory];
      ctaLine = pickByDate(sharePool, date).replace(/\{topic\}/g, facet.title);
    } else {
      // Brand CTA (existing behavior)
      const slug = options?.grimoireSlug;
      if (slug) {
        ctaLine = `Explore this deeper: lunary.app/grimoire/${slug.split('/').pop()}`;
      } else {
        const pool = SOFT_CTA_LINES[theme.category] || SOFT_CTA_LINES.default;
        ctaLine = pickByDate(pool, date);
      }
    }
    parts.push('');
    parts.push(ctaLine);
  }

  // Urgency line for time-sensitive content
  if (isTimeSensitiveContent(options?.contentTypeKey)) {
    const urgencyPool = URGENCY_LINES[options!.contentTypeKey];
    if (urgencyPool) {
      parts.push('');
      parts.push(pickByDate(urgencyPool, date));
    }
  }

  parts.push('');
  parts.push(`${emoji2} ${hashtags.join(' ')}`);

  return parts.join('\n');
}
