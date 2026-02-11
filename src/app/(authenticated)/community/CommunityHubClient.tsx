'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Users, Loader2 } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { zodiacSymbol, bodiesSymbols } from '@utils/zodiac/zodiac';

interface CommunitySpace {
  id: number;
  spaceType: string;
  slug: string;
  title: string;
  description: string | null;
  sign: string | null;
  planet: string | null;
  metadata: Record<string, unknown>;
  isActive: boolean;
  postCount: number;
  memberCount: number;
  isMember: boolean;
}

interface AutoJoinResult {
  joinedSpaces: Array<{
    slug: string;
    title: string;
    spaceType: string;
    sign: string | null;
    planet: string | null;
  }>;
  newlyJoined: string[];
  needsBirthChart: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  retrograde_checkin: 'Active Retrogrades',
  saturn_return: 'Life Transits',
  sign_rising: 'Rising Sign',
  sign_sun: 'Sun Sign',
  sign_moon: 'Moon Sign',
};

/** Derive a display group key from a space. Sign spaces are split by placement. */
function getGroupKey(space: CommunitySpace): string {
  if (space.spaceType === 'sign_space') {
    if (space.slug.endsWith('-sun')) return 'sign_sun';
    if (space.slug.endsWith('-moon')) return 'sign_moon';
    return 'sign_rising';
  }
  return space.spaceType;
}

function getSpaceSymbol(
  space: CommunitySpace,
): { chars: string; isAstro: true } | null {
  if (space.spaceType === 'saturn_return') {
    return { chars: bodiesSymbols.saturn, isAstro: true };
  }
  if (space.spaceType === 'retrograde_checkin' && space.planet) {
    const key = space.planet.toLowerCase() as keyof typeof bodiesSymbols;
    if (bodiesSymbols[key]) return { chars: bodiesSymbols[key], isAstro: true };
  }

  const symbols: string[] = [];

  // Show body symbol for sun/moon sign spaces
  if (space.slug.endsWith('-sun')) {
    symbols.push(bodiesSymbols.sun);
  } else if (space.slug.endsWith('-moon')) {
    symbols.push(bodiesSymbols.moon);
  }

  if (space.sign) {
    const key = space.sign.toLowerCase() as keyof typeof zodiacSymbol;
    if (zodiacSymbol[key]) symbols.push(zodiacSymbol[key]);
  }

  return symbols.length > 0 ? { chars: symbols.join(''), isAstro: true } : null;
}

export default function CommunityHubClient() {
  const [spaces, setSpaces] = useState<CommunitySpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [needsBirthChart, setNeedsBirthChart] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Auto-join relevant spaces
        const autoJoinRes = await fetch('/api/community/auto-join', {
          method: 'POST',
        });
        if (autoJoinRes.ok) {
          const autoJoinData: AutoJoinResult = await autoJoinRes.json();
          setNeedsBirthChart(autoJoinData.needsBirthChart);
        }

        // Fetch all spaces (no-store to bypass cache after auto-join)
        const spacesRes = await fetch('/api/community/spaces', {
          cache: 'no-store',
        });
        if (spacesRes.ok) {
          const data = await spacesRes.json();
          setSpaces(data.spaces ?? []);
        }
      } catch {
        // Silent fail
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  // Only show spaces the user has joined
  const mySpaces = spaces.filter((s) => s.isMember);

  // Group by display key (sign spaces split into rising/sun/moon)
  const grouped = mySpaces.reduce<Record<string, CommunitySpace[]>>(
    (acc, space) => {
      const key = getGroupKey(space);
      if (!acc[key]) acc[key] = [];
      acc[key].push(space);
      return acc;
    },
    {},
  );

  const orderedTypes = [
    'retrograde_checkin',
    'saturn_return',
    'sign_rising',
    'sign_sun',
    'sign_moon',
  ];

  if (isLoading) {
    return (
      <div className='min-h-screen p-4'>
        <div className='max-w-2xl mx-auto'>
          <div className='flex items-center gap-2 py-4'>
            <Loader2 className='w-5 h-5 text-zinc-500 animate-spin' />
            <span className='text-sm text-zinc-500'>
              Loading your spaces...
            </span>
          </div>
        </div>
      </div>
    );
  }

  const hasSpaces = mySpaces.length > 0;

  return (
    <div className='min-h-screen p-4'>
      <div className='max-w-2xl mx-auto space-y-6'>
        <header className='pt-4 pb-2'>
          <Link
            href='/explore'
            className='inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-3'
          >
            <ArrowLeft className='w-3.5 h-3.5' />
            Explore
          </Link>
          <Heading variant='h1' as='h1'>
            Community
          </Heading>
          <p className='text-sm text-zinc-400'>
            Connect with your cosmic community
          </p>
        </header>

        {/* Birth chart prompt */}
        {needsBirthChart && (
          <Link
            href='/app/birth-chart'
            className='block rounded-xl border border-lunary-primary-700 bg-gradient-to-r from-lunary-primary-950/60 to-zinc-900 p-4 hover:border-lunary-primary-500 transition-colors'
          >
            <p className='text-sm text-zinc-200'>
              Generate your birth chart to join your Sun, Moon, and Rising sign
              spaces
            </p>
            <p className='text-xs text-lunary-primary-400 mt-1'>
              Tap to set up your birth chart
            </p>
          </Link>
        )}

        {/* No spaces yet */}
        {!hasSpaces && !needsBirthChart && (
          <div className='rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 text-center'>
            <Users className='w-6 h-6 text-zinc-500 mx-auto mb-2' />
            <p className='text-sm text-zinc-400'>No community spaces yet</p>
            <p className='text-xs text-zinc-500 mt-1'>
              Set up your birth chart to get auto-joined to your spaces
            </p>
          </div>
        )}

        {/* Grouped joined spaces */}
        {orderedTypes.map((type) => {
          const typeSpaces = grouped[type];
          if (!typeSpaces || typeSpaces.length === 0) return null;

          const typeLabel = TYPE_LABELS[type] ?? type;

          return (
            <section key={type}>
              <h2 className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3'>
                {typeLabel}
              </h2>
              <div className='space-y-2'>
                {typeSpaces.map((space) => (
                  <SpaceCard key={space.id} space={space} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function SpaceCard({ space }: { space: CommunitySpace }) {
  const symbol = getSpaceSymbol(space);

  return (
    <Link
      href={`/community/${space.slug}`}
      className='flex items-center gap-3 p-3 rounded-lg border border-lunary-primary-700/50 bg-lunary-primary-950/20 hover:border-lunary-primary-600 transition-colors group'
    >
      <div className='w-10 h-10 rounded-lg flex items-center justify-center bg-lunary-primary-900/30 flex-shrink-0'>
        {symbol ? (
          <span className='font-astro text-lg text-lunary-primary-400'>
            {symbol.chars}
          </span>
        ) : (
          <Users className='w-5 h-5 text-lunary-primary-400' />
        )}
      </div>

      <div className='flex-1 min-w-0'>
        <span className='text-sm font-medium text-zinc-200 group-hover:text-zinc-100 truncate block'>
          {space.title}
        </span>
        <div className='flex items-center gap-3 text-[11px] text-zinc-500 mt-0.5'>
          <span>{space.memberCount} members</span>
          <span>{space.postCount} posts</span>
        </div>
      </div>

      <ChevronRight className='w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0' />
    </Link>
  );
}
