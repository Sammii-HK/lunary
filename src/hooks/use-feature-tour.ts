'use client';

import { useState, useEffect, useCallback } from 'react';
import { FEATURE_TOURS } from '@/lib/feature-tours/tours';
import type {
  TourId,
  TourContext,
  FeatureTour,
} from '@/lib/feature-tours/tour-system';

export function useFeatureTour(context: TourContext) {
  const [activeTour, setActiveTour] = useState<FeatureTour | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Check if any tour should trigger
  const checkTours = useCallback(() => {
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

    try {
      await fetch('/api/tours/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId: activeTour.id }),
      });
    } catch (error) {
      console.error('Failed to dismiss tour:', error);
    }

    setActiveTour(null);
    setCurrentStep(0);
  }, [activeTour]);

  const completeTour = useCallback(async () => {
    if (!activeTour) return;

    try {
      await fetch('/api/tours/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId: activeTour.id }),
      });
    } catch (error) {
      console.error('Failed to complete tour:', error);
    }

    setActiveTour(null);
    setCurrentStep(0);
  }, [activeTour]);

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
