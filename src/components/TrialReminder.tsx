'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSubscription } from '../hooks/useSubscription';
import { useAuthStatus } from './AuthStatus';
import { conversionTracking } from '@/lib/analytics';
import { Clock, Zap } from 'lucide-react';
import { Button } from './ui/button';

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
  const _authState = useAuthStatus();
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
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lunary-rose-900 border border-lunary-rose-700 text-lunary-rose text-xs font-medium hover:bg-lunary-rose-800 transition-colors ${className}`}
      >
        <Zap className='w-3 h-3' />
        <span>{trialDaysRemaining} days left</span>
      </Link>
    );
  }

  return (
    <div
      className={`bg-gradient-to-r from-lunary-accent-950 to-lunary-rose-950 border border-lunary-accent-800 rounded-lg p-4 ${className}`}
    >
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Clock className='w-5 h-5 text-lunary-accent' />
          <div>
            <h3 className='text-sm font-medium text-white'>{getMessage()}</h3>
            <p className='text-xs text-gray-400'>
              Continue enjoying personalized cosmic insights
            </p>
          </div>
        </div>
        <Button
          variant='lunary-white'
          size='sm'
          className='rounded-full'
          onClick={handleUpgradeClick}
          asChild
        >
          <Link href='/pricing'>Upgrade Now</Link>
        </Button>
      </div>
    </div>
  );
}
