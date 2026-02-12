'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';

interface SignupGateProps {
  referralCode?: string;
  inviteCode: string;
}

export function SignupGate({ referralCode, inviteCode }: SignupGateProps) {
  const signupUrl = referralCode
    ? `/signup?ref=${encodeURIComponent(referralCode)}&redirect=/compatibility/${encodeURIComponent(inviteCode)}`
    : `/signup?redirect=/compatibility/${encodeURIComponent(inviteCode)}`;

  return (
    <div className='text-center space-y-6 py-8'>
      {/* Animated teaser */}
      <div className='relative mx-auto w-32 h-32'>
        {/* Pulsing score circle */}
        <div className='absolute inset-0 rounded-full border-4 border-lunary-primary-500/30 animate-pulse' />
        <div className='absolute inset-2 rounded-full border-2 border-lunary-primary-400/20 animate-pulse delay-75' />
        <div className='flex items-center justify-center w-full h-full'>
          <span className='text-4xl font-bold text-lunary-primary-400/60'>
            ?
          </span>
        </div>
      </div>

      {/* Blurred aspect previews */}
      <div className='space-y-2 max-w-xs mx-auto'>
        {[
          'Strong connection in Venus aspects',
          'Moon harmony detected',
          'Mars energy exchange',
        ].map((text) => (
          <div
            key={text}
            className='px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 blur-sm select-none'
          >
            <p className='text-sm text-zinc-300'>{text}</p>
          </div>
        ))}
      </div>

      <div className='space-y-3'>
        <Lock className='w-5 h-5 text-lunary-primary-400 mx-auto' />
        <h2 className='text-lg font-semibold text-white'>
          Your results are ready!
        </h2>
        <p className='text-sm text-zinc-400 max-w-sm mx-auto'>
          Create a free account to reveal your cosmic compatibility
        </p>

        <Link
          href={signupUrl}
          className='inline-flex items-center justify-center px-8 py-3 text-sm font-medium rounded-lg bg-lunary-primary-600 hover:bg-lunary-primary-500 text-white transition-colors'
        >
          Sign Up Free to See Results
        </Link>
      </div>
    </div>
  );
}
