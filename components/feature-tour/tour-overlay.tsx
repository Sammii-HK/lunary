'use client';

import { useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FeatureTour, TourStep } from '@/lib/feature-tours/tour-system';
import type { PlanKey } from '@/lib/entitlements';

interface TourOverlayProps {
  tour: FeatureTour;
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onDismiss: () => void;
  onComplete: () => void;
  userTier: PlanKey;
}

export function TourOverlay({
  tour,
  currentStep,
  onNext,
  onPrev,
  onDismiss,
  onComplete,
  userTier,
}: TourOverlayProps) {
  const step = tour.steps[currentStep];
  const isLastStep = currentStep === tour.steps.length - 1;
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: '50%', left: '50%' });

  // Get the icon component
  const IconComponent = step.icon
    ? (LucideIcons as any)[step.icon]
    : LucideIcons.Sparkles;

  // Get content (may be function)
  const content = typeof step.content === 'function'
    ? step.content(userTier)
    : step.content;

  const title = typeof step.title === 'function'
    ? step.title(userTier)
    : step.title;

  // Calculate position based on target element
  useEffect(() => {
    if (step.placement === 'center') {
      setPosition({ top: '50%', left: '50%' });
      return;
    }

    const targetElement = document.querySelector(step.target);
    if (!targetElement) {
      setPosition({ top: '50%', left: '50%' });
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const cardWidth = 400; // max-w-md
    const cardHeight = 300; // estimated
    const padding = 16;

    let top = '50%';
    let left = '50%';

    switch (step.placement) {
      case 'top':
        top = `${Math.max(padding, rect.top - cardHeight - padding)}px`;
        left = `${rect.left + rect.width / 2}px`;
        break;
      case 'bottom':
        top = `${rect.bottom + padding}px`;
        left = `${rect.left + rect.width / 2}px`;
        break;
      case 'left':
        top = `${rect.top + rect.height / 2}px`;
        left = `${Math.max(padding, rect.left - cardWidth - padding)}px`;
        break;
      case 'right':
        top = `${rect.top + rect.height / 2}px`;
        left = `${rect.right + padding}px`;
        break;
    }

    setPosition({ top, left });
  }, [step.target, step.placement, currentStep]);

  const handleAction = () => {
    if (step.action?.onClick) step.action.onClick();
    if (step.action?.href) window.location.href = step.action.href;
    if (isLastStep) onComplete();
    else onNext();
  };

  const getTransformClass = () => {
    if (step.placement === 'center') {
      return '-translate-x-1/2 -translate-y-1/2';
    }
    if (step.placement === 'top' || step.placement === 'bottom') {
      return '-translate-x-1/2';
    }
    if (step.placement === 'left' || step.placement === 'right') {
      return '-translate-y-1/2';
    }
    return '';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Tour card */}
      <div
        ref={cardRef}
        className={cn(
          'fixed z-50 bg-white dark:bg-gray-900 rounded-lg shadow-xl',
          'max-w-md p-6 animate-in fade-in slide-in-from-bottom-4',
          'border border-gray-200 dark:border-gray-800',
          getTransformClass()
        )}
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        {/* Icon */}
        {IconComponent && (
          <div className="mb-4">
            <IconComponent className="h-8 w-8 text-purple-500" />
          </div>
        )}

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {content}
        </p>

        {/* Progress indicator */}
        <div className="flex items-center gap-1 mb-4">
          {tour.steps.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                idx <= currentStep ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'
              )}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Skip tour
          </Button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
              >
                Back
              </Button>
            )}

            {step.action && (
              <Button
                variant={step.action.variant === 'outline' ? 'outline' : 'default'}
                size="sm"
                onClick={handleAction}
                className={cn(
                  step.action.variant === 'primary' && 'bg-purple-600 hover:bg-purple-700'
                )}
              >
                {step.action.label}
              </Button>
            )}
          </div>
        </div>

        {/* Secondary action */}
        {step.secondaryAction && (
          <button
            className="mt-3 text-sm text-purple-600 hover:underline dark:text-purple-400"
            onClick={step.secondaryAction.onClick}
          >
            {step.secondaryAction.label}
          </button>
        )}
      </div>
    </>
  );
}
