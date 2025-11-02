'use client';

import { SmartTrialButton } from '@/components/SmartTrialButton';
import { ReactNode } from 'react';

interface FeaturePreviewProps {
  title: string;
  description: string;
  blurredContent: ReactNode;
  icon?: ReactNode;
}

export function FeaturePreview({
  title,
  description,
  blurredContent,
  icon,
}: FeaturePreviewProps) {
  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-medium text-zinc-100'>{title}</h2>
        <div className='px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10'>
          <span className='text-xs font-medium text-purple-300/90'>
            Personalised Feature
          </span>
        </div>
      </div>
      <div className='relative'>
        <div className='filter blur-sm pointer-events-none'>
          {blurredContent}
        </div>
        <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-zinc-900/90'>
          <div className='text-center p-6 max-w-sm'>
            {icon && <div className='mb-3'>{icon}</div>}
            <h3 className='text-lg font-medium text-zinc-100 mb-2'>{title}</h3>
            <p className='text-sm text-zinc-400 mb-4 leading-relaxed'>
              {description}
            </p>
            <SmartTrialButton className='inline-block' />
          </div>
        </div>
      </div>
    </div>
  );
}
