'use client';

import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { useSubscription } from '../../../hooks/useSubscription';
import { hasFeatureAccess } from '../../../../utils/pricing';
import { TarotView } from './components/TarotView';
import { useABTestTracking } from '@/hooks/useABTestTracking';
import { SkillProgressWidget } from '@/components/progress/SkillProgressWidget';
import { conversionTracking } from '@/lib/analytics';
import { useEffect } from 'react';

export default function TarotReadings() {
  const { user, loading } = useUser();
  const authStatus = useAuthStatus();
  const subscription = useSubscription();

  // Track one tarot page view. CTA/test-specific impressions are tracked separately.
  useABTestTracking('tarot', 'page_viewed', []);

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
    if (authStatus.loading || loading || subscription.loading) return;
    if (!user?.id) return;

    const isPaidUser =
      subscription.plan === 'monthly' || subscription.plan === 'yearly';

    if (hasPersonalTarotAccess && isPaidUser) {
      conversionTracking.personalizedTarotViewed(user.id, subscription.plan);
      return;
    }

    conversionTracking.tarotViewed(user.id, subscription.plan);
  }, [
    authStatus.loading,
    hasPersonalTarotAccess,
    loading,
    subscription.loading,
    subscription.plan,
    user?.id,
  ]);

  // Simple sequential loading checks - prioritize unauthenticated users
  if (authStatus.loading) {
    // Still checking authentication - show loading
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-stroke-strong border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-content-muted'>Loading your tarot reading...</p>
        </div>
      </div>
    );
  }

  // If authenticated but user data is still loading, show loading
  if (authStatus.isAuthenticated && loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-stroke-strong border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-content-muted'>Loading your tarot reading...</p>
        </div>
      </div>
    );
  }

  // Otherwise, continue to render content
  return (
    <>
      {authStatus.isAuthenticated && (
        <SkillProgressWidget
          skillTree='tarot'
          className='sticky top-0 z-10 px-4 pt-3 pb-2 bg-surface-base/90 backdrop-blur-sm'
        />
      )}
      <TarotView
        hasPaidAccess={hasPersonalTarotAccess}
        userName={user?.name}
        userBirthday={user?.birthday}
        user={user}
      />
    </>
  );
}
