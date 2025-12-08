'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSubscription } from '../hooks/useSubscription';
import { useAuthStatus } from './AuthStatus';
import { conversionTracking } from '@/lib/analytics';
import { Clock, Zap } from 'lucide-react';

interface TrialReminderProps {
  showWhenDaysRemaining?: number[];
  variant?: 'banner' | 'badge';
  className?: string;
}

export function TrialReminder({
  showWhenDaysRemaining = [7, 5, 3, 1],
  variant = 'banner',
  className = '',
}: TrialReminderProps) {
  const subscription = useSubscription();
  const authState = useAuthStatus();
  const [hasTracked, setHasTracked] = useState(false);

  const { isTrialActive, trialDaysRemaining, isSubscribed } = subscription;

  useEffect(() => {
    if (
      isTrialActive &&
      trialDaysRemaining > 0 &&
      showWhenDaysRemaining.includes(trialDaysRemaining) &&
      !hasTracked
    ) {
      setHasTracked(true);
      conversionTracking.upgradePromptShown(
        `trial_reminder_${trialDaysRemaining}_days`,
      );
    }
  }, [isTrialActive, trialDaysRemaining, showWhenDaysRemaining, hasTracked]);

  if (!isTrialActive || isSubscribed) return null;

  if (!showWhenDaysRemaining.includes(trialDaysRemaining)) return null;

  const handleUpgradeClick = () => {
    conversionTracking.upgradeClicked('trial_reminder');
  };

  const getMessage = () => {
    if (trialDaysRemaining === 1) {
      return 'Last day of your trial! Upgrade to keep your cosmic insights';
    }
    if (trialDaysRemaining <= 3) {
      return `Only ${trialDaysRemaining} days left in your trial`;
    }
    return `${trialDaysRemaining} days left in your trial`;
  };

  if (variant === 'badge') {
    return (
      <Link
        href='/pricing'
        onClick={handleUpgradeClick}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lunary-warning-soft/20 border border-lunary-warning-soft/30 text-lunary-warning-soft text-xs font-medium hover:bg-lunary-warning-soft/30 transition-colors ${className}`}
      >
        <Zap className='w-3 h-3' />
        <span>{trialDaysRemaining} days left</span>
      </Link>
    );
  }

  return (
    <div
      className={`bg-gradient-to-r from-lunary-accent-soft/10 to-lunary-warning-soft/10 border border-lunary-accent-soft/20 rounded-lg p-4 ${className}`}
    >
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Clock className='w-5 h-5 text-lunary-accent-soft' />
          <div>
            <h3 className='text-sm font-medium text-white'>{getMessage()}</h3>
            <p className='text-xs text-gray-400'>
              Continue enjoying personalized cosmic insights
            </p>
          </div>
        </div>
        <Link
          href='/pricing'
          onClick={handleUpgradeClick}
          className='bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap'
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}
