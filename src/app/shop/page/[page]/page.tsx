// app/shop/page/[page]/page.tsx
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ShopClient } from '../../ShopClient';
import {
  getFeaturedProducts,
  getCurrentSeasonalPack,
} from '@/lib/shop/generators';
import { getShopListingsFromStripe } from '@/lib/shop/catalogue';

export const runtime = 'nodejs';
// Optional caching so Stripe isn’t hit on every request
export const revalidate = 3600;

const PRODUCTS_PER_PAGE = 12;

interface PageProps {
  params: Promise<{ page: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { page } = await params;
  const pageNum = parseInt(page, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    return { title: 'Page Not Found | Lunary Shop' };
  }

  // Only index page 1, noindex subsequent pages
  const shouldIndex = pageNum === 1;

  return {
    title:
      pageNum === 1
        ? 'Digital Ritual Packs & Spell Collections | Lunary Shop'
        : `Shop Page ${pageNum} | Lunary`,
    robots: shouldIndex
      ? { index: true, follow: true }
      : { index: false, follow: true },
    alternates: {
      canonical:
        pageNum === 1
          ? 'https://lunary.app/shop'
          : `https://lunary.app/shop/page/${pageNum}`,
    },
  };
}

export default async function ShopPaginatedPage({ params }: PageProps) {
  const { page } = await params;
  const pageNum = parseInt(page, 10);

  if (pageNum === 1) redirect('/shop');
  if (isNaN(pageNum) || pageNum < 1) notFound();

  // ✅ Stripe SSOT, not local generators
  const allProducts = await getShopListingsFromStripe();

  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  if (pageNum > totalPages) notFound();

  const startIndex = (pageNum - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const products = allProducts.slice(startIndex, endIndex);

  // Featured can stay local, then map to Stripe by slug
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
      products={products}
      featuredProduct={featuredProduct}
      currentPage={pageNum}
      totalPages={totalPages}
      totalProducts={allProducts.length}
      allProductCounts={allProductCounts}
    />
  );
}
