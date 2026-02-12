'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flame, Sparkles, Users, Heart, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { FriendTransitBadge } from './FriendTransitBadge';
import { CompatibilityTipCard } from './CompatibilityTipCard';

interface FriendActivity {
  connectionId: string;
  friendId: string;
  name: string;
  avatar: string | null;
  sunSign: string | null;
  synastryScore: number | null;
  currentStreak: number;
  lastCheckIn: string | null;
}

interface Milestone {
  friendId: string;
  name: string;
  milestone: number;
  achievedAt: string;
}

interface CelebrationSent {
  friendId: string;
  milestone: number;
}

interface CelebrationReceived {
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  milestone: number;
  createdAt: string;
}

interface DailyTip {
  friendName: string;
  tip: string;
  pairType: string;
}

interface ActivityData {
  friends: FriendActivity[];
  milestones: Milestone[];
  celebrationsSent: CelebrationSent[];
  celebrationsReceived: CelebrationReceived[];
  dailyTip: DailyTip | null;
  retrogradePlanets: string[];
}

function getMatchColor(score: number): string {
  if (score >= 80) return 'text-green-400 bg-green-900/30 border-green-800/40';
  if (score >= 60)
    return 'text-lunary-accent-300 bg-lunary-accent-900/30 border-lunary-accent-800/40';
  if (score >= 40) return 'text-amber-400 bg-amber-900/30 border-amber-800/40';
  return 'text-zinc-400 bg-zinc-800/50 border-zinc-700/40';
}

function FriendRow({
  friend,
  onRemove,
  retrogradePlanets,
}: {
  friend: FriendActivity;
  onRemove: (connectionId: string) => void;
  retrogradePlanets?: string[];
}) {
  const [showDelete, setShowDelete] = useState(false);
  const [swiped, setSwiped] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diffX = startX.current - e.changedTouches[0].clientX;
    const diffY = Math.abs(startY.current - e.changedTouches[0].clientY);
    // Only trigger on horizontal swipe (left), not vertical scroll
    if (diffX > 50 && diffY < 30) {
      setSwiped(true);
    } else if (diffX < -50) {
      setSwiped(false);
    }
  }, []);

  return (
    <div
      className='group relative rounded-lg'
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Link
        href={`/profile/friends/${friend.connectionId}`}
        className='flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800/50 transition-colors'
        data-testid='friend-activity-link'
      >
        <div className='flex items-center gap-2.5 min-w-0'>
          {friend.avatar ? (
            <Image
              src={friend.avatar}
              alt=''
              width={32}
              height={32}
              className='w-8 h-8 rounded-full'
            />
          ) : (
            <div className='w-8 h-8 rounded-full bg-lunary-primary-800 flex items-center justify-center text-xs text-zinc-400'>
              {friend.name.charAt(0)}
            </div>
          )}
          <div className='min-w-0'>
            <div className='flex items-center gap-1.5'>
              <span className='text-sm text-zinc-200 truncate'>
                {friend.name}
              </span>
              {friend.sunSign && (
                <span className='text-[10px] text-zinc-500'>
                  {friend.sunSign}
                </span>
              )}
              {retrogradePlanets && retrogradePlanets.length > 0 && (
                <FriendTransitBadge
                  label={
                    retrogradePlanets.length === 1
                      ? `${retrogradePlanets[0]} Rx`
                      : `${retrogradePlanets.length} Rx`
                  }
                  variant='retrograde'
                />
              )}
            </div>
            <div className='flex items-center gap-2 text-[11px] text-zinc-500'>
              {friend.lastCheckIn && (
                <span>
                  {formatDistanceToNow(new Date(friend.lastCheckIn), {
                    addSuffix: true,
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2 flex-shrink-0'>
          {friend.synastryScore != null && (
            <span
              className={cn(
                'text-[11px] font-semibold px-2 py-0.5 rounded-full border',
                getMatchColor(friend.synastryScore),
              )}
            >
              {friend.synastryScore}%
            </span>
          )}
          {friend.currentStreak >= 7 && (
            <Flame className='w-3.5 h-3.5 text-orange-400' />
          )}
          {friend.currentStreak > 0 && (
            <span className='text-xs text-zinc-400'>
              {friend.currentStreak}d
            </span>
          )}
        </div>
      </Link>

      {/* Delete: hover on desktop, swipe on mobile */}
      {(showDelete || swiped) && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSwiped(false);
            onRemove(friend.connectionId);
          }}
          className='absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-800 hover:bg-red-900/60 text-zinc-500 hover:text-red-400 transition-colors'
          data-testid='remove-friend'
        >
          <Trash2 className='w-3.5 h-3.5' />
        </button>
      )}
    </div>
  );
}

export function FriendActivityFeed() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [celebratingSent, setCelebratingSent] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch('/api/friends/activity');
        if (response.status === 403) {
          setError('upgrade');
          return;
        }
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result);
      } catch {
        setError('error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const handleRemoveFriend = async (connectionId: string) => {
    if (!data) return;
    // Optimistic removal
    setData({
      ...data,
      friends: data.friends.filter((f) => f.connectionId !== connectionId),
    });

    try {
      const response = await fetch(`/api/friends/${connectionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        // Revert on failure - refetch
        const res = await fetch('/api/friends/activity');
        if (res.ok) setData(await res.json());
      }
    } catch {
      // Revert on error - refetch
      const res = await fetch('/api/friends/activity');
      if (res.ok) setData(await res.json());
    }
  };

  const handleCelebrate = async (friendId: string, milestone: number) => {
    const key = `${friendId}-${milestone}`;
    setCelebratingSent((prev) => new Set(prev).add(key));

    try {
      const response = await fetch('/api/friends/celebrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId, milestone }),
      });

      if (!response.ok) {
        setCelebratingSent((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    } catch {
      setCelebratingSent((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const hasSentCelebration = (friendId: string, milestone: number) => {
    const key = `${friendId}-${milestone}`;
    if (celebratingSent.has(key)) return true;
    return data?.celebrationsSent.some(
      (c) => c.friendId === friendId && c.milestone === milestone,
    );
  };

  if (isLoading) {
    return (
      <div className='bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 animate-pulse'>
        <div className='h-4 bg-zinc-800 rounded w-1/3 mb-3' />
        <div className='space-y-3'>
          <div className='h-12 bg-zinc-800/50 rounded' />
          <div className='h-12 bg-zinc-800/50 rounded' />
        </div>
      </div>
    );
  }

  if (error === 'upgrade' || error === 'error') return null;

  if (
    !data ||
    (data.friends.length === 0 &&
      data.milestones.length === 0 &&
      data.celebrationsReceived.length === 0)
  ) {
    return (
      <div className='bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4'>
        <div className='flex items-center gap-2 mb-2'>
          <Users className='w-4 h-4 text-lunary-primary-400' />
          <h3 className='text-sm font-medium text-zinc-300'>
            Your Circle Today
          </h3>
        </div>
        <p className='text-xs text-zinc-500'>
          Add friends to see their activity.{' '}
          <Link
            href='/profile/friends'
            className='text-lunary-primary-400 hover:underline'
          >
            Find friends
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {/* Daily Compatibility Tip */}
      {data.dailyTip && (
        <CompatibilityTipCard
          friendName={data.dailyTip.friendName}
          tip={data.dailyTip.tip}
          pairType={data.dailyTip.pairType}
        />
      )}

      {/* Cosmic Support Received */}
      {data.celebrationsReceived.length > 0 && (
        <div className='bg-gradient-to-r from-lunary-accent-900/20 to-lunary-primary-900/20 border border-lunary-accent-800/30 rounded-xl p-4'>
          <div className='flex items-center gap-2 mb-3'>
            <Heart className='w-4 h-4 text-lunary-accent-400' />
            <h3 className='text-sm font-medium text-zinc-300'>
              Cosmic Support Received
            </h3>
          </div>
          <div className='space-y-2'>
            {data.celebrationsReceived.map((c, i) => (
              <div
                key={i}
                className='flex items-center justify-between text-xs'
              >
                <div className='flex items-center gap-2 min-w-0'>
                  {c.senderAvatar ? (
                    <Image
                      src={c.senderAvatar}
                      alt=''
                      width={20}
                      height={20}
                      className='w-5 h-5 rounded-full'
                    />
                  ) : (
                    <div className='w-5 h-5 rounded-full bg-lunary-primary-800 flex items-center justify-center text-[10px] text-zinc-400'>
                      {c.senderName.charAt(0)}
                    </div>
                  )}
                  <span className='text-zinc-300 truncate'>
                    {c.senderName} celebrated your {c.milestone}-day streak
                  </span>
                </div>
                <span className='text-zinc-500 flex-shrink-0 ml-2'>
                  {formatDistanceToNow(new Date(c.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Your Circle Today */}
      {data.friends.length > 0 && (
        <div className='bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4'>
          <div className='flex items-center gap-2 mb-3'>
            <Users className='w-4 h-4 text-lunary-primary-400' />
            <h3 className='text-sm font-medium text-zinc-300'>
              Your Circle Today
            </h3>
          </div>
          <div className='space-y-1'>
            {data.friends.map((friend) => (
              <FriendRow
                key={friend.friendId}
                friend={friend}
                onRemove={handleRemoveFriend}
                retrogradePlanets={data.retrogradePlanets}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Milestones */}
      {data.milestones.length > 0 && (
        <div className='bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4'>
          <div className='flex items-center gap-2 mb-3'>
            <Sparkles className='w-4 h-4 text-lunary-accent-400' />
            <h3 className='text-sm font-medium text-zinc-300'>
              Recent Milestones
            </h3>
          </div>
          <div className='space-y-2'>
            {data.milestones.map((m, i) => {
              const alreadySent = hasSentCelebration(m.friendId, m.milestone);
              return (
                <div
                  key={i}
                  className='flex items-center justify-between text-xs'
                >
                  <div className='min-w-0'>
                    <span className='text-zinc-300'>
                      {m.name} hit {m.milestone} days
                    </span>
                    <span className='text-zinc-500 ml-1.5'>
                      {formatDistanceToNow(new Date(m.achievedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCelebrate(m.friendId, m.milestone)}
                    disabled={alreadySent}
                    className={cn(
                      'flex-shrink-0 ml-2 px-2.5 py-1 rounded-full text-[11px] transition-colors',
                      alreadySent
                        ? 'bg-zinc-800 text-zinc-500 cursor-default'
                        : 'bg-lunary-primary-900/50 text-lunary-primary-300 hover:bg-lunary-primary-800/50',
                    )}
                  >
                    {alreadySent ? 'Sent!' : 'Send cosmic energy'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
