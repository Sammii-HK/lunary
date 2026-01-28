'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { TourOverlay } from '@/components/feature-tour/tour-overlay';
import { useFeatureTour } from '@/hooks/use-feature-tour';
import type {
  TourContext as ITourContext,
  TourId,
} from '@/lib/feature-tours/tour-system';

interface RawTourContext {
  userTier: string;
  chatCount: number;
  tarotCount: number;
  journalCount: number;
  daysActive: number;
  completedTours: string[];
  dismissedTours: string[];
}

interface TourContextValue {
  startTour: (tourId: TourId) => void;
  hasSeenOnboarding: boolean;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const authState = useAuthStatus();
  const [rawContext, setRawContext] = useState<RawTourContext | null>(null);

  // Fetch tour context on mount
  useEffect(() => {
    if (!authState.isAuthenticated || !user?.id) return;

    const fetchTourContext = async () => {
      try {
        const response = await fetch('/api/tours/context');
        if (response.ok) {
          const data = await response.json();
          setRawContext(data);
        }
      } catch (error) {
        console.error('Failed to fetch tour context:', error);
      }
    };

    fetchTourContext();
  }, [authState.isAuthenticated, user?.id]);

  // Reconstruct full TourContext only once API data arrives
  const tourContext: ITourContext | null = useMemo(() => {
    if (!rawContext) return null;
    return {
      userTier: rawContext.userTier as ITourContext['userTier'],
      chatCount: rawContext.chatCount,
      tarotCount: rawContext.tarotCount,
      journalCount: rawContext.journalCount,
      daysActive: rawContext.daysActive,
      hasSeenTour: (tourId) =>
        rawContext.completedTours.includes(tourId) ||
        rawContext.dismissedTours.includes(tourId),
    };
  }, [rawContext]);

  // Optimistically update local context so checkTours doesn't re-activate a dismissed/completed tour
  const markTourSeen = useCallback(
    (tourId: string, status: 'dismissed' | 'completed') => {
      setRawContext((prev) => {
        if (!prev) return prev;
        const key =
          status === 'dismissed' ? 'dismissedTours' : 'completedTours';
        if (prev[key].includes(tourId)) return prev;
        return { ...prev, [key]: [...prev[key], tourId] };
      });
    },
    [],
  );

  const hasSeenOnboarding = useMemo(() => {
    if (!rawContext) return true; // default to true to avoid flicker
    return (
      rawContext.completedTours.includes('first_time_onboarding') ||
      rawContext.dismissedTours.includes('first_time_onboarding')
    );
  }, [rawContext]);

  const {
    activeTour,
    currentStep,
    nextStep,
    prevStep,
    dismissTour,
    completeTour,
    startTour,
  } = useFeatureTour(tourContext, markTourSeen);

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
