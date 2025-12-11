'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ShopProduct, formatPrice, CATEGORY_LABELS } from '@/lib/shop/types';

interface ProductDetailProps {
  product: ShopProduct;
  stripePriceId?: string;
}

export function ProductDetail({ product, stripePriceId }: ProductDetailProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get('from');
  const linkSuffix = fromParam ? `?from=${fromParam}` : '';

  const handlePurchase = async () => {
    if (!stripePriceId) {
      alert('This product is coming soon.');
      return;
    }

    try {
      setIsPurchasing(true);

      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packId: product.id,
          stripePriceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error: any) {
      alert(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className='min-h-screen bg-lunary-bg'>
      <div
        className='relative py-16 px-4 md:py-24'
        style={{ background: product.gradient }}
      >
        <div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-lunary-bg' />

        {/* Back to Shop Link */}
        <div className='relative z-20 container mx-auto max-w-4xl mb-8'>
          <Link
            href={`/shop${linkSuffix}`}
            className='inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to Shop
          </Link>
        </div>

        <div className='relative z-10 container mx-auto max-w-4xl text-center'>
          <span className='inline-block px-3 py-1 text-xs font-medium text-white/80 bg-white/10 backdrop-blur-sm rounded-full mb-4'>
            {CATEGORY_LABELS[product.category]}
          </span>
          <h1 className='text-3xl md:text-5xl font-medium text-white mb-4'>
            {product.title}
          </h1>
          <p className='text-xl text-white/80 italic max-w-2xl mx-auto'>
            {product.tagline}
          </p>
        </div>
      </div>

      <div className='container mx-auto max-w-4xl px-4 -mt-8 relative z-20'>
        <div className='bg-lunary-bg-deep rounded-2xl border border-white/10 overflow-hidden'>
          <div className='p-8 md:p-10'>
            <p className='text-white/70 text-lg leading-relaxed mb-10'>
              {product.description}
            </p>

            <div className='mb-10'>
              <h2 className='text-lg font-medium text-white mb-4'>
                What's Inside
              </h2>
              <ul className='space-y-3'>
                {product.whatInside.map((item, index) => (
                  <li
                    key={index}
                    className='flex items-start gap-3 text-white/60'
                  >
                    <span className='text-lunary-primary mt-1'>✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {product.perfectFor && product.perfectFor.length > 0 && (
              <div className='mb-10'>
                <h2 className='text-lg font-medium text-white mb-4'>
                  Perfect For
                </h2>
                <ul className='space-y-2'>
                  {product.perfectFor.map((item, index) => (
                    <li
                      key={index}
                      className='flex items-start gap-3 text-white/60'
                    >
                      <span className='text-lunary-accent mt-1'>→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className='border-t border-white/10 pt-8 mt-8'>
              <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                <div>
                  <span className='text-3xl font-semibold text-white'>
                    {formatPrice(product.price)}
                  </span>
                  <p className='text-white/40 text-sm mt-1'>
                    Instant digital access
                  </p>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className='w-full sm:w-auto px-8 py-4 rounded-full text-white font-medium transition-all duration-300 disabled:opacity-50'
                  style={{ background: product.gradient }}
                >
                  {isPurchasing ? (
                    <span className='flex items-center justify-center gap-2'>
                      <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                      Processing...
                    </span>
                  ) : (
                    'Add to Library'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
