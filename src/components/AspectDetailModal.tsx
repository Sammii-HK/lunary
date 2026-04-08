'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { Aspect } from '@/hooks/useAspects';

interface AspectDetailModalProps {
  aspect: Aspect | null;
  onClose: () => void;
}

// Aspect interpretations for common aspects
const aspectInterpretations: Record<
  string,
  { meaning: string; description: string }
> = {
  Conjunction: {
    meaning: 'Fusion & Integration',
    description:
      'A conjunction blends the energies of two planets, creating intensity and focus. These energies work together, amplifying each other. This aspect creates a unified expression of both planetary forces.',
  },
  Opposition: {
    meaning: 'Tension & Balance',
    description:
      'An opposition creates polarity and tension between two planetary energies. While challenging, this aspect can lead to growth through balance and understanding of opposing viewpoints.',
  },
  Trine: {
    meaning: 'Harmony & Flow',
    description:
      'A trine is one of the most fortunate aspects, bringing ease, harmony, and natural talent. These planets work smoothly together, supporting your growth and expression.',
  },
  Square: {
    meaning: 'Challenge & Growth',
    description:
      'A square creates friction and tension that drives action and growth. While challenging, this aspect motivates you to overcome obstacles and develop resilience.',
  },
  Sextile: {
    meaning: 'Opportunity & Support',
    description:
      'A sextile brings favorable opportunities and supportive energy between planets. These energies complement each other well, encouraging cooperation and positive outcomes.',
  },
};

function getOrbStrength(
  orb: number,
  maxOrb: number = 8,
): 'tight' | 'moderate' | 'wide' {
  const tolerance = orb / maxOrb;
  if (tolerance <= 0.33) return 'tight';
  if (tolerance <= 0.66) return 'moderate';
  return 'wide';
}

function getOrbDescription(orb: number): string {
  const strength = getOrbStrength(orb);
  if (strength === 'tight') {
    return `Very tight orb (${orb.toFixed(1)}°) — exceptionally strong influence`;
  }
  if (strength === 'moderate') {
    return `Moderate orb (${orb.toFixed(1)}°) — significant influence`;
  }
  return `Wide orb (${orb.toFixed(1)}°) — subtle influence`;
}

export function AspectDetailModal({ aspect, onClose }: AspectDetailModalProps) {
  if (!aspect) return null;

  const interpretation = aspectInterpretations[aspect.type] || {
    meaning: aspect.type,
    description: 'Explore the dynamic between these two planetary energies.',
  };

  const orbStrength = getOrbStrength(aspect.orb);
  const orbDescription = getOrbDescription(aspect.orb);

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='relative w-full max-w-lg rounded-xl bg-surface-elevated border border-stroke-subtle p-6 shadow-xl'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-content-muted hover:text-content-primary transition-colors'
          aria-label='Close modal'
        >
          <X className='h-5 w-5' />
        </button>

        {/* Aspect Header */}
        <div className='mb-6'>
          <div className='flex items-center gap-3 mb-2'>
            <div
              className='w-4 h-4 rounded-full'
              style={{ backgroundColor: aspect.color }}
            />
            <h2 className='text-2xl font-bold text-content-primary'>
              {aspect.planet1} {aspect.type} {aspect.planet2}
            </h2>
          </div>
          <p className='text-content-secondary'>{interpretation.meaning}</p>
        </div>

        {/* Orb Information */}
        <div className='mb-6 p-4 bg-layer-base/50 rounded-lg border border-stroke-subtle'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-semibold text-content-primary'>
              Orb Strength
            </span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${
                orbStrength === 'tight'
                  ? 'bg-lunary-primary/20 text-lunary-primary'
                  : orbStrength === 'moderate'
                    ? 'bg-lunary-secondary/20 text-lunary-secondary'
                    : 'bg-content-muted/20 text-content-muted'
              }`}
            >
              {orbStrength.charAt(0).toUpperCase() + orbStrength.slice(1)}
            </span>
          </div>
          <p className='text-xs text-content-secondary'>{orbDescription}</p>

          {/* Orb Visualization */}
          <div className='mt-3 w-full h-2 bg-layer-base rounded-full overflow-hidden'>
            <div
              className={`h-full transition-all ${
                orbStrength === 'tight'
                  ? 'bg-lunary-primary'
                  : orbStrength === 'moderate'
                    ? 'bg-lunary-secondary'
                    : 'bg-content-muted'
              }`}
              style={{ width: `${Math.max((1 - aspect.orb / 8) * 100, 0)}%` }}
            />
          </div>
        </div>

        {/* Interpretation */}
        <div className='mb-6'>
          <h3 className='text-sm font-semibold text-content-primary mb-2'>
            What this aspect means
          </h3>
          <p className='text-sm text-content-secondary leading-relaxed'>
            {interpretation.description}
          </p>
        </div>

        {/* Integration Tips */}
        <div className='p-4 bg-lunary-primary/5 rounded-lg border border-lunary-primary/20 mb-6'>
          <p className='text-xs text-lunary-primary font-semibold mb-2'>
            Integration Tip
          </p>
          <p className='text-xs text-content-secondary'>
            {orbStrength === 'tight'
              ? 'This powerful aspect has a strong influence on your personality. Consciously harness its potential.'
              : orbStrength === 'moderate'
                ? 'This aspect creates a noticeable influence. Work with its energy intentionally.'
                : 'This subtle aspect influences your character gently. Notice its patterns over time.'}
          </p>
        </div>

        {/* Close Button */}
        <Button onClick={onClose} variant='lunary-soft' className='w-full'>
          Close
        </Button>
      </div>
    </div>
  );
}
