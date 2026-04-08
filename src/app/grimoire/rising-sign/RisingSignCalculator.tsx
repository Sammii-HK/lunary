'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '@/components/AuthStatus';
import { AuthComponent } from '@/components/Auth';
import { useModal } from '@/hooks/useModal';
import { setOnboardingPrefill } from '@/lib/onboarding/prefill';

type RisingSignFormState = {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
};

export function RisingSignCalculator() {
  const router = useRouter();
  const authState = useAuthStatus();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState<RisingSignFormState>({
    birthDate: '',
    birthTime: '',
    birthLocation: '',
  });

  useModal({
    isOpen: showAuthModal,
    onClose: () => setShowAuthModal(false),
    closeOnClickOutside: false,
  });

  useEffect(() => {
    if (showAuthModal && authState.isAuthenticated) {
      setShowAuthModal(false);
      router.push('/app/birth-chart');
    }
  }, [authState.isAuthenticated, router, showAuthModal]);

  const updateField =
    (key: keyof RisingSignFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({
        ...prev,
        [key]: event.target.value,
      }));
    };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const birthDate = formState.birthDate.trim();
    const birthTime = formState.birthTime.trim();
    const birthLocation = formState.birthLocation.trim();

    if (!birthDate || !birthTime || !birthLocation) {
      setError('Add your birth date, exact time, and location to continue.');
      return;
    }

    setOnboardingPrefill({
      birthday: birthDate,
      birthTime,
      birthLocation,
      autoAdvance: true,
      source: 'rising-sign',
    });

    if (authState.isAuthenticated) {
      router.push('/app/birth-chart');
      return;
    }

    setShowAuthModal(true);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className='rounded-2xl border border-stroke-subtle bg-surface-elevated/50 p-6 md:p-8'
      >
        <h2 className='text-lg font-medium text-content-primary mb-2'>
          Calculate Your Rising Sign
        </h2>
        <p className='text-sm text-content-muted mb-4'>
          Enter your birth date, exact time, and location to calculate your
          Ascendant accurately.
        </p>
        <div className='grid gap-4 md:grid-cols-3'>
          <label className='text-sm text-content-secondary'>
            Birth date
            <input
              type='date'
              value={formState.birthDate}
              onChange={updateField('birthDate')}
              className='mt-2 w-full rounded-lg border border-stroke-default bg-surface-base/60 px-3 py-2 text-sm text-content-primary'
              required
            />
          </label>
          <label className='text-sm text-content-secondary'>
            Exact time
            <input
              type='time'
              value={formState.birthTime}
              onChange={updateField('birthTime')}
              className='mt-2 w-full rounded-lg border border-stroke-default bg-surface-base/60 px-3 py-2 text-sm text-content-primary'
              required
            />
          </label>
          <label className='text-sm text-content-secondary'>
            Birth location
            <input
              type='text'
              value={formState.birthLocation}
              onChange={updateField('birthLocation')}
              placeholder='City, Country'
              className='mt-2 w-full rounded-lg border border-stroke-default bg-surface-base/60 px-3 py-2 text-sm text-content-primary'
              required
            />
          </label>
        </div>
        {error ? (
          <p className='mt-3 text-xs text-rose-300'>{error}</p>
        ) : (
          <p className='mt-3 text-xs text-content-muted'>
            We&apos;ll use this to prefill your chart after you sign up.
          </p>
        )}
        <div className='mt-4'>
          <button
            type='submit'
            disabled={authState.loading}
            className='inline-flex items-center justify-center rounded-lg bg-lunary-primary px-4 py-2 text-sm font-medium text-white hover:bg-lunary-primary-400 transition-colors disabled:cursor-not-allowed disabled:opacity-60'
          >
            Calculate rising sign
          </button>
        </div>
      </form>

      {showAuthModal && (
        <div className='fixed inset-0 bg-surface-base/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-surface-elevated rounded-lg p-4 sm:p-6 w-full max-w-md relative mx-4 sm:mx-0'>
            <button
              onClick={() => setShowAuthModal(false)}
              className='absolute top-2 right-2 sm:top-4 sm:right-4 text-content-muted hover:text-content-primary text-xl'
              aria-label='Close sign up modal'
            >
              ×
            </button>

            <div className='text-center mb-4 sm:mb-6'>
              <h3 className='text-lg sm:text-xl font-bold text-content-primary mb-2'>
                Sign up to see your rising sign
              </h3>
              <p className='text-content-secondary text-xs sm:text-sm'>
                Create your account and we&apos;ll calculate it instantly.
              </p>
            </div>

            <AuthComponent
              compact={false}
              defaultToSignUp={true}
              onSuccess={() => {
                setShowAuthModal(false);
                router.push('/app/birth-chart');
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
