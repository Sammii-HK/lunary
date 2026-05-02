'use client';

/**
 * Year in Stars — single fullscreen slide.
 *
 * Designed to be composed inside `YearInStarsReel`. Each slide animates in
 * with `motion/react` and renders a single retrospective fact from the
 * `YearInStarsData` blob. Brand colours are pulled from the Tailwind
 * `lunary-*` tokens; never use raw `<h1>` etc — all headings go through
 * `<Heading>`.
 */

import { motion } from 'motion/react';
import { Sparkles, BookOpen, Moon, Sun, CloudRain, Stars } from 'lucide-react';

import { Heading } from '@/components/ui/Heading';
import type {
  YearInStarsData,
  RankedTransitHighlight,
  WeekHighlight,
} from '@/lib/year-in-stars/compute';

export type YearInStarsSlideKind =
  | 'top-transits'
  | 'journal-volume'
  | 'moon-pattern'
  | 'best-week'
  | 'hardest-week'
  | 'closing';

export type YearInStarsAccent = 'violet' | 'rose' | 'gold' | 'aqua' | 'indigo';

export interface YearInStarsSlideProps {
  kind: YearInStarsSlideKind;
  data: YearInStarsData;
  accent?: YearInStarsAccent;
}

const ACCENT_GRADIENTS: Record<YearInStarsAccent, string> = {
  violet:
    'radial-gradient(ellipse at top, rgba(132, 88, 216, 0.55) 0%, rgba(10, 10, 15, 0.95) 70%)',
  rose: 'radial-gradient(ellipse at top, rgba(238, 120, 158, 0.55) 0%, rgba(10, 10, 15, 0.95) 70%)',
  gold: 'radial-gradient(ellipse at top, rgba(234, 179, 8, 0.45) 0%, rgba(10, 10, 15, 0.95) 70%)',
  aqua: 'radial-gradient(ellipse at top, rgba(56, 189, 248, 0.45) 0%, rgba(10, 10, 15, 0.95) 70%)',
  indigo:
    'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.5) 0%, rgba(10, 10, 15, 0.95) 70%)',
};

const ACCENT_TEXT: Record<YearInStarsAccent, string> = {
  violet: 'text-lunary-primary-300',
  rose: 'text-lunary-rose-300',
  gold: 'text-lunary-accent-300',
  aqua: 'text-lunary-secondary-300',
  indigo: 'text-lunary-primary-200',
};

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: 'easeOut' as const },
  };
}

function SlideShell({
  accent,
  children,
}: {
  accent: YearInStarsAccent;
  children: React.ReactNode;
}) {
  return (
    <div
      className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6 py-12 text-content-primary'
      style={{ background: ACCENT_GRADIENTS[accent] }}
    >
      {/* Decorative starfield */}
      <div className='pointer-events-none absolute inset-0 opacity-60'>
        <div className='absolute left-[12%] top-[18%] h-1 w-1 rounded-full bg-white/70' />
        <div className='absolute left-[78%] top-[24%] h-1.5 w-1.5 rounded-full bg-white/80' />
        <div className='absolute left-[40%] top-[8%] h-0.5 w-0.5 rounded-full bg-white/50' />
        <div className='absolute left-[88%] top-[60%] h-1 w-1 rounded-full bg-white/60' />
        <div className='absolute left-[20%] top-[72%] h-1 w-1 rounded-full bg-white/60' />
        <div className='absolute left-[55%] top-[88%] h-0.5 w-0.5 rounded-full bg-white/40' />
      </div>
      <div className='relative z-10 flex w-full max-w-md flex-col items-center text-center'>
        {children}
      </div>
    </div>
  );
}

function EyebrowLabel({
  icon,
  children,
  accent,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  accent: YearInStarsAccent;
}) {
  return (
    <motion.div
      {...fadeUp(0)}
      className={`mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] ${ACCENT_TEXT[accent]}`}
    >
      <span className='flex items-center'>{icon}</span>
      <span>{children}</span>
    </motion.div>
  );
}

function TransitItem({
  transit,
  index,
}: {
  transit: RankedTransitHighlight;
  index: number;
}) {
  return (
    <motion.li
      {...fadeUp(0.2 + index * 0.15)}
      className='flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left'
    >
      <span className='flex h-10 w-10 flex-none items-center justify-center rounded-full bg-lunary-primary-500/30 text-base font-semibold text-content-primary'>
        {index + 1}
      </span>
      <div className='flex flex-col'>
        <span className='text-base font-medium text-content-primary'>
          {transit.label}
        </span>
        <span className='text-xs text-content-muted'>
          Impact score {transit.score}
        </span>
      </div>
    </motion.li>
  );
}

function StatBlock({
  value,
  label,
  delay = 0,
}: {
  value: string | number;
  label: string;
  delay?: number;
}) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className='flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4'
    >
      <span className='text-3xl font-light tracking-tight text-content-primary md:text-4xl'>
        {value}
      </span>
      <span className='mt-1 text-xs uppercase tracking-[0.25em] text-content-muted'>
        {label}
      </span>
    </motion.div>
  );
}

function WeekCard({
  week,
  tone,
}: {
  week: WeekHighlight;
  tone: 'best' | 'hardest';
}) {
  return (
    <motion.div
      {...fadeUp(0.25)}
      className='w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5 text-left'
    >
      <div className='text-xs uppercase tracking-[0.3em] text-content-muted'>
        {week.label}
      </div>
      <Heading as='h3' variant='h3' className='mt-2 text-content-primary'>
        {week.entryCount} {week.entryCount === 1 ? 'entry' : 'entries'}
        {tone === 'best' ? ' — and so much light' : ' — and you held on'}
      </Heading>
      {week.topMoods.length > 0 && (
        <div className='mt-3 flex flex-wrap gap-2'>
          {week.topMoods.map((mood) => (
            <span
              key={mood}
              className='rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs capitalize text-content-secondary'
            >
              {mood}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Slide variants
// ---------------------------------------------------------------------------

function TopTransitsSlide({
  data,
  accent,
}: {
  data: YearInStarsData;
  accent: YearInStarsAccent;
}) {
  return (
    <SlideShell accent={accent}>
      <EyebrowLabel icon={<Sparkles size={14} />} accent={accent}>
        Your year in transits
      </EyebrowLabel>
      <motion.div {...fadeUp(0.05)}>
        <Heading as='h2' variant='h1' className='text-content-primary'>
          The sky moved you
        </Heading>
      </motion.div>
      <motion.p
        {...fadeUp(0.1)}
        className='mt-2 max-w-xs text-sm text-content-muted'
      >
        These are the three transits that touched your chart hardest in{' '}
        {data.year}.
      </motion.p>
      <ul className='mt-8 flex w-full flex-col gap-3'>
        {data.topTransits.length === 0 ? (
          <li className='rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-6 text-sm text-content-muted'>
            Quiet skies overall — nothing peaked above the noise this year.
          </li>
        ) : (
          data.topTransits.map((t, i) => (
            <TransitItem key={`${t.label}-${t.date}`} transit={t} index={i} />
          ))
        )}
      </ul>
    </SlideShell>
  );
}

function JournalVolumeSlide({
  data,
  accent,
}: {
  data: YearInStarsData;
  accent: YearInStarsAccent;
}) {
  const { journal } = data;
  return (
    <SlideShell accent={accent}>
      <EyebrowLabel icon={<BookOpen size={14} />} accent={accent}>
        Your year in journal
      </EyebrowLabel>
      <motion.div {...fadeUp(0.05)}>
        <Heading as='h2' variant='h1' className='text-content-primary'>
          You wrote it down
        </Heading>
      </motion.div>
      <motion.p
        {...fadeUp(0.1)}
        className='mt-2 max-w-xs text-sm text-content-muted'
      >
        {journal.totalEntries === 0
          ? 'No entries this year — start one anytime.'
          : `${journal.totalWords.toLocaleString()} words across ${journal.uniqueDays} days.`}
      </motion.p>
      <div className='mt-8 grid w-full grid-cols-2 gap-3'>
        <StatBlock delay={0.15} value={journal.totalEntries} label='Entries' />
        <StatBlock
          delay={0.25}
          value={journal.longestStreak}
          label='Longest streak'
        />
        <StatBlock
          delay={0.35}
          value={journal.averageWordsPerEntry}
          label='Avg words'
        />
        <StatBlock
          delay={0.45}
          value={journal.busiestMonth ?? '—'}
          label='Busiest month'
        />
      </div>
    </SlideShell>
  );
}

function MoonPatternSlide({
  data,
  accent,
}: {
  data: YearInStarsData;
  accent: YearInStarsAccent;
}) {
  const { moon } = data;
  return (
    <SlideShell accent={accent}>
      <EyebrowLabel icon={<Moon size={14} />} accent={accent}>
        Your moon
      </EyebrowLabel>
      <motion.div {...fadeUp(0.05)}>
        <Heading as='h2' variant='h1' className='text-content-primary'>
          {moon.topPhase ?? 'Across all phases'}
        </Heading>
      </motion.div>
      <motion.p
        {...fadeUp(0.1)}
        className='mt-2 max-w-xs text-sm text-content-muted'
      >
        {moon.topPhase
          ? `You journaled ${moon.topPhaseCount} times under ${moon.topPhase} this year — more than any other phase.`
          : 'You journaled across every phase of the moon this year.'}
      </motion.p>
      <div className='mt-8 flex w-full flex-col gap-2'>
        {moon.distribution.slice(0, 5).map((row, i) => {
          const max = moon.distribution[0]?.count || 1;
          const pct = Math.round((row.count / max) * 100);
          return (
            <motion.div
              key={row.phase}
              {...fadeUp(0.15 + i * 0.08)}
              className='flex items-center gap-3 text-left'
            >
              <span className='w-32 flex-none text-xs text-content-muted'>
                {row.phase}
              </span>
              <div className='relative h-2 flex-1 overflow-hidden rounded-full bg-white/5'>
                <div
                  className='h-full rounded-full bg-lunary-primary-400'
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className='w-6 text-right text-xs text-content-secondary'>
                {row.count}
              </span>
            </motion.div>
          );
        })}
      </div>
    </SlideShell>
  );
}

function BestWeekSlide({
  data,
  accent,
}: {
  data: YearInStarsData;
  accent: YearInStarsAccent;
}) {
  return (
    <SlideShell accent={accent}>
      <EyebrowLabel icon={<Sun size={14} />} accent={accent}>
        Your brightest week
      </EyebrowLabel>
      <motion.div {...fadeUp(0.05)}>
        <Heading as='h2' variant='h1' className='text-content-primary'>
          When everything aligned
        </Heading>
      </motion.div>
      {data.bestWeek ? (
        <>
          <motion.p
            {...fadeUp(0.1)}
            className='mt-2 max-w-xs text-sm text-content-muted'
          >
            One week stood out — by mood, energy, and the words you wrote.
          </motion.p>
          <div className='mt-8 w-full'>
            <WeekCard week={data.bestWeek} tone='best' />
          </div>
        </>
      ) : (
        <motion.p {...fadeUp(0.1)} className='mt-6 text-sm text-content-muted'>
          Not quite enough mood data this year — every week was its own thing.
        </motion.p>
      )}
    </SlideShell>
  );
}

function HardestWeekSlide({
  data,
  accent,
}: {
  data: YearInStarsData;
  accent: YearInStarsAccent;
}) {
  return (
    <SlideShell accent={accent}>
      <EyebrowLabel icon={<CloudRain size={14} />} accent={accent}>
        Your hardest week
      </EyebrowLabel>
      <motion.div {...fadeUp(0.05)}>
        <Heading as='h2' variant='h1' className='text-content-primary'>
          You moved through it
        </Heading>
      </motion.div>
      {data.hardestWeek ? (
        <>
          <motion.p
            {...fadeUp(0.1)}
            className='mt-2 max-w-xs text-sm text-content-muted'
          >
            This week asked the most of you — and you still showed up to write.
          </motion.p>
          <div className='mt-8 w-full'>
            <WeekCard week={data.hardestWeek} tone='hardest' />
          </div>
        </>
      ) : (
        <motion.p {...fadeUp(0.1)} className='mt-6 text-sm text-content-muted'>
          No standout heavy week — a steady year, all the way through.
        </motion.p>
      )}
    </SlideShell>
  );
}

function ClosingSlide({
  data,
  accent,
}: {
  data: YearInStarsData;
  accent: YearInStarsAccent;
}) {
  return (
    <SlideShell accent={accent}>
      <EyebrowLabel icon={<Stars size={14} />} accent={accent}>
        That was {data.year}
      </EyebrowLabel>
      <motion.div {...fadeUp(0.05)}>
        <Heading as='h2' variant='h1' className='text-content-primary'>
          Your year in stars
        </Heading>
      </motion.div>
      <motion.p
        {...fadeUp(0.15)}
        className='mt-3 max-w-xs text-sm text-content-muted'
      >
        {data.journal.totalEntries.toLocaleString()} entries.{' '}
        {data.journal.totalWords.toLocaleString()} words.{' '}
        {data.topTransits.length} transits that mattered. One you.
      </motion.p>
      <motion.div {...fadeUp(0.3)} className='mt-8 flex w-full justify-center'>
        {/* Reel layers a real share button on top — this is just the visual */}
      </motion.div>
    </SlideShell>
  );
}

export function YearInStarsSlide({
  kind,
  data,
  accent = 'violet',
}: YearInStarsSlideProps) {
  switch (kind) {
    case 'top-transits':
      return <TopTransitsSlide data={data} accent={accent} />;
    case 'journal-volume':
      return <JournalVolumeSlide data={data} accent={accent} />;
    case 'moon-pattern':
      return <MoonPatternSlide data={data} accent={accent} />;
    case 'best-week':
      return <BestWeekSlide data={data} accent={accent} />;
    case 'hardest-week':
      return <HardestWeekSlide data={data} accent={accent} />;
    case 'closing':
      return <ClosingSlide data={data} accent={accent} />;
    default:
      return null;
  }
}
