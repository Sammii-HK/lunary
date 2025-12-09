'use client';

import { useEffect, useCallback, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeOnEsc?: boolean;
  closeOnClickOutside?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  closeOnEsc = true,
  closeOnClickOutside = true,
  size = 'md',
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleEscKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        e.preventDefault();
        onClose();
      }
    },
    [onClose, closeOnEsc],
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnClickOutside && e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose, closeOnClickOutside],
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleEscKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscKey]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'
      onClick={handleBackdropClick}
      role='dialog'
      aria-modal='true'
    >
      <div
        ref={contentRef}
        className={cn(
          'relative w-full rounded-2xl border border-zinc-700/50 bg-zinc-900/70 backdrop-blur-xl shadow-2xl',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          'max-h-[85vh] flex flex-col',
          sizeClasses[size],
          className,
        )}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className='absolute right-3 top-3 z-10 h-9 w-9 flex items-center justify-center text-zinc-400 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-2xl border border-zinc-700/50 rounded-full transition-all'
            aria-label='Close'
          >
            <X className='w-4 h-4' />
          </button>
        )}
        <div className='flex-1 min-h-0 overflow-y-auto p-6'>{children}</div>
      </div>
    </div>
  );
}

interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ModalHeader({ children, className }: ModalHeaderProps) {
  return (
    <div className={cn('mb-4 pr-8', className)}>
      {typeof children === 'string' ? (
        <h3 className='text-lg font-semibold text-white'>{children}</h3>
      ) : (
        children
      )}
    </div>
  );
}

interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn('mt-6 flex gap-2 justify-end', className)}>
      {children}
    </div>
  );
}
