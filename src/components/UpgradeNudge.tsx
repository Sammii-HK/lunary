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
        href='/pricing?nav=app'
        className={`flex items-center gap-2 text-sm text-lunary-accent-400 hover:text-content-brand-accent transition-colors ${className}`}
      >
        <Sparkles className='w-3.5 h-3.5' />
        <span>{message}</span>
      </Link>
    );
  }

  return (
    <div
      className={`relative flex items-center gap-3 px-4 py-3 bg-layer-deep border border-lunary-primary-800 rounded-lg ${className}`}
    >
      <Sparkles className='w-4 h-4 text-lunary-accent-600 flex-shrink-0' />
      <Link
        href='/pricing?nav=app'
        className='flex-1 text-sm text-content-muted hover:text-content-secondary transition-colors'
      >
        {message}
      </Link>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className='text-content-muted hover:text-content-muted transition-colors'
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
      className={`flex items-center justify-between gap-4 px-4 py-3 bg-gradient-to-r from-layer-deep to-transparent border border-lunary-primary-800 rounded-lg ${className}`}
    >
      <div className='flex items-center gap-3'>
        <Sparkles className='w-4 h-4 text-lunary-accent-400' />
        <span className='text-sm text-content-secondary'>
          {feature} available with{' '}
          <Link
            href='/pricing?nav=app'
            className='text-lunary-accent hover:text-content-brand-accent'
          >
            Lunary+
          </Link>
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className='text-content-muted hover:text-content-muted transition-colors'
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
      href='/pricing?nav=app'
      className={`inline-flex items-center gap-1.5 text-xs text-lunary-accent-500 hover:text-content-brand-accent transition-colors ${className}`}
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
      className={`absolute inset-0 flex flex-col items-center justify-center bg-surface-elevated/80 backdrop-blur-sm rounded-lg ${className}`}
    >
      <Sparkles className='w-6 h-6 text-lunary-accent-400 mb-3' />
      <p className='text-sm text-content-secondary text-center mb-1'>
        {feature}
      </p>
      {description && (
        <p className='text-xs text-content-muted text-center mb-3'>
          {description}
        </p>
      )}
      <Link
        href='/pricing?nav=app'
        className='px-4 py-2 text-sm bg-layer-base text-content-brand-accent rounded-lg hover:bg-layer-raised transition-colors'
      >
        Upgrade to Lunary+
      </Link>
    </div>
  );
}
