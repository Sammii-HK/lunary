'use client';

import Link from 'next/link';
import { ShopProduct, formatPrice } from '@/lib/shop/types';

interface SeasonalHighlightProps {
  product: ShopProduct;
  label?: string;
  linkSuffix?: string;
}

export function SeasonalHighlight({
  product,
  label = 'Seasonal Pick',
  linkSuffix = '',
}: SeasonalHighlightProps) {
  return (
    <Link href={`/shop/${product.slug}${linkSuffix}`} className='block group'>
      <div
        className='relative rounded-2xl overflow-hidden p-8 md:p-10'
        style={{ background: product.gradient }}
      >
        <div className='absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent' />

        <div className='relative z-10 max-w-xl'>
          <span className='inline-block px-3 py-1 text-xs font-medium text-white bg-white/20 backdrop-blur-sm rounded-full mb-4'>
            {label}
          </span>

          <h3 className='text-2xl md:text-3xl font-medium text-white mb-3'>
            {product.title}
          </h3>

          <p className='text-white/80 text-base italic mb-4'>
            {product.tagline}
          </p>

          <p className='text-white/60 text-sm mb-6 line-clamp-2'>
            {product.description}
          </p>

          <div className='flex items-center gap-4'>
            <span className='text-2xl font-semibold text-white'>
              {formatPrice(product.price)}
            </span>
            <span className='px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium group-hover:bg-white/20 transition-colors'>
              Explore Pack →
            </span>
          </div>
        </div>

        <div className='absolute top-0 right-0 w-1/3 h-full opacity-20'>
          <div
            className='w-full h-full'
            style={{
              background:
                'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            }}
          />
        </div>
      </div>
    </Link>
  );
}
