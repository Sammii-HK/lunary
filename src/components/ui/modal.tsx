'use client';

import { useEffect, useCallback, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hapticService } from '@/services/native/haptic-service';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeOnEsc?: boolean;
  closeOnClickOutside?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Accessible name announced to screen readers when the dialog opens. */
  ariaLabel?: string;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  ariaLabel,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        e.preventDefault();
        onClose();
        return;
      }

      // Trap Tab focus within the dialog
      if (e.key === 'Tab' && contentRef.current) {
        const focusable = Array.from(
          contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter((el) => el.offsetParent !== null);
        if (focusable.length === 0) {
          e.preventDefault();
          contentRef.current.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && (active === first || active === contentRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
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

    // Light haptic feedback when modal opens
    hapticService.light();

    // Remember what had focus so we can restore it on close
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Move focus into the dialog so keyboard/SR users start inside it
    const focusTarget = contentRef.current;
    if (focusTarget) {
      const firstFocusable =
        focusTarget.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (firstFocusable ?? focusTarget).focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      // Restore focus to the element that opened the modal
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-surface-base/60 backdrop-blur-sm sm:p-4'
      onClick={handleBackdropClick}
    >
      <div
        ref={contentRef}
        role='dialog'
        aria-modal='true'
        aria-label={ariaLabel}
        tabIndex={-1}
        className={cn(
          'relative w-full border border-stroke-default/50 bg-surface-card/95 backdrop-blur-xl shadow-2xl focus:outline-none',
          'rounded-t-2xl sm:rounded-2xl',
          'animate-in fade-in-0 slide-in-from-bottom-4 sm:zoom-in-95 duration-200',
          'max-h-[90vh] sm:max-h-[85vh] flex flex-col',
          'pb-[env(safe-area-inset-bottom,0px)]',
          sizeClasses[size],
          className,
        )}
      >
        {/* iOS-style drag handle on mobile */}
        <div className='flex justify-center pt-2 pb-0 sm:hidden'>
          <div className='h-1 w-10 rounded-full bg-stroke-default' />
        </div>
        {showCloseButton && (
          <button
            onClick={onClose}
            className='absolute right-3 top-3 z-10 h-9 w-9 flex items-center justify-center text-content-muted hover:text-content-primary bg-surface-base/30 hover:bg-surface-base/50 backdrop-blur-2xl border border-stroke-default/50 rounded-full transition-all'
            aria-label='Close'
          >
            <X className='w-4 h-4' />
          </button>
        )}
        <div className='flex-1 min-h-0 overflow-y-auto p-4 sm:p-6'>
          {children}
        </div>
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
        <h3 className='text-lg font-semibold text-content-primary'>
          {children}
        </h3>
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
