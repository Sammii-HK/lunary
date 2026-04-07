'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2, Wand2, Eye, BookOpen } from 'lucide-react';

interface TransitPost {
  id: string;
  slug: string;
  transit_id: string;
  title: string;
  subtitle: string | null;
  planet: string;
  sign: string | null;
  transit_type: string;
  start_date: string | null;
  rarity: string | null;
  status: string;
  word_count: number | null;
  published_at: string | null;
  created_at: string;
}

interface QueueItem {
  transitId: string;
  planet: string;
  sign: string;
  year: number;
  title: string;
  rarity: string;
  score: number;
}

const RARITY_COLOURS: Record<string, string> = {
  CRITICAL: 'bg-red-500/20 text-red-300',
  HIGH: 'bg-amber-500/20 text-amber-300',
  MEDIUM: 'bg-blue-500/20 text-blue-300',
  LOW: 'bg-surface-overlay/20 text-slate-300',
};

const STATUS_COLOURS: Record<string, string> = {
  published: 'bg-green-500/20 text-green-300',
  draft: 'bg-yellow-500/20 text-yellow-300',
  archived: 'bg-surface-overlay/20 text-slate-300',
};

export default function TransitBlogAdminPage() {
  const [posts, setPosts] = useState<TransitPost[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [catchingUp, setCatchingUp] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/transit-blog?includeQueue=true');
      const data = await res.json();
      setPosts(data.posts || []);
      setQueue(data.queue || []);
    } catch (err) {
      console.error('Failed to fetch transit blog data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerate = async (transitId: string) => {
    setGenerating(transitId);
    try {
      const res = await fetch('/api/admin/transit-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transitId }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchData();
      } else {
        alert(data.error || 'Generation failed');
      }
    } catch (err) {
      alert('Generation failed');
    } finally {
      setGenerating(null);
    }
  };

  const handleCatchUp = async () => {
    setCatchingUp(true);
    try {
      const res = await fetch('/api/admin/transit-blog/catch-up', {
        method: 'POST',
      });
      const data = await res.json();
      await fetchData();
      alert(
        `Generated ${data.generated?.length || 0} posts. ${data.remaining} remaining.`,
      );
    } catch (err) {
      alert('Catch-up failed');
    } finally {
      setCatchingUp(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch(`/api/admin/transit-blog/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    await fetchData();
  };

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  return (
    <div className='min-h-screen bg-[#050505] p-6 text-content-secondary'>
      <div className='mx-auto max-w-6xl'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-2xl font-bold'>Transit deep-dive blog</h1>
            <p className='text-sm text-lunary-primary-400 mt-1'>
              {publishedCount} published, {draftCount} drafts, {queue.length} in
              queue
            </p>
          </div>
          <div className='flex gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className='w-4 h-4 mr-2' />
              Refresh
            </Button>
            <Button
              size='sm'
              onClick={handleCatchUp}
              disabled={catchingUp}
              className='bg-lunary-accent-500 hover:bg-lunary-accent-600'
            >
              <Wand2 className='w-4 h-4 mr-2' />
              {catchingUp ? 'Generating...' : 'Catch up (3 posts)'}
            </Button>
          </div>
        </div>

        {/* Published + Draft posts */}
        <Card className='bg-layer-deep/50 border-lunary-primary-800/40 mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BookOpen className='w-5 h-5' />
              Published posts ({posts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className='text-lunary-primary-400'>Loading...</p>
            ) : posts.length === 0 ? (
              <p className='text-lunary-primary-400'>
                No posts yet. Use the catch-up button to generate the first
                batch.
              </p>
            ) : (
              <div className='space-y-3'>
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className='flex items-center justify-between p-3 rounded-lg bg-layer-base/20 border border-lunary-primary-800/30'
                  >
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium truncate'>
                          {post.title}
                        </span>
                        <Badge
                          className={
                            STATUS_COLOURS[post.status] || STATUS_COLOURS.draft
                          }
                        >
                          {post.status}
                        </Badge>
                        {post.rarity && (
                          <Badge
                            className={
                              RARITY_COLOURS[post.rarity] || RARITY_COLOURS.LOW
                            }
                          >
                            {post.rarity}
                          </Badge>
                        )}
                      </div>
                      <p className='text-xs text-lunary-primary-400 mt-1'>
                        {post.planet}
                        {post.sign ? ` in ${post.sign}` : ''} |{' '}
                        {post.word_count
                          ? `${post.word_count} words`
                          : 'no word count'}
                        {post.start_date &&
                          ` | starts ${new Date(post.start_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className='flex items-center gap-2 ml-4'>
                      {post.status === 'published' && (
                        <>
                          <a
                            href={`/blog/transits/${post.slug}`}
                            target='_blank'
                            rel='noopener'
                            className='text-lunary-primary-400 hover:text-content-secondary'
                          >
                            <Eye className='w-4 h-4' />
                          </a>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              handleStatusChange(post.id, 'archived')
                            }
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </>
                      )}
                      {post.status === 'draft' && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            handleStatusChange(post.id, 'published')
                          }
                        >
                          Publish
                        </Button>
                      )}
                      {post.status === 'archived' && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            handleStatusChange(post.id, 'published')
                          }
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generation queue */}
        <Card className='bg-layer-deep/50 border-lunary-primary-800/40'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Wand2 className='w-5 h-5' />
              Generation queue ({queue.length} transits need posts)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {queue.length === 0 ? (
              <p className='text-lunary-primary-400'>
                All transits have blog posts.
              </p>
            ) : (
              <div className='space-y-2'>
                {queue.slice(0, 15).map((item) => (
                  <div
                    key={item.transitId}
                    className='flex items-center justify-between p-3 rounded-lg bg-layer-base/10 border border-lunary-primary-800/20'
                  >
                    <div>
                      <span className='font-medium'>{item.title}</span>
                      <div className='flex items-center gap-2 mt-1'>
                        <Badge
                          className={
                            RARITY_COLOURS[item.rarity] || RARITY_COLOURS.LOW
                          }
                        >
                          {item.rarity}
                        </Badge>
                        <span className='text-xs text-lunary-primary-400'>
                          Score: {item.score}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleGenerate(item.transitId)}
                      disabled={generating === item.transitId}
                    >
                      {generating === item.transitId
                        ? 'Generating...'
                        : 'Generate'}
                    </Button>
                  </div>
                ))}
                {queue.length > 15 && (
                  <p className='text-sm text-lunary-primary-400 pt-2'>
                    + {queue.length - 15} more transits in queue
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
