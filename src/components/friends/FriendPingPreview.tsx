'use client';

import { Bell, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Heading } from '@/components/ui/Heading';
import type {
  MilestonePing,
  MilestoneType,
} from '@/lib/notifications/friend-pings';

interface FriendPingPreviewProps {
  /** The next milestone for this friend, or null when nothing is upcoming. */
  ping: MilestonePing | null;
  /** Optional friend name fallback when there is no upcoming ping. */
  friendName?: string;
  className?: string;
}

const MILESTONE_LABELS: Record<MilestoneType, string> = {
  saturn_return: 'Saturn return',
  jupiter_return: 'Jupiter return',
  outer_natal_sun_aspect: 'Outer-planet Sun hit',
  profection_year_start: 'Profection year start',
};

const MILESTONE_TONE: Record<MilestoneType, string> = {
  saturn_return: 'border-lunary-secondary-800/50 from-lunary-secondary-950/40',
  jupiter_return: 'border-lunary-success-800/50 from-lunary-success-950/40',
  outer_natal_sun_aspect:
    'border-lunary-accent-800/50 from-lunary-accent-950/40',
  profection_year_start: 'border-lunary-rose-800/50 from-lunary-rose-950/40',
};

/**
 * Card preview of the push notification a user would receive about a friend's
 * next astrological milestone. Rendered on the friend's profile page so users
 * can see what is coming and opt in or out of pings.
 */
export function FriendPingPreview({
  ping,
  friendName,
  className,
}: FriendPingPreviewProps) {
  if (!ping) {
    return (
      <div
        className={cn(
          'rounded-xl border border-stroke-subtle/40 bg-surface-elevated/40 p-4',
          className,
        )}
      >
        <div className='flex items-center gap-2 mb-1'>
          <Sparkles className='w-3.5 h-3.5 text-content-muted' />
          <span className='text-[10px] font-medium text-content-muted uppercase tracking-wide'>
            Friend pings
          </span>
        </div>
        <p className='text-xs text-content-muted'>
          No major milestones for {friendName ?? 'this friend'} in the next few
          days. We will ping you when one lands.
        </p>
      </div>
    );
  }

  const tone = MILESTONE_TONE[ping.milestoneType];
  const label = MILESTONE_LABELS[ping.milestoneType];
  const formattedDate = formatDate(ping.exactDate);

  return (
    <div
      className={cn(
        'rounded-xl border bg-gradient-to-br to-surface-elevated p-4',
        tone,
        className,
      )}
    >
      <div className='flex items-center gap-2 mb-3'>
        <Bell className='w-3.5 h-3.5 text-lunary-accent-400' />
        <span className='text-[10px] font-medium text-content-muted uppercase tracking-wide'>
          Next ping preview
        </span>
        <span className='ml-auto px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-surface-card/50 text-content-muted'>
          {label}
        </span>
      </div>

      <Heading as='h3' variant='h3' className='text-content-secondary mb-1'>
        {ping.friendName} next milestone
      </Heading>

      <p className='text-xs text-content-secondary mb-3 leading-relaxed'>
        {ping.copy}
      </p>

      <div className='flex items-center gap-1.5 text-[11px] text-content-muted'>
        <Clock className='w-3 h-3' />
        <span>Exact on {formattedDate}</span>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  // Parse YYYY-MM-DD as UTC so the displayed date matches detection.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
