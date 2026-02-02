// app/shop/page.tsx
import { Metadata } from 'next';
import { ShopClient } from './ShopClient';
import {
  getFeaturedProducts,
  getCurrentSeasonalPack,
} from '@/lib/shop/generators';
import { getShopListingsFromStripe } from '@/lib/shop/catalogue';

const PRODUCTS_PER_PAGE = 12;

// Optional but recommended so this can ISR instead of re-running constantly
export const revalidate = 2592000; // 30 days

export const metadata: Metadata = {
  title: 'Digital Ritual Packs & Spell Collections | Lunary Shop',
  description:
    'Curated packs of rituals, tarot spreads, crystal guides, and cosmic wisdom. Instant digital access to deepen your spiritual practice.',
  alternates: {
    canonical: 'https://lunary.app/shop',
  },
  openGraph: {
    title: 'Digital Ritual Packs & Spell Collections | Lunary Shop',
    description:
      'Curated packs of rituals, tarot spreads, crystal guides, and cosmic wisdom. Instant digital access.',
    url: 'https://lunary.app/shop',
    siteName: 'Lunary',
    type: 'website',
  },
};

export default async function ShopPage() {
  const allProducts = await getShopListingsFromStripe();

  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);

  const featuredLocal = getCurrentSeasonalPack() || getFeaturedProducts()[0];
  const featuredProduct =
    allProducts.find((p) => p.slug === featuredLocal?.slug) || allProducts[0];

  const allProductCounts = {
    all: allProducts.length,
    spell: allProducts.filter((p) => p.category === 'spell').length,
    crystal: allProducts.filter((p) => p.category === 'crystal').length,
    tarot: allProducts.filter((p) => p.category === 'tarot').length,
    seasonal: allProducts.filter((p) => p.category === 'seasonal').length,
    astrology: allProducts.filter((p) => p.category === 'astrology').length,
    birthchart: allProducts.filter((p) => p.category === 'birthchart').length,
    bundle: allProducts.filter((p) => p.category === 'bundle').length,
    retrograde: allProducts.filter((p) => p.category === 'retrograde').length,
  } as const;

  return (
    <ShopClient
      products={allProducts}
      featuredProduct={featuredProduct}
      currentPage={1}
      totalPages={totalPages}
      totalProducts={allProducts.length}
      allProductCounts={allProductCounts}
    />
  );
}
