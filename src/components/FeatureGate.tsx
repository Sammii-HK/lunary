'use client';

import { ReactNode, useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { useAuthStatus } from './AuthStatus';
import { UpgradePrompt } from './UpgradePrompt';
import { conversionTracking } from '@/lib/analytics';
import { Lock } from 'lucide-react';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  showPreview?: boolean;
  previewContent?: ReactNode;
  gateType?: 'hard' | 'soft';
  className?: string;
}

export function FeatureGate({
  feature,
  children,
  showPreview = false,
  previewContent,
  gateType = 'soft',
  className = '',
}: FeatureGateProps) {
  const subscription = useSubscription();
  const authState = useAuthStatus();
  const [hasShownGate, setHasShownGate] = useState(false);

  const { hasAccess, isTrialActive } = subscription;

  const hasFeatureAccess = hasAccess(feature as any);

  if (hasFeatureAccess) {
    return <>{children}</>;
  }

  if (!hasShownGate) {
    setHasShownGate(true);
    conversionTracking.featureGated(feature);
  }

  if (gateType === 'hard') {
    return (
      <div className={className}>
        {/* Teaser Text */}
        <div className='mb-4 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30'>
          <p className='text-purple-200 text-sm font-medium italic'>
            &ldquo;This is the personalised interpretation for YOUR
            chart.&rdquo;
          </p>
        </div>
        <UpgradePrompt
          variant='card'
          featureName={feature}
          title='Premium Feature'
          description={`Unlock ${feature} to access this personalized cosmic insight`}
        />
      </div>
    );
  }

  if (showPreview && previewContent) {
    return (
      <div className={className}>
        <div className='relative'>
          {/* Teaser Text */}
          <div className='mb-4 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30'>
            <p className='text-purple-200 text-sm font-medium italic'>
              &ldquo;This is the personalised interpretation for YOUR
              chart.&rdquo;
            </p>
          </div>
          <div className='opacity-50 pointer-events-none'>{previewContent}</div>
          <div className='absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg'>
            <div className='text-center p-6 max-w-md'>
              <Lock className='w-12 h-12 text-purple-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-white mb-2'>
                Unlock Full Access
              </h3>
              <p className='text-sm text-gray-400 mb-4'>
                Get the complete personalized insight
              </p>
              <UpgradePrompt variant='inline' featureName={feature} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className='bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center'>
        <Lock className='w-10 h-10 text-purple-400 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-white mb-2'>Premium Feature</h3>
        <p className='text-sm text-gray-400 mb-4'>
          This feature requires a subscription
        </p>
        <UpgradePrompt variant='inline' featureName={feature} />
      </div>
    </div>
  );
}
