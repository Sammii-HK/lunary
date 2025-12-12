import { ShopProduct, SHOP_GRADIENTS, PRICE_TIERS } from '../types';

interface RetrogradePackConfig {
  id: string;
  slug: string;
  planet: string;
  title: string;
  tagline: string;
  description: string;
  domains: string[];
  challenges: string[];
  opportunities: string[];
  whatInside: string[];
  perfectFor: string[];
  price: number;
  gradient: string;
}

const RETROGRADE_PACK_CONFIGS: RetrogradePackConfig[] = [
  {
    id: 'mercury-retrograde',
    slug: 'mercury-retrograde-pack',
    planet: 'Mercury',
    title: 'Mercury Retrograde Survival Pack',
    tagline: 'Navigate the cosmic static with grace.',
    description:
      'Three to four times a year, Mercury appears to move backward, and communication tangles, technology glitches, and travel plans unravel. This pack arms you with protective rituals, smoothing spells, and reflective practices to not just survive but thrive during retrograde season.',
    domains: ['Communication', 'Technology', 'Travel', 'Contracts', 'Thinking'],
    challenges: [
      'Miscommunication and misunderstandings',
      'Tech failures and glitches',
      'Travel delays and disruptions',
      'Document and contract issues',
    ],
    opportunities: [
      'Reviewing and revising past work',
      'Reconnecting with old friends',
      'Rethinking communication patterns',
      'Slowing down and reflecting',
    ],
    whatInside: [
      'Mercury retrograde dates and shadow periods explained',
      'Protection ritual for devices and communication',
      'Travel safety spell and blessing',
      'Miscommunication repair working',
      'Reflection journal prompts for each retrograde phase',
      'Crystal and herb correspondences for Mercury',
      'Retrograde survival daily practices',
    ],
    perfectFor: [
      'Anyone dreading the next Mercury retrograde.',
      'Those who work with technology daily.',
      'Frequent travellers seeking peace of mind.',
    ],
    price: PRICE_TIERS.seasonal,
    gradient: SHOP_GRADIENTS.horizCometToRose, // Mercury's airy, shifting communication
  },
  {
    id: 'venus-retrograde',
    slug: 'venus-retrograde-pack',
    planet: 'Venus',
    title: 'Venus Retrograde Heart Healing Pack',
    tagline: 'Tend to matters of the heart.',
    description:
      'Every eighteen months, Venus turns retrograde, calling us to review our relationships, values, and self-worth. Old loves may resurface, beauty preferences shift, and financial matters require attention. This pack guides you through the heart work Venus demands.',
    domains: [
      'Love',
      'Relationships',
      'Beauty',
      'Values',
      'Money',
      'Self-Worth',
    ],
    challenges: [
      'Ex-partners reappearing',
      'Relationship doubts surfacing',
      'Financial reassessment needs',
      'Self-worth wounds triggered',
    ],
    opportunities: [
      'Healing past relationship wounds',
      'Clarifying what you truly value',
      'Reconnecting with self-love',
      'Resolving old romantic karma',
    ],
    whatInside: [
      'Venus retrograde meaning and timing',
      'Heart healing ritual for past relationships',
      'Self-worth affirmation practice',
      'Ex-partner cord cutting ceremony',
      'Values clarification spread and journal',
      'Beauty and self-care ritual',
      'Rose quartz working for Venus energy',
    ],
    perfectFor: [
      'Those processing past relationship patterns.',
      'Anyone experiencing the return of an ex.',
      'Those doing deep work on self-worth.',
    ],
    price: PRICE_TIERS.seasonal,
    gradient: SHOP_GRADIENTS.lightHazeToRose, // Venus's love energy
  },
  {
    id: 'mars-retrograde',
    slug: 'mars-retrograde-pack',
    planet: 'Mars',
    title: 'Mars Retrograde Action Reset Pack',
    tagline: 'Redirect your fire, reclaim your power.',
    description:
      'Every two years, Mars retrograde asks us to pause our forward momentum and reassess our actions, anger, and ambitions. Frustration can build as plans stall. This pack helps you channel Mars energy constructively and emerge with renewed direction.',
    domains: ['Action', 'Anger', 'Ambition', 'Drive', 'Conflict', 'Sexuality'],
    challenges: [
      'Frustration and blocked energy',
      'Stalled projects and plans',
      'Conflict and aggression surfacing',
      'Low motivation and drive',
    ],
    opportunities: [
      'Reviewing goals and strategies',
      'Processing anger constructively',
      'Resting and rebuilding energy',
      'Redirecting ambition',
    ],
    whatInside: [
      'Mars retrograde meaning and timing',
      'Anger alchemy ritual',
      'Energy conservation practices',
      'Goal review and strategy revision framework',
      'Patience spell for frustration',
      'Physical movement practices for blocked Mars',
      'Bloodstone and red jasper workings',
    ],
    perfectFor: [
      'Those managing frustration during Mars retrograde.',
      'Anyone reviewing and revising their big goals.',
      'Those channelling anger into positive change.',
    ],
    price: PRICE_TIERS.seasonal,
    gradient: SHOP_GRADIENTS.supernovaToNebula, // Mars's intense, fiery energy
  },
];

export function generateRetrogradePacks(): ShopProduct[] {
  return RETROGRADE_PACK_CONFIGS.map((config) => ({
    id: config.id,
    slug: config.slug,
    title: config.title,
    tagline: config.tagline,
    description: config.description,
    category: 'astrology' as const,
    whatInside: config.whatInside,
    perfectFor: config.perfectFor,
    related: RETROGRADE_PACK_CONFIGS.filter((c) => c.id !== config.id).map(
      (c) => c.slug,
    ),
    price: config.price,
    gradient: config.gradient,
  }));
}

export function getRetrogradePackBySlug(slug: string): ShopProduct | undefined {
  return generateRetrogradePacks().find((pack) => pack.slug === slug);
}
