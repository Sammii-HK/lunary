'use client';

import { useEffect, useState } from 'react';
import { Lock, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackDemoEvent } from '@/lib/demo-tracking';

interface DemoBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  action?: string;
}

export function DemoBlockedModal({
  isOpen,
  onClose,
  action = 'This action',
}: DemoBlockedModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-50',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-300',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        )}
      >
        <div className='relative w-[320px] bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-2xl border border-zinc-700/50 shadow-2xl p-6'>
          {/* Close button */}
          <button
            onClick={onClose}
            className='absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>

          {/* Icon */}
          <div className='flex justify-center mb-4'>
            <div className='relative'>
              <div className='absolute inset-0 bg-lunary-primary-500/20 blur-xl rounded-full' />
              <div className='relative bg-gradient-to-br from-lunary-primary-600 to-lunary-accent-600 p-3 rounded-full'>
                <Lock className='w-6 h-6 text-white' />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='text-center space-y-3'>
            <h3 className='text-lg font-semibold text-zinc-100'>
              Unavailable in Demo
            </h3>
            <p className='text-sm text-zinc-400'>
              {action} is not available in the demo preview. Create a free
              account to unlock all features.
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={() => {
              trackDemoEvent('signup_clicked', {
                source: 'blocked_modal',
                blocked_action: action,
              });
              window.open('/auth?signup=true', '_blank');
              onClose();
            }}
            className='w-full mt-6 bg-gradient-to-r from-lunary-primary-600 to-lunary-accent-600 hover:from-lunary-primary-500 hover:to-lunary-accent-500 text-white font-medium px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-lunary-primary-600/20'
          >
            <Sparkles className='w-4 h-4' />
            Create Free Account
          </button>

          {/* Dismiss button */}
          <button
            onClick={onClose}
            className='w-full mt-2 text-sm text-zinc-400 hover:text-zinc-200 py-2 transition-colors'
          >
            Continue exploring demo
          </button>
        </div>
      </div>
    </>
  );
}
