'use client';

import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TourTriggerProps {
  onStartTour: () => void;
  hasSeenOnboarding?: boolean;
}

export function TourTrigger({ onStartTour, hasSeenOnboarding }: TourTriggerProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show the button after a brief delay
    const timer = setTimeout(() => setShow(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Don't show if user has already seen onboarding
  if (hasSeenOnboarding) return null;
  if (!show) return null;

  return (
    <button
      onClick={onStartTour}
      className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors"
    >
      <Sparkles className="h-4 w-4" />
      New here? Take a 2-minute tour
    </button>
  );
}
