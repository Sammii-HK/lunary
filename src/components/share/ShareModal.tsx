'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, ReactNode } from 'react';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function ShareModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
}: ShareModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className={`bg-zinc-900 border border-zinc-700 rounded-xl ${maxWidthClasses[maxWidth]} w-full max-h-[90vh] overflow-y-auto relative transition-all duration-200 opacity-100 scale-100`}
      >
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10'
          aria-label='Close modal'
        >
          <X className='w-5 h-5' />
        </button>

        <div className='p-6'>
          <h2 className='text-lg font-medium text-white mb-4'>{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}
