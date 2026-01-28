'use client';

import { useState, useEffect, useCallback } from 'react';
import { FEATURE_TOURS } from '@/lib/feature-tours/tours';
import type {
  TourId,
  TourContext,
  FeatureTour,
} from '@/lib/feature-tours/tour-system';

type MarkTourSeenFn = (
  tourId: string,
  status: 'dismissed' | 'completed',
) => void;

export function useFeatureTour(
  context: TourContext | null,
  markTourSeen: MarkTourSeenFn,
) {
  const [activeTour, setActiveTour] = useState<FeatureTour | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Check if any tour should trigger — only once we have real context
  const checkTours = useCallback(() => {
    if (!context) return;

    const tour = FEATURE_TOURS.find((t) => {
      // Check if already seen/dismissed
      if (t.showOnce && context.hasSeenTour(t.id)) return false;

      // Check tier restrictions
      if (t.requiredTier && !t.requiredTier.includes(context.userTier))
        return false;
      if (t.excludedTier && t.excludedTier.includes(context.userTier))
        return false;

      // Check trigger condition
      if (t.triggerCondition && !t.triggerCondition(context)) return false;

      return true;
    });

    if (tour && !activeTour) {
      setActiveTour(tour);
    }
  }, [context, activeTour]);

  useEffect(() => {
    checkTours();
  }, [checkTours]);

  const startTour = useCallback((tourId: TourId) => {
    const tour = FEATURE_TOURS.find((t) => t.id === tourId);
    if (tour) {
      setActiveTour(tour);
      setCurrentStep(0);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (!activeTour) return;

    if (currentStep < activeTour.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  }, [activeTour, currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const dismissTour = useCallback(async () => {
    if (!activeTour) return;

    const tourId = activeTour.id;

    // Optimistically update context before clearing active tour,
    // so checkTours won't re-activate this tour when activeTour becomes null
    markTourSeen(tourId, 'dismissed');
    setActiveTour(null);
    setCurrentStep(0);

    try {
      const res = await fetch('/api/tours/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId }),
      });
      if (!res.ok) {
        console.error('[tour] dismiss failed:', res.status, await res.text());
      }
    } catch (error) {
      console.error('Failed to dismiss tour:', error);
    }
  }, [activeTour, markTourSeen]);

  const completeTour = useCallback(async () => {
    if (!activeTour) return;

    const tourId = activeTour.id;

    // Optimistically update context before clearing active tour
    markTourSeen(tourId, 'completed');
    setActiveTour(null);
    setCurrentStep(0);

    try {
      const res = await fetch('/api/tours/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId }),
      });
      if (!res.ok) {
        console.error('[tour] complete failed:', res.status, await res.text());
      }
    } catch (error) {
      console.error('Failed to complete tour:', error);
    }
  }, [activeTour, markTourSeen]);

  return {
    activeTour,
    currentStep,
    nextStep,
    prevStep,
    dismissTour,
    completeTour,
    startTour,
  };
}
