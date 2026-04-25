'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Sparkles, Lock } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { useUser } from '@/context/UserContext';
import { useSubscription } from '@/hooks/useSubscription';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import {
  GroupSkyChart,
  computeGroupAspects,
  type GroupParticipant,
  type ActiveAspect,
} from '@/components/charts/GroupSkyChart';
import {
  GroupSkyFriendPicker,
  type GroupFriend,
} from '@/components/charts/GroupSkyFriendPicker';
import {
  useEphemerisRange,
  sampleEphemeris,
  type BodyName,
} from '@/components/charts/useEphemerisRange';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';

const PARTICIPANT_PALETTE = [
  '#7BFFB8', // user — soft mint
  '#C77DFF', // friend 1 — orchid
  '#94d1ff', // friend 2 — sky
  '#ffd6a3', // friend 3 — apricot
  '#ff9bd2', // friend 4 — rose
  '#ffe08a', // friend 5 — gold
  '#9b9bff', // friend 6 — periwinkle
];

const PLUS_FRIEND_CAP = 6;
const FREE_FRIEND_CAP = 1;

type FriendListEntry = {
  id: string;
  friendId: string;
  name: string;
  avatar?: string;
  relationshipType?: string;
  sunSign?: string;
};

type FriendDetail = {
  id: string;
  friendId: string;
  name: string;
  avatar?: string;
  hasBirthChart: boolean;
  birthChart?: BirthChartData[];
};

type FriendsListResponse = {
  friends?: FriendListEntry[];
  error?: string;
  requiresUpgrade?: boolean;
};

type FriendDetailResponse = Partial<FriendDetail> & {
  error?: string;
  requiresUpgrade?: boolean;
};

export default function GroupSkyPage() {
  const { user, loading: userLoading } = useUser();
  const sub = useSubscription();
  const hasGroupAccess = sub.hasAccess('personalized_transit_readings');

  const friendCap = hasGroupAccess ? PLUS_FRIEND_CAP : FREE_FRIEND_CAP;

  const [friends, setFriends] = useState<GroupFriend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendsError, setFriendsError] = useState<string | null>(null);
  const [friendsRequireUpgrade, setFriendsRequireUpgrade] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Fetch the friends list, then fetch each friend's detail to get their birthChart.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setFriendsLoading(true);
      setFriendsError(null);
      try {
        const listRes = await fetch('/api/friends', {
          credentials: 'include',
        });
        const listData = (await listRes.json()) as FriendsListResponse;
        if (!listRes.ok) {
          if (listData.requiresUpgrade) {
            setFriendsRequireUpgrade(true);
          }
          throw new Error(listData.error || 'Failed to load friends');
        }
        const list = listData.friends ?? [];

        // Fetch each friend's detail in parallel for their birthChart.
        const detailResults = await Promise.all(
          list.map(async (entry) => {
            try {
              const res = await fetch(`/api/friends/${entry.id}`, {
                credentials: 'include',
              });
              const data = (await res.json()) as FriendDetailResponse;
              if (!res.ok || !data.hasBirthChart || !data.birthChart) {
                return null;
              }
              return {
                id: entry.id,
                name: entry.name,
                avatarUrl: entry.avatar,
                birthChart: data.birthChart,
              } as GroupFriend;
            } catch {
              return null;
            }
          }),
        );
        if (cancelled) return;
        const withCharts = detailResults.filter(
          (f): f is GroupFriend => f !== null,
        );
        setFriends(withCharts);
      } catch (err) {
        if (cancelled) return;
        setFriendsError(
          err instanceof Error ? err.message : 'Failed to load friends',
        );
      } finally {
        if (!cancelled) setFriendsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-pre-select the first friend (so the chart isn't lonely).
  useEffect(() => {
    if (friendsLoading) return;
    setSelected((prev) => {
      if (prev.size > 0) return prev;
      if (friends.length === 0) return prev;
      const next = new Set(prev);
      next.add(friends[0].id);
      return next;
    });
  }, [friendsLoading, friends]);

  // Cap selection if subscription tier changes.
  useEffect(() => {
    setSelected((prev) => {
      if (prev.size <= friendCap) return prev;
      const trimmed = new Set<string>();
      let i = 0;
      for (const id of prev) {
        if (i++ >= friendCap) break;
        trimmed.add(id);
      }
      return trimmed;
    });
  }, [friendCap]);

  const colorById = useMemo(() => {
    const map: Record<string, string> = {};
    friends.forEach((f, idx) => {
      // user takes palette[0]; friends start at palette[1]
      map[f.id] =
        PARTICIPANT_PALETTE[(idx + 1) % PARTICIPANT_PALETTE.length] ??
        '#a1a1aa';
    });
    return map;
  }, [friends]);

  const userBirthChart =
    (user?.birthChart as BirthChartData[] | undefined) ?? [];
  const userHasChart = userBirthChart.length > 0;
  const userColor = PARTICIPANT_PALETTE[0];
  const userName = user?.name?.split(' ')[0] || 'You';

  const handleToggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < friendCap) {
        next.add(id);
      }
      return next;
    });
  };

  const participants = useMemo<GroupParticipant[]>(() => {
    const list: GroupParticipant[] = [];
    if (userHasChart && user) {
      list.push({
        id: user.id,
        name: userName,
        color: userColor,
        birthChart: userBirthChart,
        isUser: true,
      });
    }
    for (const friend of friends) {
      if (!selected.has(friend.id)) continue;
      list.push({
        id: friend.id,
        name: friend.name,
        color: colorById[friend.id] ?? '#a1a1aa',
        birthChart: friend.birthChart,
      });
    }
    return list;
  }, [
    userHasChart,
    user,
    userName,
    userColor,
    userBirthChart,
    friends,
    selected,
    colorById,
  ]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, []);

  // Fetch a small ephemeris range to compute the insight panel server-side of UI.
  // (GroupSkyChart also fetches its own; the worker cache should make this cheap.)
  const rangeStart = useMemo(
    () => new Date(today.getTime() - 2 * 86400000),
    [today],
  );
  const rangeEnd = useMemo(
    () => new Date(today.getTime() + 2 * 86400000),
    [today],
  );
  const { range } = useEphemerisRange({
    enabled: participants.length > 0,
    start: rangeStart,
    end: rangeEnd,
    stepDays: 1,
  });

  const topAspects = useMemo<ActiveAspect[]>(() => {
    if (!range || participants.length === 0) return [];
    const snapshot = sampleEphemeris(range, today.getTime());
    if (!snapshot) return [];
    const all = computeGroupAspects(snapshot, participants);
    // Rank by tightness, prioritise inner planets which feel more day-to-day.
    const FAST: BodyName[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
    const score = (a: ActiveAspect) =>
      a.orb + (FAST.includes(a.transitBody) ? 0 : 1.5);
    return [...all].sort((a, b) => score(a) - score(b)).slice(0, 5);
  }, [range, participants, today]);

  // ---------- Render ----------

  if (userLoading) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-lunary-primary' />
      </div>
    );
  }

  if (!user) {
    return (
      <div className='mx-auto max-w-2xl px-4 py-12 text-center'>
        <Heading as='h1' variant='h2'>
          Sign in to see your group sky
        </Heading>
        <p className='text-sm text-content-muted mt-2'>
          Once you&apos;re signed in and have your friends added, you can read
          today&apos;s sky for the whole group at once.
        </p>
      </div>
    );
  }

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-6 pb-20'>
      <div className='mb-6'>
        <div className='flex items-center gap-2 text-xs uppercase tracking-wide text-content-muted mb-2'>
          <Sparkles className='w-3.5 h-3.5 text-lunary-primary' />
          Group Sky
        </div>
        <Heading as='h1' variant='h2'>
          Your friend group&apos;s sky right now
        </Heading>
        <p className='text-sm text-content-muted mt-2'>
          Today&apos;s transits, drawn against everyone&apos;s natal placements
          at once. Tap a name to focus their lines, or tap a planet for the
          story behind the aspect.
        </p>
      </div>

      {!userHasChart && (
        <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/60 p-4 mb-6 text-sm text-content-secondary'>
          You need your own birth chart first.{' '}
          <Link href='/profile' className='text-lunary-primary underline'>
            Add your birth details
          </Link>{' '}
          to see how today&apos;s sky lands on you.
        </div>
      )}

      {/* Free-tier gate banner */}
      {!hasGroupAccess && !sub.loading && (
        <div className='rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 mb-6 flex flex-wrap items-center gap-3'>
          <Lock className='w-4 h-4 text-amber-300 shrink-0' />
          <div className='flex-1 min-w-0'>
            <div className='text-sm font-medium text-content-primary'>
              Plus unlocks the full group sky
            </div>
            <div className='text-xs text-content-muted'>
              Free shows 1 friend at a time. Plus shows up to 6 — the whole
              group on one wheel.
            </div>
          </div>
          <SmartTrialButton size='sm' feature='personalized_transit_readings' />
        </div>
      )}

      {friendsRequireUpgrade && !hasGroupAccess && (
        <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/60 p-4 mb-6 text-sm text-content-secondary'>
          Friend connections are a Lunary+ feature.{' '}
          <Link href='/pricing' className='text-lunary-primary underline'>
            See plans
          </Link>
          .
        </div>
      )}

      <div className='mb-5'>
        <GroupSkyFriendPicker
          user={
            user && userHasChart
              ? {
                  id: user.id,
                  name: userName,
                  avatarUrl: undefined,
                  color: userColor,
                }
              : undefined
          }
          friends={friends}
          selected={selected}
          colorById={colorById}
          canSelectMore={selected.size < friendCap}
          locked={!hasGroupAccess}
          onToggle={handleToggle}
        />
      </div>

      {friendsLoading ? (
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-lunary-primary' />
        </div>
      ) : friendsError && friends.length === 0 ? (
        <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/60 p-6 text-sm text-content-muted text-center'>
          {friendsError}
        </div>
      ) : participants.length === 0 ? (
        <div className='rounded-xl border-2 border-dashed border-stroke-subtle p-8 text-center'>
          <p className='text-sm text-content-muted'>
            Pick at least one friend to draw the group sky.
          </p>
        </div>
      ) : (
        <motion.div
          key={participants.map((p) => p.id).join('|')}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <GroupSkyChart participants={participants} now={today} />
        </motion.div>
      )}

      {/* Insight panel */}
      {participants.length > 0 && topAspects.length > 0 && (
        <div className='mt-8'>
          <h2 className='text-sm font-semibold uppercase tracking-wide text-content-muted mb-3'>
            What&apos;s active across the group
          </h2>
          <ul className='space-y-2'>
            {topAspects.map((a) => (
              <li
                key={a.key}
                className='flex items-start gap-3 rounded-lg border border-stroke-subtle bg-surface-elevated/60 px-3 py-2.5'
              >
                <span
                  className='mt-1.5 inline-block w-2 h-2 rounded-full shrink-0'
                  style={{ backgroundColor: a.participantColor }}
                />
                <div className='flex-1 min-w-0'>
                  <div className='text-sm text-content-primary'>
                    <span className='font-semibold'>{a.transitBody}</span>{' '}
                    <span
                      className='font-astro'
                      style={{ color: a.aspectTint }}
                      aria-label={a.aspect}
                    >
                      {a.aspectSymbol}
                    </span>{' '}
                    {a.participantName}&apos;s{' '}
                    <span className='font-semibold'>{a.natalBody}</span>{' '}
                    <span className='text-content-muted text-xs'>
                      ({a.orb.toFixed(1)}°)
                    </span>
                  </div>
                  {a.blurb && (
                    <div className='text-xs text-content-secondary mt-0.5'>
                      {a.blurb}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {participants.length > 0 && topAspects.length === 0 && range && (
        <div className='mt-8 rounded-xl border border-stroke-subtle bg-surface-elevated/60 p-5 text-sm text-content-muted text-center'>
          The sky is quiet between you all today — no tight aspects within 3°.
          Try again tomorrow.
        </div>
      )}
    </div>
  );
}
