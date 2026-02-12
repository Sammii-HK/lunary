'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpaceHeader } from '@/components/community/SpaceHeader';
import { CommunityPostFeed } from '@/components/community/CommunityPostFeed';
import { SharePostForm } from '@/components/community/SharePostForm';
import { WeeklyThemeCard } from '@/components/community/WeeklyThemeCard';
import { useSubscription } from '@/hooks/useSubscription';

interface SpaceData {
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

export default function CommunitySpaceClient() {
  const params = useParams();
  const slug = params?.slug as string;
  const { isSubscribed } = useSubscription();

  const [space, setSpace] = useState<SpaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchSpace = async () => {
      try {
        const res = await fetch(`/api/community/spaces/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Space not found');
          } else {
            setError('Failed to load space');
          }
          return;
        }
        const data = await res.json();
        setSpace(data.space);
      } catch {
        setError('Failed to load space');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpace();
  }, [slug]);

  const handleJoin = async () => {
    if (!slug || isJoining) return;
    setIsJoining(true);

    try {
      const res = await fetch(`/api/community/spaces/${slug}/join`, {
        method: 'POST',
      });
      if (res.ok && space) {
        setSpace({
          ...space,
          isMember: true,
          memberCount: space.memberCount + 1,
        });
      }
    } catch {
      // Silent fail
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen p-4'>
        <div className='max-w-2xl mx-auto flex items-center gap-2 py-8'>
          <Loader2 className='w-5 h-5 text-zinc-500 animate-spin' />
          <span className='text-sm text-zinc-500'>Loading space...</span>
        </div>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className='min-h-screen p-4'>
        <div className='max-w-2xl mx-auto py-8 text-center'>
          <p className='text-sm text-zinc-400'>{error ?? 'Space not found'}</p>
          <Link
            href='/community'
            className='text-xs text-lunary-primary-400 hover:underline mt-2 inline-block'
          >
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const canPost = isSubscribed && space.isMember;
  const isSaturnReturn = space.spaceType === 'saturn_return';

  return (
    <div className='min-h-screen p-4'>
      <div className='max-w-2xl mx-auto space-y-4 mb-20'>
        <Link
          href='/community'
          className='inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors'
        >
          <ArrowLeft className='w-3.5 h-3.5' />
          Community
        </Link>

        <SpaceHeader
          title={space.title}
          description={space.description}
          memberCount={space.memberCount}
          postCount={space.postCount}
          sign={space.sign}
          planet={space.planet}
          slug={space.slug}
          spaceType={space.spaceType}
        />

        {/* Join button if not a member */}
        {!space.isMember && (
          <Button onClick={handleJoin} disabled={isJoining} className='w-full'>
            {isJoining ? 'Joining...' : 'Join this space'}
          </Button>
        )}

        {/* Saturn Return weekly theme */}
        {isSaturnReturn && (
          <WeeklyThemeCard
            metadata={space.metadata as { weekly_themes?: string[] }}
          />
        )}

        {/* Post form (paid members only) */}
        {canPost && <SharePostForm spaceSlug={slug} />}

        {/* Upgrade prompt for free users who are members */}
        {space.isMember && !isSubscribed && (
          <div className='rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4 text-center'>
            <Lock className='w-5 h-5 text-zinc-500 mx-auto mb-2' />
            <p className='text-sm text-zinc-400'>
              Upgrade to Lunary+ to post in community spaces
            </p>
            <Link
              href='/pricing'
              className='text-xs text-lunary-primary-400 hover:underline mt-1 inline-block'
            >
              View plans
            </Link>
          </div>
        )}

        {/* Post feed (visible to all) */}
        <CommunityPostFeed spaceSlug={slug} />
      </div>
    </div>
  );
}
