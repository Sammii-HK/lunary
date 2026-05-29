'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, X } from 'lucide-react';
import {
  getNextMilestone,
  getDaysUntilNextMilestone,
} from '@/lib/notifications/streak-notifications';
import { useIsNativeIOS } from '@/hooks/useNativePlatform';
import { trackCtaClick } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { IOSPaywall } from './IOSPaywall';

interface StreakData {
  current: number;
  longest: number;
  lastCheckIn: string | null;
}

interface StreakBannerProps {
  location: 'horoscope' | 'profile';
  className?: string;
  /**
   * When true, surfaces a small come-back-tomorrow hook beneath the streak
   * (progress toward the next milestone) so the daily visit becomes something
   * to protect. Uses only the already-fetched streak — no extra request.
   */
  showNextMilestone?: boolean;
  /**
   * When the user is on an active trial, the caller passes their trial end
   * date (`subscription.trialEndsAt` while `isTrialActive`). When set, in the
   * future, and the streak is worth keeping (>= 3), a single dismissible
   * loss-aversion line invites them to keep the streak with Pro. This is NOT a
   * paywall: it names an asset the user already owns and gates nothing. The
   * caller must only pass this while the trial is genuinely active so a
   * past_due / dunning user is never told to "keep your streak".
   */
  trialEndsAt?: string;
}

// Streaks below this are not worth a loss-aversion nudge.
const MIN_STREAK_FOR_TRIAL_NUDGE = 3;
// One-time guard so the trial loss-aversion line shows at most once per user.
const TRIAL_NUDGE_SEEN_KEY = 'lunary.streakTrialNudgeSeen';

export function StreakBanner({
  location,
  className = '',
  showNextMilestone = false,
  trialEndsAt,
}: StreakBannerProps) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trialNudgeDismissed, setTrialNudgeDismissed] = useState(true);
  const [showIOSPaywall, setShowIOSPaywall] = useState(false);
  const isIOS = useIsNativeIOS();
  const pathname = usePathname() || '';

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const response = await fetch('/api/streak/check-in', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setStreak(
            data.streak || {
              current: 0,
              longest: 0,
              lastCheckIn: null,
            },
          );
        }
      } catch (error) {
        console.error('[StreakBanner] Failed to fetch streak:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreak();
  }, []);

  // Read the one-time guard on mount. Default to dismissed so the trial line
  // never flashes before we have checked localStorage.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const seen = window.localStorage.getItem(TRIAL_NUDGE_SEEN_KEY);
      setTrialNudgeDismissed(seen === '1');
    } catch {
      setTrialNudgeDismissed(true);
    }
  }, []);

  if (isLoading || !streak || streak.current === 0) {
    return null;
  }

  // Has the user already checked in today? recordCheckIn() fires on dashboard
  // load, so on the dashboard this is effectively always true; the at-risk
  // copy is most useful on surfaces where check-in is not auto-fired.
  const todayISO = new Date().toISOString().split('T')[0];
  const checkedInToday = streak.lastCheckIn === todayISO;
  const atRisk = streak.current > 0 && !checkedInToday;

  // Come-back-tomorrow hook: how many more daily check-ins until the next
  // milestone. Derived from the streak we already have — no extra request.
  const nextMilestone = getNextMilestone(streak.current);
  const daysToNextMilestone = getDaysUntilNextMilestone(streak.current);
  const milestoneHook =
    showNextMilestone && nextMilestone !== null && daysToNextMilestone !== null
      ? daysToNextMilestone === 1
        ? `Check in tomorrow to reach your ${nextMilestone}-day milestone.`
        : `${daysToNextMilestone} more days to your ${nextMilestone}-day milestone.`
      : null;

  // When the streak is at risk, the sub-line becomes a loss-framed nudge to
  // return today and protect what is already built (stronger than the
  // gain-framed milestone hook). Reuses the same milestone helpers.
  const subLine = atRisk
    ? `Open a reading today to keep your ${streak.current}-day streak.`
    : milestoneHook;

  // Trial loss-aversion line: only when an active trial date is supplied (the
  // caller passes this only while isTrialActive), it is genuinely in the
  // future (so a stale past_due trialEndsAt never qualifies), the streak is
  // worth keeping, and the one-time guard has not fired.
  const trialEndDate = trialEndsAt ? new Date(trialEndsAt) : null;
  const trialIsActive =
    trialEndDate !== null && trialEndDate.getTime() > Date.now();
  const trialDaysRemaining = trialIsActive
    ? Math.max(
        1,
        Math.ceil(
          (trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
      )
    : 0;
  const showTrialNudge =
    trialIsActive &&
    streak.current >= MIN_STREAK_FOR_TRIAL_NUDGE &&
    !trialNudgeDismissed;

  const dismissTrialNudge = () => {
    setTrialNudgeDismissed(true);
    try {
      window.localStorage.setItem(TRIAL_NUDGE_SEEN_KEY, '1');
    } catch {
      // localStorage may be unavailable — the in-memory state still hides it.
    }
  };

  const trackTrialCtaClick = () => {
    trackCtaClick({
      ctaId: 'streak_trial_nudge',
      location: `streak_banner_${location}`,
      label: 'Keep my streak',
      href: '/pricing?nav=app',
      pagePath: pathname,
    });
  };

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-layer-deep/30 border border-lunary-rose-800/30'>
        <Flame className='w-4 h-4 text-lunary-rose' />
        <span className='text-sm text-content-secondary'>
          <span className='font-medium text-lunary-rose'>{streak.current}</span>{' '}
          day streak
        </span>
        {streak.current === streak.longest && streak.current > 1 && (
          <span className='text-xs text-lunary-accent-400 ml-1'>
            Personal best!
          </span>
        )}
      </div>
      {subLine && (
        <p
          className={`px-3 text-xs ${
            atRisk ? 'text-lunary-rose' : 'text-content-muted'
          }`}
        >
          {subLine}
        </p>
      )}
      {showTrialNudge && (
        <div className='relative mt-1 max-w-sm rounded-lg bg-layer-deep/30 border border-lunary-rose-800/30 px-4 py-3'>
          <button
            type='button'
            onClick={dismissTrialNudge}
            aria-label='Dismiss'
            className='absolute top-2 right-2 text-content-muted hover:text-content-primary'
          >
            <X className='w-3.5 h-3.5' />
          </button>
          <p className='pr-5 text-xs text-content-secondary'>
            Your {streak.current}-day streak and personalised readings stay with
            Pro. Keep them for {trialDaysRemaining} more day
            {trialDaysRemaining === 1 ? '' : 's'}.
          </p>
          {/* iOS native must route through IAP, not the web checkout, so on
              confirmed native iOS we open the IAP sheet instead of /pricing. */}
          {isIOS === true ? (
            <>
              <Button
                variant='lunary-soft'
                size='sm'
                className='mt-2'
                onClick={() => {
                  trackTrialCtaClick();
                  setShowIOSPaywall(true);
                }}
              >
                Keep my streak
              </Button>
              {showIOSPaywall && (
                <div className='fixed inset-0 bg-surface-base/60 backdrop-blur-sm flex items-end justify-center z-50 p-4'>
                  <div className='bg-surface-elevated rounded-2xl p-6 w-full max-w-md'>
                    <IOSPaywall
                      onSuccess={() => setShowIOSPaywall(false)}
                      onDismiss={() => setShowIOSPaywall(false)}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <Button variant='lunary-soft' size='sm' className='mt-2' asChild>
              <Link href='/pricing?nav=app' onClick={trackTrialCtaClick}>
                Keep my streak
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
