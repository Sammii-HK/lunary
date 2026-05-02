'use client';

import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import {
  GLOSSARY,
  relatedTerms,
  type GlossaryTerm,
} from '@/lib/glossary/terms';

type Props = {
  /** The full term object, OR a term id to resolve from GLOSSARY. */
  term: GlossaryTerm | string | null;
  onClose: () => void;
  /** Click handler for related-term chips; defaults to swapping in this sheet. */
  onSelectRelated?: (term: GlossaryTerm) => void;
};

const CATEGORY_LABELS: Record<GlossaryTerm['category'], string> = {
  planet: 'Planet',
  sign: 'Sign',
  house: 'House',
  aspect: 'Aspect',
  concept: 'Concept',
  point: 'Point',
  phase: 'Lunar phase',
};

function resolveTerm(input: GlossaryTerm | string | null): GlossaryTerm | null {
  if (!input) return null;
  if (typeof input === 'string') return GLOSSARY[input] ?? null;
  return input;
}

export function GlossarySheet({ term, onClose, onSelectRelated }: Props) {
  const resolved = resolveTerm(term);

  useEffect(() => {
    if (!resolved) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [resolved, onClose]);

  const related = resolved ? relatedTerms(resolved.id) : [];

  return (
    <AnimatePresence>
      {resolved && (
        <>
          <motion.div
            key='glossary-backdrop'
            className='fixed inset-0 z-40 bg-black/50 backdrop-blur-sm'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key='glossary-sheet'
            role='dialog'
            aria-modal='true'
            aria-label={`Definition: ${resolved.term}`}
            className='fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border border-stroke-default bg-surface-elevated px-5 pb-8 pt-3 shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:bottom-auto md:w-[420px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl'
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <div className='mx-auto mb-3 h-1 w-10 rounded-full bg-stroke-default md:hidden' />
            <div className='flex items-start justify-between gap-3'>
              <div className='flex items-center gap-3'>
                {resolved.symbol && (
                  <span
                    className='font-astro text-3xl text-lunary-primary'
                    aria-hidden='true'
                  >
                    {resolved.symbol}
                  </span>
                )}
                <div>
                  <h3 className='text-lg font-semibold text-content-primary'>
                    {resolved.term}
                  </h3>
                  <p className='mt-0.5 text-xs uppercase tracking-wide text-content-muted'>
                    {CATEGORY_LABELS[resolved.category]}
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={onClose}
                className='rounded-full p-1.5 text-content-muted hover:bg-surface-muted hover:text-content-primary'
                aria-label='Close definition'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            <p className='mt-4 text-sm font-medium leading-relaxed text-content-primary'>
              {resolved.short}
            </p>
            <p className='mt-2 text-sm leading-relaxed text-content-secondary'>
              {resolved.long}
            </p>

            {related.length > 0 && (
              <div className='mt-5'>
                <h4 className='mb-2 text-xs font-semibold uppercase tracking-wide text-content-muted'>
                  Related
                </h4>
                <div className='flex flex-wrap gap-1.5'>
                  {related.map((r) => (
                    <button
                      key={r.id}
                      type='button'
                      onClick={() => onSelectRelated?.(r)}
                      className='rounded-full border border-stroke-default bg-surface-muted px-2.5 py-1 text-xs font-medium text-content-secondary transition hover:border-lunary-primary/40 hover:text-content-primary'
                    >
                      {r.symbol && (
                        <span className='mr-1 font-astro' aria-hidden='true'>
                          {r.symbol}
                        </span>
                      )}
                      {r.term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default GlossarySheet;
