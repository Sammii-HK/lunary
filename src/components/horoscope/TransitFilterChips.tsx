'use client';

import { useCallback, useEffect, useState } from 'react';

export type TransitFilter =
  | 'all'
  | 'personal'
  | 'major'
  | 'this-week'
  | 'retrogrades';

const STORAGE_KEY = 'lunary:transit-filter';
const DEFAULT_FILTER: TransitFilter = 'personal';

const FILTER_OPTIONS: Array<{ value: TransitFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'personal', label: 'Personal' },
  { value: 'major', label: 'Major only' },
  { value: 'this-week', label: 'This week' },
  { value: 'retrogrades', label: 'Retrogrades' },
];

function readStoredFilter(): TransitFilter {
  if (typeof window === 'undefined') return DEFAULT_FILTER;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FILTER;
    const isValid = FILTER_OPTIONS.some((o) => o.value === raw);
    return isValid ? (raw as TransitFilter) : DEFAULT_FILTER;
  } catch {
    return DEFAULT_FILTER;
  }
}

/**
 * Hook for any consumer that wants to read or set the active transit filter.
 * Side effects are intentionally limited to localStorage persistence.
 */
export function useTransitFilter(): {
  filter: TransitFilter;
  setFilter: (next: TransitFilter) => void;
} {
  const [filter, setFilterState] = useState<TransitFilter>(DEFAULT_FILTER);

  // Hydrate from localStorage on mount (SSR-safe).
  useEffect(() => {
    setFilterState(readStoredFilter());
  }, []);

  const setFilter = useCallback((next: TransitFilter) => {
    setFilterState(next);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable (Safari private mode etc.) — ignore.
    }
  }, []);

  return { filter, setFilter };
}

interface TransitFilterChipsProps {
  filter?: TransitFilter;
  onChange?: (next: TransitFilter) => void;
  className?: string;
}

/**
 * Pill-chip filter row for the transit calendar. Single-select; persists choice
 * to localStorage. Use either as a controlled component (pass filter+onChange)
 * or uncontrolled (omit them and it manages its own state via useTransitFilter).
 */
export function TransitFilterChips({
  filter: controlledFilter,
  onChange,
  className,
}: TransitFilterChipsProps) {
  const internal = useTransitFilter();
  const isControlled = controlledFilter !== undefined && onChange !== undefined;
  const filter = isControlled ? controlledFilter : internal.filter;
  const setFilter = isControlled ? onChange : internal.setFilter;

  return (
    <div
      role='radiogroup'
      aria-label='Filter transits'
      className={[
        'flex flex-nowrap gap-2 overflow-x-auto pb-1',
        '-mx-1 px-1 scrollbar-none',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {FILTER_OPTIONS.map((option) => {
        const isActive = filter === option.value;
        return (
          <button
            key={option.value}
            type='button'
            role='radio'
            aria-checked={isActive}
            tabIndex={0}
            onClick={() => setFilter(option.value)}
            className={[
              'shrink-0 select-none rounded-full px-3 py-1.5 text-xs font-medium',
              'border transition-all duration-150 ease-out',
              'active:scale-95 active:opacity-90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lunary-primary-500/60',
              isActive
                ? 'border-lunary-primary-700 bg-lunary-primary-700/20 text-lunary-primary shadow-[0_0_0_1px_rgba(124,107,242,0.25)]'
                : 'border-stroke-subtle bg-surface-card/40 text-content-primary hover:border-lunary-primary-700/60 hover:text-lunary-primary',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default TransitFilterChips;
