'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { GLOSSARY, type GlossaryTerm } from '@/lib/glossary/terms';
import { GlossarySheet } from './GlossarySheet';

type Props = {
  /** Term object, or term id to resolve. */
  term: GlossaryTerm | string;
  /** The inline text or node to wrap. */
  children: ReactNode;
  /** Optional override className for the trigger element. */
  className?: string;
};

function resolveTerm(input: GlossaryTerm | string): GlossaryTerm | null {
  if (typeof input === 'string') return GLOSSARY[input] ?? null;
  return input;
}

type Side = 'top' | 'bottom';

export function GlossaryTooltip({ term, children, className }: Props) {
  const resolved = resolveTerm(term);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTerm, setActiveTerm] = useState<GlossaryTerm | null>(resolved);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    side: Side;
  } | null>(null);
  const tooltipId = useId();

  // Close on escape, only when tooltip (not sheet) is the visible layer.
  useEffect(() => {
    if (!open || sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, sheetOpen]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // Position the popover, auto-flipping to avoid viewport edges.
  const computePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const pop = popoverRef.current;
    if (!trigger || !pop) return;
    const rect = trigger.getBoundingClientRect();
    const popRect = pop.getBoundingClientRect();
    const margin = 8;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;
    const side: Side =
      spaceBelow >= popRect.height + margin || spaceBelow >= spaceAbove
        ? 'bottom'
        : 'top';

    const top =
      side === 'bottom'
        ? rect.bottom + margin + window.scrollY
        : rect.top - popRect.height - margin + window.scrollY;

    let left = rect.left + rect.width / 2 - popRect.width / 2 + window.scrollX;
    const minLeft = margin + window.scrollX;
    const maxLeft = window.scrollX + viewportW - popRect.width - margin;
    left = Math.max(minLeft, Math.min(maxLeft, left));

    setCoords({ top, left, side });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    computePosition();
    const onResize = () => computePosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open, computePosition]);

  if (!resolved) {
    // Term not found — render children inertly so we never break layout.
    return <>{children}</>;
  }

  const ariaLabel = `Definition: ${resolved.term}`;

  return (
    <>
      <button
        ref={triggerRef}
        type='button'
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={(e) => {
          // Don't close if pointer moves into the popover.
          const next = e.relatedTarget as Node | null;
          if (next && popoverRef.current?.contains(next)) return;
          setOpen(false);
        }}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          const next = e.relatedTarget as Node | null;
          if (next && popoverRef.current?.contains(next)) return;
          setOpen(false);
        }}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        aria-label={ariaLabel}
        className={
          className ??
          'cursor-help underline decoration-dotted decoration-lunary-primary/50 underline-offset-2 transition-colors hover:text-lunary-primary focus:rounded focus:outline-none focus:ring-2 focus:ring-lunary-primary/40'
        }
      >
        {children}
      </button>

      <AnimatePresence>
        {open && coords && (
          <motion.div
            ref={popoverRef}
            id={tooltipId}
            role='tooltip'
            aria-label={ariaLabel}
            initial={{
              opacity: 0,
              y: coords.side === 'bottom' ? -4 : 4,
              scale: 0.98,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: coords.side === 'bottom' ? -4 : 4,
              scale: 0.98,
            }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: coords.top,
              left: coords.left,
              zIndex: 60,
            }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className='w-[260px] rounded-xl border border-stroke-default bg-surface-elevated p-3 shadow-xl'
          >
            <div className='flex items-start gap-2'>
              {resolved.symbol && (
                <span
                  className='font-astro text-xl text-lunary-primary'
                  aria-hidden='true'
                >
                  {resolved.symbol}
                </span>
              )}
              <div className='min-w-0'>
                <div className='text-sm font-semibold text-content-primary'>
                  {resolved.term}
                </div>
                <p className='mt-0.5 text-xs leading-relaxed text-content-secondary'>
                  {resolved.short}
                </p>
              </div>
            </div>
            <button
              type='button'
              onClick={() => {
                setActiveTerm(resolved);
                setSheetOpen(true);
                setOpen(false);
              }}
              className='mt-2 text-xs font-medium text-lunary-primary hover:underline focus:outline-none focus:ring-2 focus:ring-lunary-primary/40 focus:ring-offset-1 focus:ring-offset-surface-elevated rounded'
            >
              Learn more &rarr;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <GlossarySheet
        term={sheetOpen ? activeTerm : null}
        onClose={() => setSheetOpen(false)}
        onSelectRelated={(t) => setActiveTerm(t)}
      />
    </>
  );
}

export default GlossaryTooltip;
