export type ContentArchetype =
  | 'founder'
  | 'educational'
  | 'cosmic_insight'
  | 'feature_deep_dive'
  | 'user_transformation';

export interface ArchetypeConfig {
  name: string;
  description: string;
  tone: string;
  guidelines: string[];
  examplePosts: string[];
  ctaStyle: 'none' | 'soft' | 'direct';
  uniqueFeatures?: string[];
}

export const CONTENT_ARCHETYPES: Record<ContentArchetype, ArchetypeConfig> = {
  founder: {
    name: 'Founder/Indie Dev Journey',
    description:
      'Vulnerable, authentic behind-the-scenes content about building Lunary',
    tone: 'Reflective, honest, personal',
    guidelines: [
      'Share real challenges and learnings from building the app',
      'Be vulnerable about the journey - failures, pivots, discoveries',
      'Connect personal growth to the product vision',
      'Use "I" statements - this is YOUR story',
      'No selling - let authenticity build trust',
    ],
    examplePosts: [
      "Building an astrology app taught me that most 'horoscopes' are just recycled generic text. I spent 6 months learning real astronomy so Lunary could calculate actual planetary positions. The difference is everything.",
      "I used to think astrology was just sun signs. Then I learned about houses, aspects, transits. Your birth chart is a complete map of the sky the moment you were born. That's what I wanted Lunary to show people.",
      'The hardest part of building Lunary was realizing accuracy matters more than features. I deleted 3 months of work to rebuild the astronomical calculations from scratch.',
      "Why I built an AI that remembers your conversations: astrology isn't one-size-fits-all. Your chart is unique. Your questions deserve context. That's why Lunary's AI actually remembers what you've discussed.",
      "Something I learned building Lunary: people don't want predictions. They want understanding. Why am I feeling this way? What's influencing my energy? That's what birth charts reveal.",
    ],
    ctaStyle: 'none',
  },

  educational: {
    name: 'Educational Content',
    description:
      'Teach astronomy facts and explain how astrological concepts actually work',
    tone: 'Curious, informative, accessible',
    guidelines: [
      "Explain ONE concept clearly - don't overwhelm",
      'Use "did you know" style hooks when appropriate',
      'Connect astronomical facts to personal meaning',
      'Avoid jargon - explain terms simply',
      'Make complex topics feel approachable',
    ],
    examplePosts: [
      'Your birth chart has 12 houses. Each one represents a different area of life - career, relationships, home, creativity. When planets move through these houses, they activate different themes for YOU specifically.',
      "The difference between your sun sign and rising sign: your sun is your core identity. Your rising is how others perceive you. They're often completely different signs.",
      "Mercury retrograde isn't actually moving backwards. It's an optical illusion from Earth's perspective. But the energy shift during these periods? That's real astronomical geometry at work.",
      "Tarot patterns reveal more than single cards. When the same cards keep appearing across readings, they're highlighting recurring themes in your life. Tracking this over time shows your growth.",
      "Your moon sign shapes your emotional world. It's calculated from the moon's exact position when you were born. Most people don't know theirs - but it explains so much about how you process feelings.",
    ],
    ctaStyle: 'none',
  },

  cosmic_insight: {
    name: 'Cosmic Insight',
    description:
      'Value-first cosmic wisdom and daily guidance without any promotion',
    tone: 'Grounded, reflective, wise',
    guidelines: [
      'Lead with insight, not product',
      'Share wisdom that stands alone - no app mention needed',
      'Connect celestial events to human experience',
      'Be poetic but grounded - not fluffy',
      'This is pure value content - no CTA',
    ],
    examplePosts: [
      "The moon doesn't create your emotions. It illuminates what's already there. Full moons bring things to light. New moons invite you to plant seeds in the dark.",
      'Every planet in your chart tells a story. Mars is how you take action. Venus is how you connect. Saturn is where you face resistance. The whole sky was arranged uniquely for you.',
      "Retrograde periods aren't punishment. They're invitations to revisit, review, and reconsider. The universe doesn't move against you - it moves with purpose.",
      'Your birth chart is a snapshot of the entire solar system at your first breath. Billions of possible configurations, and you got this one. That specificity matters.',
      "Transits don't happen TO you. They happen WITH you. The planets are always moving, always activating different parts of your chart. It's a conversation, not a verdict.",
    ],
    ctaStyle: 'none',
  },

  feature_deep_dive: {
    name: 'Feature Deep-Dive',
    description:
      'Explain ONE specific unique feature in depth - show what makes it special',
    tone: 'Enthusiastic, specific, demonstrative',
    guidelines: [
      'Focus on ONE feature per post - go deep, not wide',
      'Explain WHAT it does and WHY it matters',
      'Show the value through specific examples',
      "Highlight features competitors don't have",
      'Soft CTA only - "discover at lunary.app" style',
    ],
    uniqueFeatures: [
      'AI chat with memory - remembers your past conversations and builds context over time',
      'Tarot pattern analysis - tracks which cards appear frequently and identifies recurring themes',
      'Personal transits - shows which houses are being activated in YOUR chart specifically',
      '500+ page digital grimoire - spells, rituals, crystals, correspondences all in one place',
      'Birth chart houses - see exactly which areas of life each transit affects for you',
    ],
    examplePosts: [
      "Most AI chatbots forget you exist between sessions. Lunary's AI remembers your birth chart, your past questions, your recurring themes. Ask about your career today, and it knows you asked about Saturn transits last week.",
      "Tarot apps show you a card. Lunary shows you patterns. Which cards keep appearing? What themes are recurring? Over 30 days, the patterns tell a story single readings can't.",
      "Generic transit forecasts say 'Mars is in Aries.' Personal transits say 'Mars is activating your 7th house - relationships and partnerships are energized.' The difference is YOUR birth chart.",
      '500+ pages of grimoire content. Moon phases, crystal properties, spell correspondences, ritual guides. Not scattered across the internet - organized, searchable, always accessible.',
      "Your birth chart has 12 houses. Lunary shows you exactly which house each planet is transiting. When Jupiter enters your 10th house, you'll know your career is expanding. That specificity changes everything.",
    ],
    ctaStyle: 'soft',
  },

  user_transformation: {
    name: 'User Transformation',
    description:
      'Show what people actually experience and gain from understanding their chart',
    tone: 'Empathetic, relatable, aspirational',
    guidelines: [
      'Focus on the FEELING and OUTCOME, not features',
      'Use second person - "you" statements',
      'Paint a picture of transformation',
      'Be specific about what changes',
      'Soft CTA - invite curiosity',
    ],
    examplePosts: [
      "Understanding your birth chart doesn't predict your future. It explains your patterns. Why you always react that way. Why certain relationships feel harder. Why some things come naturally. That self-knowledge is the transformation.",
      'Imagine knowing exactly when your energy will be high for starting projects vs. when to rest and reflect. Personal transits give you that - a cosmic calendar aligned to YOUR chart.',
      "You've probably read your sun sign horoscope and thought 'this doesn't feel like me.' That's because you're reading 1/12th of your chart. Your full chart has your moon, rising, and 8 other planets. It's a complete picture.",
      "Tracking tarot patterns over time reveals something powerful: you're growing. Cards that appeared constantly three months ago fade away. New themes emerge. You can literally see your evolution.",
      "The grimoire isn't just information - it's a practice. Finding the right crystal for your mood. The right ritual for the moon phase. The right correspondence for your intention. It becomes part of your daily rhythm.",
    ],
    ctaStyle: 'soft',
  },
};

export function getArchetypePrompt(archetype: ContentArchetype): string {
  const config = CONTENT_ARCHETYPES[archetype];
  return `
CONTENT STYLE: ${config.name}
${config.description}

TONE: ${config.tone}

GUIDELINES:
${config.guidelines.map((g) => `- ${g}`).join('\n')}

${config.uniqueFeatures ? `UNIQUE FEATURES TO HIGHLIGHT (pick one):\n${config.uniqueFeatures.map((f) => `- ${f}`).join('\n')}` : ''}

EXAMPLE POSTS (match this style and quality):
${config.examplePosts.map((p) => `"${p}"`).join('\n\n')}

CTA STYLE: ${config.ctaStyle === 'none' ? 'No CTA - pure value content' : config.ctaStyle === 'soft' ? 'Soft CTA only - "discover at lunary.app" or "try Lunary" - no pricing or trial mentions' : 'Direct but natural CTA'}
`;
}

export function getRandomArchetype(): ContentArchetype {
  const archetypes: ContentArchetype[] = [
    'founder',
    'educational',
    'cosmic_insight',
    'feature_deep_dive',
    'user_transformation',
  ];
  return archetypes[Math.floor(Math.random() * archetypes.length)];
}

export function getWeightedArchetype(): ContentArchetype {
  const weights: Record<ContentArchetype, number> = {
    founder: 15,
    educational: 25,
    cosmic_insight: 25,
    feature_deep_dive: 20,
    user_transformation: 15,
  };

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const random = Math.random() * total;

  let cumulative = 0;
  for (const [archetype, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (random < cumulative) {
      return archetype as ContentArchetype;
    }
  }

  return 'educational';
}

export function mapPostTypeToArchetype(
  postType: string,
): ContentArchetype | null {
  const mapping: Record<string, ContentArchetype> = {
    feature: 'feature_deep_dive',
    benefit: 'user_transformation',
    educational: 'educational',
    inspirational: 'cosmic_insight',
    behind_scenes: 'founder',
    promotional: 'feature_deep_dive',
    user_story: 'user_transformation',
  };

  return mapping[postType] || null;
}
