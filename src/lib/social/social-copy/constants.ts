/**
 * Constants for social copy generation
 */

import type { SocialPostType } from './types';

export const CTA_OPTIONS = [
  "Full guide in Lunary's Grimoire.",
  'Explored further in the Grimoire.',
];

export const CTA_PHRASES = new Set(CTA_OPTIONS);

export const POST_TYPE_SPECS: Record<
  SocialPostType,
  {
    sentenceCount: [number, number];
    ending?: 'question' | 'observation' | 'ritual';
    toneNote: string;
  }
> = {
  educational_intro: {
    sentenceCount: [1, 2],
    ending: 'observation',
    toneNote: 'clear and welcoming, like opening a conversation',
  },
  educational_deep_1: {
    sentenceCount: [2, 3],
    ending: 'observation',
    toneNote: 'share a deeper layer or nuance people might miss',
  },
  educational_deep_2: {
    sentenceCount: [2, 3],
    ending: 'observation',
    toneNote: 'practical application or timing insight',
  },
  educational_deep_3: {
    sentenceCount: [2, 3],
    ending: 'observation',
    toneNote: 'contextual depth or broader connection',
  },
  question: {
    sentenceCount: [1, 1],
    ending: 'question',
    toneNote: 'genuine curiosity about lived experience',
  },
  closing_ritual: {
    sentenceCount: [2, 3],
    ending: 'ritual',
    toneNote: 'gentle invitation to reflect or try something',
  },
  closing_statement: {
    sentenceCount: [1, 2],
    ending: 'observation',
    toneNote: 'simple, grounded closing thought',
  },
  persona: {
    sentenceCount: [1, 2],
    toneNote: 'warm and welcoming, establishing connection',
  },
  video_caption: {
    sentenceCount: [2, 4],
    toneNote: 'complement the video with context and insight',
  },
};

export const QUESTION_STARTERS = [
  'what',
  'why',
  'how',
  'when',
  'which',
  'who',
  'where',
  'do',
  'does',
  'did',
  'is',
  'are',
  'can',
  'could',
  'would',
  'should',
  'will',
  'have',
  'has',
  'am',
  'was',
  'were',
];

export const HASHTAG_REGEX = /#[\w-]+/g;
