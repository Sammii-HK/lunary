'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, BellRing, Mail, Sunrise, Volume2 } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

/**
 * PushPreferencesCard
 * -----------------------------------------------------------------------------
 * Lets a user opt into the new "push notifications that don't suck" stream:
 *   - Daily personalised reading (off by default — opt-in)
 *   - Push when a major transit goes exact (on by default)
 *   - Weekly Pages email digest (off by default — opt-in)
 *
 * Reads + writes through the existing /api/profile/personal-card route, which
 * stores everything under `user_profiles.personal_card` (JSONB). We namespace
 * our flags under `pushPreferences` to avoid stomping anything else in there.
 */

interface PushPreferences {
  dailyPersonalised: boolean;
  exactTransitAlerts: boolean;
  weeklyDigest: boolean;
}

const DEFAULT_PREFS: PushPreferences = {
  dailyPersonalised: false,
  exactTransitAlerts: true,
  weeklyDigest: false,
};

interface PushPreferencesCardProps {
  className?: string;
}

export function PushPreferencesCard({ className }: PushPreferencesCardProps) {
  const [prefs, setPrefs] = useState<PushPreferences>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate from /api/profile/personal-card
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch('/api/profile/personal-card', {
          method: 'GET',
          signal: controller.signal,
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error(`Could not load preferences (${res.status})`);
        }
        const data = (await res.json()) as {
          personalCard?: {
            pushPreferences?: Partial<PushPreferences>;
          } | null;
        };
        if (cancelled) return;
        const stored = data.personalCard?.pushPreferences ?? {};
        setPrefs({
          dailyPersonalised:
            stored.dailyPersonalised ?? DEFAULT_PREFS.dailyPersonalised,
          exactTransitAlerts:
            stored.exactTransitAlerts ?? DEFAULT_PREFS.exactTransitAlerts,
          weeklyDigest: stored.weeklyDigest ?? DEFAULT_PREFS.weeklyDigest,
        });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        setError('Could not load your preferences. Try again in a moment.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const persist = useCallback(
    async (next: PushPreferences) => {
      setSaving(true);
      setError(null);
      const previous = prefs;
      setPrefs(next);
      try {
        // Read-modify-write so we don't blow away other personal_card fields.
        const currentRes = await fetch('/api/profile/personal-card', {
          method: 'GET',
          credentials: 'include',
        });
        const currentData = currentRes.ok
          ? ((await currentRes.json()) as {
              personalCard?: Record<string, unknown> | null;
            })
          : { personalCard: null };
        const merged = {
          ...(currentData.personalCard ?? {}),
          pushPreferences: next,
        };

        const saveRes = await fetch('/api/profile/personal-card', {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ personalCard: merged }),
        });
        if (!saveRes.ok) {
          throw new Error(`Save failed (${saveRes.status})`);
        }
      } catch {
        setPrefs(previous);
        setError('Could not save. Please try again.');
      } finally {
        setSaving(false);
      }
    },
    [prefs],
  );

  const handleToggle = useCallback(
    (key: keyof PushPreferences) => (checked: boolean) => {
      void persist({ ...prefs, [key]: checked });
    },
    [persist, prefs],
  );

  return (
    <section
      className={cn(
        'rounded-3xl border border-lunary-primary-700/40 bg-layer-base/70 p-5 shadow-sm backdrop-blur-sm',
        'flex flex-col gap-4',
        className,
      )}
      aria-label='Push notification preferences'
    >
      <header className='flex items-center gap-2 text-content-brand'>
        <Bell className='h-4 w-4' aria-hidden='true' />
        <span className='text-xs uppercase tracking-[0.18em] text-content-muted'>
          Push notifications
        </span>
      </header>

      <Heading as='h2' variant='h2'>
        Notifications that don&apos;t suck
      </Heading>

      <p className='text-sm text-content-secondary'>
        Two streams. Both grounded in your actual chart — not horoscope mush.
      </p>

      {loading ? (
        <div className='flex flex-col gap-3' role='status' aria-busy='true'>
          <div className='h-12 rounded-xl bg-surface-overlay/60 animate-pulse' />
          <div className='h-12 rounded-xl bg-surface-overlay/50 animate-pulse' />
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          <PreferenceRow
            icon={
              <Sunrise
                className='h-5 w-5 text-lunary-accent'
                aria-hidden='true'
              />
            }
            title='Daily personalised reading'
            description='Every morning at your local sunrise — your strongest transit, voiced when you tap in.'
            checked={prefs.dailyPersonalised}
            onCheckedChange={handleToggle('dailyPersonalised')}
            disabled={saving}
          />

          <PreferenceRow
            icon={
              <BellRing
                className='h-5 w-5 text-lunary-primary-300'
                aria-hidden='true'
              />
            }
            title='Push when a major transit goes exact'
            description='Only the big moments — eclipses, stations, exact aspects to your natal chart.'
            checked={prefs.exactTransitAlerts}
            onCheckedChange={handleToggle('exactTransitAlerts')}
            disabled={saving}
          />

          <PreferenceRow
            icon={
              <Mail
                className='h-5 w-5 text-lunary-secondary-300'
                aria-hidden='true'
              />
            }
            title='Weekly Pages email'
            description='A Sunday evening Week Ahead digest with your top transits, moon journey and ritual.'
            checked={prefs.weeklyDigest}
            onCheckedChange={handleToggle('weeklyDigest')}
            disabled={saving}
          />
        </div>
      )}

      {error ? (
        <p className='text-xs text-lunary-rose' role='alert'>
          {error}
        </p>
      ) : null}

      <p className='flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-content-muted'>
        <Volume2 className='h-3.5 w-3.5' aria-hidden='true' />
        Tap a notification to auto-play your reading.
      </p>
    </section>
  );
}

interface PreferenceRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

function PreferenceRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
}: PreferenceRowProps) {
  return (
    <label
      className={cn(
        'flex items-start gap-3 rounded-2xl border border-lunary-primary-700/30 bg-layer-base/40 p-4',
        'cursor-pointer transition-colors hover:border-lunary-primary-600/60',
      )}
    >
      <span
        aria-hidden='true'
        className='mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full bg-surface-overlay/70'
      >
        {icon}
      </span>
      <span className='min-w-0 flex-1'>
        <span className='block text-sm font-medium text-content-primary'>
          {title}
        </span>
        <span className='mt-0.5 block text-xs text-content-secondary'>
          {description}
        </span>
      </span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={title}
      />
    </label>
  );
}

export default PushPreferencesCard;
