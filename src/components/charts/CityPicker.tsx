'use client';

/**
 * CityPicker — debounced city/location autocomplete that returns
 * `{ lat, lon, label }` to the parent. Reuses `/api/location/suggest`
 * (LocationIQ) which already powers the onboarding birth-location field.
 *
 * Designed to replace raw lat/lon numeric inputs anywhere in the app
 * (e.g. Time Machine, future event tools).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, MapPin, X } from 'lucide-react';

export type CityPickerValue = {
  lat: number;
  lon: number;
  label: string;
};

type LocationSuggestion = {
  label: string;
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
};

interface CityPickerProps {
  value: CityPickerValue | null;
  onChange: (value: CityPickerValue | null) => void;
  placeholder?: string;
  label?: string;
  /** Show as compact (no label, denser spacing). */
  compact?: boolean;
  className?: string;
  inputClassName?: string;
}

export function CityPicker({
  value,
  onChange,
  placeholder = 'Search a city, region, or country',
  label = 'Location',
  compact = false,
  className = '',
  inputClassName = '',
}: CityPickerProps) {
  const [query, setQuery] = useState<string>(value?.label ?? '');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef<string | null>(null);
  const lastSelectionRef = useRef<string | null>(value?.label ?? null);
  const blurTimeoutRef = useRef<number | null>(null);

  // Keep input in sync if parent updates `value` (e.g. prefill).
  useEffect(() => {
    if (value?.label && value.label !== query) {
      setQuery(value.label);
      lastSelectionRef.current = value.label;
    }
    if (!value && query && lastSelectionRef.current === query) {
      // Parent cleared selection — keep the typed text.
      lastSelectionRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.label, value?.lat, value?.lon]);

  // Debounced suggestion fetch.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3 || trimmed === lastSelectionRef.current) {
      setSuggestions([]);
      setError(null);
      return;
    }

    if (lastQueryRef.current === trimmed && suggestions.length) return;

    const timeout = window.setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      lastQueryRef.current = trimmed;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/location/suggest?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error('Could not load suggestions');
        const json = (await res.json()) as { results?: LocationSuggestion[] };
        setSuggestions(Array.isArray(json.results) ? json.results : []);
        setOpen(true);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Could not load suggestions');
          setSuggestions([]);
          setOpen(true);
        }
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [query, suggestions.length]);

  const cancelBlur = useCallback(() => {
    if (blurTimeoutRef.current !== null) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelBlur();
    blurTimeoutRef.current = window.setTimeout(() => setOpen(false), 150);
  }, [cancelBlur]);

  const select = useCallback(
    (s: LocationSuggestion) => {
      cancelBlur();
      setQuery(s.label);
      lastSelectionRef.current = s.label;
      setSuggestions([]);
      setOpen(false);
      onChange({ lat: s.latitude, lon: s.longitude, label: s.label });
    },
    [cancelBlur, onChange],
  );

  const clear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setError(null);
    setOpen(false);
    lastSelectionRef.current = null;
    onChange(null);
  }, [onChange]);

  return (
    <div className={`relative flex flex-col gap-1 ${className}`}>
      {!compact && (
        <span className='text-xs font-semibold uppercase tracking-wider text-content-muted'>
          {label}
        </span>
      )}
      <div className='relative'>
        <MapPin className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted' />
        <input
          type='text'
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // typing invalidates previous selection coords
            if (
              value &&
              lastSelectionRef.current &&
              e.target.value !== lastSelectionRef.current
            ) {
              onChange(null);
              lastSelectionRef.current = null;
            }
          }}
          onFocus={() => {
            if (suggestions.length) setOpen(true);
          }}
          onBlur={scheduleClose}
          placeholder={placeholder}
          aria-label={label}
          autoComplete='off'
          className={`w-full rounded-lg border border-stroke-subtle bg-layer-base/40 py-2 pl-9 pr-9 text-sm text-content-primary placeholder:text-content-muted focus:border-lunary-primary focus:outline-none ${inputClassName}`}
        />
        {loading && (
          <Loader2 className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-content-muted' />
        )}
        {!loading && query && (
          <button
            type='button'
            onClick={clear}
            onMouseDown={(e) => e.preventDefault()}
            aria-label='Clear location'
            className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-content-muted hover:text-content-primary'
          >
            <X className='h-3.5 w-3.5' />
          </button>
        )}
      </div>

      {open && (suggestions.length > 0 || error) && (
        <ul
          className='absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-lg border border-stroke-subtle bg-surface-elevated/95 p-1 text-sm shadow-lg backdrop-blur'
          onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={cancelBlur}
        >
          {error && (
            <li className='px-3 py-2 text-xs text-content-muted'>{error}</li>
          )}
          {suggestions.map((s) => (
            <li key={`${s.latitude}-${s.longitude}-${s.label}`}>
              <button
                type='button'
                onClick={() => select(s)}
                className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-content-primary hover:bg-lunary-primary/10'
              >
                <MapPin className='h-3.5 w-3.5 text-lunary-accent' />
                <span className='truncate'>{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {value && !compact && (
        <span className='text-[11px] text-content-muted'>
          {value.lat.toFixed(3)}°, {value.lon.toFixed(3)}°
        </span>
      )}
    </div>
  );
}

export default CityPicker;
