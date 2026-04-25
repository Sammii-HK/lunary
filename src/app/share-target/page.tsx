'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { useEffect, useMemo } from 'react';
import { captureEvent } from '@/lib/posthog-client';

/**
 * /share-target
 *
 * Endpoint registered as the PWA Web Share Target (see public/manifest.json).
 * When a user shares text/url/title from another app into Lunary (after the
 * PWA has been installed), the OS opens this route with `?title=&text=&url=`.
 *
 * We parse the incoming payload, look for date / birthday / lunary-url / pure-text
 * signals, and present 1-3 contextual CTA cards that route the user into the
 * right Lunary surface (time machine, save-a-friend, book-of-shadows, etc).
 */

type SharePayload = {
  title: string;
  text: string;
  url: string;
};

type ResolvedAction =
  | {
      kind: 'lunary-url';
      label: string;
      description: string;
      href: string;
    }
  | {
      kind: 'birthday';
      label: string;
      description: string;
      href: string;
      name?: string;
      isoDate: string;
    }
  | {
      kind: 'date';
      label: string;
      description: string;
      href: string;
      isoDate: string;
    }
  | {
      kind: 'journal';
      label: string;
      description: string;
      href: string;
    }
  | {
      kind: 'fallback';
      label: string;
      description: string;
      href: string;
    };

const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const pad = (n: number) => String(n).padStart(2, '0');

const isValidDateParts = (year: number, month: number, day: number) => {
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  )
    return false;
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  // js Date validates day-in-month
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
};

const toIso = (year: number, month: number, day: number) =>
  `${year}-${pad(month)}-${pad(day)}`;

/**
 * Permissive date extractor — returns the first plausible ISO date string
 * (YYYY-MM-DD) found in `input`, or null. Supports:
 *   - 1994-08-12 (ISO)
 *   - 08/12/1994 (US MM/DD/YYYY) and 12/08/1994 (DD/MM/YYYY) — heuristic
 *   - August 12 1994 / Aug 12, 1994 / 12 August 1994
 */
function extractDate(input: string): string | null {
  if (!input) return null;
  const text = input.trim();

  // ISO YYYY-MM-DD
  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    const d = Number(iso[3]);
    if (isValidDateParts(y, m, d)) return toIso(y, m, d);
  }

  // Numeric MM/DD/YYYY or DD/MM/YYYY (also supports - separator)
  const numeric = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (numeric) {
    const a = Number(numeric[1]);
    const b = Number(numeric[2]);
    const y = Number(numeric[3]);
    // Prefer MM/DD; fall back to DD/MM if first interpretation invalid.
    if (isValidDateParts(y, a, b)) return toIso(y, a, b);
    if (isValidDateParts(y, b, a)) return toIso(y, b, a);
  }

  // "Month DD YYYY" or "Month DD, YYYY"
  const monthFirst = text.match(
    /\b([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/,
  );
  if (monthFirst) {
    const month = MONTHS[monthFirst[1].toLowerCase()];
    const day = Number(monthFirst[2]);
    const year = Number(monthFirst[3]);
    if (month && isValidDateParts(year, month, day))
      return toIso(year, month, day);
  }

  // "DD Month YYYY"
  const dayFirst = text.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})\b/,
  );
  if (dayFirst) {
    const month = MONTHS[dayFirst[2].toLowerCase()];
    const day = Number(dayFirst[1]);
    const year = Number(dayFirst[3]);
    if (month && isValidDateParts(year, month, day))
      return toIso(year, month, day);
  }

  return null;
}

const BIRTHDAY_PATTERN = /\b(birthday|born on|b-?day|date of birth|dob)\b/i;

/**
 * Cheap heuristic for "this looks like 'name + birthday'":
 * grabs the first "Title Case" name-shaped fragment near a birthday keyword.
 */
function extractName(combined: string): string | undefined {
  if (!combined) return undefined;
  // "Name's birthday" or "Name was born on..."
  const possessive = combined.match(
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})(?:'s|\s+was\s+born|\s+is\s+born)/,
  );
  if (possessive?.[1]) return possessive[1].trim();

  // Otherwise the first 1-3-word Title Case run.
  const titleCase = combined.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/);
  if (titleCase?.[1] && titleCase[1].length <= 60) return titleCase[1].trim();

  return undefined;
}

/**
 * Detect a Lunary URL and return its path + search if so.
 * Accepts lunary.app and www.lunary.app.
 */
function extractLunaryPath(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!/^(www\.)?lunary\.app$/i.test(parsed.hostname)) return null;
    const path = parsed.pathname || '/';
    return `${path}${parsed.search}`;
  } catch {
    return null;
  }
}

function buildActions(payload: SharePayload): {
  actions: ResolvedAction[];
  primaryKind: ResolvedAction['kind'];
} {
  const combined = [payload.title, payload.text, payload.url]
    .filter(Boolean)
    .join('\n');

  const lunaryPath = extractLunaryPath(payload.url);
  if (lunaryPath) {
    return {
      actions: [
        {
          kind: 'lunary-url',
          label: 'Open in Lunary',
          description: `Continue to ${lunaryPath}`,
          href: lunaryPath,
        },
      ],
      primaryKind: 'lunary-url',
    };
  }

  const isoDate = extractDate(combined);
  const looksLikeBirthday = BIRTHDAY_PATTERN.test(combined);

  const actions: ResolvedAction[] = [];

  if (isoDate && looksLikeBirthday) {
    const name = extractName(combined);
    const params = new URLSearchParams();
    if (name) params.set('prefillName', name);
    params.set('birthDate', isoDate);
    actions.push({
      kind: 'birthday',
      label: 'Save as a friend',
      description: name
        ? `Add ${name} (born ${isoDate}) to your Lunary friends.`
        : `Add a friend born on ${isoDate}.`,
      href: `/profile/friends?${params.toString()}`,
      name,
      isoDate,
    });
  }

  if (isoDate) {
    actions.push({
      kind: 'date',
      label: 'Open in Time Machine',
      description: `See the cosmos on ${isoDate}.`,
      href: `/app/time-machine?date=${encodeURIComponent(isoDate)}`,
      isoDate,
    });
  }

  if (payload.text || payload.title) {
    const prefill = payload.text || payload.title;
    actions.push({
      kind: 'journal',
      label: 'Journal about this',
      description: 'Drop it into your Book of Shadows.',
      href: `/book-of-shadows?prefill=${encodeURIComponent(prefill.slice(0, 600))}`,
    });
  }

  if (actions.length === 0) {
    actions.push({
      kind: 'fallback',
      label: 'Open Lunary',
      description: 'Head to your home dashboard.',
      href: '/app',
    });
  }

  return { actions, primaryKind: actions[0].kind };
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className='inline-flex max-w-full items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-300'>
      <span className='font-medium uppercase tracking-wide text-zinc-500'>
        {label}
      </span>
      <span className='truncate text-zinc-200'>{value}</span>
    </div>
  );
}

export default function ShareTargetPage() {
  const searchParams = useSearchParams();

  const payload: SharePayload = useMemo(
    () => ({
      title: searchParams?.get('title')?.slice(0, 500) ?? '',
      text: searchParams?.get('text')?.slice(0, 4000) ?? '',
      url: searchParams?.get('url')?.slice(0, 2000) ?? '',
    }),
    [searchParams],
  );

  const { actions, primaryKind } = useMemo(
    () => buildActions(payload),
    [payload],
  );

  useEffect(() => {
    captureEvent('pwa_share_target_received', {
      resolved_type: primaryKind,
      had_title: Boolean(payload.title),
      had_text: Boolean(payload.text),
      had_url: Boolean(payload.url),
      action_count: actions.length,
    });
  }, [primaryKind, payload, actions.length]);

  const hasAnyInput = Boolean(payload.title || payload.text || payload.url);

  return (
    <main className='mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col gap-6 px-5 pb-16 pt-10 text-zinc-100'>
      <header className='flex flex-col gap-2'>
        <span className='text-xs uppercase tracking-[0.2em] text-violet-300/80'>
          Lunary
        </span>
        <h1 className='text-2xl font-semibold text-zinc-50'>
          Shared into Lunary
        </h1>
        <p className='text-sm text-zinc-400'>
          {hasAnyInput
            ? 'We had a peek at what you sent — here are a few places it might fit.'
            : 'Nothing was shared this time. Open Lunary to keep going.'}
        </p>
      </header>

      {hasAnyInput && (
        <section className='flex flex-wrap gap-2'>
          {payload.title && <Chip label='Title' value={payload.title} />}
          {payload.text && <Chip label='Text' value={payload.text} />}
          {payload.url && <Chip label='URL' value={payload.url} />}
        </section>
      )}

      <section className='flex flex-col gap-3'>
        {actions.map((action, index) => (
          <motion.div
            key={`${action.kind}-${index}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.06,
              duration: 0.35,
              ease: 'easeOut',
            }}
          >
            <Link
              href={action.href}
              className='group flex flex-col gap-1 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 p-4 transition hover:border-violet-500/60 hover:from-violet-950/40'
              prefetch={false}
            >
              <div className='flex items-center justify-between'>
                <span className='text-base font-semibold text-zinc-50'>
                  {action.label}
                </span>
                <span
                  aria-hidden
                  className='text-violet-300 transition-transform group-hover:translate-x-0.5'
                >
                  →
                </span>
              </div>
              <span className='text-sm text-zinc-400'>
                {action.description}
              </span>
            </Link>
          </motion.div>
        ))}
      </section>

      <footer className='mt-auto pt-6'>
        <Link
          href='/app'
          className='text-xs text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline'
          prefetch={false}
        >
          Skip and open Lunary home
        </Link>
      </footer>
    </main>
  );
}
