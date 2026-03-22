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
  {
    id: 'shadow-work-journal',
    slug: 'shadow-work-journal',
    title: 'Shadow Work Journal',
    tagline: "Explore what you've hidden. Reclaim what you've disowned.",
    description:
      'A guided companion for shadow integration. Includes a daily shadow log, trigger journal, inner critic work, 12 pre-filled shadow archetypes with healing prompts, integration tracker, and a reference library with 30 prompts and somatic practices.',
    whatInside: [
      'Daily Shadow Log with pre-filled example entries to show the practice in action',
      'Trigger Journal with 5 example entries linking triggers to root wounds',
      'Inner Critic Work table plus all 12 shadow archetypes with root wounds and healing prompts',
      '30 shadow work prompts across 5 themes: childhood, relationships, work, body, and spirituality',
      'Integration Tracker to log shifts and breakthroughs over time',
      'Somatic practices, book recommendations, and affirmations for each archetype',
    ],
    perfectFor: [
      'Anyone beginning shadow work who wants structured guidance rather than a blank page.',
      'Those in therapy or self-development who want a Notion home for their inner work.',
      'Astrology and spiritual practitioners ready to go deeper with their 8th house, Pluto, or South Node.',
    ],
    price: 1200,
    gradient: SHOP_GRADIENTS.nebulaToSupernova,
    tags: [
      'notion',
      'template',
      'digital download',
      'shadow work',
      'inner work',
      'psychology',
      'spirituality',
    ],
    keywords: [
      'shadow work journal notion',
      'shadow work template',
      'inner work notion',
    ],
    badge: 'new',
  },
  {
    id: 'dream-journal',
    slug: 'dream-journal',
    title: 'Dream Journal',
    tagline: 'Your nightly transmissions, recorded and decoded.',
    description:
      'A complete dream tracking system with 5 pre-filled dream entries, a 60+ symbol library with universal and shadow meanings, moon phase correlation tracker, pattern analysis tables, and a full lucid dreaming log with technique tracker and dream incubation guide.',
    whatInside: [
      '5 vivid pre-filled dream entries showing exactly how to log and interpret',
      '60+ symbol library covering animals, people, places, and themes with universal and shadow meanings',
      'Pattern Tracker with recurring elements log, monthly themes table, and moon phase correlation chart',
      'Lucid Dreaming Log with technique tracker and 2 example lucid dream entries',
      '5 lucid dreaming techniques with step-by-step instructions',
      'Dream incubation practice guide: how to ask your dreams a question before sleep',
    ],
    perfectFor: [
      'Anyone who wants to remember, understand, and learn from their dreams.',
      'Spiritual practitioners exploring the unconscious through lunar cycles.',
      'Those interested in lucid dreaming who want a structured practice log.',
    ],
    price: 1000,
    gradient: SHOP_GRADIENTS.cometToHaze,
    tags: [
      'notion',
      'template',
      'digital download',
      'dreams',
      'lucid dreaming',
      'spirituality',
      'psychology',
    ],
    keywords: [
      'dream journal notion template',
      'dream log notion',
      'lucid dreaming journal',
    ],
    badge: 'new',
  },
  {
    id: 'oracle-card-journal',
    slug: 'oracle-card-journal',
    title: 'Oracle Card Journal',
    tagline: 'Your daily draws, readings, and card wisdom in one place.',
    description:
      'A complete oracle practice system with a daily draw log, 25 pre-filled card library entries across 5 popular decks, reading journal with 6 spread guides, and deck management tools including a moon charging planner and cleansing log.',
    whatInside: [
      '25 pre-filled card library entries across Work Your Light, Wild Unknown Animal Spirit, Moonology, Sacred Forest, and Moon Oracle decks',
      'Daily Draw Log with 7 example entries showing how to capture card, reflection, and mood',
      'Reading Journal with 4 pre-filled full reading entries and 6 spread guides',
      "Deck Notes table for tracking each deck's personality, strengths, and purchase date",
      'Moon charging planner and cleansing log with 7 cleansing methods',
      'Techniques for reading reversals and developing intuitive reading',
    ],
    perfectFor: [
      'Oracle card readers who want a single searchable home for all their decks.',
      'Those building a daily draw habit who want structured guidance.',
      'Anyone who wants to deepen their relationship with their cards over time.',
    ],
    price: 1000,
    gradient: SHOP_GRADIENTS.supernovaToHaze,
    tags: [
      'notion',
      'template',
      'digital download',
      'spirituality',
      'oracle cards',
      'tarot',
    ],
    keywords: [
      'oracle card journal notion',
      'oracle deck tracker',
      'oracle reading log notion',
    ],
    badge: 'new',
  },
  {
    id: 'chakra-healing-tracker',
    slug: 'chakra-healing-tracker',
    title: 'Chakra Healing Tracker',
    tagline: 'Map your energy body. Balance your centres. Track what shifts.',
    description:
      'A complete chakra system with daily check-in scoring, 7 fully detailed chakra pages (crystals, affirmations, yoga poses, journal prompts), healing practice log, and monthly balance assessment. 14 pre-filled check-in rows show the practice in action.',
    whatInside: [
      'Daily Check-In table with 14 pre-filled rows showing realistic energy patterns over time',
      '7 fully detailed chakra pages: Sanskrit name, element, colour, sound, crystals, affirmations, yoga poses, and healing practices',
      'In balance, blocked, and overactive states described for every chakra',
      'Healing Log with 10 pre-filled practice entries showing before and after energy ratings',
      'Monthly balance assessment table to track long-term patterns',
      'Journal prompts for each chakra to guide deeper inner work',
    ],
    perfectFor: [
      'Energy healers and practitioners wanting a structured daily tracking system.',
      'Those exploring chakra work for the first time who need a complete reference.',
      'Anyone using crystals, yoga, or meditation to balance their energy body.',
    ],
    price: 1000,
    gradient: SHOP_GRADIENTS.roseToSupernova,
    tags: [
      'notion',
      'template',
      'digital download',
      'spirituality',
      'chakras',
      'energy healing',
    ],
    keywords: [
      'chakra healing tracker notion',
      'chakra journal template',
      'chakra balancing notion',
    ],
    badge: 'new',
  },
  {
    id: 'crystal-collection-manager',
    slug: 'crystal-collection-manager',
    title: 'Crystal Collection Manager',
    tagline: 'Know every stone you own. Care for them properly.',
    description:
      'A complete crystal management system with 30 pre-filled crystal entries, a collection tracker, 2026 moon charging calendar with sign-appropriate crystal pairings, crystal care log, and safety guides for water and sunlight sensitivity.',
    whatInside: [
      '30 pre-filled crystal entries with properties, chakra associations, intentions, and hardness ratings',
      'Collection Tracker with 8 example rows showing how to log acquisition date, source, and purpose',
      '2026 Moon Charging Planner with all 12 full moons pre-filled with sign and recommended crystals',
      'Crystal Care Log with 10 example entries and 3 cleansing method guides',
      'Water-unsafe crystal list and sun-fade warning list to protect your collection',
      'Gallery and list views for browsing by chakra, element, or intention',
    ],
    perfectFor: [
      'Crystal collectors who want a searchable inventory of everything they own.',
      'Those who work with crystals intentionally and want to track charging and cleansing.',
      'Anyone who has lost track of what their crystals do and wants a complete reference.',
    ],
    price: 1200,
    gradient: SHOP_GRADIENTS.cometToRose,
    tags: [
      'notion',
      'template',
      'digital download',
      'spirituality',
      'crystals',
      'crystal healing',
    ],
    keywords: [
      'crystal collection manager notion',
      'crystal database notion template',
      'crystal tracker notion',
    ],
    badge: 'new',
  },
  {
    id: 'wheel-of-the-year-planner',
    slug: 'wheel-of-the-year-planner',
    title: 'Wheel of the Year Planner',
    tagline: 'Live in rhythm with the 8 sacred turning points of the year.',
    description:
      'A complete pagan and Wiccan seasonal planner with all 8 sabbat dates for 2026 pre-filled, fully detailed sabbat pages (history, correspondences, rituals, journal prompts), and a ritual log to track your practice across the year.',
    whatInside: [
      'All 8 sabbat dates for 2026 pre-filled: Imbolc, Ostara, Beltane, Litha, Lughnasadh, Mabon, Samhain, Yule',
      '8 fully detailed sabbat toggles with history, energy description, and themes',
      'Complete correspondence tables for each sabbat: colours, herbs, crystals, deities, and foods',
      '3 complete rituals per sabbat with step-by-step instructions',
      '5 journal prompts per sabbat for reflection and intention-setting',
      'Ritual Log to record your practice and revisit what worked across seasons',
    ],
    perfectFor: [
      'Pagans, Wiccans, and witches who want a structured year of seasonal practice.',
      'Those new to the wheel of the year who want a complete reference and guide.',
      "Anyone wanting to reconnect with nature's rhythms through ritual and reflection.",
    ],
    price: 1200,
    gradient: SHOP_GRADIENTS.hazeToSupernova,
    tags: [
      'notion',
      'template',
      'digital download',
      'spirituality',
      'pagan',
      'wicca',
      'wheel of the year',
    ],
    keywords: [
      'wheel of the year notion',
      'sabbat planner template',
      'pagan calendar notion',
    ],
    badge: 'new',
  },
  {
    id: 'astrology-birth-chart-journal',
    slug: 'astrology-birth-chart-journal',
    title: 'Astrology Birth Chart Journal',
    tagline: 'Understand your natal chart. Track how transits shape your life.',
    description:
      'A complete birth chart companion with 15 pre-filled natal placements, a transit tracker, planetary returns log, and house activations journal. Understand every planet in your chart and track how current transits activate it.',
    whatInside: [
      '15 pre-filled natal placements: all 10 planets, Chiron, North Node, South Node, Ascendant, and Midheaven with keywords and themes',
      'Transit Tracker with 10 example 2026 entries — aspect, natal planet, area of life, journal entry, and star rating',
      'Planetary Returns Log covering Solar, Lunar, Saturn, Jupiter, and Chiron returns with intention fields',
      'House Activations Journal — all 12 houses with life area descriptions and journal prompts',
      'Understanding your chart guide: elements, modalities, chart shapes, dignities, and houses at a glance',
      'Quick reference callout for your Big Three: Sun, Moon, and Rising',
    ],
    perfectFor: [
      'Anyone who wants to go beyond sun sign horoscopes and truly understand their chart.',
      'Those tracking how current transits are affecting their life and decisions.',
      'Astrology students building a personal reference and reflection log.',
    ],
    price: 1200,
    gradient: SHOP_GRADIENTS.nebulaToComet,
    tags: [
      'notion',
      'template',
      'digital download',
      'astrology',
      'birth chart',
      'spirituality',
    ],
    keywords: [
      'astrology birth chart journal notion',
      'natal chart tracker notion',
      'transit journal template',
    ],
    badge: 'new',
  },
  {
    id: 'manifestation-journal',
    slug: 'manifestation-journal',
    title: 'Manifestation Journal',
    tagline: 'Align your energy. Script your reality. Track the evidence.',
    description:
      'A complete manifestation system with a scripting database, monthly intentions tracker, evidence log, gratitude log, and 30-affirmation library. 5 pre-filled scripts, 15 evidence entries, and 3 months of example intentions show you exactly how to use it.',
    whatInside: [
      '5 vivid pre-filled scripts across career, love, abundance, health, and home — written in present-tense "as if" style',
      'Monthly Intentions database with 3 months pre-filled: New Moon sign, intentions, releasing, mid-month check-in, and Full Moon reflection',
      'Evidence Log with 15 example sightings: synchronicities, number patterns, unexpected money, and emotional shifts',
      'Gratitude Log with 10 entries across relationships, body, time, creativity, and the practice itself',
      '30-affirmation library across 7 categories with moon phase recommendations and personalisation notes',
      'The 369 Method guide, scripting tips, and moon phase manifestation guide',
    ],
    perfectFor: [
      'Anyone building a consistent manifestation practice who wants more than a blank journal.',
      'Those who work with new and full moons and want a structured intentions system.',
      'People exploring law of attraction who want a searchable, trackable digital system.',
    ],
    price: 1200,
    gradient: SHOP_GRADIENTS.hazeToRose,
    tags: [
      'notion',
      'template',
      'digital download',
      'manifestation',
      'law of attraction',
      'spirituality',
    ],
    keywords: [
      'manifestation journal notion',
      'scripting template notion',
      'law of attraction journal notion',
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
