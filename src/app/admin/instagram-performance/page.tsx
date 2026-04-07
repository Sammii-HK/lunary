'use client';

import { useState, useEffect } from 'react';

interface PerformanceByType {
  post_type: string;
  _avg: {
    engagement_rate: number | null;
    save_rate: number | null;
    impressions: number | null;
    reach: number | null;
  };
  _sum: {
    likes: number | null;
    comments: number | null;
    saves: number | null;
    shares: number | null;
  };
  _count: number;
}

interface TopPost {
  id: number;
  post_type: string;
  content_category: string | null;
  engagement_rate: number | null;
  save_rate: number | null;
  likes: number | null;
  saves: number | null;
  comments: number | null;
  posted_at: string | null;
}

export default function InstagramPerformancePage() {
  const [days, setDays] = useState(30);
  const [byType, setByType] = useState<PerformanceByType[]>([]);
  const [byCategory, setByCategory] = useState<PerformanceByType[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [typeRes, catRes, topRes] = await Promise.all([
          fetch(
            `/api/admin/instagram-performance?groupBy=post_type&days=${days}`,
          ),
          fetch(
            `/api/admin/instagram-performance?groupBy=content_category&days=${days}`,
          ),
          fetch(
            `/api/admin/instagram-performance?groupBy=top_posts&days=${days}`,
          ),
        ]);

        const typeData = await typeRes.json();
        const catData = await catRes.json();
        const topData = await topRes.json();

        setByType(typeData.results || []);
        setByCategory(catData.results || []);
        setTopPosts(topData.results || []);
      } catch (error) {
        console.error('Failed to load performance data:', error);
      }
      setLoading(false);
    }

    load();
  }, [days]);

  const formatRate = (rate: number | null) =>
    rate != null ? `${(rate * 100).toFixed(2)}%` : '-';

  const formatNum = (n: number | null) =>
    n != null ? n.toLocaleString() : '-';

  return (
    <div className='min-h-screen bg-surface-base text-content-primary p-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Instagram Performance</h1>
          <p className='text-content-muted mb-6'>
            Track engagement, saves, and reach across all content types
          </p>

          <div className='flex items-center gap-4'>
            <label className='text-sm font-medium'>Time range:</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className='px-3 py-2 bg-surface-card border border-stroke-strong rounded-md text-content-primary'
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className='text-content-muted py-12 text-center'>
            Loading performance data...
          </div>
        ) : (
          <>
            {/* By Post Type */}
            <div className='mb-8'>
              <h2 className='text-xl font-bold mb-4'>
                Performance by Post Type
              </h2>
              {byType.length === 0 ? (
                <div className='bg-surface-elevated rounded-lg border border-stroke-default p-8 text-center text-content-muted'>
                  No data yet. Record performance metrics via POST
                  /api/admin/instagram-performance.
                </div>
              ) : (
                <div className='bg-surface-elevated rounded-lg border border-stroke-default overflow-hidden'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b border-stroke-default'>
                        <th className='p-4 text-left font-medium text-content-muted'>
                          Post Type
                        </th>
                        <th className='p-4 text-right font-medium text-content-muted'>
                          Posts
                        </th>
                        <th className='p-4 text-right font-medium text-content-muted'>
                          Avg Engagement
                        </th>
                        <th className='p-4 text-right font-medium text-content-muted'>
                          Avg Save Rate
                        </th>
                        <th className='p-4 text-right font-medium text-content-muted'>
                          Total Likes
                        </th>
                        <th className='p-4 text-right font-medium text-content-muted'>
                          Total Saves
                        </th>
                        <th className='p-4 text-right font-medium text-content-muted'>
                          Total Comments
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {byType.map((row) => (
                        <tr
                          key={row.post_type}
                          className='border-b border-stroke-subtle hover:bg-surface-card/50'
                        >
                          <td className='p-4 font-medium capitalize'>
                            {row.post_type.replace(/_/g, ' ')}
                          </td>
                          <td className='p-4 text-right'>{row._count}</td>
                          <td className='p-4 text-right text-lunary-accent-400'>
                            {formatRate(row._avg.engagement_rate)}
                          </td>
                          <td className='p-4 text-right text-lunary-primary-400'>
                            {formatRate(row._avg.save_rate)}
                          </td>
                          <td className='p-4 text-right'>
                            {formatNum(row._sum.likes)}
                          </td>
                          <td className='p-4 text-right'>
                            {formatNum(row._sum.saves)}
                          </td>
                          <td className='p-4 text-right'>
                            {formatNum(row._sum.comments)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* By Category */}
            <div className='mb-8'>
              <h2 className='text-xl font-bold mb-4'>
                Performance by Category (Save Rate)
              </h2>
              {byCategory.length === 0 ? (
                <div className='bg-surface-elevated rounded-lg border border-stroke-default p-8 text-center text-content-muted'>
                  No category data yet.
                </div>
              ) : (
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  {byCategory.map((row) => (
                    <div
                      key={row.post_type}
                      className='bg-surface-elevated rounded-lg border border-stroke-default p-4'
                    >
                      <div className='text-sm text-content-muted capitalize mb-1'>
                        {(row as any).content_category || 'Unknown'}
                      </div>
                      <div className='text-2xl font-bold text-lunary-primary-400'>
                        {formatRate(row._avg.save_rate)}
                      </div>
                      <div className='text-xs text-content-muted mt-1'>
                        {row._count} posts &middot; {formatNum(row._sum.saves)}{' '}
                        saves
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Posts */}
            <div className='mb-8'>
              <h2 className='text-xl font-bold mb-4'>Top 10 Posts</h2>
              {topPosts.length === 0 ? (
                <div className='bg-surface-elevated rounded-lg border border-stroke-default p-8 text-center text-content-muted'>
                  No posts recorded yet.
                </div>
              ) : (
                <div className='bg-surface-elevated rounded-lg border border-stroke-default overflow-hidden'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b border-stroke-default'>
                        <th className='p-4 text-left font-medium text-content-muted'>
                          #
                        </th>
                        <th className='p-4 text-left font-medium text-content-muted'>
                          Type
                        </th>
                        <th className='p-4 text-left font-medium text-content-muted'>
                          Category
                        </th>
                        <th className='p-4 text-right font-medium text-content-muted'>
                          Engagement
                        </th>
                        <th className='p-4 text-right font-medium text-content-muted'>
                          Likes
                        </th>
                        <th className='p-4 text-right font-medium text-content-muted'>
                          Saves
                        </th>
                        <th className='p-4 text-right font-medium text-content-muted'>
                          Comments
                        </th>
                        <th className='p-4 text-right font-medium text-content-muted'>
                          Posted
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPosts.map((post, i) => (
                        <tr
                          key={post.id}
                          className='border-b border-stroke-subtle hover:bg-surface-card/50'
                        >
                          <td className='p-4'>{i + 1}</td>
                          <td className='p-4 capitalize'>
                            {post.post_type.replace(/_/g, ' ')}
                          </td>
                          <td className='p-4 capitalize'>
                            {post.content_category || '-'}
                          </td>
                          <td className='p-4 text-right text-lunary-accent-400'>
                            {formatRate(post.engagement_rate)}
                          </td>
                          <td className='p-4 text-right'>
                            {formatNum(post.likes)}
                          </td>
                          <td className='p-4 text-right'>
                            {formatNum(post.saves)}
                          </td>
                          <td className='p-4 text-right'>
                            {formatNum(post.comments)}
                          </td>
                          <td className='p-4 text-right text-content-muted'>
                            {post.posted_at
                              ? new Date(post.posted_at).toLocaleDateString()
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Actions */}
        <div className='mt-8 bg-surface-elevated rounded-lg p-6 border border-stroke-default'>
          <h3 className='text-xl font-bold mb-4'>Quick Links</h3>
          <div className='flex flex-wrap gap-4'>
            <a
              href='/admin/instagram-preview'
              className='px-4 py-2 bg-surface-card hover:bg-surface-overlay rounded-md text-content-primary font-medium transition-colors'
            >
              Content Preview
            </a>
            <a
              href='/admin/scheduler'
              className='px-4 py-2 bg-surface-card hover:bg-surface-overlay rounded-md text-content-primary font-medium transition-colors'
            >
              Scheduler
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
