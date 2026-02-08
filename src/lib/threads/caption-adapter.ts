import type { IGScheduledPost } from '@/lib/instagram/types';
import { THREADS_CHAR_LIMITS, type CrosspostableIGType } from './types';

interface AdaptedCaption {
  hook: string;
  body: string;
  prompt: string;
}

/**
 * Adapt an Instagram caption for Threads.
 * Extracts key info from the IG post and creates a short,
 * conversation-driving Threads caption within char limits.
 */
export function adaptIGCaptionForThreads(
  postType: CrosspostableIGType,
  igPost: IGScheduledPost,
): AdaptedCaption {
  switch (postType) {
    case 'meme':
      return adaptMeme(igPost);
    case 'sign_ranking':
      return adaptSignRanking(igPost);
    case 'compatibility':
      return adaptCompatibility(igPost);
    case 'did_you_know':
      return adaptDidYouKnow(igPost);
    case 'quote':
      return adaptQuote(igPost);
    case 'daily_cosmic':
      return adaptDailyCosmic(igPost);
    default:
      return adaptGeneric(igPost);
  }
}

function adaptMeme(post: IGScheduledPost): AdaptedCaption {
  const sign = post.metadata.sign || 'your sign';
  return enforceCharLimits({
    hook: `${sign} energy in one image`,
    body: 'no notes needed',
    prompt: 'tag the friend who needs to see this',
  });
}

function adaptSignRanking(post: IGScheduledPost): AdaptedCaption {
  // Extract trait from caption - first meaningful line
  const captionLines = post.caption.split('\n').filter(Boolean);
  const trait =
    captionLines[0]?.slice(0, 60) || 'this ranking speaks for itself';
  return enforceCharLimits({
    hook: truncate(trait, THREADS_CHAR_LIMITS.hook),
    body: 'the signs have been ranked',
    prompt: 'where did your sign land? agree or disagree?',
  });
}

function adaptCompatibility(post: IGScheduledPost): AdaptedCaption {
  // Extract signs from caption
  const captionLines = post.caption.split('\n').filter(Boolean);
  const headline = captionLines[0]?.slice(0, 60) || 'this pairing is something';
  return enforceCharLimits({
    hook: truncate(headline, THREADS_CHAR_LIMITS.hook),
    body: 'some combos just hit different',
    prompt: 'agree or disagree? drop your pairing below',
  });
}

function adaptDidYouKnow(post: IGScheduledPost): AdaptedCaption {
  const captionLines = post.caption.split('\n').filter(Boolean);
  const fact = captionLines[0]?.slice(0, 70) || 'this one surprised me';
  return enforceCharLimits({
    hook: truncate(fact, THREADS_CHAR_LIMITS.hook),
    body: 'most people get this wrong',
    prompt: 'did you know this already?',
  });
}

function adaptQuote(post: IGScheduledPost): AdaptedCaption {
  // Pull the quote text from the caption
  const captionLines = post.caption.split('\n').filter(Boolean);
  const quote = captionLines[0]?.slice(0, 70) || 'this one hits';
  return enforceCharLimits({
    hook: truncate(quote, THREADS_CHAR_LIMITS.hook),
    body: 'let this one land for a second',
    prompt: 'what does this bring up for you?',
  });
}

function adaptDailyCosmic(post: IGScheduledPost): AdaptedCaption {
  const captionLines = post.caption.split('\n').filter(Boolean);
  const vibe = captionLines[0]?.slice(0, 60) || "today's cosmic energy";
  return enforceCharLimits({
    hook: truncate(vibe, THREADS_CHAR_LIMITS.hook),
    body: 'the sky is setting the tone today',
    prompt: 'drop your sign, what are you feeling?',
  });
}

function adaptGeneric(post: IGScheduledPost): AdaptedCaption {
  const captionLines = post.caption.split('\n').filter(Boolean);
  const headline = captionLines[0]?.slice(0, 70) || 'the cosmos has notes';
  return enforceCharLimits({
    hook: truncate(headline, THREADS_CHAR_LIMITS.hook),
    body: '',
    prompt: 'thoughts?',
  });
}

/** Enforce character limits on all caption parts */
function enforceCharLimits(caption: AdaptedCaption): AdaptedCaption {
  const hook = truncate(caption.hook, THREADS_CHAR_LIMITS.hook);
  const prompt = truncate(caption.prompt, 80);

  // Calculate remaining space for body
  const usedChars = hook.length + prompt.length + 4; // 4 for newlines
  const bodyLimit = Math.min(
    THREADS_CHAR_LIMITS.body,
    THREADS_CHAR_LIMITS.total - usedChars,
  );
  const body = truncate(caption.body, Math.max(0, bodyLimit));

  return { hook, body, prompt };
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).trim() + '\u2026';
}
