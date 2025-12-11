import { Metadata } from 'next';
import { ShopClient } from './ShopClient';
import {
  getAllProducts,
  getFeaturedProducts,
  getCurrentSeasonalPack,
} from '@/lib/shop/generators';

export const PRODUCTS_PER_PAGE = 12;

export const metadata: Metadata = {
  title: 'Digital Ritual Packs & Spell Collections | Lunary Shop',
  description:
    'Curated packs of rituals, tarot spreads, crystal guides, and cosmic wisdom. Instant digital access to deepen your spiritual practice. 100+ packs for witchcraft, astrology, and moon magic.',
  keywords: [
    'ritual packs',
    'digital witchcraft',
    'tarot spreads',
    'crystal guides',
    'spell packs',
    'astrology packs',
    'moon magic',
    'witchcraft downloads',
    'spiritual digital products',
  ],
  authors: [{ name: 'Lunary' }],
  creator: 'Lunary',
  publisher: 'Lunary',
  openGraph: {
    title: 'Digital Ritual Packs & Spell Collections | Lunary Shop',
    description:
      'Curated packs of rituals, tarot spreads, crystal guides, and cosmic wisdom. Instant digital access.',
    url: 'https://lunary.app/shop',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/shop',
        width: 1200,
        height: 630,
        alt: 'Lunary Shop - Digital Ritual Packs',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Ritual Packs & Spell Collections | Lunary Shop',
    description:
      '100+ curated packs of rituals, tarot spreads, crystal guides, and cosmic wisdom.',
    images: ['/api/og/shop'],
  },
  alternates: {
    canonical: 'https://lunary.app/shop',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function ShopPage() {
  const allProducts = getAllProducts();
  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  const products = allProducts.slice(0, PRODUCTS_PER_PAGE);
  const featuredProduct = getCurrentSeasonalPack() || getFeaturedProducts()[0];

  return (
    <ShopClient
      products={products}
      featuredProduct={featuredProduct}
      currentPage={1}
      totalPages={totalPages}
      totalProducts={allProducts.length}
    />
  );
}
