'use client';

import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import type { BirthChartData } from '../../../utils/astrology/birthChart';

export type GroupFriend = {
  id: string;
  name: string;
  avatarUrl?: string;
  source?: 'friend' | 'profile';
  relationshipType?: string | null;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  birthChart: BirthChartData[];
};

type Props = {
  /** The current user, locked-in / always selected. */
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
    color: string;
  };
  friends: GroupFriend[];
  /** Set of selected friend ids (does not include the user). */
  selected: Set<string>;
  /** Map of friend id → assigned colour (matched to GroupSkyChart). */
  colorById: Record<string, string>;
  /** Friends that haven't been picked but can be (i.e. not at cap). */
  canSelectMore: boolean;
  /** True if user is on free tier and limited. */
  locked?: boolean;
  onToggle: (id: string) => void;
};

function initialsOf(name: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function AvatarChip({
  name,
  avatarUrl,
  color,
  isSelected,
  isLockedIn,
  isDisabled,
  badge,
  onClick,
}: {
  name: string;
  avatarUrl?: string;
  color: string;
  isSelected: boolean;
  isLockedIn?: boolean;
  isDisabled?: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type='button'
      onClick={onClick}
      disabled={isDisabled}
      whileTap={!isDisabled ? { scale: 0.92 } : undefined}
      whileHover={!isDisabled ? { y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      className='flex flex-col items-center gap-1.5 shrink-0 px-1 py-1 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none'
      aria-pressed={isSelected}
      aria-label={
        isLockedIn ? `${name} (you)` : `${name}${isSelected ? ' selected' : ''}`
      }
    >
      <div className='relative'>
        <motion.div
          animate={{
            boxShadow: isSelected
              ? `0 0 0 2px ${color}, 0 0 18px ${color}66`
              : '0 0 0 1px rgba(255,255,255,0.08)',
          }}
          transition={{ duration: 0.25 }}
          className='w-14 h-14 rounded-full bg-gradient-to-br from-lunary-primary/40 to-lunary-highlight/40 flex items-center justify-center overflow-hidden'
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name}
              className='w-full h-full object-cover'
            />
          ) : (
            <span className='text-base font-semibold text-content-primary'>
              {initialsOf(name)}
            </span>
          )}
        </motion.div>
        {isLockedIn && (
          <span className='absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-surface-elevated border border-stroke-subtle text-[8px] text-content-muted'>
            <Lock className='w-2.5 h-2.5' />
          </span>
        )}
      </div>

      <span className='text-[11px] font-medium text-content-primary max-w-[72px] truncate'>
        {name}
      </span>
      {badge && (
        <span className='-mt-1 rounded-full border border-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-content-muted'>
          {badge}
        </span>
      )}

      <motion.span
        initial={false}
        animate={{
          opacity: isSelected ? 1 : 0.0,
          scale: isSelected ? 1 : 0.4,
        }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className='block w-2 h-2 rounded-full'
        style={{ backgroundColor: color }}
        aria-hidden
      />
    </motion.button>
  );
}

export function GroupSkyFriendPicker({
  user,
  friends,
  selected,
  colorById,
  canSelectMore,
  locked = false,
  onToggle,
}: Props) {
  const hasFriends = friends.length > 0;

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between px-1 mb-2'>
        <p className='text-xs uppercase tracking-wide text-content-muted'>
          Pick your circle
        </p>
        <p className='text-[11px] text-content-muted'>
          {selected.size} selected{locked ? ' · 1 max on Free' : ''}
        </p>
      </div>

      <div
        className='flex gap-3 overflow-x-auto pb-2 px-1 -mx-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        role='listbox'
        aria-label='Group sky participants'
      >
        {user && (
          <AvatarChip
            name={user.name}
            avatarUrl={user.avatarUrl}
            color={user.color}
            isSelected
            isLockedIn
            onClick={() => {
              /* user is always locked in */
            }}
          />
        )}

        {!hasFriends && (
          <div className='flex items-center text-xs text-content-muted px-3 py-4'>
            Add friends from your Profile to build a group sky.
          </div>
        )}

        {friends.map((friend) => {
          const isSelected = selected.has(friend.id);
          const color = colorById[friend.id] ?? '#a1a1aa';
          const disabled = !isSelected && !canSelectMore;
          return (
            <AvatarChip
              key={friend.id}
              name={friend.name}
              avatarUrl={friend.avatarUrl}
              color={color}
              isSelected={isSelected}
              isDisabled={disabled}
              badge={friend.source === 'profile' ? 'Private' : undefined}
              onClick={() => onToggle(friend.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
