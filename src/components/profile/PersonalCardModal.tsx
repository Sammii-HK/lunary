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
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-zinc-900 rounded-lg p-6 w-full max-w-md relative border border-zinc-700'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-zinc-400 hover:text-white'
        >
          <X size={20} />
        </button>
        {personalCard ? (
          <>
            <div className='text-center mb-4'>
              <Layers className='w-12 h-12 text-lunary-accent mx-auto mb-3' />
              <h3 className='text-xl font-bold text-white'>
                {personalCard.name}
              </h3>
              <p className='text-sm text-lunary-accent-300'>
                Your Personal Card
              </p>
            </div>
            <div className='space-y-4 text-sm text-zinc-300'>
              {personalCard.keywords && personalCard.keywords.length > 0 && (
                <div className='flex flex-wrap gap-2 justify-center'>
                  {personalCard.keywords.map((keyword: string, i: number) => (
                    <span
                      key={i}
                      className='px-2 py-1 bg-lunary-primary-900 text-lunary-accent-300 rounded text-xs'
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
                  <h4 className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1'>
                    Why This Card
                  </h4>
                  <p className='leading-relaxed'>{personalCard.reason}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className='text-center py-8'>
            <Layers className='w-12 h-12 text-zinc-600 mx-auto mb-3' />
            <p className='text-zinc-400'>
              Add your birthday to discover your personal tarot card
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
