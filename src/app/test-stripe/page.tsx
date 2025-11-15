'use client';

import { useState } from 'react';
import { createCheckoutSession } from '../../../utils/stripe';

export default function TestStripePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testStripe = async () => {
    setLoading(true);
    setResult('');

    try {
      // Test with monthly price ID from environment
      const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;

      if (!monthlyPriceId) {
        setResult(
          '❌ NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID not set in environment variables',
        );
        return;
      }

      setResult('🔄 Creating checkout session...');

      const { sessionId, url } = await createCheckoutSession(
        monthlyPriceId,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      if (sessionId && url) {
        setResult(`✅ Stripe setup working! Session ID: ${sessionId}`);
        console.log('Checkout URL:', url);
      } else {
        setResult('❌ Failed to create checkout session');
      }
    } catch (error) {
      console.error('Stripe test error:', error);
      setResult(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-zinc-900 p-8'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold text-white mb-8'>
          Stripe Integration Test
        </h1>

        <div className='bg-zinc-800 rounded-lg p-6 space-y-6'>
          <div className='space-y-4'>
            <h2 className='text-xl font-semibold text-white'>
              Environment Check
            </h2>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Publishable Key:</span>
                <span
                  className={`${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'text-green-400' : 'text-red-400'}`}
                >
                  {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                    ? '✅ Set'
                    : '❌ Missing'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Monthly Price ID:</span>
                <span
                  className={`${process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ? 'text-green-400' : 'text-red-400'}`}
                >
                  {process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
                    ? '✅ Set'
                    : '❌ Missing'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Yearly Price ID:</span>
                <span
                  className={`${process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID ? 'text-green-400' : 'text-red-400'}`}
                >
                  {process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID
                    ? '✅ Set'
                    : '❌ Missing'}
                </span>
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <h2 className='text-xl font-semibold text-white'>
              Test Checkout Creation
            </h2>
            <button
              onClick={testStripe}
              disabled={loading}
              className='bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors'
            >
              {loading ? 'Testing...' : 'Test Stripe Integration'}
            </button>

            {result && (
              <div className='mt-4 p-4 bg-zinc-700 rounded border-l-4 border-purple-500'>
                <p className='text-white whitespace-pre-wrap'>{result}</p>
              </div>
            )}
          </div>

          <div className='space-y-4'>
            <h2 className='text-xl font-semibold text-white'>
              Setup Instructions
            </h2>
            <div className='text-sm text-zinc-300 space-y-2'>
              <p>1. Create products in Stripe Dashboard</p>
              <p>2. Copy price IDs to .env.local</p>
              <p>3. Add Stripe API keys to .env.local</p>
              <p>4. Click test button above</p>
              <p>5. Check browser console for checkout URL</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
