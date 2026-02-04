'use client';

import { useEffect, useState } from 'react';
import { Flame, Trophy, Users, Crown, ArrowUp } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FriendStreak {
  friendId: string;
  name: string;
  avatar: string | null;
  currentStreak: number;
  lastCheckIn: string | null;
}

interface LeaderboardData {
  userStreak: number;
  userPosition: number;
  friends: FriendStreak[];
}

export function CircleLeaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/friends/streaks', {
          credentials: 'include',
        });

        if (!response.ok) {
          const result = await response.json();
          if (result.requiresUpgrade) {
            setError('upgrade');
          } else {
            setError('Failed to load');
          }
          return;
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('[CircleLeaderboard] Error:', err);
        setError('Failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-4'>
        <div className='flex items-center gap-2 mb-3'>
          <Users className='w-4 h-4 text-zinc-400' />
          <span className='text-sm font-medium text-zinc-400'>
            Circle Leaderboard
          </span>
        </div>
        <div className='space-y-2'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='h-12 bg-zinc-900/50 rounded-lg animate-pulse'
            />
          ))}
        </div>
      </div>
    );
  }

  if (error === 'upgrade') {
    return null; // Don't show if user doesn't have access
  }

  if (error || !data) {
    return null;
  }

  // No friends yet
  if (data.friends.length === 0) {
    return (
      <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-4'>
        <div className='flex items-center gap-2 mb-3'>
          <Users className='w-4 h-4 text-zinc-400' />
          <span className='text-sm font-medium text-zinc-300'>
            Circle Leaderboard
          </span>
        </div>
        <p className='text-xs text-zinc-500'>
          Add friends to your circle to compete on the leaderboard!
        </p>
      </div>
    );
  }

  // Build leaderboard entries (top 3 friends + user)
  const topFriends = data.friends.slice(0, 3);
  const allEntries = [
    { type: 'user' as const, streak: data.userStreak },
    ...topFriends.map((f) => ({ type: 'friend' as const, ...f })),
  ].sort((a, b) => b.streak - a.streak);

  // Get motivational copy
  const motivationalCopy = getMotivationalCopy(
    data.userPosition,
    data.userStreak,
    topFriends[0]?.currentStreak || 0,
  );

  return (
    <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <Users className='w-4 h-4 text-lunary-accent' />
          <span className='text-sm font-medium text-zinc-300'>
            Circle Leaderboard
          </span>
        </div>
        {data.userPosition === 1 && (
          <Crown className='w-4 h-4 text-yellow-500' />
        )}
      </div>

      {/* Leaderboard List */}
      <div className='space-y-2'>
        {allEntries.slice(0, 4).map((entry, index) => {
          const position = index + 1;
          const isUser = entry.type === 'user';

          return (
            <div
              key={isUser ? 'user' : entry.friendId}
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg transition-colors',
                isUser
                  ? 'bg-lunary-primary-900/20 border border-lunary-primary-800/30'
                  : 'bg-zinc-900/30',
              )}
            >
              {/* Position */}
              <span
                className={cn(
                  'w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold',
                  position === 1
                    ? 'bg-yellow-500/20 text-yellow-500'
                    : position === 2
                      ? 'bg-zinc-400/20 text-zinc-400'
                      : position === 3
                        ? 'bg-orange-500/20 text-orange-500'
                        : 'bg-zinc-800 text-zinc-500',
                )}
              >
                {position}
              </span>

              {/* Avatar */}
              <div className='w-8 h-8 rounded-full bg-zinc-800 overflow-hidden'>
                {isUser ? (
                  <div className='w-full h-full flex items-center justify-center text-xs text-lunary-accent font-semibold'>
                    You
                  </div>
                ) : entry.avatar ? (
                  <Image
                    src={entry.avatar}
                    alt={entry.name}
                    width={32}
                    height={32}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-xs text-zinc-500'>
                    {entry.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name */}
              <span
                className={cn(
                  'flex-1 text-sm truncate',
                  isUser ? 'text-lunary-accent font-medium' : 'text-zinc-300',
                )}
              >
                {isUser ? 'You' : entry.name}
              </span>

              {/* Streak */}
              <div className='flex items-center gap-1'>
                <Flame
                  className={cn(
                    'w-4 h-4',
                    entry.streak > 0 ? 'text-lunary-rose' : 'text-zinc-600',
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-semibold',
                    entry.streak > 0 ? 'text-white' : 'text-zinc-500',
                  )}
                >
                  {entry.streak}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Copy */}
      {motivationalCopy && (
        <div className='mt-3 pt-3 border-t border-zinc-800/60'>
          <div className='flex items-center gap-2'>
            {motivationalCopy.icon}
            <p className='text-xs text-zinc-400'>{motivationalCopy.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function getMotivationalCopy(
  position: number,
  userStreak: number,
  topStreak: number,
): { text: string; icon: React.ReactNode } | null {
  if (position === 1) {
    return {
      text: "You're leading the pack!",
      icon: <Trophy className='w-3.5 h-3.5 text-yellow-500 shrink-0' />,
    };
  }

  if (position <= 3) {
    const daysToFirst = topStreak - userStreak;
    return {
      text: `${daysToFirst} day${daysToFirst !== 1 ? 's' : ''} to take #1!`,
      icon: <ArrowUp className='w-3.5 h-3.5 text-lunary-success shrink-0' />,
    };
  }

  return {
    text: `Keep going to climb the leaderboard!`,
    icon: <ArrowUp className='w-3.5 h-3.5 text-zinc-500 shrink-0' />,
  };
}
