'use client';

import Link from 'next/link';
import { useSafeSearchParams } from '@/lib/safeSearchParams';
import { ShopProduct, formatPrice } from '@/lib/shop/types';
import { getProductBySlug } from '@/lib/shop/generators';

interface UpsellSidebarProps {
  products: ShopProduct[];
  currentProduct: ShopProduct;
}

export function UpsellSidebar({
  products,
  currentProduct,
}: UpsellSidebarProps) {
  const searchParams = useSafeSearchParams();
  const fromParam = searchParams?.get('from');
  const linkSuffix = fromParam ? `?from=${fromParam}` : '';

  if (products.length === 0) {
    return null;
  }

  function getBundleSavingPercent(bundle: ShopProduct): number | null {
    if (!bundle.related || bundle.related.length === 0) return null;
    const individualTotal = bundle.related.reduce((sum, slug) => {
      const p = getProductBySlug(slug);
      return sum + (p ? p.price : 0);
    }, 0);
    if (individualTotal <= bundle.price) return null;
    const saving = Math.round(
      ((individualTotal - bundle.price) / individualTotal) * 100,
    );
    return saving > 0 ? saving : null;
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-lg font-medium text-white'>Save with Bundles</h2>

      {products.map((product) => {
        const savingPercent = getBundleSavingPercent(product);
        return (
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
              {savingPercent !== null && (
                <span className='absolute top-3 right-3 z-20 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-800'>
                  Save {savingPercent}%
                </span>
              )}
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
        );
      })}

      <div className='p-4 rounded-xl bg-white/5 border border-white/5'>
        <p className='text-sm text-white/50 text-center'>
          Bundles include {currentProduct.title} and more at a discounted price.
        </p>
      </div>
    </div>
  );
}
