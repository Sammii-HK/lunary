'use client';

import { SmartTrialButton } from '@/components/SmartTrialButton';
import { ReactNode } from 'react';

interface FeaturePreviewProps {
  title: string;
  description: string;
  blurredContent: ReactNode;
  icon?: ReactNode;
  feature?: string; // Feature key to determine if free or paid
}

export function FeaturePreview({
  title,
  description,
  blurredContent,
  icon,
  feature,
}: FeaturePreviewProps) {
  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-base md:text-lg font-medium text-zinc-100'>
          {title}
        </h2>
        <div className='px-3 rounded-lg border border-lunary-primary-700 bg-lunary-primary-950 flex items-center justify-center'>
          <span className='text-[8px] font-medium text-lunary-accent-300 whitespace-nowrap'>
            Personalised Feature
          </span>
        </div>
      </div>
      <div className='relative'>
        <div className='filter blur-sm pointer-events-none rounded-lg overflow-hidden'>
          {blurredContent}
        </div>
        <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-zinc-900/90'>
          <div className='text-center p-6 max-w-sm'>
            {icon && <div className='mb-3'>{icon}</div>}
            <h3 className='text-lg font-medium text-zinc-100 mb-2'>{title}</h3>
            <p className='text-sm text-zinc-400 mb-4 leading-relaxed'>
              {description}
            </p>
            <SmartTrialButton size='sm' feature={feature} />
          </div>
        </div>
      </div>
    </div>
  );
}
