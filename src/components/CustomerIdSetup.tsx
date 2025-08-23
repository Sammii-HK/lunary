'use client';

import { useState } from 'react';
import { useAccount } from 'jazz-tools/react';

export default function CustomerIdSetup() {
  const { me } = useAccount();
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSaveCustomerId = async () => {
    if (!customerId.startsWith('cus_')) {
      setError('Customer ID must start with "cus_"');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (me?.profile) {
        (me.profile as any).stripeCustomerId = customerId;
        const response = await fetch('/api/stripe/get-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.hasSubscription) {
            console.log('Found subscription:', data.subscription);
          }
        }

        setSuccess(true);
        setCustomerId('');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      setError('Failed to save customer ID. Please try again.');
      console.error('Customer ID save error:', err);
    } finally {
      setLoading(false);
    }
  };


  const existingCustomerId = (me?.profile as any)?.stripeCustomerId;
  const existingSubscription = (me?.profile as any)?.subscription;

  if (existingCustomerId || (existingSubscription && existingSubscription.status !== 'free')) {
    return null;
  }

  return (
    <div className='w-full max-w-md p-4 bg-orange-900/20 border border-orange-500/50 rounded-lg'>
      <h3 className='text-orange-300 font-semibold mb-3'>🔧 Manual Setup</h3>
      
      <div className='text-sm text-orange-200 mb-4 space-y-2'>
        <p><strong>Backup Setup:</strong> Customer ID wasn't automatically captured during signup.</p>
        <ol className='list-decimal list-inside space-y-1 text-xs'>
          <li>Check your email for Stripe receipts</li>
          <li>Look for "Customer ID" (starts with cus_)</li>
          <li>Enter it below to enable cancellation and billing features</li>
        </ol>
      </div>

      {success && (
        <div className='mb-4 p-3 bg-green-900/50 border border-green-500/50 rounded text-green-200 text-sm'>
          ✅ Customer ID saved! Refreshing page...
        </div>
      )}

      {error && (
        <div className='mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded text-red-200 text-sm'>
          ❌ {error}
        </div>
      )}

      <div className='space-y-3'>
        <input
          type='text'
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          placeholder='cus_abcd1234567890'
          className='w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'
          disabled={loading}
        />
        
        <button
          onClick={handleSaveCustomerId}
          disabled={!customerId || loading}
          className='w-full bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded text-sm font-medium transition-colors'
        >
          {loading ? 'Saving...' : 'Save Customer ID'}
        </button>
      </div>

      <div className='mt-3 text-xs text-orange-300'>
        This is a one-time setup. Your Customer ID will be securely stored in your profile.
      </div>
    </div>
  );
} 