'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShopProduct, formatPrice, CATEGORY_LABELS } from '@/lib/shop/types';

interface RelatedProductsProps {
  products: ShopProduct[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get('from');
  const linkSuffix = fromParam ? `?from=${fromParam}` : '';

  if (products.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className='text-xl font-medium text-white mb-6'>
        You Might Also Like
      </h2>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/shop/${product.slug}${linkSuffix}`}
            className='group block rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-white/10 transition-all'
          >
            <div
              className='aspect-[3/2] p-4 flex flex-col justify-end relative'
              style={{ background: product.gradient }}
            >
              <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent' />
              <div className='relative z-10'>
                <span className='text-xs text-white/60'>
                  {CATEGORY_LABELS[product.category]}
                </span>
                <h3 className='text-base font-medium text-white line-clamp-1'>
                  {product.title}
                </h3>
              </div>
            </div>

            <div className='p-4'>
              <p className='text-sm text-white/50 line-clamp-2 mb-3'>
                {product.tagline}
              </p>
              <div className='flex items-center justify-between'>
                <span className='text-white font-medium'>
                  {formatPrice(product.price)}
                </span>
                <span className='text-xs text-lunary-primary group-hover:text-lunary-accent transition-colors'>
                  View →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
