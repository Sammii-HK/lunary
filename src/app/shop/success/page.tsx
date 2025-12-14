'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';

interface PurchaseDetails {
  purchase: {
    id: string;
    packId: string;
    amount: number;
    downloadToken: string;
    currency?: string | null;
  };
  downloadUrl: string;
}

async function safeReadResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  const isJson =
    contentType.includes('application/json') ||
    contentType.includes('application/problem+json');

  if (!isJson) {
    return { kind: 'text' as const, text };
  }

  if (!text) {
    return { kind: 'json' as const, json: null as any };
  }

  try {
    return { kind: 'json' as const, json: JSON.parse(text) };
  } catch {
    // server said json but lied (or returned partial output)
    return { kind: 'text' as const, text };
  }
}

export default function ShopSuccessPage() {
  const searchParams = useSearchParams();
  const [purchaseDetails, setPurchaseDetails] =
    useState<PurchaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setError('No session ID provided.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const run = async () => {
      attempts += 1;

      try {
        const url = `/api/shop/purchases?session_id=${encodeURIComponent(sessionId)}`;
        const response = await fetch(url, { method: 'GET' });

        const payload = await safeReadResponse(response);

        if (!response.ok) {
          // try to extract a friendly error
          let msg = `Failed to fetch purchase details (${response.status}).`;

          if (payload.kind === 'json' && payload.json?.error) {
            msg = payload.json.error;
          } else if (payload.kind === 'text' && payload.text) {
            // avoid dumping a whole HTML doc at the user
            msg =
              response.status === 404
                ? 'Purchase not found yet. Your webhook may still be processing. Please try again in a moment.'
                : `Server returned an unexpected response (${response.status}).`;
          }

          // webhook insert can lag: retry a few times
          if (
            (response.status === 404 || response.status === 409) &&
            attempts < 8
          ) {
            setTimeout(run, 900);
            return;
          }

          throw new Error(msg);
        }

        // success: must be json
        if (payload.kind !== 'json' || !payload.json) {
          throw new Error('Server returned an unexpected response format.');
        }

        if (!cancelled) {
          setPurchaseDetails(payload.json as PurchaseDetails);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Something went wrong.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const handleDownload = () => {
    if (!purchaseDetails?.downloadUrl) return;

    // ✅ opens in a new tab
    window.open(purchaseDetails.downloadUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-lunary-primary-400 mx-auto mb-4' />
          <p className='text-slate-300'>Processing your purchase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center'>
        <div className='text-center max-w-md mx-auto px-4'>
          <div className='text-lunary-error text-6xl mb-6'>⚠️</div>
          <h1 className='text-2xl font-semibold text-white mb-4'>
            Something went wrong
          </h1>
          <p className='text-slate-300 mb-6'>{error}</p>

          <div className='flex gap-3 justify-center'>
            <Button onClick={() => window.location.reload()} variant='lunary'>
              Try again
            </Button>
            <Link
              href='/shop'
              className='inline-block px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors'
            >
              Return to shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-900 to-slate-800'>
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-2xl mx-auto text-center'>
          <div className='justify-self-center mb-8'>
            <Logo size={181} />
          </div>

          <h1 className='text-4xl font-light text-white mb-4'>
            Purchase successful
          </h1>

          <p className='text-xl text-slate-300 mb-8'>
            Your digital pack is ready for download.
          </p>

          {purchaseDetails && (
            <div className='bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 mb-8'>
              <h2 className='text-lg font-medium text-white mb-4'>
                Purchase details
              </h2>

              <div className='space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>Purchase ID:</span>
                  <span className='text-white font-mono'>
                    {purchaseDetails.purchase.id}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-slate-400'>Amount:</span>
                  <span className='text-white'>
                    {(purchaseDetails.purchase.currency || 'usd').toUpperCase()}{' '}
                    {(purchaseDetails.purchase.amount / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6 mb-8'>
            <h2 className='text-lg font-medium text-white mb-3'>
              Download your pack
            </h2>

            <p className='text-slate-300 text-sm mb-6'>
              Your download link is valid for 30 days with up to 5 downloads.
            </p>

            <Button onClick={handleDownload} variant='lunary' size='lg'>
              Download now
            </Button>
          </div>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/shop'
              className='px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors'
            >
              Browse more products
            </Link>

            <Link
              href='/'
              className='px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors'
            >
              Return home
            </Link>
          </div>

          <p className='text-slate-400 text-sm mt-8'>
            A receipt has been sent to your email address.
          </p>
        </div>
      </div>
    </div>
  );
}
