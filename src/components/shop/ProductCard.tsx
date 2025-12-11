'use client';

import Link from 'next/link';
import { ShopProduct, formatPrice, CATEGORY_LABELS } from '@/lib/shop/types';

interface ProductCardProps {
  product: ShopProduct;
  priority?: boolean;
  linkSuffix?: string;
}

export function ProductCard({
  product,
  priority = false,
  linkSuffix = '',
}: ProductCardProps) {
  return (
    <Link
      href={`/shop/${product.slug}${linkSuffix}`}
      className='group block rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-lunary-primary/10'
    >
      <article className='h-full flex flex-col'>
        <div
          className='px-4 py-6 flex flex-col justify-end relative overflow-hidden'
          style={{ background: product.gradient }}
        >
          <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent' />
          <div className='relative z-10'>
            <span className='inline-block px-2 py-0.5 text-[10px] font-medium text-white/80 bg-white/10 backdrop-blur-sm rounded-full mb-1.5'>
              {CATEGORY_LABELS[product.category]}
            </span>
            <h3 className='text-base font-medium text-white leading-snug'>
              {product.title}
            </h3>
          </div>
        </div>

        <div className='flex-1 bg-lunary-bg p-5 flex flex-col border border-white/5 border-t-0 rounded-b-2xl'>
          <p className='text-white/70 text-sm italic mb-3 line-clamp-2'>
            {product.tagline}
          </p>

          <p className='text-white/50 text-sm mb-4 line-clamp-2 flex-1'>
            {product.description}
          </p>

          <div className='flex items-center justify-between mt-auto pt-3 border-t border-white/5'>
            <span className='text-lg font-semibold text-white'>
              {formatPrice(product.price)}
            </span>
            <span className='text-sm text-lunary-primary group-hover:text-lunary-accent transition-colors'>
              View Pack →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
