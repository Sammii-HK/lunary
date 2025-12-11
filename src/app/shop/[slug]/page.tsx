import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
  getUpsellProducts,
} from '@/lib/shop/generators';
import { CATEGORY_LABELS } from '@/lib/shop/types';
import { ProductDetail } from '@/components/shop/ProductDetail';
import { RelatedProducts } from '@/components/shop/RelatedProducts';
import { UpsellSidebar } from '@/components/shop/UpsellSidebar';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const products = getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Lunary Shop',
    };
  }

  const categoryLabel = CATEGORY_LABELS[product.category];
  const title = `${product.title} | ${categoryLabel} | Lunary`;
  const description =
    product.metaDescription ||
    `${product.tagline} ${product.description.slice(0, 120)}...`;

  // Build keywords from product data
  const keywords = [
    product.title.toLowerCase(),
    categoryLabel.toLowerCase(),
    product.category,
    ...(product.tags || []),
    ...(product.keywords || []),
    'digital download',
    'ritual pack',
    'lunary',
  ];

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'Lunary' }],
    creator: 'Lunary',
    publisher: 'Lunary',
    openGraph: {
      title,
      description: product.tagline,
      url: `https://lunary.app/shop/${product.slug}`,
      siteName: 'Lunary',
      images: [
        {
          url: `/api/og/shop/${product.slug}`,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: product.tagline,
      images: [`/api/og/shop/${product.slug}`],
    },
    alternates: {
      canonical: `https://lunary.app/shop/${product.slug}`,
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
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product, 4);
  const upsellProducts = getUpsellProducts(product);

  return (
    <div className='min-h-screen bg-lunary-bg'>
      <ProductDetail product={product} />

      <div className='container mx-auto max-w-6xl px-4 py-16'>
        <div className='grid lg:grid-cols-3 gap-12'>
          <div className='lg:col-span-2'>
            {relatedProducts.length > 0 && (
              <RelatedProducts products={relatedProducts} />
            )}
          </div>

          <div className='lg:col-span-1'>
            {upsellProducts.length > 0 && (
              <UpsellSidebar
                products={upsellProducts}
                currentProduct={product}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
