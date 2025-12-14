import { ShopProduct, ShopCategory } from '../types';
import { generateSpellPacks, getSpellPackBySlug } from './spell-packs';
import { generateCrystalPacks, getCrystalPackBySlug } from './crystal-packs';
import { generateTarotPacks, getTarotPackBySlug } from './tarot-packs';
import {
  generateSeasonalPacks,
  getSeasonalPackBySlug,
  getCurrentSeasonalPack,
} from './seasonal-packs';
import {
  generateRetrogradePacks,
  getRetrogradePackBySlug,
} from './retrograde-packs';
import {
  generateAstrologyPacks,
  getAstrologyPackBySlug,
  getCurrentSunSeasonPack,
} from './astrology-packs';
import {
  generateBirthChartPacks,
  getBirthChartPackBySlug,
} from './birthchart-packs';
import { generateBundles, getBundleBySlug } from './bundles';

let cachedProducts: ShopProduct[] | null = null;

/**
 * Interleave products from different categories for variety
 * Takes products from each category in round-robin fashion
 */
function interleaveProducts(products: ShopProduct[]): ShopProduct[] {
  // Group products by category
  const byCategory = new Map<ShopCategory, ShopProduct[]>();

  products.forEach((product) => {
    const existing = byCategory.get(product.category) || [];
    existing.push(product);
    byCategory.set(product.category, existing);
  });

  // Define preferred category order for interleaving
  const categoryOrder: ShopCategory[] = [
    'spell',
    'crystal',
    'tarot',
    'astrology',
    'seasonal',
    'birthchart',
    'bundle',
  ];

  // Create interleaved array
  const interleaved: ShopProduct[] = [];
  const categoryIndices = new Map<ShopCategory, number>();
  categoryOrder.forEach((cat) => categoryIndices.set(cat, 0));

  let hasMore = true;
  while (hasMore) {
    hasMore = false;
    for (const category of categoryOrder) {
      const categoryProducts = byCategory.get(category) || [];
      const index = categoryIndices.get(category) || 0;

      if (index < categoryProducts.length) {
        interleaved.push(categoryProducts[index]);
        categoryIndices.set(category, index + 1);
        hasMore = true;
      }
    }
  }

  return interleaved;
}

export function getAllProducts(): ShopProduct[] {
  if (cachedProducts) {
    return cachedProducts;
  }

  const products: ShopProduct[] = [
    ...generateSpellPacks(),
    ...generateCrystalPacks(),
    ...generateTarotPacks(),
    ...generateSeasonalPacks(),
    ...generateRetrogradePacks(),
    ...generateAstrologyPacks(),
    ...generateBirthChartPacks(),
    ...generateBundles(),
  ];

  // Interleave products so each page has variety
  cachedProducts = interleaveProducts(products);
  return cachedProducts;
}

export function getProductBySlug(slug: string): ShopProduct | undefined {
  return (
    getSpellPackBySlug(slug) ||
    getCrystalPackBySlug(slug) ||
    getTarotPackBySlug(slug) ||
    getSeasonalPackBySlug(slug) ||
    getRetrogradePackBySlug(slug) ||
    getAstrologyPackBySlug(slug) ||
    getBirthChartPackBySlug(slug) ||
    getBundleBySlug(slug)
  );
}

export function getProductsByCategory(category: ShopCategory): ShopProduct[] {
  return getAllProducts().filter((product) => product.category === category);
}

export function getRelatedProducts(
  product: ShopProduct,
  limit: number = 4,
): ShopProduct[] {
  const allProducts = getAllProducts();
  const relatedSlugs = product.related || [];

  const directRelated = relatedSlugs
    .map((slug) => allProducts.find((p) => p.slug === slug))
    .filter((p): p is ShopProduct => p !== undefined);

  if (directRelated.length >= limit) {
    return directRelated.slice(0, limit);
  }

  const sameCategory = allProducts.filter(
    (p) =>
      p.category === product.category &&
      p.id !== product.id &&
      !relatedSlugs.includes(p.slug),
  );

  return [...directRelated, ...sameCategory].slice(0, limit);
}

export function getFeaturedProducts(): ShopProduct[] {
  const allProducts = getAllProducts();

  const currentSeason = getCurrentSeasonalPack();
  const currentSunSeason = getCurrentSunSeasonPack();

  const featured: ShopProduct[] = [];

  if (currentSeason) {
    featured.push(currentSeason);
  }

  if (currentSunSeason) {
    featured.push(currentSunSeason);
  }

  const bundles = allProducts.filter((p) => p.category === 'bundle');
  featured.push(...bundles);

  const popularPacks = allProducts.filter((p) =>
    [
      'saturn-return-survival-pack',
      'shadow-excavation-tarot-pack',
      'mercury-retrograde-pack',
      'new-moon-manifestation-pack',
    ].includes(p.slug),
  );
  featured.push(...popularPacks);

  const uniqueFeatured = featured.filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i,
  );

  return uniqueFeatured.slice(0, 6);
}

export function getUpsellProducts(currentProduct: ShopProduct): ShopProduct[] {
  const allProducts = getAllProducts();

  const bundles = allProducts.filter(
    (p) => p.category === 'bundle' && p.id !== currentProduct.id,
  );

  if (currentProduct.category === 'seasonal') {
    const wheelBundle = bundles.find((b) => b.slug === 'wheel-of-year-bundle');
    if (wheelBundle) {
      return [wheelBundle, ...bundles.filter((b) => b !== wheelBundle)].slice(
        0,
        2,
      );
    }
  }

  return bundles.slice(0, 2);
}

export function searchProducts(query: string): ShopProduct[] {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return [];

  return getAllProducts().filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm) ||
      product.tagline.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.whatInside.some((item) =>
        item.toLowerCase().includes(searchTerm),
      ),
  );
}

export function getProductStats(): {
  total: number;
  byCategory: Record<ShopCategory, number>;
} {
  const products = getAllProducts();
  const byCategory: Record<ShopCategory, number> = {
    spell: 0,
    crystal: 0,
    tarot: 0,
    seasonal: 0,
    astrology: 0,
    birthchart: 0,
    bundle: 0,
    retrograde: 0,
  };

  products.forEach((p) => {
    byCategory[p.category]++;
  });

  return {
    total: products.length,
    byCategory,
  };
}

export {
  generateSpellPacks,
  generateCrystalPacks,
  generateTarotPacks,
  generateSeasonalPacks,
  generateRetrogradePacks,
  generateAstrologyPacks,
  generateBirthChartPacks,
  generateBundles,
  getCurrentSeasonalPack,
  getCurrentSunSeasonPack,
};
