'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Sparkles } from 'lucide-react';
import { UPGRADE_NUDGES } from '@/lib/notifications/copy-library';

type NudgeType = keyof typeof UPGRADE_NUDGES;

interface UpgradeNudgeProps {
  type: NudgeType;
  className?: string;
  dismissible?: boolean;
  inline?: boolean;
}

export function UpgradeNudge({
  type,
  className = '',
  dismissible = true,
  inline = false,
}: UpgradeNudgeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const message = UPGRADE_NUDGES[type];

  if (inline) {
    return (
      <Link
        href='/pricing'
        className={`flex items-center gap-2 text-sm text-purple-400/80 hover:text-purple-300 transition-colors ${className}`}
      >
        <Sparkles className='w-3.5 h-3.5' />
        <span>{message}</span>
      </Link>
    );
  }

  return (
    <div
      className={`relative flex items-center gap-3 px-4 py-3 bg-purple-500/5 border border-purple-500/10 rounded-lg ${className}`}
    >
      <Sparkles className='w-4 h-4 text-purple-400/60 flex-shrink-0' />
      <Link
        href='/pricing'
        className='flex-1 text-sm text-zinc-400 hover:text-zinc-300 transition-colors'
      >
        {message}
      </Link>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className='text-zinc-600 hover:text-zinc-400 transition-colors'
          aria-label='Dismiss'
        >
          <X className='w-4 h-4' />
        </button>
      )}
    </div>
  );
}

interface UpgradeNudgeBannerProps {
  feature: string;
  className?: string;
}

export function UpgradeNudgeBanner({
  feature,
  className = '',
}: UpgradeNudgeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/10 rounded-lg ${className}`}
    >
      <div className='flex items-center gap-3'>
        <Sparkles className='w-4 h-4 text-purple-400/80' />
        <span className='text-sm text-zinc-300'>
          {feature} available with{' '}
          <Link
            href='/pricing'
            className='text-purple-400 hover:text-purple-300'
          >
            Lunary+
          </Link>
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className='text-zinc-600 hover:text-zinc-400 transition-colors'
        aria-label='Dismiss'
      >
        <X className='w-4 h-4' />
      </button>
    </div>
  );
}

interface UpgradeNudgeInlineProps {
  message?: string;
  className?: string;
}

export function UpgradeNudgeInline({
  message = 'Unlock with Lunary+',
  className = '',
}: UpgradeNudgeInlineProps) {
  return (
    <Link
      href='/pricing'
      className={`inline-flex items-center gap-1.5 text-xs text-purple-400/70 hover:text-purple-300 transition-colors ${className}`}
    >
      <Sparkles className='w-3 h-3' />
      <span>{message}</span>
    </Link>
  );
}

interface UpgradeNudgeOverlayProps {
  feature: string;
  description?: string;
  className?: string;
}

export function UpgradeNudgeOverlay({
  feature,
  description,
  className = '',
}: UpgradeNudgeOverlayProps) {
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 backdrop-blur-sm rounded-lg ${className}`}
    >
      <Sparkles className='w-6 h-6 text-purple-400/80 mb-3' />
      <p className='text-sm text-zinc-300 text-center mb-1'>{feature}</p>
      {description && (
        <p className='text-xs text-zinc-500 text-center mb-3'>{description}</p>
      )}
      <Link
        href='/pricing'
        className='px-4 py-2 text-sm bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors'
      >
        Upgrade to Lunary+
      </Link>
    </div>
  );
}
