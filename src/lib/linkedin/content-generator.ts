/**
 * LinkedIn Content Generator
 *
 * Generates standalone "Did You Know" educational posts for LinkedIn.
 * Research shows LinkedIn carousels get 6.6% engagement (highest format).
 * Educational surprising facts with professional framing perform best.
 *
 * Schedule: 3x/week (Tue/Wed/Thu — research says 8-9am Tue/Wed best)
 * Format: 1,500+ chars with professional context, engagement question, 1-3 hashtags
 */

import { FACT_POOLS } from '@/lib/instagram/did-you-know-content';
import { seededRandom } from '@/lib/instagram/ig-utils';
import type { ThemeCategory } from '@/lib/social/types';

const CATEGORIES: ThemeCategory[] = [
  'tarot',
  'crystals',
  'spells',
  'numerology',
  'runes',
  'chakras',
  'zodiac',
];

// Professional framing intros that position spiritual content for LinkedIn
const PROFESSIONAL_INTROS: Record<string, string[]> = {
  tarot: [
    'Tarot has been used as a decision-making framework for centuries. Before it became associated with fortune-telling, it was a tool for structured reflection — something many executives and coaches are rediscovering today.',
    'The most effective leaders I know have one thing in common: they make space for reflection before making decisions. Tarot, stripped of its mystical reputation, is essentially a structured reflection framework.',
    'Psychology and ancient wisdom have more overlap than most professionals realise. Tarot archetypes map directly onto Jungian psychology — a framework used in leadership development worldwide.',
  ],
  crystals: [
    'The intersection of geology and wellness is fascinating from a professional development perspective. Understanding the science behind crystals reveals why cultures across history have valued them.',
    'Mindfulness tools come in many forms. Some of the most effective ones have been used for thousands of years — they just need reframing for modern professional contexts.',
    'The best productivity systems incorporate sensory anchors. Here is something from the world of mineralogy that puts this into perspective.',
  ],
  spells: [
    'Intention-setting rituals have been studied extensively in behavioural psychology. What ancient practitioners called "spells" share remarkable similarities with modern goal-setting frameworks.',
    'The science of habit formation has roots far older than most people realise. Ancient ritual practices anticipated what behavioural scientists now confirm about how the brain creates change.',
    'Every effective leader has rituals — morning routines, pre-meeting preparation, end-of-day reviews. The history of intentional ritual practice offers fascinating insights into why these work.',
  ],
  numerology: [
    'Pattern recognition is one of the most valuable professional skills. Numerology — the study of number patterns — has been used as a reflection tool by mathematicians and philosophers for millennia.',
    'Pythagoras was not just a mathematician. He founded a system of number interpretation that influenced Western philosophy for centuries. Here is what makes it relevant to personal development.',
    'Numbers shape more of our daily decisions than we realise. From pricing psychology to calendar planning, the study of number patterns offers surprising professional insights.',
  ],
  runes: [
    'The Norse tradition of rune reading is essentially an ancient decision-making protocol. Viking leaders used it to consider options from multiple angles before committing to action.',
    'Some of history is most effective leaders used symbolic systems for strategic thinking. The Norse rune system is one of the oldest structured reflection frameworks we know of.',
    'Cross-cultural leadership wisdom often converges on the same principles. The Norse runic tradition offers a fascinating lens on strategic decision-making.',
  ],
  chakras: [
    'Energy management is the new time management. The ancient chakra system — a framework for understanding where you are blocked or overextended — maps surprisingly well to modern burnout prevention.',
    'The World Health Organisation recognises burnout as an occupational phenomenon. Ancient wellness frameworks like the chakra system offer structured approaches to identifying where energy is depleted.',
    'Holistic wellbeing is no longer a fringe concept in professional development. The chakra framework, used for thousands of years, provides a structured self-assessment that many coaches now incorporate.',
  ],
  zodiac: [
    'Understanding different personality frameworks makes you a better collaborator and leader. Astrology, used thoughtfully, is one of the oldest personality typing systems in existence.',
    'The most emotionally intelligent professionals I know are curious about all frameworks for understanding human behaviour — including ones outside the corporate mainstream.',
    'Myers-Briggs, DISC, StrengthsFinder — all personality frameworks that businesses rely on daily. Astrology predates them all and offers surprisingly practical insights about communication styles.',
  ],
};

// Engagement questions for LinkedIn (professional tone)
const ENGAGEMENT_QUESTIONS: string[] = [
  'What frameworks do you use for self-reflection in your professional life?',
  'Have you ever found wisdom in an unexpected source? I would love to hear about it.',
  'What unconventional tools have helped you grow professionally?',
  'Do you think ancient wisdom has a place in modern professional development? Share your thoughts.',
  'What is the most surprising thing you have learned recently that changed your perspective?',
  'How do you create space for reflection in your work routine?',
  'What is one practice from outside your industry that has improved your professional life?',
  'Which non-traditional frameworks have you found valuable for personal growth?',
];

// LinkedIn-appropriate hashtags (SEO keywords, not discovery tags)
const LINKEDIN_HASHTAGS: string[] = [
  '#ProfessionalDevelopment',
  '#Mindfulness',
  '#PersonalGrowth',
  '#LeadershipDevelopment',
  '#WellnessAtWork',
  '#SelfAwareness',
  '#EmotionalIntelligence',
  '#ContinuousLearning',
  '#HolisticWellbeing',
  '#AncientWisdom',
];

export interface LinkedInPost {
  content: string;
  category: ThemeCategory;
  fact: string;
  source: string;
  scheduledHour: number;
}

// LinkedIn posts only on Tue (2), Wed (3), Thu (4)
const LINKEDIN_DAYS = [2, 3, 4];

export function isLinkedInPostingDay(dateStr: string): boolean {
  const dayOfWeek = new Date(dateStr).getUTCDay();
  return LINKEDIN_DAYS.includes(dayOfWeek);
}

export function generateLinkedInPost(dateStr: string): LinkedInPost {
  const rng = seededRandom(`linkedin-${dateStr}`);

  // Pick category deterministically
  const category = CATEGORIES[Math.floor(rng() * CATEGORIES.length)];
  const pool = FACT_POOLS[category] ?? FACT_POOLS.tarot;
  const entry = pool[Math.floor(rng() * pool.length)];

  // Pick professional intro
  const intros = PROFESSIONAL_INTROS[category] ?? PROFESSIONAL_INTROS.tarot;
  const intro = intros[Math.floor(rng() * intros.length)];

  // Pick engagement question
  const question =
    ENGAGEMENT_QUESTIONS[Math.floor(rng() * ENGAGEMENT_QUESTIONS.length)];

  // Pick 1-3 hashtags
  const shuffledTags = [...LINKEDIN_HASHTAGS].sort(() => rng() - 0.5);
  const tagCount = 1 + Math.floor(rng() * 3); // 1-3
  const hashtags = shuffledTags.slice(0, tagCount).join(' ');

  // Assemble post (1,500+ chars for LinkedIn sweet spot)
  const content = [
    intro,
    '',
    `Did you know? ${entry.fact}`,
    '',
    question,
    '',
    hashtags,
  ].join('\n');

  // Schedule at 8-9am UTC (optimal LinkedIn posting time)
  const scheduledHour = 8 + Math.floor(rng() * 2);

  return {
    content,
    category,
    fact: entry.fact,
    source: entry.source,
    scheduledHour,
  };
}
