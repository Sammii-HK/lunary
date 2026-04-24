'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSubscription } from '../hooks/useSubscription';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from './AuthStatus';
import { SmartTrialButton } from './SmartTrialButton';
import { conversionTracking, trackEvent } from '@/lib/analytics';
import { Sparkles, Zap, Star, X } from 'lucide-react';
import { Button } from './ui/button';
import { useIsNativeIOS } from '@/hooks/useNativePlatform';
import { iosLabel } from '@/lib/ios-labels';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { getABTestMetadataFromVariant } from '@/lib/ab-test-tracking';

export type UpgradePromptVariant =
  | 'banner'
  | 'card'
  | 'inline'
  | 'modal'
  | 'floating';

type PlanType =
  | 'free'
  | 'lunary_plus'
  | 'lunary_plus_ai'
  | 'lunary_plus_ai_annual';

interface UpgradePromptProps {
  variant?: UpgradePromptVariant;
  featureName?: string;
  title?: string;
  description?: string;
  requiredPlan?: PlanType;
  showTrialCountdown?: boolean;
  className?: string;
  onShow?: () => void;
  /**
   * Modal-only: controls whether the modal is visible.
   * Ignored for non-modal variants. Required for modal variant consumers.
   */
  isOpen?: boolean;
  /**
   * Modal-only: called when the user dismisses the modal via the close
   * button or the backdrop. Ignored for non-modal variants.
   */
  onClose?: () => void;
  /**
   * Optional: fires when the user clicks the primary upgrade CTA (the
   * SmartTrialButton / upgrade link in the modal). Used by callers that
   * own an A/B test wrapping this prompt and need to fire their own
   * per-variant tracking event on click.
   */
  onCtaClick?: () => void;
}

const PLAN_LABELS: Record<PlanType, string> = {
  free: 'Cosmic Explorer',
  lunary_plus: 'Lunary+',
  lunary_plus_ai: 'Lunary+ Pro',
  lunary_plus_ai_annual: 'Lunary+ Pro Annual',
};

const TRIAL_UPSELL_DISMISSAL_KEY = 'trialUpsellDismissed';
const TRIAL_UPSELL_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export function UpgradePrompt({
  variant = 'card',
  featureName,
  title,
  description,
  requiredPlan,
  showTrialCountdown = true,
  className = '',
  onShow,
  isOpen,
  onClose,
  onCtaClick,
}: UpgradePromptProps) {
  const isNativeIOS = useIsNativeIOS();
  const subscription = useSubscription();
  const authState = useAuthStatus();
  const [isDismissed, setIsDismissed] = useState(false);

  const {
    showUpgradePrompt,
    isTrialActive,
    trialDaysRemaining,
    isSubscribed: _isSubscribed,
  } = subscription;

  const { user } = useUser();
  const hasCouponOrDiscount = Boolean(
    (user as any)?.couponId || (user as any)?.hasDiscount,
  );

  // A/B Test: Track upgrade prompt variant
  const upgradePromptVariant = useFeatureFlagVariant('upgrade_prompt_test');

  // Check if trial upsell was dismissed recently
  useEffect(() => {
    if (isTrialActive) {
      const dismissedData = localStorage.getItem(TRIAL_UPSELL_DISMISSAL_KEY);
      if (dismissedData) {
        try {
          const { timestamp } = JSON.parse(dismissedData);
          const timeSinceDismissed = Date.now() - timestamp;
          if (timeSinceDismissed < TRIAL_UPSELL_COOLDOWN_MS) {
            // Still in cooldown period
            setIsDismissed(true);
            return;
          }
        } catch (e) {
          // Invalid data, continue
        }
      }
      setIsDismissed(false);
    }
  }, [isTrialActive]);

  useEffect(() => {
    if (onShow && showUpgradePrompt) {
      onShow();

      // Track with A/B test metadata if available
      const abMetadata = getABTestMetadataFromVariant(
        'upgrade_prompt_test',
        upgradePromptVariant,
      );

      if (abMetadata) {
        // Track as app_opened impression event with A/B test metadata
        trackEvent('app_opened', {
          featureName,
          metadata: abMetadata,
        });
        trackEvent('paywall_shown', {
          userId: authState.user?.id,
          featureName,
          metadata: abMetadata,
        });
      } else {
        conversionTracking.upgradePromptShown(featureName);
        conversionTracking.paywallShown(authState.user?.id, featureName);
      }
    }
  }, [
    onShow,
    showUpgradePrompt,
    featureName,
    authState.user?.id,
    upgradePromptVariant,
  ]);

  // Modal variant is controlled by the caller (via isOpen/onClose) so it
  // bypasses the ambient showUpgradePrompt / dismissal gating. All other
  // variants keep their original gating behaviour.
  const isControlledModal = variant === 'modal';
  if (!isControlledModal) {
    // For trial-specific prompts, only show if user is actually on trial AND not dismissed
    // For general upgrade prompts, show if showUpgradePrompt is true (free users)
    // This prevents showing trial upsells to paid users who are not on trial
    if (isTrialActive && isDismissed) return null;
    if (!isTrialActive && !showUpgradePrompt) return null;
  } else if (!isOpen) {
    return null;
  }

  const planLabel = requiredPlan ? PLAN_LABELS[requiredPlan] : undefined;
  const dayLabel = trialDaysRemaining === 1 ? 'day' : 'days';

  // Don't show trial countdown if user has a coupon/discount
  // They likely have a special deal that continues past trial
  const shouldShowTrialCountdown =
    isTrialActive && !hasCouponOrDiscount && showTrialCountdown;

  const defaultTitle = shouldShowTrialCountdown
    ? `Trial: ${trialDaysRemaining} ${dayLabel} left`
    : planLabel
      ? `Upgrade to ${planLabel}`
      : 'Unlock Personalized Features';

  const defaultDescription = shouldShowTrialCountdown
    ? 'Continue enjoying premium cosmic insights after your trial'
    : planLabel
      ? `This feature requires ${planLabel}. Upgrade to unlock it.`
      : 'Readings personalized to your name, birthday, birth chart, birth time and location';

  const promptTitle = iosLabel(title || defaultTitle, isNativeIOS);
  const promptDescription = iosLabel(
    description || defaultDescription,
    isNativeIOS,
  );

  const handleUpgradeClick = () => {
    // Let the caller fire its own per-variant tracking event first (used by
    // callers that wrap this prompt in their own A/B test).
    onCtaClick?.();

    // Track with A/B test metadata if available
    const abMetadata = getABTestMetadataFromVariant(
      'upgrade_prompt_test',
      upgradePromptVariant,
    );

    if (abMetadata) {
      trackEvent('upgrade_clicked', {
        featureName,
        metadata: abMetadata,
      });
      trackEvent('paywall_accepted', {
        userId: authState.user?.id,
        featureName,
        metadata: abMetadata,
      });
    } else {
      conversionTracking.upgradeClicked(featureName);
      conversionTracking.paywallAccepted(authState.user?.id, featureName);
    }
  };

  const handleDismiss = () => {
    if (shouldShowTrialCountdown) {
      // Store dismissal timestamp for trial upsells
      localStorage.setItem(
        TRIAL_UPSELL_DISMISSAL_KEY,
        JSON.stringify({ timestamp: Date.now() }),
      );
      setIsDismissed(true);
    }
  };

  switch (variant) {
    case 'banner':
      return (
        <div
          className={`bg-gradient-to-r from-layer-base to-lunary-secondary-900 border border-lunary-primary-700 rounded-lg p-4 relative ${className}`}
        >
          {shouldShowTrialCountdown && (
            <button
              onClick={handleDismiss}
              className='absolute top-2 right-2 text-content-muted hover:text-content-primary transition-colors p-1'
              aria-label='Dismiss'
            >
              <X className='w-4 h-4' />
            </button>
          )}
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <Zap className='w-5 h-5 text-lunary-primary' />
              <div>
                <h3 className='text-sm font-medium text-content-primary'>
                  {promptTitle}
                </h3>
                <p className='text-xs text-gray-400'>{promptDescription}</p>
              </div>
            </div>
            <Button
              variant='lunary-white'
              size='sm'
              className='rounded-full'
              onClick={handleUpgradeClick}
              asChild
            >
              <Link
                href={authState.isAuthenticated ? '/pricing?nav=app' : '/auth'}
              >
                {authState.isAuthenticated
                  ? shouldShowTrialCountdown
                    ? 'Continue'
                    : 'Upgrade'
                  : 'Sign In'}
              </Link>
            </Button>
          </div>
        </div>
      );

    case 'card':
      return (
        <div
          className={`bg-surface-elevated border border-stroke-subtle rounded-lg p-4 text-center ${className}`}
        >
          <div className='w-12 h-12 bg-gradient-to-br from-lunary-primary to-lunary-secondary rounded-full flex items-center justify-center mx-auto mb-4'>
            <Star className='w-6 h-6 text-content-primary' />
          </div>
          <h3 className='text-xl font-medium text-content-primary mb-2'>
            {promptTitle}
          </h3>
          <p className='text-sm text-gray-400 mb-6'>{promptDescription}</p>
          <SmartTrialButton fullWidth />
        </div>
      );

    case 'inline':
      return (
        <div className={`text-center py-6 ${className}`}>
          <p className='text-sm text-gray-400 mb-4'>{promptDescription}</p>
          <SmartTrialButton />
        </div>
      );

    case 'modal':
      return (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center p-4'
          role='dialog'
          aria-modal='true'
          aria-labelledby='upgrade-modal-title'
        >
          <button
            type='button'
            aria-label='Close upgrade prompt'
            className='absolute inset-0 bg-surface-base/70 backdrop-blur-sm cursor-default'
            onClick={onClose}
          />
          <div
            className={`relative bg-surface-elevated border border-stroke-default rounded-2xl p-6 max-w-md w-full shadow-xl ${className}`}
          >
            <button
              type='button'
              onClick={onClose}
              className='absolute top-3 right-3 text-content-muted hover:text-content-primary transition-colors p-1'
              aria-label='Dismiss'
            >
              <X className='w-4 h-4' />
            </button>
            <div className='w-12 h-12 bg-gradient-to-br from-lunary-primary to-lunary-secondary rounded-full flex items-center justify-center mx-auto mb-4'>
              <Star className='w-6 h-6 text-content-primary' />
            </div>
            <h3
              id='upgrade-modal-title'
              className='text-xl font-medium text-content-primary mb-2 text-center'
            >
              {promptTitle}
            </h3>
            <p className='text-sm text-gray-400 mb-6 text-center'>
              {promptDescription}
            </p>
            <div className='space-y-3'>
              <div onClick={handleUpgradeClick}>
                <SmartTrialButton fullWidth />
              </div>
              {authState.isAuthenticated && (
                <Link
                  href='/pricing?nav=app'
                  onClick={handleUpgradeClick}
                  className='block text-center text-xs text-content-muted hover:text-content-primary transition-colors'
                >
                  Compare plans
                </Link>
              )}
            </div>
          </div>
        </div>
      );

    case 'floating':
      return (
        <div
          className={`fixed bottom-4 right-4 bg-surface-elevated border border-stroke-default rounded-lg p-4 max-w-sm z-50 shadow-lg ${className}`}
        >
          {shouldShowTrialCountdown && (
            <button
              onClick={handleDismiss}
              className='absolute top-2 right-2 text-content-muted hover:text-content-primary transition-colors p-1'
              aria-label='Dismiss'
            >
              <X className='w-4 h-4' />
            </button>
          )}
          <div className='flex items-start gap-3'>
            <Sparkles className='w-5 h-5 text-lunary-primary mt-0.5 flex-shrink-0' />
            <div className='flex-1'>
              <h3 className='text-sm font-medium text-content-primary mb-1'>
                {promptTitle}
              </h3>
              <p className='text-xs text-gray-400 mb-3'>{promptDescription}</p>
              <Button
                variant='lunary-white'
                size='sm'
                className='rounded-full w-full'
                onClick={handleUpgradeClick}
                asChild
              >
                <Link
                  href={
                    authState.isAuthenticated ? '/pricing?nav=app' : '/auth'
                  }
                >
                  {authState.isAuthenticated
                    ? shouldShowTrialCountdown
                      ? 'Continue Trial'
                      : 'Upgrade now'
                    : 'Sign In'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className={`bg-surface-elevated rounded-lg p-6 ${className}`}>
          <h3 className='text-lg font-medium text-content-primary mb-2'>
            {promptTitle}
          </h3>
          <p className='text-sm text-gray-400 mb-4'>{promptDescription}</p>
          <SmartTrialButton />
        </div>
      );
  }
}
