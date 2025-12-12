import { ShopProduct, SHOP_GRADIENTS, PRICE_TIERS } from '../types';

interface BirthChartPackConfig {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  whatInside: string[];
  perfectFor: string[];
  price: number;
  gradient: string;
}

const BIRTHCHART_PACK_CONFIGS: BirthChartPackConfig[] = [
  {
    id: 'rising-sign-guide',
    slug: 'rising-sign-guide-pack',
    title: 'Rising Sign Guide',
    tagline: 'Understand your cosmic first impression.',
    description:
      'Your rising sign—the constellation on the eastern horizon at your birth—shapes how you appear to others and approach new experiences. This compact guide explores each rising sign in depth, helping you understand your social persona and life path direction.',
    whatInside: [
      'Rising sign meaning and significance explained',
      'All 12 rising sign profiles',
      'How your rising interacts with sun and moon',
      'Rising sign appearance and first impressions',
      'Life path themes by rising sign',
      'Ascendant ruler and its importance',
      'Reflection prompts for your rising',
    ],
    perfectFor: [
      'Those curious about how others perceive them.',
      'Anyone exploring their life path direction.',
      'Beginners learning the basics of birth chart interpretation.',
    ],
    price: PRICE_TIERS.mini,
    gradient: SHOP_GRADIENTS.nebulaToHaze, // Rising/ascendant energy
  },
  {
    id: 'moon-sign-blueprint',
    slug: 'moon-sign-emotional-blueprint-pack',
    title: 'Moon Sign Emotional Blueprint',
    tagline: 'Understand your emotional inner world.',
    description:
      'Your moon sign reveals your emotional nature, needs, and instinctive responses. This guide explores how each moon sign processes feelings, finds comfort, and nurtures themselves and others. Know your emotional blueprint and honour your lunar needs.',
    whatInside: [
      'Moon sign meaning and significance',
      'All 12 moon sign emotional profiles',
      'Emotional needs by moon sign',
      'How to nurture yourself based on your moon',
      'Moon sign in relationships',
      'Monthly moon rituals by sign',
      'Integration journal prompts',
    ],
    perfectFor: [
      'Those seeking to understand their emotional patterns.',
      'Anyone wanting to improve self-care based on their moon.',
      'Those deepening their emotional intelligence.',
    ],
    price: PRICE_TIERS.mini,
    gradient: SHOP_GRADIENTS.lightCometToHaze, // Moon emotional depth
  },
  {
    id: 'big-3-bundle',
    slug: 'big-3-bundle-pack',
    title: 'Big 3 Bundle',
    tagline: 'Sun, Moon, Rising—the trinity of self.',
    description:
      'Your Big Three—sun, moon, and rising signs—form the foundation of your astrological identity. This comprehensive bundle explores how these three placements interact, create your unique personality blend, and guide your life journey. Essential for anyone serious about self-understanding.',
    whatInside: [
      'Deep dive into sun sign meaning',
      'Complete moon sign emotional profile',
      'Rising sign life path guide',
      'How your Big 3 work together',
      '144 Big 3 combination interpretations',
      'Integration worksheet for your specific combo',
      'Ritual for honouring your Big 3',
      'Journal prompts for each placement',
    ],
    perfectFor: [
      'Those seeking to understand their core astrological identity.',
      'Anyone curious how their placements interact.',
      'Those building a foundation for deeper chart study.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.nebulaSupernovaRose, // Trinity of placements blending
  },
  {
    id: 'house-meanings',
    slug: 'house-meanings-pack',
    title: 'House Meanings Pack',
    tagline: 'Understand the twelve life arenas.',
    description:
      "The twelve houses represent different areas of life where planetary energies play out. From self-identity to spirituality, relationships to career, this guide explores each house's meaning and how planets in your houses shape your experience.",
    whatInside: [
      'All 12 houses explained in depth',
      'Life themes and areas for each house',
      'Empty houses and what they mean',
      'House rulers and their significance',
      'Planets in houses interpretations',
      'Angular, succedent, and cadent houses',
      'Worksheet for mapping your chart houses',
    ],
    perfectFor: [
      'Those seeking to understand where life themes manifest.',
      'Anyone wanting to read their birth chart more deeply.',
      'Those tracking which houses transits will affect.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.coolSpectrum, // 12 houses, complete system
  },
];

export function generateBirthChartPacks(): ShopProduct[] {
  return BIRTHCHART_PACK_CONFIGS.map((config) => ({
    id: config.id,
    slug: config.slug,
    title: config.title,
    tagline: config.tagline,
    description: config.description,
    category: 'birthchart' as const,
    whatInside: config.whatInside,
    perfectFor: config.perfectFor,
    related: BIRTHCHART_PACK_CONFIGS.filter((c) => c.id !== config.id).map(
      (c) => c.slug,
    ),
    price: config.price,
    gradient: config.gradient,
  }));
}

export function getBirthChartPackBySlug(slug: string): ShopProduct | undefined {
  return generateBirthChartPacks().find((pack) => pack.slug === slug);
}
