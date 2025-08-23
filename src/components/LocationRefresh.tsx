'use client';

import { useState } from 'react';
import { MapPin, RotateCcw, CheckCircle } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import { formatLocation } from '../../utils/location';

export default function LocationRefresh() {
  const { location, requestLocation, loading, error, isLoggedIn } =
    useLocation();
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isLoggedIn) return null;

  const handleRefreshLocation = async () => {
    await requestLocation();
    if (!error) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className='w-full max-w-md p-4 bg-zinc-800 rounded-lg border border-zinc-700'>
      <div className='flex items-center gap-2 mb-3'>
        <MapPin size={16} className='text-purple-400' />
        <h3 className='text-lg font-semibold text-white'>Location</h3>
      </div>

      <div className='space-y-3'>
        <div>
          <label className='block text-sm font-medium text-zinc-300 mb-1'>
            Current Location
          </label>
          {location ? (
            <>
              <p className='text-white text-sm'>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </p>
              <p className='text-xs text-zinc-400 mt-1'>
                {formatLocation(location)}
              </p>
            </>
          ) : (
            <p className='text-white text-sm'>No location set</p>
          )}
        </div>

        {error && (
          <div className='bg-red-900/50 border border-red-500 text-red-300 px-3 py-2 rounded text-sm'>
            {error}
          </div>
        )}

        {showSuccess && (
          <div className='bg-green-900/50 border border-green-500 text-green-300 px-3 py-2 rounded text-sm flex items-center gap-2'>
            <CheckCircle size={14} />
            Location updated successfully!
          </div>
        )}

        <button
          onClick={handleRefreshLocation}
          disabled={loading}
          className='w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors text-sm'
        >
          <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Updating Location...' : 'Refresh Location'}
        </button>

        <div className='text-xs text-zinc-400 text-center'>
          <p>
            Your location is used to calculate accurate rise/set times and
            astronomical data. It's saved to your profile and synced across
            devices.
          </p>
        </div>
      </div>
    </div>
  );
}
