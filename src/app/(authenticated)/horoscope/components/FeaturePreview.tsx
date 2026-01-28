'use client';

import { useRouter } from 'next/navigation';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import { useCTACopy } from '@/hooks/useCTACopy';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { captureEvent } from '@/lib/posthog-client';
import { Sparkles } from 'lucide-react';
import type { FeatureKey } from '../../../../../utils/pricing';
import { ReactNode, useCallback } from 'react';

interface FeaturePreviewProps {
  title: string;
  description: string;
  blurredContent: ReactNode;
  icon?: ReactNode;
  feature?: FeatureKey;
  ctaKey?:
    | 'horoscope'
    | 'tarotDaily'
    | 'tarotWeekly'
    | 'chartConnection'
    | 'transitList';
  trackingFeature?: string;
  page?: string;
}

export function FeaturePreview({
  title,
  description,
  blurredContent,
  icon,
  feature,
  ctaKey,
  trackingFeature,
  page = 'horoscope',
}: FeaturePreviewProps) {
  const router = useRouter();
  const ctaCopy = useCTACopy();
  const variantRaw = useFeatureFlagVariant('paywall_preview_style_v1');
  const variant = variantRaw || 'blur';

  const handleUpgradeClick = useCallback(() => {
    if (ctaKey) {
      ctaCopy.trackCTAClick(ctaKey, page);
    }
    if (trackingFeature) {
      captureEvent('locked_content_clicked', {
        feature: trackingFeature,
        tier: 'free',
      });
    }
    router.push('/pricing');
  }, [ctaKey, ctaCopy, page, trackingFeature, router]);

  const renderBlurredContent = () => {
    if (variant === 'truncated') {
      return (
        <div className='pointer-events-none rounded-lg overflow-hidden'>
          {blurredContent}
        </div>
      );
    }

    if (variant === 'redacted') {
      return (
        <div className='filter blur-[2px] opacity-60 pointer-events-none rounded-lg overflow-hidden'>
          {blurredContent}
        </div>
      );
    }

    // Default: blur
    return (
      <div className='filter blur-sm opacity-50 pointer-events-none rounded-lg overflow-hidden'>
        {blurredContent}
      </div>
    );
  };

  const ctaButtonText = ctaKey ? ctaCopy[ctaKey] : undefined;

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-base md:text-lg font-medium text-zinc-100'>
          {title}
        </h2>
        <span className='inline-flex items-center gap-1 text-[10px] bg-lunary-primary-900/50 border border-lunary-primary-700/50 px-2 py-0.5 rounded text-lunary-primary-300'>
          <Sparkles className='w-2.5 h-2.5' />
          Lunary+
        </span>
      </div>
      <div className='relative'>
        {renderBlurredContent()}
        <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-gradient-to-b from-transparent via-zinc-950/70 to-zinc-950'>
          <div className='text-center p-6 max-w-sm'>
            {icon && <div className='mb-3'>{icon}</div>}
            <p className='text-sm text-zinc-400 mb-4 leading-relaxed'>
              {description}
            </p>
            {ctaButtonText ? (
              <button
                type='button'
                onClick={handleUpgradeClick}
                className='inline-flex items-center gap-1.5 rounded-lg border border-lunary-primary-700 bg-zinc-900/80 px-4 py-2 text-xs font-medium text-lunary-primary-300 hover:bg-zinc-900 transition-colors'
              >
                <Sparkles className='w-3 h-3' />
                {ctaButtonText}
              </button>
            ) : (
              <SmartTrialButton size='sm' feature={feature} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
