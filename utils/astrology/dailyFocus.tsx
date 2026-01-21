import { HoroscopeReading } from './personalizedHoroscope';

const normalizePhrase = (raw: string) => {
  return raw
    .replace(/focus on|lean into|today/gi, '')
    .replace(/\.+$/, '')
    .trim();
};

const toCoreWord = (phrase: string) => {
  const cleaned = normalizePhrase(phrase);
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const toSentenceForm = (phrase: string) => {
  const cleaned = normalizePhrase(phrase).toLowerCase();
  return `Today invites you to honour ${cleaned}.`;
};

const firstSentence = (text: string) => {
  const match = text.match(/[^.]+\.?/);
  return match ? match[0].trim() : text.trim();
};

type DailyFocusCard = {
  title: string; // "Your focus today"
  tag: string; // "Personal" | "Work" | "Love" | "Inner"
  headline: string; // short, punchy
  focus: string; // 1–2 sentences
  prompt: string; // a concrete action for today
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

const extractFocusPhrase = (dailyGuidance: string, fallback: string) => {
  // Tries to pull: "Focus on ____ today." from the guidance text
  const match = dailyGuidance.match(/Focus on\s+([^\.]+)\s+today\./i);
  const phrase = (match?.[1] || fallback || '').trim();
  return phrase || 'what matters most';
};

const toHeadline = (phrase: string) => {
  // Keep it short and “card-like”
  // Examples: "Choose individuality." / "Back yourself." / "Lead with curiosity."
  const cleaned = phrase.replace(/^\w/, (c) => c.toUpperCase());
  if (cleaned.length <= 24)
    return cleaned.endsWith('.') ? cleaned : `${cleaned}.`;
  return `Lean into ${cleaned.toLowerCase()}.`;
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
  const rawPhrase = extractFocusPhrase(
    reading.dailyGuidance,
    reading.dailyFocus,
  );

  const core = toCoreWord(rawPhrase);
  const tag = pickTag(core.toLowerCase());

  const focusLines: string[] = [];
  focusLines.push(`${toSentenceForm(rawPhrase)}`);

  if (reading.personalInsight) {
    focusLines.push(firstSentence(reading.personalInsight));
  }

  const focus = focusLines.join(' ');

  const crystal = reading.luckyElements?.[0];
  const prompt = crystal
    ? `Carry ${crystal} and take one small action that reflects who you truly are.`
    : `Take one small action today that reflects who you truly are.`;

  return {
    title: 'Your focus today',
    tag,
    headline: core,
    focus,
    prompt,
  };
};
