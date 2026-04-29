'use client';

import { useState, type ReactNode } from 'react';
import {
  Sun,
  Moon,
  Calendar,
  Sparkles,
  MountainSnow,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InfoBottomSheet } from '@/components/ui/InfoBottomSheet';
import type {
  SaturnReturnResult,
  JupiterReturnResult,
  ProfectionYearResult,
  LunationResult,
  SolarReturnResult,
} from '@/lib/personal-cycles/compute';

interface Props {
  saturn: SaturnReturnResult;
  jupiter: JupiterReturnResult;
  profection: ProfectionYearResult;
  lunation: LunationResult;
  solar: SolarReturnResult;
}

type TrackKey = 'saturn' | 'jupiter' | 'profection' | 'lunation' | 'solar';

interface TrackConfig {
  key: TrackKey;
  label: string;
  short: string;
  icon: LucideIcon;
  accent: string; // text-* token
  bar: string; // bg-* token for the faint bar
  pin: string; // bg-* token for the pin
  glow: string; // shadow color
  progressPct: number;
  caption: string;
  detail: ReactNode;
  markers: { pct: number; label: string }[];
  ariaPin: string;
}

function buildTracks(p: Props): TrackConfig[] {
  // Solar return track: % through current astrological year.
  // 365 days in a "year of life" - days remaining = days into the year.
  const daysIntoYear = Math.max(0, 365 - p.solar.daysUntilNextBirthday);
  const solarPct = Math.min(100, (daysIntoYear / 365) * 100);

  // Profection track: % through the active house's 12-month tenancy
  // (mirrors solar return exactly - houses turn on the birthday).
  const profectionPct = solarPct;

  // Lunation: % through the synodic cycle (new = 0%, full = 50%, next new = 100%)
  const lunationPct = (p.lunation.daysSinceNew / 29.5306) * 100;

  return [
    {
      key: 'saturn',
      label: 'Saturn return arc',
      short: 'Saturn',
      icon: MountainSnow,
      accent: 'text-lunary-secondary',
      bar: 'bg-lunary-secondary-900/40',
      pin: 'bg-lunary-secondary-300',
      glow: 'shadow-[0_0_18px_3px_rgba(168,162,236,0.55)]',
      progressPct: p.saturn.progressPct,
      caption: `${p.saturn.progressPct.toFixed(0)}% - return #${p.saturn.returnNumber} in ${p.saturn.daysUntilNext} days`,
      detail: (
        <div className='space-y-3 text-sm text-content-secondary'>
          <p>{p.saturn.narrative}</p>
          <p>
            Return #{p.saturn.returnNumber} hits exactly on{' '}
            <strong className='text-content-primary'>
              {p.saturn.nextExactDate}
            </strong>{' '}
            ({p.saturn.daysUntilNext.toLocaleString()} days from now).
          </p>
          <p className='text-xs text-content-muted'>
            Saturn cycle = 29.46 years. The return is when Saturn comes back to
            its natal position - structure tested, rebuilt, locked in.
          </p>
        </div>
      ),
      markers: [
        { pct: 0, label: 'Cycle start' },
        { pct: 50, label: 'Mid-cycle' },
        { pct: 100, label: 'Return' },
      ],
      ariaPin: `Saturn return: ${p.saturn.progressPct.toFixed(0)} percent through current cycle, ${p.saturn.daysUntilNext} days until next exact return on ${p.saturn.nextExactDate}.`,
    },
    {
      key: 'jupiter',
      label: 'Jupiter return',
      short: 'Jupiter',
      icon: Sparkles,
      accent: 'text-lunary-accent',
      bar: 'bg-lunary-accent-900/40',
      pin: 'bg-lunary-accent-300',
      glow: 'shadow-[0_0_18px_3px_rgba(255,205,140,0.55)]',
      progressPct: p.jupiter.progressPct,
      caption: `${p.jupiter.progressPct.toFixed(0)}% - return #${p.jupiter.returnNumber} in ${p.jupiter.daysUntilNext} days`,
      detail: (
        <div className='space-y-3 text-sm text-content-secondary'>
          <p>{p.jupiter.narrative}</p>
          <p>
            Return #{p.jupiter.returnNumber} hits exactly on{' '}
            <strong className='text-content-primary'>
              {p.jupiter.nextExactDate}
            </strong>{' '}
            ({p.jupiter.daysUntilNext.toLocaleString()} days from now).
          </p>
          <p className='text-xs text-content-muted'>
            Jupiter cycle = 11.86 years. Each return reopens the lucky-leap
            window: expansion, optimism, doors that swing wider than usual.
          </p>
        </div>
      ),
      markers: [
        { pct: 0, label: 'Cycle start' },
        { pct: 50, label: 'Mid-cycle' },
        { pct: 100, label: 'Return' },
      ],
      ariaPin: `Jupiter return: ${p.jupiter.progressPct.toFixed(0)} percent through current cycle, ${p.jupiter.daysUntilNext} days until next exact return on ${p.jupiter.nextExactDate}.`,
    },
    {
      key: 'profection',
      label: `Profection - house ${p.profection.activeHouse}`,
      short: 'Profection',
      icon: Calendar,
      accent: 'text-lunary-rose-300',
      bar: 'bg-lunary-rose-900/40',
      pin: 'bg-lunary-rose-300',
      glow: 'shadow-[0_0_18px_3px_rgba(255,165,200,0.55)]',
      progressPct: profectionPct,
      caption: `Year ${p.profection.yearOfLife} - ${p.profection.themeOneLiner}`,
      detail: (
        <div className='space-y-3 text-sm text-content-secondary'>
          <p>
            You are in the{' '}
            <strong className='text-content-primary'>
              {p.profection.yearOfLife}
            </strong>{' '}
            year of your life, which activates{' '}
            <strong className='text-content-primary'>
              house {p.profection.activeHouse}
            </strong>
            . The lord of the year is{' '}
            <strong className='text-content-primary'>
              {p.profection.ruler}
            </strong>
            .
          </p>
          <p>{p.profection.themeOneLiner}</p>
          <p className='text-xs text-content-muted'>
            Annual profections rotate one house per year of life. This
            year&apos;s ruler becomes the &quot;time lord&quot; and its transits
            are weighted extra-heavily for you.
          </p>
        </div>
      ),
      markers: [
        { pct: 0, label: 'Birthday' },
        { pct: 50, label: 'Half year' },
        { pct: 100, label: 'Next house' },
      ],
      ariaPin: `Profection year: ${profectionPct.toFixed(0)} percent through year of life ${p.profection.yearOfLife}, house ${p.profection.activeHouse} active, ruled by ${p.profection.ruler}.`,
    },
    {
      key: 'lunation',
      label: `Lunation - ${p.lunation.phase}`,
      short: 'Moon',
      icon: Moon,
      accent: 'text-lunary-primary',
      bar: 'bg-lunary-primary-900/40',
      pin: 'bg-lunary-primary-300',
      glow: 'shadow-[0_0_18px_3px_rgba(180,170,255,0.6)]',
      progressPct: lunationPct,
      caption: `${p.lunation.phase} - ${p.lunation.illuminationPct.toFixed(0)}% illuminated`,
      detail: (
        <div className='space-y-3 text-sm text-content-secondary'>
          <p>
            The Moon is{' '}
            <strong className='text-content-primary'>{p.lunation.phase}</strong>{' '}
            at{' '}
            <strong className='text-content-primary'>
              {p.lunation.illuminationPct.toFixed(0)}%
            </strong>{' '}
            illumination.
          </p>
          <p>
            {p.lunation.daysSinceNew.toFixed(1)} days since the last new moon
            and {p.lunation.daysUntilFull.toFixed(1)} days until full.
          </p>
          <p className='text-xs text-content-muted'>
            Synodic month = 29.53 days. Phase derived from the live Sun-Moon
            ecliptic-longitude difference, so it tracks the actual sky.
          </p>
        </div>
      ),
      markers: [
        { pct: 0, label: 'New' },
        { pct: 50, label: 'Full' },
        { pct: 100, label: 'New' },
      ],
      ariaPin: `Current lunation: ${lunationPct.toFixed(0)} percent through the synodic cycle, currently ${p.lunation.phase} at ${p.lunation.illuminationPct.toFixed(0)} percent illumination.`,
    },
    {
      key: 'solar',
      label: 'Solar return',
      short: 'Solar',
      icon: Sun,
      accent: 'text-lunary-highlight',
      bar: 'bg-lunary-highlight/20',
      pin: 'bg-lunary-highlight',
      glow: 'shadow-[0_0_18px_3px_rgba(255,220,140,0.6)]',
      progressPct: solarPct,
      caption: `${p.solar.daysUntilNextBirthday} days until age ${p.solar.ageStarting}`,
      detail: (
        <div className='space-y-3 text-sm text-content-secondary'>
          <p>
            Your last solar return was{' '}
            <strong className='text-content-primary'>
              {p.solar.currentReturnDate}
            </strong>
            .
          </p>
          <p>
            <strong className='text-content-primary'>
              {p.solar.daysUntilNextBirthday} days
            </strong>{' '}
            until your next astrological birthday - you will be{' '}
            <strong className='text-content-primary'>
              {p.solar.ageStarting}
            </strong>
            .
          </p>
          <p className='text-xs text-content-muted'>
            The solar return chart, cast for the moment the Sun returns to its
            natal position, is the classic snapshot of the year ahead.
          </p>
        </div>
      ),
      markers: [
        { pct: 0, label: 'Last birthday' },
        { pct: 50, label: 'Half year' },
        { pct: 100, label: 'Next birthday' },
      ],
      ariaPin: `Solar return: ${solarPct.toFixed(0)} percent through your current astrological year, ${p.solar.daysUntilNextBirthday} days until next birthday.`,
    },
  ];
}

export function CyclesTimeline(props: Props) {
  const tracks = buildTracks(props);
  const [active, setActive] = useState<TrackConfig | null>(null);

  return (
    <>
      <div className='space-y-5'>
        {tracks.map((t) => (
          <Track key={t.key} track={t} onOpen={() => setActive(t)} />
        ))}
      </div>

      <InfoBottomSheet
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.label ?? ''}
        accentColor={active?.accent ?? 'text-lunary-primary'}
        leading={
          active ? <active.icon className='h-5 w-5' aria-hidden /> : undefined
        }
      >
        {active?.detail}
      </InfoBottomSheet>
    </>
  );
}

interface TrackProps {
  track: TrackConfig;
  onOpen: () => void;
}

function Track({ track, onOpen }: TrackProps) {
  const Icon = track.icon;
  const pinPos = `${Math.max(0, Math.min(100, track.progressPct))}%`;

  return (
    <button
      type='button'
      onClick={onOpen}
      className='block w-full text-left group'
      aria-label={`Open ${track.label} details`}
    >
      <div className='flex items-center justify-between gap-3 mb-1.5'>
        <div className='flex items-center gap-2 min-w-0'>
          <Icon className={cn('h-4 w-4 shrink-0', track.accent)} aria-hidden />
          <span className='text-sm font-medium text-content-primary truncate'>
            {track.label}
          </span>
        </div>
        <span className='text-xs text-content-muted shrink-0'>
          {track.progressPct.toFixed(0)}%
        </span>
      </div>

      <div className='relative h-3 rounded-full bg-surface-muted/40 overflow-visible group-hover:bg-surface-muted/60 transition-colors'>
        {/* faint progress fill */}
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full', track.bar)}
          style={{ width: pinPos }}
        />

        {/* evenly-spaced markers */}
        {track.markers.map((m, i) => (
          <span
            key={`${track.key}-marker-${i}`}
            className='absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-stroke-default'
            style={{ left: `${m.pct}%`, transform: 'translate(-50%, -50%)' }}
            aria-hidden
            title={m.label}
          />
        ))}

        {/* "you are here" pin */}
        <span
          role='img'
          aria-label={track.ariaPin}
          className={cn(
            'absolute top-1/2 h-4 w-4 rounded-full ring-2 ring-surface-base',
            track.pin,
            track.glow,
          )}
          style={{ left: pinPos, transform: 'translate(-50%, -50%)' }}
        />
      </div>

      <p className={cn('mt-1.5 text-xs', track.accent)}>{track.caption}</p>
    </button>
  );
}

export default CyclesTimeline;
