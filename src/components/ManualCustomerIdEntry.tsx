'use client';

import { useState } from 'react';
import { useAccount } from 'jazz-tools/react';
import { Save, User } from 'lucide-react';

export default function ManualCustomerIdEntry() {
  const { me } = useAccount();
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const currentCustomerId = (me?.profile as any)?.stripeCustomerId;

  const handleSave = async () => {
    if (!me?.profile || !customerId.trim()) return;

    setLoading(true);
    try {
      // Save directly to Jazz profile
      (me.profile as any).stripeCustomerId = customerId.trim();
      setSuccess(true);
      setCustomerId('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving customer ID:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (!me?.profile) return;
    (me.profile as any).stripeCustomerId = undefined;
    setSuccess(false);
  };

  return (
    <div className='w-full max-w-md p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg'>
      <div className='flex items-center gap-2 mb-3'>
        <User size={16} className='text-yellow-400' />
        <h3 className='text-lg font-semibold text-white'>Manual Customer ID</h3>
      </div>

      {currentCustomerId && (
        <div className='mb-3 p-2 bg-zinc-800 rounded text-xs'>
          <div className='text-zinc-300'>Current: {currentCustomerId}</div>
          <button
            onClick={handleClear}
            className='text-red-400 hover:text-red-300 text-xs mt-1'
          >
            Clear
          </button>
        </div>
      )}

      <div className='space-y-3'>
        <div>
          <input
            type='text'
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder='Enter Stripe Customer ID (cus_...)'
            className='w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm'
          />
        </div>

        {success && (
          <div className='bg-green-900/50 border border-green-500 text-green-300 px-3 py-2 rounded text-sm'>
            Customer ID saved successfully!
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading || !customerId.trim()}
          className='w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors text-sm'
        >
          <Save size={14} />
          {loading ? 'Saving...' : 'Save Customer ID'}
        </button>

        <div className='text-xs text-zinc-400 text-center'>
          <p>Temporary widget for testing. Enter your Stripe customer ID to debug subscription issues.</p>
        </div>
      </div>
    </div>
  );
} 