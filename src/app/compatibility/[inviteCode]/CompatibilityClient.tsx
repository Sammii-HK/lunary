'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { BirthDataForm } from '@/components/compatibility/BirthDataForm';
import { SignupGate } from '@/components/compatibility/SignupGate';
import { CompatibilityResult } from '@/components/compatibility/CompatibilityResult';
import { Heading } from '@/components/ui/Heading';

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: '\u2648',
  Taurus: '\u2649',
  Gemini: '\u264A',
  Cancer: '\u264B',
  Leo: '\u264C',
  Virgo: '\u264D',
  Libra: '\u264E',
  Scorpio: '\u264F',
  Sagittarius: '\u2650',
  Capricorn: '\u2651',
  Aquarius: '\u2652',
  Pisces: '\u2653',
};

type Step = 'loading' | 'enter-data' | 'signup-gate' | 'results' | 'error';

interface InviteInfo {
  inviterName: string;
  inviterSign: string;
  referralCode?: string;
}

interface CompatResult {
  score: number;
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspectType: string;
    isHarmonious: boolean;
  }>;
  elementBalance?: Record<string, number>;
  summary?: string;
  inviterName: string;
}

interface CompatibilityClientProps {
  inviteCode: string;
}

const BIRTH_DATA_KEY = 'compat_birth_data';

export function CompatibilityClient({ inviteCode }: CompatibilityClientProps) {
  const { user } = useUser();
  const isAuthenticated = !!user?.id;

  const [step, setStep] = useState<Step>('loading');
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [result, setResult] = useState<CompatResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Fetch invite data on mount
  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const res = await fetch(
          `/api/compatibility/invite?code=${encodeURIComponent(inviteCode)}`,
        );

        if (!res.ok) {
          setError('This compatibility invite has expired or is invalid.');
          setStep('error');
          return;
        }

        const data = await res.json();
        setInviteInfo(data);

        // If authenticated, check for saved birth data and auto-calculate
        if (isAuthenticated) {
          const savedData = sessionStorage.getItem(BIRTH_DATA_KEY);
          if (savedData) {
            const birthData = JSON.parse(savedData);
            sessionStorage.removeItem(BIRTH_DATA_KEY);
            await calculateCompatibility(birthData, data);
            return;
          }
        }

        setStep('enter-data');
      } catch {
        setError('Failed to load invite data');
        setStep('error');
      }
    };

    fetchInvite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteCode, isAuthenticated]);

  const calculateCompatibility = async (
    birthData: { birthDate: string; birthTime?: string },
    invite?: InviteInfo,
  ) => {
    setCalculating(true);
    try {
      const res = await fetch('/api/compatibility/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode,
          birthDate: birthData.birthDate,
          birthTime: birthData.birthTime,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ||
            'Failed to calculate compatibility',
        );
      }

      const data = await res.json();
      setResult(data);
      setStep('results');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to calculate compatibility',
      );
      setStep('error');
    } finally {
      setCalculating(false);
    }
  };

  const handleBirthDataSubmit = async (data: {
    name: string;
    birthDate: string;
    birthTime?: string;
  }) => {
    if (!isAuthenticated) {
      // Store birth data in sessionStorage for after signup
      // lgtm[js/clear-text-storage-of-sensitive-data] — birthDate is the core input for this astrology app, not a secret
      sessionStorage.setItem(BIRTH_DATA_KEY, JSON.stringify(data));
      setStep('signup-gate');
      return;
    }

    await calculateCompatibility(data);
  };

  if (step === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-pulse text-zinc-400'>
          Loading compatibility invite...
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center p-4'>
        <div className='max-w-sm text-center space-y-4'>
          <h1 className='text-lg font-semibold text-white'>
            Something went wrong
          </h1>
          <p className='text-sm text-zinc-400'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <div className='flex-1 p-4'>
        <div className='max-w-md mx-auto space-y-6 py-8'>
          {/* Inviter info */}
          {inviteInfo && step !== 'results' && (
            <div className='text-center space-y-4'>
              <div className='text-5xl'>
                {SIGN_SYMBOLS[inviteInfo.inviterSign] || '\u2606'}
              </div>
              <Heading variant='h2' as='h1'>
                {inviteInfo.inviterName}
              </Heading>
              <p className='text-sm text-zinc-400'>
                wants to check your cosmic compatibility
              </p>
            </div>
          )}

          {/* Step: enter birth data */}
          {step === 'enter-data' && (
            <div className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/50'>
              <h2 className='text-sm font-medium text-zinc-300 mb-4'>
                Enter your birth details
              </h2>
              <BirthDataForm
                onSubmit={handleBirthDataSubmit}
                submitting={calculating}
              />
            </div>
          )}

          {/* Step: signup gate */}
          {step === 'signup-gate' && (
            <SignupGate
              referralCode={inviteInfo?.referralCode}
              inviteCode={inviteCode}
            />
          )}

          {/* Step: results */}
          {step === 'results' && result && (
            <CompatibilityResult
              score={result.score}
              aspects={result.aspects}
              elementBalance={result.elementBalance}
              summary={result.summary}
              inviterName={result.inviterName}
            />
          )}
        </div>
      </div>
    </div>
  );
}
