import { ShopProduct, SHOP_GRADIENTS } from '../types';

interface NotionTemplateConfig {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  whatInside: string[];
  perfectFor: string[];
  price: number;
  gradient: string;
  tags?: string[];
  keywords?: string[];
  badge?: 'new' | 'seasonal' | 'trending' | 'popular';
}

const NOTION_TEMPLATE_CONFIGS: NotionTemplateConfig[] = [
  {
    id: 'tarot-journal',
    slug: 'tarot-journal',
    title: 'Tarot Journal',
    tagline: 'Your complete tarot practice in one place.',
    description:
      'A complete tarot practice system with 78 pre-filled card references, 6 spread guides, daily draw tracker, and reading log. Pre-populated with real card meanings and journal prompts.',
    whatInside: [
      '78 pre-filled card reference pages with meanings and keywords',
      '6 spread guides with step-by-step instructions',
      'Daily draw tracker to log your one-card pulls',
      'Full reading log with date, cards, and interpretation fields',
      'Journal prompts for each Major Arcana card',
      'Linked gallery view for quick card lookup',
    ],
    perfectFor: [
      'Beginners building a consistent tarot practice.',
      'Experienced readers who want a searchable digital log.',
      'Anyone who wants all their card knowledge in one Notion workspace.',
    ],
    price: 1200,
    gradient: SHOP_GRADIENTS.supernovaToHaze,
    tags: ['notion', 'template', 'digital download', 'spirituality', 'tarot'],
    keywords: [
      'tarot journal notion',
      'tarot template',
      'digital tarot journal',
    ],
    badge: 'new',
  },
  {
    id: 'moon-planner-2026',
    slug: 'moon-planner-2026',
    title: 'Moon Planner 2026',
    tagline: 'Plan your year by the light of the moon.',
    description:
      'Full lunar year planner with all 2026 moon dates, phases, and signs pre-filled. Includes lunar intentions database, moon observations log, and ritual suggestions for every phase.',
    whatInside: [
      'All 2026 new and full moon dates pre-filled with signs and themes',
      'Complete moon phase calendar for every month',
      'Lunar intentions database to set and track monthly intentions',
      'Moon observations log for tracking how each phase affects you',
      'Ritual suggestions for every phase: new, waxing, full, waning',
      'Timeline view showing the full lunar year at a glance',
    ],
    perfectFor: [
      'Those who align their life and goals with the lunar cycle.',
      'Moon ritualists wanting a structured yearly planner.',
      'Anyone replacing a paper moon journal with a searchable digital system.',
    ],
    price: 1000,
    gradient: SHOP_GRADIENTS.cometToHaze,
    tags: ['notion', 'template', 'digital download', 'spirituality', 'moon'],
    keywords: [
      'moon planner notion',
      'lunar calendar 2026',
      'moon journal template',
    ],
    badge: 'new',
  },
  {
    id: 'rune-journal',
    slug: 'rune-journal',
    title: 'Rune Journal',
    tagline: 'Master the Elder Futhark with daily practice.',
    description:
      'All 24 Elder Futhark runes pre-filled with meanings, keywords, and journal prompts. Daily draw log, reading tracker, and stats dashboard. Near-zero competition in this niche.',
    whatInside: [
      '24 Elder Futhark rune pages with meanings, keywords, and associations',
      'Journal prompts for each rune to deepen your understanding',
      'Daily draw log with date, rune, and reflection fields',
      'Reading tracker for multi-rune spreads',
      'Stats dashboard showing your most-drawn runes over time',
      'Reversed meanings for all runes that carry them',
    ],
    perfectFor: [
      'Rune practitioners building a daily draw habit.',
      'Those new to the Elder Futhark wanting structured reference material.',
      'Anyone tracking patterns in their rune readings over time.',
    ],
    price: 1000,
    gradient: SHOP_GRADIENTS.nebulaToComet,
    tags: ['notion', 'template', 'digital download', 'spirituality', 'runes'],
    keywords: [
      'rune journal notion',
      'elder futhark template',
      'rune reading tracker',
    ],
    badge: 'new',
  },
  {
    id: 'angel-numbers-journal',
    slug: 'angel-numbers-journal',
    title: 'Angel Numbers Journal',
    tagline: 'Track and decode the numbers showing up in your life.',
    description:
      '75 angel numbers pre-filled with meanings and messages. Sighting log to track when and where you spot numbers. Pattern view groups repeating numbers automatically.',
    whatInside: [
      '75 angel numbers pre-filled with meanings and spiritual messages',
      'Sighting log to record when, where, and how you spotted each number',
      'Pattern view that groups your most-seen numbers automatically',
      'Filter by number family (111s, 222s, 333s, etc.) for quick reference',
      'Notes field on each number page for personal interpretations',
      'Timeline view showing your sightings chronologically',
    ],
    perfectFor: [
      'Those who regularly notice repeating numbers and want to track them.',
      'Anyone building a personal relationship with angel number meanings.',
      'People who want to spot patterns in when certain numbers appear.',
    ],
    price: 900,
    gradient: SHOP_GRADIENTS.hazeToRose,
    tags: [
      'notion',
      'template',
      'digital download',
      'spirituality',
      'angel numbers',
    ],
    keywords: [
      'angel numbers journal notion',
      'angel number tracker',
      'spiritual number template',
    ],
    badge: 'new',
  },
  {
    id: 'digital-grimoire',
    slug: 'digital-grimoire',
    title: 'Digital Grimoire',
    tagline: 'Your complete Book of Shadows in Notion.',
    description:
      'Your complete digital Book of Shadows. Includes spell library, crystal database, chakra guide, herb correspondences, moon ritual planner, and daily practice tracker.',
    whatInside: [
      'Spell library with fields for ingredients, steps, moon phase, and intention',
      'Crystal database with properties, chakra associations, and care notes',
      'Complete chakra guide with correspondences and balancing practices',
      'Herb correspondences reference for spell and ritual work',
      'Moon ritual planner linked to lunar dates',
      'Daily practice tracker for logging rituals, draws, and observations',
    ],
    perfectFor: [
      'Witches and practitioners wanting one digital home for their practice.',
      'Those replacing a physical grimoire with a searchable, linked system.',
      'Anyone building a serious spiritual reference library in Notion.',
    ],
    price: 1200,
    gradient: SHOP_GRADIENTS.nebulaSupernovaRose,
    tags: [
      'notion',
      'template',
      'digital download',
      'spirituality',
      'grimoire',
      'witchcraft',
    ],
    keywords: [
      'digital grimoire notion',
      'book of shadows template',
      'witch notion template',
    ],
    badge: 'new',
  },
];

export function generateNotionTemplates(): ShopProduct[] {
  return NOTION_TEMPLATE_CONFIGS.map((config) => ({
    id: config.id,
    slug: config.slug,
    title: config.title,
    tagline: config.tagline,
    description: config.description,
    category: 'notion_template' as const,
    whatInside: config.whatInside,
    perfectFor: config.perfectFor,
    related: NOTION_TEMPLATE_CONFIGS.filter((c) => c.id !== config.id)
      .slice(0, 3)
      .map((c) => c.slug),
    price: config.price,
    gradient: config.gradient,
    tags: config.tags,
    keywords: config.keywords,
    badge: config.badge,
  }));
}

export function getNotionTemplateBySlug(slug: string): ShopProduct | undefined {
  return generateNotionTemplates().find((t) => t.slug === slug);
}
