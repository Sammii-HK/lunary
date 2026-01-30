'use client';

import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { useSubscription } from '../../../hooks/useSubscription';
import { hasFeatureAccess } from '../../../../utils/pricing';
import { TarotView } from './components/TarotView';
import { conversionTracking } from '@/lib/analytics';
import { useEffect } from 'react';
import { useABTestTracking } from '@/hooks/useABTestTracking';

export default function TarotReadings() {
  const { user, loading } = useUser();
  const authStatus = useAuthStatus();
  const subscription = useSubscription();

  // Track tarot page with A/B tests: cta-copy, tarot-truncation, weekly-lock, paywall-preview
  useABTestTracking('tarot', 'page_viewed', [
    'cta-copy-test',
    'tarot-truncation-length',
    'weekly-lock-style',
    'paywall_preview_style_v1',
  ]);

  // For unauthenticated users, force paid tarot access to false immediately
  // Don't wait for subscription to resolve
  const hasPersonalTarotAccess = !authStatus.isAuthenticated
    ? false
    : hasFeatureAccess(
        subscription.status,
        subscription.plan,
        'personal_tarot',
      );

  useEffect(() => {
    if (!user?.id) return;

    const isPaidUser =
      subscription.plan === 'monthly' || subscription.plan === 'yearly';

    if (hasPersonalTarotAccess && isPaidUser) {
      conversionTracking.personalizedTarotViewed(user.id, subscription.plan);
    } else if (user.id) {
      conversionTracking.tarotViewed(user.id, subscription.plan);
    }
  }, [hasPersonalTarotAccess, user?.id, subscription.plan]);

  // Simple sequential loading checks - prioritize unauthenticated users
  if (authStatus.loading) {
    // Still checking authentication - show loading
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-zinc-400'>Loading your tarot reading...</p>
        </div>
      </div>
    );
  }

  // If authenticated but user data is still loading, show loading
  if (authStatus.isAuthenticated && loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-zinc-400'>Loading your tarot reading...</p>
        </div>
      </div>
    );
  }

  // Otherwise, continue to render content
  return (
    <TarotView
      hasPaidAccess={hasPersonalTarotAccess}
      userName={user?.name}
      userBirthday={user?.birthday}
      user={user}
    />
  );
}
