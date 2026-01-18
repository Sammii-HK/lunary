import { sendDiscordNotification } from '@/lib/discord';

export type CaptionValidationContext = {
  postId?: number | string;
  themeId?: string;
  facetTitle?: string;
};

export type CaptionValidationResult = {
  valid: boolean;
  sanitizedCaption: string;
  reasons: string[];
  lines: string[];
};

const URL_PATTERN = /(https?:\/\/\S+|www\.\S+|lunary\.app\/\S*)/gi;
const HASHTAG_PATTERN = /#[\w-]+/;
const EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;

const FORBIDDEN_HOOK_PREFIX = /^(welcome back|today|in this video|part|day)\b/i;
const FORBIDDEN_HOOK_WORDS = /\b(this week|episode)\b/i;

const REQUIRED_FINAL_LINE = 'Read more on the Lunary blog.';

const hookWordCount = (hook: string) =>
  hook
    .replace(/[.!?]+$/, '')
    .split(/\s+/)
    .filter(Boolean).length;

const stripUrls = (text: string) =>
  text.replace(URL_PATTERN, 'Read more on Lunary');

const stripEmojis = (text: string) => text.replace(EMOJI_PATTERN, '');

const splitLines = (caption: string) =>
  caption
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const splitSentences = (text: string) =>
  text
    .replace(/(\d)\.(\d)/g, '$1<DECIMAL>$2')
    .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
    ?.map((sentence) => sentence.replace(/<DECIMAL>/g, '.').trim())
    .filter(Boolean) || [];

const hasConcreteTakeaway = (lines: string[]) =>
  lines.some((line) =>
    /\b(watch for|look for|notice|pay attention to|track)\b/i.test(line),
  );

export function validateCaption(
  caption: string,
  themeName?: string,
): CaptionValidationResult {
  const reasons: string[] = [];
  const sanitizedCaption = stripUrls(caption).replace(/\s+$/g, '');
  const lines = splitLines(sanitizedCaption);

  if (lines.length !== 4) {
    reasons.push(`Expected 4 lines, found ${lines.length}`);
  }

  if (HASHTAG_PATTERN.test(sanitizedCaption)) {
    reasons.push('Contains hashtags');
  }

  if (EMOJI_PATTERN.test(sanitizedCaption)) {
    reasons.push('Contains emojis');
  }

  const hookLine = lines[0] || '';
  if (!hookLine) {
    reasons.push('Missing hook line');
  } else {
    if (hookLine.includes('?')) {
      reasons.push('Hook is a question');
    }
    if (FORBIDDEN_HOOK_PREFIX.test(hookLine)) {
      reasons.push('Hook starts with forbidden prefix');
    }
    if (FORBIDDEN_HOOK_WORDS.test(hookLine)) {
      reasons.push('Hook includes forbidden wording');
    }
    if (
      themeName &&
      hookLine.toLowerCase().startsWith(themeName.toLowerCase())
    ) {
      reasons.push('Hook starts with theme name');
    }
  }

  if (!hasConcreteTakeaway(lines)) {
    reasons.push('Missing concrete takeaway');
  }

  if (
    lines.length === 4 &&
    lines[3] &&
    lines[3].trim() !== REQUIRED_FINAL_LINE
  ) {
    reasons.push('Final line must be "Read more on the Lunary blog."');
  }

  return {
    valid: reasons.length === 0,
    sanitizedCaption,
    reasons,
    lines,
  };
}

export function validateSpokenHook(hook: string): string[] {
  const reasons: string[] = [];
  const trimmed = hook.trim();
  const words = hookWordCount(trimmed);
  const allowedStructures = [
    /^.+ isn't about .+\.$/i,
    /^Most people misunderstand .+\.$/i,
    /^This isn't random\s-\sit's .+\.$/i,
    /^This affects you more than you realise\.$/i,
    /^This explains why .+\.$/i,
  ];

  if (!trimmed) {
    return ['Hook is empty'];
  }
  if (!allowedStructures.some((pattern) => pattern.test(trimmed))) {
    reasons.push('Hook does not match allowed structure');
  }
  if (trimmed.includes('?')) {
    reasons.push('Hook is a question');
  }
  if (words < 6 || words > 12) {
    reasons.push(`Hook length must be 6-12 words (found ${words})`);
  }
  if (FORBIDDEN_HOOK_PREFIX.test(trimmed)) {
    reasons.push('Hook starts with forbidden prefix');
  }
  if (FORBIDDEN_HOOK_WORDS.test(trimmed)) {
    reasons.push('Hook includes forbidden wording');
  }
  if (/\b(lunary|part|series)\b/i.test(trimmed)) {
    reasons.push('Hook references series/part/Lunary');
  }
  if (/\b(today|this week|right now)\b/i.test(trimmed)) {
    reasons.push('Hook references time');
  }
  if (/\b(magic|powerful|cosmic|destiny|universe)\b/i.test(trimmed)) {
    reasons.push('Hook uses mystical filler words');
  }
  if (/\b(maybe|often|can be|tends to)\b/i.test(trimmed)) {
    reasons.push('Hook uses hedging');
  }
  if ((trimmed.match(/\byou\b/gi) || []).length > 1) {
    reasons.push('Hook uses "you" more than once');
  }

  return reasons;
}

export function buildFallbackCaption({
  script,
  themeName,
  facetTitle,
  facetFocus,
  platform,
}: {
  script: string;
  themeName: string;
  facetTitle: string;
  facetFocus: string;
  platform: string;
}): string {
  const hook = `Most people misunderstand ${facetTitle.toLowerCase()}.`;
  const summarySentence =
    splitSentences(script)[0] ||
    `${facetTitle} shapes ${facetFocus.toLowerCase()}.`;
  const summaryLine = `In ${themeName}, ${summarySentence
    .replace(/[.!?]+$/, '')
    .trim()}.`;
  const takeaway = `Watch for ${facetFocus.toLowerCase()}.`;
  const cta =
    platform === 'twitter' || platform === 'bluesky'
      ? 'Save this for later.'
      : 'Share this with someone learning this.';

  return [hook, summaryLine, `${takeaway} ${cta}`, REQUIRED_FINAL_LINE].join(
    '\n',
  );
}

export async function logCaptionIssue(
  type: 'regenerated' | 'fallback',
  reasons: string[],
  context: CaptionValidationContext,
): Promise<void> {
  const title =
    type === 'regenerated'
      ? 'Caption invalid, regeneration requested'
      : 'Caption invalid after regeneration, fallback used';
  const fields = [
    {
      name: 'Post ID',
      value: String(context.postId ?? 'unknown'),
      inline: true,
    },
    {
      name: 'Theme ID',
      value: context.themeId || 'unknown',
      inline: true,
    },
    {
      name: 'Facet',
      value: context.facetTitle || 'unknown',
      inline: true,
    },
    { name: 'Reason', value: reasons.join('; ').slice(0, 950) },
  ];

  await sendDiscordNotification({
    title,
    description: 'Caption validation check triggered.',
    fields,
    category: 'general',
    dedupeKey: `caption-${type}-${context.postId ?? 'unknown'}`,
  });
}
