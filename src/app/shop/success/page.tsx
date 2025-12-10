'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PurchaseDetails {
  purchase: {
    id: string;
    packId: string;
    amount: number;
    downloadToken: string;
  };
  downloadUrl: string;
}

export default function ShopSuccessPage() {
  const searchParams = useSearchParams();
  const [purchaseDetails, setPurchaseDetails] =
    useState<PurchaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const downloadToken = searchParams.get('download_token');

    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    fetchPurchaseDetails(sessionId);
  }, [searchParams]);

  const fetchPurchaseDetails = async (sessionId: string) => {
    try {
      const response = await fetch(
        `/api/shop/purchase?session_id=${sessionId}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch purchase details');
      }

      setPurchaseDetails(data);
    } catch (error: any) {
      console.error('Failed to fetch purchase details:', error);
      setError(error.message || 'Failed to load purchase details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (purchaseDetails?.downloadUrl) {
      window.open(purchaseDetails.downloadUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-lunary-primary-400 mx-auto mb-4'></div>
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
          <Link
            href='/shop'
            className='inline-block px-6 py-3 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white font-medium rounded-lg transition-colors'
          >
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-900 to-slate-800'>
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-2xl mx-auto text-center'>
          {/* Success Icon */}
          <div className='text-lunary-success text-8xl mb-8'>✅</div>

          {/* Success Message */}
          <h1 className='text-4xl font-light text-white mb-4'>
            Purchase Successful!
          </h1>

          <p className='text-xl text-slate-300 mb-8'>
            Thank you for your purchase. Your digital pack is ready for
            download.
          </p>

          {/* Purchase Details */}
          {purchaseDetails && (
            <div className='bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 mb-8'>
              <h2 className='text-lg font-medium text-white mb-4'>
                Purchase Details
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
                    ${(purchaseDetails.purchase.amount / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Download Section */}
          <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6 mb-8'>
            <h2 className='text-lg font-medium text-white mb-3'>
              Download Your Pack
            </h2>

            <p className='text-slate-300 text-sm mb-6'>
              Click the button below to download your digital pack. Your
              download link is valid for 30 days with up to 5 downloads.
            </p>

            <button
              onClick={handleDownload}
              className='w-full sm:w-auto px-8 py-4 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white font-medium rounded-lg transition-colors text-lg'
            >
              📥 Download Now
            </button>
          </div>

          {/* Important Notes */}
          <div className='bg-slate-800/30 rounded-xl p-6 mb-8'>
            <h3 className='text-lg font-medium text-white mb-3'>
              Important Notes
            </h3>

            <div className='text-left space-y-2 text-sm text-slate-300'>
              <p>• Save your download link - you have 5 download attempts</p>
              <p>• Downloads expire after 30 days from purchase</p>
              <p>• Files are provided in PDF format for easy viewing</p>
              <p>• For support, contact us with your purchase ID</p>
            </div>
          </div>

          {/* Navigation */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/shop'
              className='px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors'
            >
              Browse More Products
            </Link>

            <Link
              href='/'
              className='px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors'
            >
              Return Home
            </Link>
          </div>

          {/* Receipt Email Notice */}
          <p className='text-slate-400 text-sm mt-8'>
            A receipt has been sent to your email address.
          </p>
        </div>
      </div>
    </div>
  );
}
