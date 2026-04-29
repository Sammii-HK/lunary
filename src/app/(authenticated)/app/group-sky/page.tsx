'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  CalendarDays,
  Lock,
  MessageCircle,
  Sparkles,
  Star,
} from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/UserContext';
import { useSubscription } from '@/hooks/useSubscription';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import {
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
import { CosmicSkeleton } from '@/components/states/CosmicSkeleton';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';

// Heavy SVG chart: only mount once we actually have a participant to draw.
const GroupSkyChart = dynamic(
  () =>
    import('@/components/charts/GroupSkyChart').then((m) => ({
      default: m.GroupSkyChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className='w-full max-w-3xl mx-auto'>
        <div className='relative w-full mx-auto aspect-square max-w-[440px] sm:max-w-[520px]'>
          <CosmicSkeleton
            variant='circle'
            width='100%'
            className='absolute inset-0'
          />
        </div>
      </div>
    ),
  },
);

const PARTICIPANT_PALETTE = [
  '#7BFFB8', // user: soft mint
  '#C77DFF', // friend 1: orchid
  '#94d1ff', // friend 2: sky
  '#ffd6a3', // friend 3: apricot
  '#ff9bd2', // friend 4: rose
  '#ffe08a', // friend 5: gold
  '#9b9bff', // friend 6: periwinkle
];

const PLUS_FRIEND_CAP = 6;
// Free users get 1: they can pick a single friend so the chart attempts to
// render. The wheel itself shows blurred under a Lock + SmartTrialButton
// overlay (FOMO play): you can feel the experience but not read it.
const FREE_FRIEND_CAP = 1;

type FriendListEntry = {
  id: string;
  friendId: string;
  name: string;
  avatar?: string;
  relationshipType?: string;
  sunSign?: string;
  hasBirthChart?: boolean;
  birthChart?: BirthChartData[];
};

type FriendsListResponse = {
  friends?: FriendListEntry[];
  error?: string;
  requiresUpgrade?: boolean;
};

type RelationshipProfileEntry = {
  id: string;
  name: string;
  relationship_type?: string | null;
  birth_chart?: BirthChartData[] | null;
};

type RelationshipProfilesResponse = {
  profiles?: RelationshipProfileEntry[];
};

type TimingWindow = {
  date: string;
  endDate?: string;
  dateFormatted: string;
  quality: 'great' | 'good' | 'neutral' | 'challenging';
  reason: string;
};

type TimingResponse = {
  timingWindows?: TimingWindow[];
  requiresProForTiming?: boolean;
  error?: string;
};

export default function GroupSkyPage() {
  const { user, loading: userLoading } = useUser();
  const sub = useSubscription();
  // Group Sky is a premium teaser. The chart computation is client-side, so
  // the cap and blurred preview live here in the UI.
  const hasGroupAccess = sub.hasAccess('group_sky');

  const friendCap = hasGroupAccess ? PLUS_FRIEND_CAP : FREE_FRIEND_CAP;

  const [friends, setFriends] = useState<GroupFriend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendsError, setFriendsError] = useState<string | null>(null);
  const [friendsRequireUpgrade, setFriendsRequireUpgrade] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [timing, setTiming] = useState<TimingResponse | null>(null);
  const [timingLoading, setTimingLoading] = useState(false);

  // Fetch friends and private relationship profiles together so Group Sky can
  // read real people without forcing social invites.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setFriendsLoading(true);
      setFriendsError(null);
      try {
        const [friendsResult, profilesResult] = await Promise.allSettled([
          fetch('/api/friends?charts=1', { credentials: 'include' }),
          fetch('/api/relationships', { credentials: 'include' }),
        ]);

        const next: GroupFriend[] = [];

        if (friendsResult.status === 'fulfilled') {
          const listRes = friendsResult.value;
          const listData = (await listRes.json()) as FriendsListResponse;
          if (listRes.ok) {
            const withCharts: GroupFriend[] = (listData.friends ?? [])
              .filter((entry) => entry.hasBirthChart && entry.birthChart)
              .map((entry) => ({
                id: entry.id,
                name: entry.name,
                avatarUrl: entry.avatar,
                source: 'friend',
                birthChart: entry.birthChart!,
              }));
            next.push(...withCharts);
            setFriendsRequireUpgrade(false);
          } else {
            if (listData.requiresUpgrade) {
              setFriendsRequireUpgrade(true);
            }
            if (!listData.requiresUpgrade) {
              throw new Error(listData.error || 'Failed to load friends');
            }
          }
        }

        if (profilesResult.status === 'fulfilled' && profilesResult.value.ok) {
          const profilesData =
            (await profilesResult.value.json()) as RelationshipProfilesResponse;
          const privateProfiles: GroupFriend[] = (profilesData.profiles ?? [])
            .filter((profile) => profile.birth_chart?.length)
            .map((profile) => ({
              id: `profile:${profile.id}`,
              name: profile.name,
              source: 'profile',
              relationshipType: profile.relationship_type ?? null,
              birthChart: profile.birth_chart!,
            }));
          next.push(...privateProfiles);
        }

        if (cancelled) return;
        setFriends(next);
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

  // Auto-pre-select the first friend (so the chart isn't lonely). Free users
  // must opt in by tapping a friend themselves. That tap is the FOMO trigger
  // that surfaces the blurred wheel + paywall, so don't pre-pick for them.
  useEffect(() => {
    if (friendsLoading) return;
    if (!hasGroupAccess) return;
    setSelected((prev) => {
      if (prev.size > 0) return prev;
      if (friends.length === 0) return prev;
      const next = new Set(prev);
      next.add(friends[0].id);
      return next;
    });
  }, [friendsLoading, friends, hasGroupAccess]);

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

  const userBirthChart = useMemo(
    () => (user?.birthChart as BirthChartData[] | undefined) ?? [],
    [user?.birthChart],
  );
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

  const primarySelectedId = useMemo(() => [...selected][0] ?? null, [selected]);
  const primaryFriend = useMemo(
    () => friends.find((friend) => friend.id === primarySelectedId) ?? null,
    [friends, primarySelectedId],
  );

  useEffect(() => {
    if (
      !primarySelectedId ||
      !hasGroupAccess ||
      primarySelectedId.startsWith('profile:')
    ) {
      setTiming(null);
      setTimingLoading(false);
      return;
    }

    let cancelled = false;
    async function loadTiming() {
      setTimingLoading(true);
      try {
        const response = await fetch(
          `/api/friends/${primarySelectedId}/timing`,
          {
            credentials: 'include',
          },
        );
        const data = (await response.json()) as TimingResponse;
        if (!cancelled) setTiming(data);
      } catch (error) {
        if (!cancelled) {
          setTiming({
            error:
              error instanceof Error
                ? error.message
                : 'Could not load relationship timing',
          });
        }
      } finally {
        if (!cancelled) setTimingLoading(false);
      }
    }

    loadTiming();
    return () => {
      cancelled = true;
    };
  }, [primarySelectedId, hasGroupAccess]);

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
      <div className='mx-auto w-full max-w-3xl px-4 py-6'>
        <CosmicSkeleton width={160} height={14} className='mb-3' />
        <CosmicSkeleton width='75%' height={28} className='mb-2' />
        <CosmicSkeleton width='90%' height={14} className='mb-6' />
        <div className='flex gap-3 mb-5'>
          {[0, 1, 2, 3].map((i) => (
            <CosmicSkeleton key={i} variant='circle' width={56} />
          ))}
        </div>
        <CosmicSkeleton
          variant='circle'
          width='100%'
          className='aspect-square max-w-[440px] mx-auto'
        />
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

      {/* Soft pitch: only when free user hasn't selected anyone yet. Once they
          pick a friend, the blurred-wheel + Lock overlay does the FOMO work. */}
      {!hasGroupAccess && !sub.loading && selected.size === 0 && (
        <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/80 p-6 mb-6 text-center'>
          <div className='w-14 h-14 bg-gradient-to-br from-lunary-primary to-lunary-secondary rounded-full flex items-center justify-center mx-auto mb-4'>
            <Star className='w-7 h-7 text-content-primary' />
          </div>
          <Heading as='h2' variant='h3' className='mb-2'>
            Pick a friend to preview Group Sky
          </Heading>
          <p className='text-sm text-content-muted mb-5 max-w-md mx-auto'>
            Tap any friend below to see today&apos;s transits drawn against your
            two charts. Lunary+ unlocks the full reading and up to 6 friends on
            one wheel.
          </p>
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
          locked={false}
          onToggle={handleToggle}
        />
      </div>

      {hasGroupAccess &&
        primaryFriend &&
        primaryFriend.source !== 'profile' && (
          <div className='mb-5 rounded-2xl border border-stroke-subtle bg-surface-elevated/45 p-4'>
            <div className='mb-3 flex items-start justify-between gap-3'>
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-content-muted'>
                  Relationship timing
                </p>
                <h2 className='mt-1 text-sm font-semibold text-content-primary'>
                  Best day to message {primaryFriend.name.split(' ')[0]}
                </h2>
              </div>
              <MessageCircle className='h-4 w-4 text-lunary-primary' />
            </div>

            {timingLoading ? (
              <p className='text-xs text-content-muted'>
                Checking the next connection window...
              </p>
            ) : timing?.requiresProForTiming ? (
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <p className='text-xs text-content-secondary'>
                  Lunary Pro unlocks best days to reconnect, shared events and
                  timing reasons.
                </p>
                <SmartTrialButton
                  size='sm'
                  feature='personalized_transit_readings'
                />
              </div>
            ) : timing?.timingWindows && timing.timingWindows.length > 0 ? (
              (() => {
                const best =
                  timing.timingWindows.find((window) =>
                    ['great', 'good'].includes(window.quality),
                  ) ?? timing.timingWindows[0];
                const params = new URLSearchParams({
                  date: best.date,
                  label: `Message ${primaryFriend.name}`,
                });

                return (
                  <Link
                    href={`/app/time-machine?${params.toString()}`}
                    className='group flex items-start gap-3 rounded-xl border border-white/10 bg-surface-base/35 p-3 transition-colors hover:border-lunary-primary/45 hover:bg-surface-base/55'
                  >
                    <span className='mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-lunary-primary/35 bg-lunary-primary/10 text-lunary-primary'>
                      <CalendarDays className='h-4 w-4' />
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span className='flex flex-wrap items-center gap-2'>
                        <span className='text-sm font-semibold text-content-primary'>
                          {best.dateFormatted}
                        </span>
                        <span className='rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-content-muted'>
                          {best.quality}
                        </span>
                      </span>
                      <span className='mt-1 block text-xs leading-relaxed text-content-secondary'>
                        {best.reason}
                      </span>
                    </span>
                  </Link>
                );
              })()
            ) : (
              <p className='text-xs text-content-muted'>
                No obvious green-light window in the next month. Keep this one
                gentle, or check again tomorrow.
              </p>
            )}
          </div>
        )}

      {friendsLoading ? (
        <div className='space-y-4'>
          <CosmicSkeleton
            variant='circle'
            width='100%'
            className='aspect-square max-w-[440px] sm:max-w-[520px] mx-auto'
            label='Loading group sky chart'
          />
          <div className='flex flex-wrap justify-center gap-2'>
            {[0, 1, 2].map((i) => (
              <CosmicSkeleton key={i} width={84} height={26} radius={999} />
            ))}
          </div>
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
        // Chart attempts to render for everyone with a participant selected.
        // For free users we layer a blur + Lock + SmartTrialButton overlay on
        // top. FOMO play: you can feel it, but you can't read it.
        <div className='relative'>
          <motion.div
            key={participants.map((p) => p.id).join('|')}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              !hasGroupAccess && 'pointer-events-none select-none blur-md',
            )}
            aria-hidden={!hasGroupAccess ? true : undefined}
          >
            <GroupSkyChart participants={participants} now={today} />
          </motion.div>

          {!hasGroupAccess && (
            <div className='absolute inset-0 flex items-center justify-center p-6'>
              <div className='max-w-sm rounded-2xl border border-stroke-subtle bg-surface-base/80 p-5 text-center backdrop-blur-md'>
                <Lock className='w-8 h-8 text-lunary-primary mx-auto mb-3' />
                <p className='text-sm font-medium text-content-primary mb-1'>
                  Unlock the whole group&apos;s sky
                </p>
                <p className='text-xs text-content-muted mb-4'>
                  Lunary+ draws today&apos;s transits against everyone&apos;s
                  natal placements on one wheel, up to 6 friends at once.
                </p>
                <SmartTrialButton fullWidth feature='group_sky' />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Insight panel: premium only. */}
      {hasGroupAccess && participants.length > 0 && topAspects.length > 0 && (
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

      {hasGroupAccess &&
        participants.length > 0 &&
        topAspects.length === 0 &&
        range && (
          <div className='mt-8 rounded-xl border border-stroke-subtle bg-surface-elevated/60 p-5 text-sm text-content-muted text-center'>
            The sky is quiet between you all today: no tight aspects within 3°.
            Try again tomorrow.
          </div>
        )}
    </div>
  );
}
