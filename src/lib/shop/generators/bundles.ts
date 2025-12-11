import { ShopProduct, SHOP_GRADIENTS, PRICE_TIERS } from '../types';
import { generateSeasonalPacks } from './seasonal-packs';

export function generateWheelOfYearBundle(): ShopProduct {
  const sabbatPacks = generateSeasonalPacks().filter(
    (p) => !p.slug.includes('lunar-new-year'),
  );
  const sabbatNames = sabbatPacks.map((p) => p.title.replace(' Pack', ''));

  return {
    id: 'wheel-of-year-bundle',
    slug: 'wheel-of-year-bundle',
    title: 'Wheel of the Year Bundle',
    tagline: 'Walk the entire sacred cycle.',
    description:
      "Journey through all eight sabbats with this complete collection. From Samhain's veil-thinning magic to Litha's solar peak, this bundle contains rituals, correspondences, and practices for every turn of the wheel. Save significantly compared to purchasing each pack individually.",
    category: 'bundle' as const,
    whatInside: [
      'All 8 sabbat packs in one collection',
      ...sabbatNames.map((name) => `${name} rituals and correspondences`),
      'Wheel of the Year overview and calendar',
      'Cross-quarter and quarter-day explanations',
      'Year-long altar rotation guide',
      'Seasonal living practices',
      'Integration rituals between sabbats',
    ],
    perfectFor: [
      'Building a complete annual practice',
      'Those new to the Wheel of the Year',
      'Deepening existing sabbat celebrations',
    ],
    related: sabbatPacks.slice(0, 3).map((p) => p.slug),
    price: PRICE_TIERS.wheelBundle,
    gradient: SHOP_GRADIENTS.cometSupernovaRose, // Complete cycle, multi-sabbat blend
  };
}

export function generateLifetimeAccessBundle(): ShopProduct {
  return {
    id: 'lifetime-library-access',
    slug: 'lifetime-library-access',
    title: 'Complete Library Lifetime Access',
    tagline: 'Every pack. Forever yours.',
    description:
      'Unlock the entire Lunary shop library with a single purchase. This includes every current pack—spells, crystals, tarot, seasonal, astrology, and birth chart guides—plus all future additions at no extra cost. The ultimate investment in your magical practice.',
    category: 'bundle' as const,
    whatInside: [
      'All spell packs (8 packs)',
      'All crystal packs (4 packs)',
      'All tarot packs (5 packs)',
      'All sabbat and seasonal packs (9 packs)',
      'All retrograde packs (3 packs)',
      'All astrology packs including 12 sun season guides',
      'All birth chart packs (4 packs)',
      'Wheel of the Year Bundle',
      'All future pack releases—forever',
      'Priority access to new content',
    ],
    perfectFor: [
      'Serious practitioners wanting everything',
      'Those who prefer lifetime purchases',
      'Building a complete magical library',
    ],
    related: [
      'wheel-of-year-bundle',
      'saturn-return-survival-pack',
      'shadow-excavation-tarot-pack',
    ],
    price: PRICE_TIERS.lifetime,
    gradient: SHOP_GRADIENTS.fullSpectrum, // FULL spectrum - everything included!
  };
}

export function generateBundles(): ShopProduct[] {
  return [generateWheelOfYearBundle(), generateLifetimeAccessBundle()];
}

export function getBundleBySlug(slug: string): ShopProduct | undefined {
  return generateBundles().find((pack) => pack.slug === slug);
}
