'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSafeSearchParams } from '@/lib/safeSearchParams';
import { ArrowLeft } from 'lucide-react';
import { ShopProduct, formatPrice, CATEGORY_LABELS } from '@/lib/shop/types';
import { Button } from '../ui/button';

interface ProductDetailProps {
  product: ShopProduct;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const searchParams = useSafeSearchParams();
  const fromParam = searchParams?.get('from');
  const linkSuffix = fromParam ? `?from=${fromParam}` : '';

  const handlePurchase = async () => {
    if (!product.stripePriceId) {
      setPurchaseError('This product is coming soon.');
      return;
    }

    setPurchaseError(null);

    try {
      setIsPurchasing(true);

      const response = await fetch('/api/shop/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packId: product.id,
          stripePriceId: product.stripePriceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.';
      setPurchaseError(message);
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

            <div className='mb-10 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
              <h2 className='text-sm font-medium text-white/50 uppercase tracking-wider mb-5'>
                Questions?
              </h2>
              <div className='space-y-5'>
                {product.category === 'notion_template' ? (
                  <>
                    <div>
                      <p className='text-sm font-medium text-white mb-1'>
                        What format is this?
                      </p>
                      <p className='text-sm text-zinc-400'>
                        A Notion template — once purchased, you&apos;ll receive
                        a unique link to duplicate it directly into your Notion
                        workspace.
                      </p>
                    </div>
                    <div>
                      <p className='text-sm font-medium text-white mb-1'>
                        Do I need a Notion account?
                      </p>
                      <p className='text-sm text-zinc-400'>
                        Yes, a free Notion account is all you need. The template
                        works with any Notion plan.
                      </p>
                    </div>
                    <div>
                      <p className='text-sm font-medium text-white mb-1'>
                        How do I duplicate it?
                      </p>
                      <p className='text-sm text-zinc-400'>
                        Click the link in your purchase email, make sure
                        you&apos;re logged into Notion, then click
                        &apos;Duplicate page&apos; in the top right.
                      </p>
                    </div>
                    <div>
                      <p className='text-sm font-medium text-white mb-1'>
                        Is the template mine to keep?
                      </p>
                      <p className='text-sm text-zinc-400'>
                        Yes — once duplicated, it lives in your workspace
                        forever. You can edit it however you like.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className='text-sm font-medium text-white mb-1'>
                        What format is this?
                      </p>
                      <p className='text-sm text-zinc-400'>
                        A beautifully designed PDF, optimised for screen and
                        print. You&apos;ll receive an instant download link
                        after purchase.
                      </p>
                    </div>
                    <div>
                      <p className='text-sm font-medium text-white mb-1'>
                        How do I access it after buying?
                      </p>
                      <p className='text-sm text-zinc-400'>
                        You&apos;ll be redirected to a download page immediately
                        after checkout. You can download up to 5 times within 30
                        days.
                      </p>
                    </div>
                    <div>
                      <p className='text-sm font-medium text-white mb-1'>
                        Do I need any special software?
                      </p>
                      <p className='text-sm text-zinc-400'>
                        Just a PDF reader — any device works. Adobe Acrobat,
                        Apple Preview, or your browser&apos;s built-in viewer
                        all work perfectly.
                      </p>
                    </div>
                    <div>
                      <p className='text-sm font-medium text-white mb-1'>
                        Can I print it?
                      </p>
                      <p className='text-sm text-zinc-400'>
                        Yes, all packs are print-ready at A4 and US Letter
                        sizes.
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <p className='text-sm font-medium text-white mb-1'>
                    What&apos;s your refund policy?
                  </p>
                  <p className='text-sm text-zinc-400'>
                    As these are instant digital downloads, we don&apos;t offer
                    refunds once the file has been accessed. If you have an
                    issue, email{' '}
                    <a
                      href='mailto:hello@lunary.app'
                      className='text-lunary-primary hover:text-white transition-colors'
                    >
                      hello@lunary.app
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>

            <div className='border-t border-white/10 pt-8 mt-8'>
              <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                <div>
                  <span className='text-3xl font-semibold text-white'>
                    {formatPrice(product.price)}
                  </span>
                  <p className='text-white/40 text-sm mt-1'>
                    {product.category === 'notion_template'
                      ? 'Duplicate to Notion after purchase'
                      : 'Instant digital access'}
                  </p>
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className='w-full sm:w-auto px-8 py-4 hover:shadow-[0_0_20px_#7B7BE880,0_0_40px_#7B7BE840] text-white font-medium transition-all duration-300 disabled:opacity-50'
                  style={{ background: product.gradient }}
                  size='lg'
                >
                  {isPurchasing ? (
                    <span className='flex items-center justify-center gap-2'>
                      <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                      Processing...
                    </span>
                  ) : product.category === 'notion_template' ? (
                    'Get Template'
                  ) : (
                    'Add to Library'
                  )}
                </Button>
              </div>

              {purchaseError && (
                <div className='mt-4 flex items-start justify-between gap-2 rounded-lg bg-red-950/40 border border-red-800/50 px-4 py-3'>
                  <p className='text-sm text-red-300'>{purchaseError}</p>
                  <button
                    onClick={() => setPurchaseError(null)}
                    className='flex-shrink-0 text-red-400 hover:text-red-200'
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
