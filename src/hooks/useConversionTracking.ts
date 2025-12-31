'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { conversionTracking, type ConversionEvent } from '@/lib/analytics';
import { useAuthStatus } from '@/components/AuthStatus';
import { useSubscription } from './useSubscription';

export function useConversionTracking() {
  const pathname = usePathname();
  const authState = useAuthStatus();
  const subscription = useSubscription();

  useEffect(() => {
    if (pathname === '/pricing') {
      conversionTracking.pricingPageViewed();
    }
  }, [pathname]);

  const trackEvent = (
    event: ConversionEvent,
    data?: {
      featureName?: string;
      planType?: 'monthly' | 'yearly' | 'free';
      trialDaysRemaining?: number;
    },
  ) => {
    const eventData = {
      userId: authState.user?.id,
      userEmail: authState.user?.email,
      planType: subscription.plan,
      trialDaysRemaining: subscription.trialDaysRemaining,
      pagePath: pathname || '',
      ...data,
    };

    switch (event) {
      case 'signup':
        conversionTracking.signup(eventData.userId, eventData.userEmail);
        break;
      case 'trial_started':
        conversionTracking.trialStarted(
          eventData.userId,
          eventData.userEmail,
          eventData.planType as 'monthly' | 'yearly',
        );
        break;
      case 'trial_converted':
        conversionTracking.trialConverted(
          eventData.userId,
          eventData.userEmail,
          eventData.planType as 'monthly' | 'yearly',
        );
        break;
      case 'subscription_started':
        conversionTracking.subscriptionStarted(
          eventData.userId,
          eventData.userEmail,
          eventData.planType as 'monthly' | 'yearly',
        );
        break;
      case 'upgrade_prompt_shown':
        conversionTracking.upgradePromptShown(
          eventData.featureName,
          eventData.pagePath,
        );
        break;
      case 'upgrade_clicked':
        conversionTracking.upgradeClicked(
          eventData.featureName,
          eventData.pagePath,
        );
        break;
      case 'feature_gated':
        if (eventData.featureName) {
          conversionTracking.featureGated(
            eventData.featureName,
            eventData.pagePath,
          );
        }
        break;
      case 'onboarding_completed':
        conversionTracking.onboardingCompleted(eventData.userId);
        break;
      case 'profile_completed':
        conversionTracking.profileCompleted(eventData.userId);
        break;
      case 'birthday_entered':
        conversionTracking.birthdayEntered(eventData.userId);
        break;
      case 'horoscope_viewed':
        conversionTracking.horoscopeViewed(eventData.userId);
        break;
      case 'tarot_viewed':
        conversionTracking.tarotViewed(eventData.userId);
        break;
      case 'birth_chart_viewed':
        conversionTracking.birthChartViewed(eventData.userId);
        break;
    }
  };

  return { trackEvent };
}
