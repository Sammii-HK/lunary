import { HoroscopeReading } from './personalizedHoroscope';

type DailyFocusCard = {
  title: string;
  tag: string;
  headline: string; // single word where possible
  focus: string; // 1–2 sentences
  prompt: string;
};

const DEFAULT_TAGS = ['Personal', 'Work', 'Love', 'Inner'] as const;
type FocusTag = (typeof DEFAULT_TAGS)[number];

const pickTag = (focusLower: string): FocusTag => {
  if (/(relationship|love|heart|partner|dating)/.test(focusLower))
    return 'Love';
  if (/(work|career|money|finance|ambition|goal|productivity)/.test(focusLower))
    return 'Work';
  if (/(intuition|dream|reflect|journal|heal|emotion|inner)/.test(focusLower))
    return 'Inner';
  return 'Personal';
};

const firstSentence = (text: string) => {
  const match = text.match(/[^.]+\.?/);
  return match ? match[0].trim() : text.trim();
};

const clean = (s: string) => s.replace(/\s+/g, ' ').replace(/\.+$/g, '').trim();

const extractFocus = (
  reading: Pick<HoroscopeReading, 'dailyGuidance' | 'dailyFocus'>,
) => {
  const fromGuidance = reading.dailyGuidance.match(
    /Focus:\s*([^.\n]+)\.?/i,
  )?.[1];
  const raw = fromGuidance || reading.dailyFocus || 'what matters most';
  return clean(raw);
};

const toHeadline = (focus: string) => {
  // Aim for 1 word. If it is clearly multi-word, keep it tight.
  const words = focus.split(' ').filter(Boolean);

  // Common patterns: "inner wisdom" -> "Wisdom", "self trust" -> "Trust"
  if (words.length >= 2 && words[0].toLowerCase() === 'inner')
    return capitalise(words[1]);
  if (words.length >= 2 && words[0].toLowerCase() === 'self')
    return capitalise(words[1]);

  // Single word headline
  if (words.length === 1) return capitalise(words[0]);

  // Short phrase headline if needed
  return capitalise(focus);
};

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const toFocusSentence = (focus: string) => {
  // Keep it simple and ritual-coded
  const lower = focus.toLowerCase();
  return `Today invites you to lean into ${lower}.`;
};

export const buildDailyFocusCard = (
  reading: Pick<
    HoroscopeReading,
    | 'sunSign'
    | 'moonPhase'
    | 'dailyGuidance'
    | 'dailyFocus'
    | 'personalInsight'
    | 'luckyElements'
  >,
): DailyFocusCard => {
  const focusPhrase = extractFocus(reading);
  const tag = pickTag(focusPhrase.toLowerCase());
  const headline = toHeadline(focusPhrase);

  const lines: string[] = [];
  lines.push(toFocusSentence(focusPhrase));

  if (reading.personalInsight) {
    lines.push(firstSentence(reading.personalInsight));
  }

  const focus = lines.join(' ');

  const crystal = reading.luckyElements?.[0];
  const promptBase = `Choose one small action that proves ${focusPhrase.toLowerCase()}.`;
  const prompt = crystal
    ? `Carry ${crystal} and ${promptBase.charAt(0).toLowerCase()}${promptBase.slice(1)}`
    : promptBase;

  return {
    title: 'Your focus today',
    tag,
    headline,
    focus,
    prompt,
  };
};
