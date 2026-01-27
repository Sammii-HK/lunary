'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { TourOverlay } from './tour-overlay';
import { useFeatureTour } from '@/hooks/use-feature-tour';
import type { TourContext } from '@/lib/feature-tours/tour-system';
import type { PlanKey } from '@/lib/entitlements';

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const authState = useAuthStatus();
  const [tourContext, setTourContext] = useState<TourContext | null>(null);

  // Fetch tour context on mount
  useEffect(() => {
    if (!authState.isAuthenticated || !user?.id) return;

    const fetchTourContext = async () => {
      try {
        const response = await fetch('/api/tours/context');
        if (response.ok) {
          const data = await response.json();
          setTourContext(data);
        }
      } catch (error) {
        console.error('Failed to fetch tour context:', error);
      }
    };

    fetchTourContext();
  }, [authState.isAuthenticated, user?.id]);

  const {
    activeTour,
    currentStep,
    nextStep,
    prevStep,
    dismissTour,
    completeTour,
    startTour,
  } = useFeatureTour(tourContext || {
    userTier: 'free' as PlanKey,
    chatCount: 0,
    tarotCount: 0,
    journalCount: 0,
    daysActive: 0,
    hasSeenTour: () => false,
  });

  return (
    <>
      {children}
      {activeTour && tourContext && (
        <TourOverlay
          tour={activeTour}
          currentStep={currentStep}
          onNext={nextStep}
          onPrev={prevStep}
          onDismiss={dismissTour}
          onComplete={completeTour}
          userTier={tourContext.userTier}
        />
      )}
    </>
  );
}
