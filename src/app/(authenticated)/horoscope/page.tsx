'use client';

import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { useSubscription } from '../../../hooks/useSubscription';
import { useNotificationDeepLink } from '@/hooks/useNotificationDeepLink';
import { hasFeatureAccess } from '../../../../utils/pricing';
import { HoroscopeView } from './components/HoroscopeView';
import { conversionTracking } from '@/lib/analytics';
import { useEffect, useState } from 'react';
import { MarketingFooterGate } from '@/components/MarketingFooterGate';
import { useABTestTracking } from '@/hooks/useABTestTracking';
import { SkillProgressWidget } from '@/components/progress/SkillProgressWidget';
import { useIsNativeIOS } from '@/hooks/useNativePlatform';
import { iosLabel } from '@/lib/ios-labels';
import { AnniversaryMoment } from '@/components/journal/AnniversaryMoment';
import type { AnniversaryRecord } from '@/lib/journal/anniversary-finder';

function AnniversaryMomentLoader() {
  const [record, setRecord] = useState<AnniversaryRecord | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    let cancelled = false;
    fetch(`/api/journal/anniversaries?date=${today}`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.anniversary) setRecord(data.anniversary);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!record) return null;
  return (
    <AnniversaryMoment
      date={record.anniversaryDate}
      journalSnippet={record.journalSnippet ?? undefined}
      transitsSnippet={record.transitsSnippet ?? undefined}
      yearsAgo={record.yearsAgo}
      className='mx-4 mt-4'
    />
  );
}

export default function HoroscopePage() {
  const { user, loading } = useUser();
  const isNativeIOS = useIsNativeIOS();
  const authStatus = useAuthStatus();
  const subscription = useSubscription();
  useNotificationDeepLink(); // Handle push notification deep links

  // Track horoscope page with A/B tests: cta-copy, feature-preview, transit-limit
  useABTestTracking('horoscope', 'page_viewed', [
    'cta-copy-test',
    'feature_preview_blur_v1',
    'transit-limit-test',
    'transit-overflow-style',
  ]);

  // For unauthenticated users, force paid horoscope access to false immediately
  // Don't wait for subscription to resolve
  const hasPersonalHoroscopeAccess = !authStatus.isAuthenticated
    ? false
    : hasFeatureAccess(
        subscription.status,
        subscription.plan,
        'personalized_horoscope',
      );

  useEffect(() => {
    if (!user?.id) return;

    const isPaidUser =
      subscription.plan === 'monthly' || subscription.plan === 'yearly';

    if (hasPersonalHoroscopeAccess && isPaidUser) {
      // Paid users: track personalized horoscope view
      conversionTracking.personalizedHoroscopeViewed(
        user.id,
        subscription.plan,
      );
    } else if (user.id) {
      // Free users: track generic horoscope view
      conversionTracking.horoscopeViewed(user.id, subscription.plan);
    }
  }, [hasPersonalHoroscopeAccess, user?.id, subscription.plan]);

  // Simple sequential loading checks - prioritize unauthenticated users
  if (authStatus.loading) {
    // Still checking authentication - show loading
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-lunary-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-content-muted'>
            {iosLabel('Loading your horoscope...', isNativeIOS)}
          </p>
        </div>
      </div>
    );
  }

  // If authenticated but user data is still loading, show loading
  if (authStatus.isAuthenticated && loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-lunary-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-content-muted'>
            {iosLabel('Loading your horoscope...', isNativeIOS)}
          </p>
        </div>
      </div>
    );
  }

  // Otherwise, continue to render content

  return (
    <div className='min-h-screen flex flex-col'>
      {authStatus.isAuthenticated && (
        <SkillProgressWidget
          skillTree='explorer'
          className='sticky top-0 z-10 px-4 pt-3 pb-2 bg-surface-base/90 backdrop-blur-sm'
        />
      )}
      <div className='flex-1'>
        {authStatus.isAuthenticated && <AnniversaryMomentLoader />}
        <HoroscopeView
          userBirthday={user?.birthday}
          userName={user?.name}
          profile={{ birthday: user?.birthday, birthChart: user?.birthChart }}
          hasPaidAccess={hasPersonalHoroscopeAccess}
        />
      </div>
      <MarketingFooterGate />
    </div>
  );
}
