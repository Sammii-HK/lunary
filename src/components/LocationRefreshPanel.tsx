'use client';

import { useState } from 'react';
import { MapPin, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import { formatLocation } from '../../utils/location';

type LocationRefreshPanelProps = {
  variant?: 'card' | 'settings';
};

export default function LocationRefreshPanel({
  variant = 'card',
}: LocationRefreshPanelProps) {
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

  const formatCoordinate = (value: unknown, digits: number) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  };

  const containerClasses =
    variant === 'card'
      ? 'w-full max-w-md rounded-lg border border-stroke-default bg-surface-card p-4'
      : 'space-y-3 text-sm text-content-primary';

  const headingClasses =
    variant === 'card'
      ? 'mb-3 flex items-center gap-2'
      : 'flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-content-muted';

  const titleClasses =
    variant === 'card'
      ? 'text-lg font-semibold text-content-primary'
      : 'text-sm font-semibold text-content-primary';

  const labelClasses =
    variant === 'card'
      ? 'mb-1 block text-sm font-medium text-content-secondary'
      : 'mb-1 block text-xs font-medium uppercase tracking-wide text-content-muted';

  const coordinatesClasses =
    variant === 'card'
      ? 'text-sm text-content-primary'
      : 'text-sm font-medium text-content-primary';

  const descriptionClasses =
    variant === 'card'
      ? 'mt-1 text-xs text-content-muted'
      : 'mt-1 text-xs text-content-muted';

  const infoTextClasses =
    variant === 'card'
      ? 'text-center text-xs text-content-muted'
      : 'text-xs text-content-muted';

  const feedbackClasses =
    variant === 'card'
      ? 'flex items-center gap-2 rounded text-sm border px-3 py-2'
      : 'flex items-center gap-2 rounded-md border px-3 py-2 text-xs';

  const successClasses =
    variant === 'card'
      ? `${feedbackClasses} border-lunary-success bg-layer-base/50 text-lunary-success-300`
      : `${feedbackClasses} border-lunary-success-600 bg-layer-deep text-lunary-success-200`;

  const errorClasses =
    variant === 'card'
      ? `${feedbackClasses} border-red-500 bg-red-900/50 text-red-300`
      : `${feedbackClasses} border-red-500/40 bg-red-500/10 text-red-200`;

  return (
    <div className={containerClasses}>
      <div className={headingClasses}>
        <MapPin size={16} className='text-lunary-primary-400' />
        <h3 className={titleClasses}>Location</h3>
      </div>

      <div className='space-y-3'>
        <div>
          <label className={labelClasses}>Current Location</label>
          {location ? (
            <>
              {(() => {
                const latText = formatCoordinate(location.latitude, 4);
                const lonText = formatCoordinate(location.longitude, 4);
                if (!latText || !lonText) {
                  return (
                    <div className='space-y-1'>
                      <p className={coordinatesClasses}>
                        Location pending update
                      </p>
                      <p className={descriptionClasses}>
                        Tip: enable location access in your browser settings.
                      </p>
                    </div>
                  );
                }
                return (
                  <>
                    <p className={coordinatesClasses}>
                      {latText}, {lonText}
                    </p>
                    <p className={descriptionClasses}>
                      {formatLocation(location)}
                    </p>
                  </>
                );
              })()}
            </>
          ) : (
            <p className={coordinatesClasses}>No location set</p>
          )}
        </div>

        {error && (
          <div className={errorClasses}>
            <XCircle size={14} />
            {error}
          </div>
        )}

        {showSuccess && (
          <div className={successClasses}>
            <CheckCircle size={14} />
            Location updated successfully!
          </div>
        )}

        <button
          onClick={handleRefreshLocation}
          disabled={loading}
          className='flex w-full items-center justify-center gap-2 rounded-md bg-lunary-primary-600 px-4 py-2 text-sm text-white transition-colors hover:bg-layer-high disabled:cursor-not-allowed disabled:bg-surface-overlay'
        >
          <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Updating Location...' : 'Refresh Location'}
        </button>

        <div className={infoTextClasses}>
          <p>
            Your location is used to calculate accurate rise/set times and
            astronomical data. It&apos;s saved to your profile and synced across
            devices.
          </p>
        </div>
      </div>
    </div>
  );
}
