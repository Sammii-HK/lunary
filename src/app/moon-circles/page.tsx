import Link from 'next/link';
import { sql } from '@vercel/postgres';
import { MoonCircleInsights } from '@/components/MoonCircleInsights';
import { cn } from '@/lib/utils';

export const revalidate = 300;

type MoonPhaseFilter = 'New Moon' | 'Full Moon' | null;

interface MoonCircleRecord {
  id: number;
  moon_phase: string;
  event_date: string | Date | null;
  title: string | null;
  theme: string | null;
  description: string | null;
  focus_points: unknown;
  insight_count: number | null;
}

const normalizePhaseFilter = (value?: string | null): MoonPhaseFilter => {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === 'new') return 'New Moon';
  if (normalized === 'full') return 'Full Moon';
  return null;
};

const formatReadableDate = (value?: string | Date | null) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const parseFocusPoints = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : ''))
      .filter(Boolean)
      .slice(0, 3);
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === 'string' ? item : ''))
          .filter(Boolean)
          .slice(0, 3);
      }
    } catch {
      return [];
    }
  }
  return [];
};

const mapCircleRow = (row: MoonCircleRecord) => ({
  id: row.id,
  moon_phase: row.moon_phase,
  event_date:
    row.event_date instanceof Date
      ? row.event_date.toISOString()
      : row.event_date
        ? new Date(row.event_date).toISOString()
        : null,
  title: row.title,
  theme: row.theme,
  description: row.description,
  focus_points: parseFocusPoints(row.focus_points),
  insight_count: Number(row.insight_count ?? 0),
});

interface MoonCirclesPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MoonCirclesPage({
  searchParams,
}: MoonCirclesPageProps) {
  const resolvedSearch = searchParams ? await searchParams : undefined;
  const phaseFilter = normalizePhaseFilter(
    Array.isArray(resolvedSearch?.phase)
      ? resolvedSearch?.phase[0]
      : resolvedSearch?.phase,
  );

  const circlesResult = phaseFilter
    ? await sql`
        SELECT id, moon_phase, event_date, title, theme, description, focus_points, insight_count
        FROM moon_circles
        WHERE moon_phase = ${phaseFilter}
        ORDER BY event_date DESC
        LIMIT 8
      `
    : await sql`
        SELECT id, moon_phase, event_date, title, theme, description, focus_points, insight_count
        FROM moon_circles
        ORDER BY event_date DESC
        LIMIT 8
      `;

  const circles = circlesResult.rows.map((row) =>
    mapCircleRow(row as MoonCircleRecord),
  );

  return (
    <div className='space-y-12 py-8'>
      <header className='space-y-6 text-center'>
        <p className='text-xs uppercase tracking-[0.3em] text-purple-200/80'>
          Moon Circle Community
        </p>
        <h1 className='text-4xl font-semibold tracking-tight text-white sm:text-5xl'>
          Share sacred insights with every moon
        </h1>
        <p className='mx-auto max-w-3xl text-base text-purple-100/80 sm:text-lg'>
          Each new and full moon gathering invites reflection, ritual, and
          community. Browse past circles, read what others experienced, and
          anonymously share your own insight after each ceremony.
        </p>
        <div className='flex flex-wrap items-center justify-center gap-3'>
          {[
            { label: 'All circles', value: null },
            { label: 'New Moon', value: 'new' },
            { label: 'Full Moon', value: 'full' },
          ].map((filter) => {
            const isActive =
              (filter.value === null && !phaseFilter) ||
              (filter.value === 'new' && phaseFilter === 'New Moon') ||
              (filter.value === 'full' && phaseFilter === 'Full Moon');
            const href =
              filter.value === null
                ? '/moon-circles'
                : `/moon-circles?phase=${filter.value}`;
            return (
              <Link
                key={filter.label}
                href={href}
                className={cn(
                  'rounded-full border border-purple-500/30 px-4 py-2 text-sm font-medium transition hover:border-purple-300',
                  isActive
                    ? 'bg-purple-500 text-white'
                    : 'bg-transparent text-purple-100',
                )}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </header>

      {circles.length === 0 && (
        <div className='rounded-3xl border border-dashed border-purple-500/40 bg-purple-500/5 p-10 text-center text-purple-100/80'>
          No Moon Circles found yet. Check back soon for upcoming gatherings.
        </div>
      )}

      <div className='space-y-10'>
        {circles.map((circle) => (
          <section
            key={circle.id}
            className='rounded-3xl border border-purple-500/30 bg-black/40 p-6 shadow-lg shadow-purple-500/20 backdrop-blur'
          >
            <div className='grid gap-8 lg:grid-cols-[1.2fr_0.8fr]'>
              <div className='space-y-5'>
                <div className='flex flex-wrap items-center gap-3'>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                      circle.moon_phase === 'Full Moon'
                        ? 'bg-amber-400/20 text-amber-100'
                        : 'bg-indigo-400/20 text-indigo-100',
                    )}
                  >
                    {circle.moon_phase}
                  </span>
                  <span className='rounded-full border border-purple-500/30 px-3 py-1 text-xs text-purple-100/80'>
                    {formatReadableDate(circle.event_date)}
                  </span>
                  <span className='rounded-full border border-purple-500/30 px-3 py-1 text-xs text-purple-100/80'>
                    {circle.insight_count} insight
                    {circle.insight_count === 1 ? '' : 's'}
                  </span>
                </div>
                <div className='space-y-2'>
                  <h2 className='text-2xl font-semibold text-white'>
                    {circle.theme || circle.title || 'Moon Circle'}
                  </h2>
                  {circle.description && (
                    <p className='text-sm text-purple-100/80'>
                      {circle.description}
                    </p>
                  )}
                </div>
                {circle.focus_points.length > 0 && (
                  <div className='space-y-2'>
                    <p className='text-xs uppercase tracking-[0.2em] text-purple-200/70'>
                      Focus
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {circle.focus_points.map((focus) => (
                        <span
                          key={focus}
                          className='rounded-full border border-purple-500/30 px-3 py-1 text-xs text-purple-100/80'
                        >
                          {focus}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className='flex flex-wrap gap-3'>
                  <Link
                    href={`/moon-circles/${circle.id}`}
                    className='inline-flex items-center justify-center rounded-2xl bg-white/90 px-5 py-2.5 text-sm font-semibold text-purple-900 shadow-inner hover:bg-white'
                  >
                    View circle details
                  </Link>
                  <Link
                    href={`/moon-circles/${circle.id}?share=true`}
                    className='inline-flex items-center justify-center rounded-2xl border border-purple-500/40 px-5 py-2.5 text-sm font-semibold text-purple-100 hover:border-purple-300 hover:text-white'
                  >
                    Share an insight
                  </Link>
                </div>
              </div>

              <MoonCircleInsights
                moonCircleId={circle.id}
                moonPhase={circle.moon_phase}
                date={circle.event_date}
                insightCount={circle.insight_count}
                collapsedByDefault
                autoFetch={false}
                pageSize={2}
                showShareForm={false}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
