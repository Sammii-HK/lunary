'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { TourOverlay } from '@/components/feature-tour/tour-overlay';
import { useFeatureTour } from '@/hooks/use-feature-tour';
import type {
  TourContext as ITourContext,
  TourId,
} from '@/lib/feature-tours/tour-system';
import type { PlanKey } from '../../utils/entitlements';

interface TourContextValue {
  startTour: (tourId: TourId) => void;
  hasSeenOnboarding: boolean;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const authState = useAuthStatus();
  const [tourContext, setTourContext] = useState<ITourContext | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  // Fetch tour context on mount
  useEffect(() => {
    if (!authState.isAuthenticated || !user?.id) return;

    const fetchTourContext = async () => {
      try {
        const response = await fetch('/api/tours/context');
        if (response.ok) {
          const data = await response.json();
          setTourContext(data);
          setHasSeenOnboarding(data.hasSeenTour('first_time_onboarding'));
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
  } = useFeatureTour(
    tourContext || {
      userTier: 'free' as PlanKey,
      chatCount: 0,
      tarotCount: 0,
      journalCount: 0,
      daysActive: 0,
      hasSeenTour: () => false,
    },
  );

  const value = {
    startTour,
    hasSeenOnboarding,
  };

  return (
    <TourContext.Provider value={value}>
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
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
}
