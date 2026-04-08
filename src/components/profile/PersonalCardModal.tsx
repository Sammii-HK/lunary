'use client';

import { Layers, X } from 'lucide-react';

type PersonalCard = {
  name: string;
  keywords?: string[];
  information?: string;
  reason?: string;
};

type PersonalCardModalProps = {
  personalCard?: PersonalCard | null;
  onClose: () => void;
};

export function PersonalCardModal({
  personalCard,
  onClose,
}: PersonalCardModalProps) {
  return (
    <div className='fixed inset-0 bg-surface-base/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-surface-elevated rounded-lg p-6 w-full max-w-md relative border border-stroke-default'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-content-muted hover:text-content-primary'
        >
          <X size={20} />
        </button>
        {personalCard ? (
          <>
            <div className='text-center mb-4'>
              <Layers className='w-12 h-12 text-lunary-accent mx-auto mb-3' />
              <h3 className='text-xl font-bold text-content-primary'>
                {personalCard.name}
              </h3>
              <p className='text-sm text-content-brand-accent'>
                Your Personal Card
              </p>
            </div>
            <div className='space-y-4 text-sm text-content-secondary'>
              {personalCard.keywords && personalCard.keywords.length > 0 && (
                <div className='flex flex-wrap gap-2 justify-center'>
                  {personalCard.keywords.map((keyword: string, i: number) => (
                    <span
                      key={i}
                      className='px-2 py-1 bg-layer-base text-content-brand-accent rounded text-xs'
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
              {personalCard.information && (
                <p className='leading-relaxed'>{personalCard.information}</p>
              )}
              {personalCard.reason && (
                <div>
                  <h4 className='text-xs font-medium text-content-muted uppercase tracking-wide mb-1'>
                    Why This Card
                  </h4>
                  <p className='leading-relaxed'>{personalCard.reason}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className='text-center py-8'>
            <Layers className='w-12 h-12 text-content-muted mx-auto mb-3' />
            <p className='text-content-muted'>
              Add your birthday to discover your personal tarot card
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
