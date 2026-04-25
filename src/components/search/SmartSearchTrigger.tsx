'use client';

/**
 * SmartSearchTrigger — the small chip that opens the Cmd-K overlay.
 *
 * Renders a button styled like a search bar ("Cmd K  Search"), and listens
 * globally for Cmd/Ctrl + K to open the same overlay. Mount once per app.
 *
 * TODO(integration): Drop `<SmartSearchTrigger />` into the authenticated
 * shell so it lives on every page. Best home is `src/components/AppChrome.tsx`
 * (top bar / nav region) since it already wraps every signed-in route. If
 * the trigger should also exist on marketing pages, also add it inside
 * `src/components/MarketingNavbar.tsx`. Do NOT mount it in
 * `src/app/layout.tsx` — that would render it on auth screens too.
 */

import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import dynamic from 'next/dynamic';

import { cn } from '@/lib/utils';

const SmartSearch = dynamic(
  () => import('./SmartSearch').then((m) => m.SmartSearch),
  { ssr: false },
);

interface SmartSearchTriggerProps {
  className?: string;
}

export function SmartSearchTrigger({ className }: SmartSearchTriggerProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      const isModK = (e.metaKey || e.ctrlKey) && key === 'k';
      if (isModK) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (key === 'escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <button
        type='button'
        onClick={handleOpen}
        aria-label='Open search'
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-lunary-primary/30 bg-white/5 px-3 py-1.5 text-sm text-content-primary/70 transition-colors hover:border-lunary-primary/60 hover:text-content-primary focus:outline-none focus:ring-2 focus:ring-lunary-primary/40',
          className,
        )}
      >
        <Search className='h-4 w-4 text-lunary-primary' aria-hidden />
        <span className='hidden sm:inline'>Search</span>
        <kbd className='ml-1 hidden rounded bg-lunary-primary/15 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-lunary-primary sm:inline'>
          {'\u2318'}K
        </kbd>
      </button>
      {open ? <SmartSearch onClose={handleClose} /> : null}
    </>
  );
}

export default SmartSearchTrigger;
