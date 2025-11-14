import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sql } from '@vercel/postgres';
import { MoonCircleInsights } from '@/components/MoonCircleInsights';
import { ShareInsightForm } from '@/components/ShareInsightForm';
import { cn } from '@/lib/utils';

export const revalidate = 120;

interface MoonCircleDetailRecord {
  id: number;
  moon_phase: string;
  event_date: string | Date | null;
  title: string | null;
  theme: string | null;
  description: string | null;
  focus_points: unknown;
  rituals: unknown;
  journal_prompts: unknown;
  astrology_highlights: unknown;
  resource_links: unknown;
  insight_count: number | null;
}

const parseStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : ''))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === 'string' ? item : ''))
          .filter(Boolean);
      }
    } catch {
      return value ? [value] : [];
    }
  }
  return [];
};

interface ResourceLink {
  label?: string;
  url?: string;
}

const parseResourceLinks = (value: unknown): ResourceLink[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const label =
            'label' in item && typeof item.label === 'string'
              ? item.label
              : undefined;
          const url =
            'url' in item && typeof item.url === 'string'
              ? item.url
              : undefined;
          if (label || url) return { label, url };
        }
        if (typeof item === 'string') {
          return { label: item, url: item };
        }
        return null;
      })
      .filter((item): item is ResourceLink =>
        Boolean(item?.label || item?.url),
      );
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parseResourceLinks(parsed);
    } catch {
      return value ? [{ label: value, url: value }] : [];
    }
  }
  return [];
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

const mapCircleDetail = (row: MoonCircleDetailRecord) => ({
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
  focus_points: parseStringArray(row.focus_points).slice(0, 5),
  rituals: parseStringArray(row.rituals),
  journal_prompts: parseStringArray(row.journal_prompts),
  astrology_highlights: parseStringArray(row.astrology_highlights),
  resource_links: parseResourceLinks(row.resource_links),
  insight_count: Number(row.insight_count ?? 0),
});

interface MoonCircleDetailPageProps {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function MoonCircleDetailPage({
  params,
  searchParams,
}: MoonCircleDetailPageProps) {
  const moonCircleId = Number.parseInt(params.id, 10);
  if (!Number.isFinite(moonCircleId)) {
    notFound();
  }

  const circleResult = await sql`
    SELECT
      id,
      moon_phase,
      event_date,
      title,
      theme,
      description,
      focus_points,
      rituals,
      journal_prompts,
      astrology_highlights,
      resource_links,
      insight_count
    FROM moon_circles
    WHERE id = ${moonCircleId}
    LIMIT 1
  `;

  if (circleResult.rows.length === 0) {
    notFound();
  }

  const circle = mapCircleDetail(circleResult.rows[0]);

  const relatedResult = await sql`
    SELECT id, moon_phase, event_date, theme, insight_count
    FROM moon_circles
    WHERE id <> ${moonCircleId}
    ORDER BY event_date DESC
    LIMIT 4
  `;

  const related = relatedResult.rows.map((row) => ({
    id: row.id,
    moon_phase: row.moon_phase,
    event_date:
      row.event_date instanceof Date
        ? row.event_date.toISOString()
        : row.event_date
          ? new Date(row.event_date).toISOString()
          : null,
    theme: row.theme,
    insight_count: Number(row.insight_count ?? 0),
  }));

  const shouldAutoFocusShare =
    (Array.isArray(searchParams?.share)
      ? searchParams?.share[0]
      : searchParams?.share) === 'true';

  return (
    <div className='space-y-12 py-8'>
      <section className='rounded-3xl border border-purple-500/30 bg-black/40 p-8 shadow-xl shadow-purple-500/20 backdrop-blur'>
        <div className='space-y-4'>
          <Link
            href='/moon-circles'
            className='inline-flex items-center text-sm text-purple-100/80 hover:text-white'
          >
            ← Back to Moon Circles
          </Link>
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
          <div className='space-y-3'>
            <h1 className='text-4xl font-semibold text-white'>
              {circle.theme || circle.title || 'Moon Circle'}
            </h1>
            {circle.description && (
              <p className='text-base text-purple-100/80'>
                {circle.description}
              </p>
            )}
          </div>
          {circle.focus_points.length > 0 && (
            <div className='space-y-2'>
              <p className='text-xs uppercase tracking-[0.2em] text-purple-200/70'>
                Focus for this circle
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
        </div>
      </section>

      <section className='grid gap-8 lg:grid-cols-[1.2fr_0.8fr]'>
        <MoonCircleInsights
          moonCircleId={circle.id}
          moonPhase={circle.moon_phase}
          date={circle.event_date}
          insightCount={circle.insight_count}
          showShareForm={false}
          autoFetch
          className='h-full'
        />
        <ShareInsightForm
          moonCircleId={circle.id}
          autoFocus={shouldAutoFocusShare}
          className='h-fit'
        />
      </section>

      {(circle.rituals.length > 0 ||
        circle.journal_prompts.length > 0 ||
        circle.astrology_highlights.length > 0) && (
        <section className='grid gap-8 rounded-3xl border border-purple-500/20 bg-purple-950/30 p-6 md:grid-cols-3'>
          {circle.rituals.length > 0 && (
            <div>
              <h2 className='text-lg font-semibold text-white'>Ritual flow</h2>
              <ul className='mt-4 space-y-2 text-sm text-purple-100/80'>
                {circle.rituals.map((item, index) => (
                  <li key={`${item}-${index}`} className='flex gap-2'>
                    <span className='text-purple-400'>{index + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {circle.journal_prompts.length > 0 && (
            <div>
              <h2 className='text-lg font-semibold text-white'>
                Journal prompts
              </h2>
              <ul className='mt-4 space-y-2 text-sm text-purple-100/80'>
                {circle.journal_prompts.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className='rounded-2xl border border-purple-500/20 bg-purple-900/30 px-3 py-2'
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {circle.astrology_highlights.length > 0 && (
            <div>
              <h2 className='text-lg font-semibold text-white'>
                Astrology highlights
              </h2>
              <ul className='mt-4 space-y-2 text-sm text-purple-100/80'>
                {circle.astrology_highlights.map((item, index) => (
                  <li key={`${item}-${index}`} className='flex gap-2'>
                    <span className='text-purple-400'>✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {circle.resource_links.length > 0 && (
        <section className='rounded-3xl border border-purple-500/20 bg-black/40 p-6'>
          <h2 className='text-lg font-semibold text-white'>
            Resources & follow-up
          </h2>
          <ul className='mt-4 space-y-3 text-sm text-purple-100/80'>
            {circle.resource_links.map((resource, index) => (
              <li key={`${resource.url ?? resource.label}-${index}`}>
                {resource.url ? (
                  <Link
                    href={resource.url}
                    className='text-purple-200 underline decoration-purple-400/60 underline-offset-4 hover:text-white'
                    target='_blank'
                    rel='noreferrer'
                  >
                    {resource.label || resource.url}
                  </Link>
                ) : (
                  resource.label
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-semibold text-white'>
              Related circles
            </h2>
            <Link
              href='/moon-circles'
              className='text-sm text-purple-100/80 underline-offset-4 hover:text-white hover:underline'
            >
              View all circles →
            </Link>
          </div>
          <div className='grid gap-5 md:grid-cols-2'>
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/moon-circles/${item.id}`}
                className='rounded-2xl border border-purple-500/20 bg-purple-900/20 p-5 transition hover:border-purple-300 hover:bg-purple-900/40'
              >
                <div className='flex items-center justify-between text-xs text-purple-200/80'>
                  <span>{item.moon_phase}</span>
                  <span>{formatReadableDate(item.event_date)}</span>
                </div>
                <p className='mt-2 text-lg font-semibold text-white'>
                  {item.theme || 'Moon Circle'}
                </p>
                <p className='mt-2 text-xs text-purple-200/70'>
                  {item.insight_count} insight
                  {item.insight_count === 1 ? '' : 's'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
