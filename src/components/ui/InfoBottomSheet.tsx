'use client';

import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /**
   * Optional accent token used for the title's accent color.
   * Pass any tailwind text color class (e.g. `text-lunary-accent`).
   * Defaults to `text-lunary-primary`.
   */
  accentColor?: string;
  /**
   * Optional leading element (icon, symbol, glyph) shown next to the title.
   */
  leading?: ReactNode;
  /**
   * Optional className for the sheet container, in case a caller needs
   * to widen it for richer content.
   */
  className?: string;
  children: ReactNode;
};

/**
 * Generic bottom-sheet / centered-modal info container.
 *
 * - Animated bottom sheet on mobile, anchored card on desktop
 * - Backdrop blur, ESC close, backdrop click close
 * - Drag-to-dismiss on mobile via motion's `drag='y'`
 * - Brand styling (surface tokens, lunary accent)
 *
 * Mirrors the visual pattern established by `PlanetBottomSheet`.
 */
export function InfoBottomSheet({
  open,
  onClose,
  title,
  subtitle,
  accentColor = 'text-lunary-primary',
  leading,
  className,
  children,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    // Dismiss when dragged down far enough or with enough velocity
    if (info.offset.y > 120 || info.velocity.y > 600) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key='infosheet-backdrop'
            className='fixed inset-0 z-40 bg-black/50 backdrop-blur-sm'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key='infosheet'
            role='dialog'
            aria-modal='true'
            aria-label={title}
            className={cn(
              'fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border border-stroke-default bg-surface-elevated px-5 pb-8 pt-3 shadow-2xl',
              'md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[85vh] md:w-[420px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:px-6 md:pt-5',
              'pb-[max(env(safe-area-inset-bottom,0px),2rem)]',
              className,
            )}
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            drag='y'
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
          >
            <div className='mx-auto mb-3 h-1 w-10 rounded-full bg-stroke-default md:hidden' />
            <div className='flex items-start justify-between gap-3'>
              <div className='flex min-w-0 items-center gap-3'>
                {leading && (
                  <span className={cn('shrink-0', accentColor)}>{leading}</span>
                )}
                <div className='min-w-0'>
                  <h3
                    className={cn(
                      'text-lg font-semibold',
                      leading ? 'text-content-primary' : accentColor,
                    )}
                  >
                    {title}
                  </h3>
                  {subtitle && (
                    <p className='mt-0.5 text-sm text-content-secondary'>
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className='shrink-0 rounded-full p-1.5 text-content-muted hover:bg-surface-muted hover:text-content-primary'
                aria-label='Close'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            <div className='mt-4'>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
