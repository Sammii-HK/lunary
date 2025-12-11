import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ShopClient } from '../../ShopClient';
import {
  getAllProducts,
  getFeaturedProducts,
  getCurrentSeasonalPack,
} from '@/lib/shop/generators';

export const PRODUCTS_PER_PAGE = 12;

interface PageProps {
  params: Promise<{
    page: string;
  }>;
}

export async function generateStaticParams() {
  const totalProducts = getAllProducts().length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  return Array.from({ length: totalPages }, (_, i) => ({
    page: String(i + 1),
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { page } = await params;
  const pageNum = parseInt(page, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    return {
      title: 'Page Not Found | Lunary Shop',
    };
  }

  const totalProducts = getAllProducts().length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  if (pageNum > totalPages) {
    return {
      title: 'Page Not Found | Lunary Shop',
    };
  }

  // Only index page 1, noindex subsequent pages
  const shouldIndex = pageNum === 1;

  return {
    title:
      pageNum === 1
        ? 'Digital Ritual Packs & Spell Collections | Lunary Shop'
        : `Shop Page ${pageNum} | Lunary`,
    description:
      pageNum === 1
        ? 'Curated packs of rituals, tarot spreads, crystal guides, and cosmic wisdom. Instant digital access to deepen your spiritual practice.'
        : `Browse our collection of digital ritual packs - Page ${pageNum} of ${totalPages}`,
    keywords: [
      'ritual packs',
      'digital witchcraft',
      'tarot spreads',
      'crystal guides',
      'spell packs',
      'astrology packs',
    ],
    openGraph: {
      title:
        pageNum === 1
          ? 'Digital Ritual Packs & Spell Collections | Lunary Shop'
          : `Shop Page ${pageNum} | Lunary`,
      description:
        'Curated packs of rituals, tarot spreads, crystal guides, and cosmic wisdom.',
      url:
        pageNum === 1
          ? 'https://lunary.app/shop'
          : `https://lunary.app/shop/page/${pageNum}`,
      siteName: 'Lunary',
      type: 'website',
    },
    alternates: {
      canonical:
        pageNum === 1
          ? 'https://lunary.app/shop'
          : `https://lunary.app/shop/page/${pageNum}`,
    },
    robots: shouldIndex
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        }
      : {
          index: false,
          follow: true,
        },
  };
}

export default async function ShopPaginatedPage({ params }: PageProps) {
  const { page } = await params;
  const pageNum = parseInt(page, 10);

  // Redirect page 1 to main shop page
  if (pageNum === 1) {
    redirect('/shop');
  }

  if (isNaN(pageNum) || pageNum < 1) {
    notFound();
  }

  const allProducts = getAllProducts();
  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);

  if (pageNum > totalPages) {
    notFound();
  }

  // Get products for this page
  const startIndex = (pageNum - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const products = allProducts.slice(startIndex, endIndex);

  const featuredProduct =
    pageNum === 1
      ? getCurrentSeasonalPack() || getFeaturedProducts()[0]
      : undefined;

  // Calculate counts for all products
  const allProductCounts = {
    all: allProducts.length,
    spell: allProducts.filter((p) => p.category === 'spell').length,
    crystal: allProducts.filter((p) => p.category === 'crystal').length,
    tarot: allProducts.filter((p) => p.category === 'tarot').length,
    seasonal: allProducts.filter((p) => p.category === 'seasonal').length,
    astrology: allProducts.filter((p) => p.category === 'astrology').length,
    birthchart: allProducts.filter((p) => p.category === 'birthchart').length,
    bundle: allProducts.filter((p) => p.category === 'bundle').length,
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
