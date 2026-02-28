'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { useAuthStatus } from './AuthStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { AuthComponent } from './Auth';
import { IOSPaywall } from './IOSPaywall';
import { useModal } from '@/hooks/useModal';
import { Button } from '@/components/ui/button';
import { isFreeFeature } from '@/utils/messaging';
import type { FeatureKey } from '../../utils/pricing';
import { cn } from '@/lib/utils';
import { trackCtaClick } from '@/lib/analytics';
import { getContextualHub } from '@/lib/grimoire/getContextualNudge';

interface SmartTrialButtonProps {
  size?: 'sm' | 'default' | 'lg' | 'xs';
  fullWidth?: boolean;
  feature?: FeatureKey; // Feature name to check if it's free or paid
  hasRequiredData?: boolean; // e.g., has birthday for birth chart features
  className?: string;
}

export function SmartTrialButton({
  size = 'default',
  fullWidth = false,
  feature,
  hasRequiredData,
  className,
}: SmartTrialButtonProps) {
  const authState = useAuthStatus();
  const { isSubscribed, isTrialActive } = useSubscription();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showIOSPaywall, setShowIOSPaywall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    setIsIOS(Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios');
  }, []);
  const pathname = usePathname() || '';

  useModal({
    isOpen: showAuthModal,
    onClose: () => setShowAuthModal(false),
    closeOnClickOutside: false,
  });

  const getButtonConfig = () => {
    // If feature is free, just needs account
    if (feature && isFreeFeature(feature)) {
      if (!authState.isAuthenticated) {
        return {
          text: 'Create your birth chart',
          href: null,
          action: 'modal' as const,
          variant: 'lunary-soft' as const,
        };
      }
      if (!hasRequiredData) {
        return {
          text: 'Add your details',
          href: '/settings',
          action: 'link' as const,
          variant: 'lunary-solid' as const,
        };
      }
      // Already has access - shouldn't show button, but handle gracefully
      return {
        text: 'Open app',
        href: '/app',
        action: 'link' as const,
        variant: 'outline' as const,
      };
    }

    // Paid feature - needs subscription
    if (isSubscribed) {
      return {
        text: 'See what Lunary+ unlocks',
        href: '/pricing',
        action: 'link' as const,
        variant: 'outline' as const,
      };
    }

    if (authState.isAuthenticated && authState.user) {
      // If trial is active, they should be able to access the feature
      // So we don't show a button - the paywall shouldn't be there
      // But if it is, link to app
      return {
        text: isTrialActive ? 'Open app' : 'See what Lunary+ unlocks',
        href: isTrialActive ? '/app' : '/pricing',
        action: 'link' as const,
        variant: 'lunary-soft' as const,
      };
    }

    return {
      text: 'See what Lunary+ unlocks',
      href: null,
      action: 'modal' as const,
      variant: 'lunary-soft' as const,
    };
  };

  const config = getButtonConfig();

  const trackClick = (hrefOverride?: string) => {
    // Use 'universal' fallback to standardize with other CTA tracking
    const hub = getContextualHub(pathname, 'universal');
    trackCtaClick({
      hub,
      ctaId: 'smart_trial',
      location: 'smart_trial_button',
      label: config.text,
      href: hrefOverride ?? config.href ?? undefined,
      pagePath: pathname,
    });
  };

  if (config.action === 'link' && config.href) {
    // On iOS, intercept /pricing links and show native IAP instead
    if (isIOS && config.href === '/pricing') {
      return (
        <>
          <Button
            variant={config.variant}
            size={size}
            className={cn(fullWidth ? 'w-full' : '', className)}
            onClick={() => {
              trackClick();
              setShowIOSPaywall(true);
            }}
          >
            {config.text}
          </Button>
          {showIOSPaywall && (
            <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-4'>
              <div className='bg-zinc-900 rounded-2xl p-6 w-full max-w-md'>
                <IOSPaywall
                  onSuccess={() => setShowIOSPaywall(false)}
                  onDismiss={() => setShowIOSPaywall(false)}
                />
              </div>
            </div>
          )}
        </>
      );
    }

    return (
      <Button
        variant={config.variant}
        size={size}
        className={fullWidth ? 'w-full' : ''}
        asChild
      >
        <Link href={config.href} onClick={() => trackClick(config.href)}>
          {config.text}
        </Link>
      </Button>
    );
  }

  const handleClick = () => {
    trackClick();
    if (config.action === 'modal') {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <Button
        variant={config.variant}
        size={size}
        className={cn(
          `${fullWidth ? 'w-full' : ''} text-xs sm:text-sm break-words`,
          className,
        )}
        onClick={handleClick}
      >
        {config.text}
      </Button>

      {showAuthModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-zinc-900 rounded-lg p-4 sm:p-6 w-full max-w-md relative mx-4 sm:mx-0'>
            <button
              onClick={() => setShowAuthModal(false)}
              className='absolute top-2 right-2 sm:top-4 sm:right-4 text-zinc-400 hover:text-white text-xl'
            >
              ×
            </button>

            <div className='text-center mb-4 sm:mb-6'>
              <h3 className='text-lg sm:text-xl font-bold text-white mb-2'>
                {feature && isFreeFeature(feature)
                  ? 'Create your birth chart'
                  : 'See what Lunary+ unlocks'}
              </h3>
              <p className='text-zinc-300 text-xs sm:text-sm'>
                {feature && isFreeFeature(feature)
                  ? 'Create an account to access this free feature.'
                  : 'Create an account to begin your cosmic journey with a free trial.'}
              </p>
            </div>

            <AuthComponent
              compact={false}
              defaultToSignUp={true}
              onSuccess={() => {
                setShowAuthModal(false);
                if (isIOS) {
                  setShowIOSPaywall(true);
                } else {
                  window.location.href = '/pricing?nav=app';
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
