'use client';

/**
 * SmartSearch — the Cmd-K overlay for the Lunary app.
 *
 * On open, fetches journal entries, glossary terms (static), and upcoming
 * transits, builds a flat search index, and renders ranked results as the
 * user types. Click a result -> router.push(href) + close.
 *
 * Renders as a centered modal on desktop and a bottom sheet on mobile.
 * Animation via motion/react. ESC / backdrop click closes.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  CalendarDays,
  CircleUserRound,
  Command,
  MoonStar,
  NotebookPen,
  Search,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react';

import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/utils';
import { GLOSSARY_LIST } from '@/lib/glossary/terms';
import {
  buildSearchIndex,
  searchIndex,
  type SearchIndexItem,
  type SearchKind,
  type RawJournalEntry,
  type RawTarotReading,
  type RawTransit,
} from '@/lib/search/index-builder';

interface SmartSearchProps {
  onClose: () => void;
}

const KIND_META: Record<
  SearchKind,
  { label: string; Icon: typeof Search; tint: string }
> = {
  command: {
    label: 'Action',
    Icon: Command,
    tint: 'text-lunary-primary',
  },
  journal: {
    label: 'Journal',
    Icon: NotebookPen,
    tint: 'text-lunary-rose',
  },
  glossary: {
    label: 'Glossary',
    Icon: BookOpen,
    tint: 'text-lunary-primary-300',
  },
  tarot: {
    label: 'Tarot',
    Icon: MoonStar,
    tint: 'text-lunary-secondary',
  },
  transit: {
    label: 'Transit',
    Icon: Sparkles,
    tint: 'text-lunary-accent',
  },
};

const COMMAND_ITEMS: SearchIndexItem[] = [
  {
    id: 'command:birth-chart',
    kind: 'command',
    title: 'Open birth chart',
    snippet: 'Read your natal chart, placements and next important dates.',
    href: '/app/birth-chart',
    keywords: ['birth', 'chart', 'natal', 'placements', 'wheel'],
  },
  {
    id: 'command:transits',
    kind: 'command',
    title: "Read today's transits",
    snippet: 'See what is active in your chart right now.',
    href: '/horoscope',
    keywords: ['transits', 'horoscope', 'today', 'sky', 'current'],
  },
  {
    id: 'command:tarot',
    kind: 'command',
    title: 'Open tarot room',
    snippet: 'Daily card, weekly card, spreads and pattern intelligence.',
    href: '/tarot',
    keywords: ['tarot', 'card', 'spread', 'daily', 'weekly'],
  },
  {
    id: 'command:time-machine',
    kind: 'command',
    title: 'Open Time Machine',
    snippet: 'Jump to a date and see the sky around that moment.',
    href: '/app/time-machine',
    keywords: ['time', 'machine', 'date', 'past', 'future', 'sky'],
  },
  {
    id: 'command:journal',
    kind: 'command',
    title: 'Write in journal',
    snippet: 'Capture a reflection, dream or ritual note.',
    href: '/book-of-shadows/journal',
    keywords: ['journal', 'write', 'reflection', 'dream', 'ritual'],
  },
  {
    id: 'command:group-sky',
    kind: 'command',
    title: 'Open Group Sky',
    snippet: 'Compare charts and relationship timing.',
    href: '/app/group-sky',
    keywords: ['group', 'sky', 'friends', 'relationship', 'synastry'],
  },
  {
    id: 'command:profile',
    kind: 'command',
    title: 'Edit profile and birth data',
    snippet: 'Update birth time, location and personal settings.',
    href: '/profile',
    keywords: ['profile', 'birth', 'data', 'location', 'settings'],
  },
];

const COMMAND_ICONS: Record<string, typeof Search> = {
  'command:birth-chart': CircleUserRound,
  'command:transits': Sparkles,
  'command:tarot': MoonStar,
  'command:time-machine': CalendarDays,
  'command:journal': NotebookPen,
  'command:group-sky': UsersRound,
  'command:profile': CircleUserRound,
};

export function SmartSearch({ onClose }: SmartSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchIndexItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Focus the input on mount.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on ESC.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Build the index once on open from journal + glossary + transits.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [journalRes, tarotRes, transitRes] = await Promise.allSettled([
          fetch('/api/journal?limit=50', { credentials: 'include' }).then(
            (r) => (r.ok ? r.json() : null),
          ),
          fetch('/api/tarot/readings?limit=20', {
            credentials: 'include',
          }).then((r) => (r.ok ? r.json() : null)),
          fetch('/api/v1/astrology/transits', {
            credentials: 'include',
          }).then((r) => (r.ok ? r.json() : null)),
        ]);

        const journal: RawJournalEntry[] =
          journalRes.status === 'fulfilled' && journalRes.value
            ? (journalRes.value.entries ?? [])
            : [];

        const transits: RawTransit[] =
          transitRes.status === 'fulfilled' && transitRes.value
            ? (transitRes.value.data?.transits ??
              transitRes.value.transits ??
              [])
            : [];
        const tarotReadings: RawTarotReading[] =
          tarotRes.status === 'fulfilled' && tarotRes.value
            ? (tarotRes.value.readings ?? []).filter(
                (reading: RawTarotReading) => (reading.cards?.length ?? 0) > 1,
              )
            : [];

        const next = buildSearchIndex({
          journal,
          glossary: GLOSSARY_LIST,
          tarotReadings,
          transits,
        });
        if (!cancelled) setItems(next);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) {
      return COMMAND_ITEMS;
    }
    return searchIndex([...COMMAND_ITEMS, ...items], query, 24);
  }, [items, query]);

  // Reset highlight when results change.
  useEffect(() => {
    setActiveIndex(0);
  }, [query, results.length]);

  const goTo = useCallback(
    (item: SearchIndexItem) => {
      onClose();
      router.push(item.href);
    },
    [onClose, router],
  );

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      const item = results[activeIndex];
      if (item) {
        e.preventDefault();
        goTo(item);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key='smart-search'
        className='fixed inset-0 z-[100] flex items-end justify-center sm:items-start sm:pt-[10vh]'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {/* Backdrop */}
        <button
          type='button'
          aria-label='Close search'
          onClick={onClose}
          className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        />

        {/* Panel — bottom sheet on mobile, modal on desktop */}
        <motion.div
          role='dialog'
          aria-modal='true'
          aria-label='Search'
          className={cn(
            'relative z-10 w-full overflow-hidden border border-white/10 bg-[#0b0a14] text-content-primary shadow-2xl',
            'rounded-t-2xl sm:max-w-xl sm:rounded-2xl',
          )}
          initial={{ y: 40, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <div className='flex items-center gap-3 border-b border-white/10 px-4 py-3'>
            <Search className='h-5 w-5 text-lunary-primary' aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder={'Search or run a command\u2026'}
              className='flex-1 bg-transparent text-base text-content-primary placeholder:text-content-primary/40 focus:outline-none'
              aria-label='Search'
            />
            <button
              type='button'
              onClick={onClose}
              className='rounded-full p-1 text-content-primary/50 hover:bg-white/10 hover:text-content-primary'
              aria-label='Close'
            >
              <X className='h-4 w-4' />
            </button>
          </div>

          <div className='max-h-[60vh] overflow-y-auto px-2 py-2 sm:max-h-[50vh]'>
            {loading && items.length === 0 ? (
              <div className='px-4 py-8 text-center text-sm text-content-primary/50'>
                {'Loading the cosmos\u2026'}
              </div>
            ) : results.length === 0 ? (
              <div className='px-4 py-8 text-center text-sm text-content-primary/50'>
                {query.trim()
                  ? `No matches for "${query.trim()}"`
                  : 'Type to search, or pick a quick action.'}
              </div>
            ) : (
              <ul role='listbox' className='space-y-1'>
                {!query.trim() ? (
                  <li className='px-3 pb-1 pt-2'>
                    <Heading
                      as='h4'
                      variant='h4'
                      className='!mb-0 text-content-primary/40'
                    >
                      Quick actions
                    </Heading>
                  </li>
                ) : null}
                {results.map((item, idx) => {
                  const meta = KIND_META[item.kind];
                  const Icon =
                    item.kind === 'command'
                      ? (COMMAND_ICONS[item.id] ?? meta.Icon)
                      : meta.Icon;
                  const active = idx === activeIndex;
                  return (
                    <li key={item.id}>
                      <button
                        type='button'
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => goTo(item)}
                        className={cn(
                          'group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                          active ? 'bg-lunary-primary/15' : 'hover:bg-white/5',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white/5',
                            meta.tint,
                          )}
                        >
                          <Icon className='h-4 w-4' aria-hidden />
                        </span>
                        <span className='min-w-0 flex-1'>
                          <span className='flex items-center gap-2'>
                            <span className='truncate text-sm font-medium text-content-primary'>
                              {item.title}
                            </span>
                            <span className='flex-none rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-content-primary/50'>
                              {meta.label}
                            </span>
                          </span>
                          {item.snippet ? (
                            <span className='mt-0.5 line-clamp-2 block text-xs text-content-primary/60'>
                              {item.snippet}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className='flex items-center justify-between border-t border-white/10 px-4 py-2 text-[10px] text-content-primary/40'>
            <span>
              <kbd className='rounded bg-white/10 px-1 py-0.5'>{'\u2191'}</kbd>{' '}
              <kbd className='rounded bg-white/10 px-1 py-0.5'>{'\u2193'}</kbd>{' '}
              navigate
            </span>
            <span>
              <kbd className='rounded bg-white/10 px-1 py-0.5'>Enter</kbd> open
            </span>
            <span>
              <kbd className='rounded bg-white/10 px-1 py-0.5'>Esc</kbd> close
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SmartSearch;
