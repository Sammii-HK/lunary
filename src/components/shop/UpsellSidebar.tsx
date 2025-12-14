'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShopProduct, formatPrice } from '@/lib/shop/types';

interface UpsellSidebarProps {
  products: ShopProduct[];
  currentProduct: ShopProduct;
}

export function UpsellSidebar({
  products,
  currentProduct,
}: UpsellSidebarProps) {
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get('from');
  const linkSuffix = fromParam ? `?from=${fromParam}` : '';

  if (products.length === 0) {
    return null;
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-lg font-medium text-white'>Save with Bundles</h2>

      {products.map((product) => (
        <Link
          key={product.id}
          href={`/shop/${product.slug}${linkSuffix}`}
          className='block rounded-xl overflow-hidden group'
        >
          <div
            className='p-5 relative'
            style={{ background: product.gradient }}
          >
            <div className='absolute inset-0 bg-black/30' />
            <div className='relative z-10'>
              <span className='inline-block px-2 py-0.5 text-xs font-medium text-white/80 bg-white/10 rounded-full mb-2'>
                Bundle
              </span>
              <h3 className='text-lg font-medium text-white mb-1'>
                {product.title}
              </h3>
              <p className='text-sm text-white/70 line-clamp-2 mb-3'>
                {product.tagline}
              </p>
              <div className='flex items-center justify-between'>
                <span className='text-xl font-semibold text-white'>
                  {formatPrice(product.price)}
                </span>
                <span className='text-sm text-white/80 group-hover:text-white transition-colors'>
                  Learn More →
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}

      <div className='p-4 rounded-xl bg-white/5 border border-white/5'>
        <p className='text-sm text-white/50 text-center'>
          Bundles include {currentProduct.title} and more at a discounted price.
        </p>
      </div>
    </div>
  );
}
