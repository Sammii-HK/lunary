import { getImageBaseUrl } from '@/lib/urls';

type CosmicPostContent = {
  date?: string;
  primaryEvent?: {
    name?: string;
    energy?: string;
  };
  highlights?: string[];
  horoscopeSnippet?: string;
  astronomicalData?: {
    planets?: Record<string, { sign?: string }>;
    moonPhase?: {
      name?: string;
    };
  };
};

async function getCosmicHighlight(): Promise<CosmicPostContent | null> {
  const baseUrl = getImageBaseUrl();
  const today = new Date().toISOString().split('T')[0];

  try {
    const response = await fetch(`${baseUrl}/api/og/cosmic-post/${today}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('CosmicHighlight fetch failed:', error);
    return null;
  }
}

export async function CosmicHighlight({
  variant,
}: {
  variant?: 'daily' | 'weekly';
}) {
  const highlight = await getCosmicHighlight();
  const headline =
    variant === 'daily' ? 'Daily cosmic highlight' : 'Weekly cosmic highlight';
  const moonPhaseName = highlight?.astronomicalData?.moonPhase?.name;
  const moonSign = highlight?.astronomicalData?.planets?.moon?.sign;
  const sunSign = highlight?.astronomicalData?.planets?.sun?.sign;
  const summary =
    highlight?.horoscopeSnippet ||
    `Check ${variant === 'daily' ? 'today’s' : 'this week’s'} horoscopes for the latest lunar, transit, and timing cues.`;
  const dateLabel =
    highlight?.date ||
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

  return (
    <section className='mb-10 grid gap-4 md:grid-cols-3'>
      <div className='col-span-2 rounded-2xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900/80 via-zinc-900/80 to-lunary-primary-950 p-6'>
        <div className='flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-zinc-400'>
          <span>Cosmic Highlight</span>
          <span className='text-zinc-500'>•</span>
          <span>{dateLabel}</span>
        </div>
        <h2 className='text-2xl font-semibold text-white mt-3'>{headline}</h2>
        <p className='mt-4 text-sm text-zinc-300 leading-relaxed'>{summary}</p>
        <div className='mt-5 flex flex-wrap gap-2 text-[11px] text-zinc-300'>
          {moonPhaseName && moonSign && (
            <span className='rounded-md border border-zinc-700/70 bg-zinc-900/60 px-3 py-1'>
              {moonPhaseName} in {moonSign}
            </span>
          )}
          {sunSign && (
            <span className='rounded-md border border-zinc-700/70 bg-zinc-900/60 px-3 py-1'>
              Sun in {sunSign}
            </span>
          )}
        </div>
      </div>
      <div className='space-y-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-5'>
        <div>
          <h3 className='text-sm font-semibold tracking-wide text-zinc-300'>
            {variant === 'daily' ? 'Daily Signals' : 'Weekly Signals'}
          </h3>
          <p className='text-xs text-zinc-500 mt-1'>
            Updated {variant === 'daily' ? 'every morning' : 'every Monday'}{' '}
            with real sky timing.
          </p>
        </div>
        <ul className='space-y-2 text-xs text-zinc-200 leading-relaxed'>
          <li>
            <strong>
              {variant === 'daily' ? 'Daily Vibe' : 'Weekly Vibe'}:
            </strong>{' '}
            New highlights land each {variant === 'daily' ? 'day' : 'Monday'}{' '}
            for immediate timing.
          </li>
          <li>
            <strong>Transit Watch:</strong> Planet shifts trigger fresh cues and
            angles.
          </li>
          <li>
            <strong>Moon Focus:</strong> Current phase and sign keep lunar
            context visible.
          </li>
        </ul>
      </div>
    </section>
  );
}
