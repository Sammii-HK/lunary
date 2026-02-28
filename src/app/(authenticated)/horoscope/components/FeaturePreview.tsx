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
  blurredContent,
  feature,
  ctaKey,
  trackingFeature,
  page = 'horoscope',
}: FeaturePreviewProps) {
  const router = useRouter();
  const ctaCopy = useCTACopy();
  const previewBlurVariant = useFeatureFlagVariant('feature_preview_blur_v1');
  const variantRaw = useFeatureFlagVariant('paywall_preview_style_v1');
  // feature_preview_blur_v1 takes priority when set (blur vs peek test)
  const variant = previewBlurVariant || variantRaw || 'blur';

  const handleUpgradeClick = useCallback(() => {
    if (ctaKey) {
      ctaCopy.trackCTAClick(ctaKey, page);
    }
    if (trackingFeature) {
      captureEvent('locked_content_clicked', {
        feature: trackingFeature,
        tier: 'free',
        preview_variant: variant,
      });
    }
    router.push('/pricing?nav=app');
  }, [ctaKey, ctaCopy, page, trackingFeature, router, variant]);

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
        <div className='filter blur-[2px] opacity-50 pointer-events-none rounded-lg overflow-hidden'>
          {blurredContent}
        </div>
      );
    }

    if (variant === 'peek') {
      // Lighter blur — content is more readable, gradient does the gating
      return (
        <div className='filter blur-[4px] opacity-80 pointer-events-none rounded-lg overflow-hidden'>
          {blurredContent}
        </div>
      );
    }

    // Default: blur
    return (
      <div className='filter blur-sm opacity-60 pointer-events-none rounded-lg overflow-hidden'>
        {blurredContent}
      </div>
    );
  };

  const ctaButtonText = ctaKey ? ctaCopy[ctaKey] : undefined;

  return (
    <div>
      <h2 className='text-base md:text-lg font-medium text-zinc-100 mb-4'>
        {title}
      </h2>
      <div className='relative'>
        {renderBlurredContent()}
        <div className='absolute inset-0 rounded-lg bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950 flex flex-col items-center justify-center gap-3'>
          <span className='inline-flex items-center gap-1 text-[10px] bg-lunary-primary-900/50 border border-lunary-primary-700/50 px-2 py-0.5 rounded text-lunary-primary-300'>
            <Sparkles className='w-2.5 h-2.5' />
            Lunary+
          </span>
          {ctaButtonText ? (
            <button
              type='button'
              onClick={handleUpgradeClick}
              className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-700 bg-zinc-900/80 px-4 py-2 text-xs font-medium text-lunary-primary-300 hover:bg-zinc-900 transition-colors'
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
  );
}
