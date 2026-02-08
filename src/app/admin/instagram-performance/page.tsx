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
    <div className='min-h-screen bg-black text-white p-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Instagram Performance</h1>
          <p className='text-zinc-400 mb-6'>
            Track engagement, saves, and reach across all content types
          </p>

          <div className='flex items-center gap-4'>
            <label className='text-sm font-medium'>Time range:</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className='px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white'
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
          <div className='text-zinc-400 py-12 text-center'>
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
                <div className='bg-zinc-900 rounded-lg border border-zinc-700 p-8 text-center text-zinc-400'>
                  No data yet. Record performance metrics via POST
                  /api/admin/instagram-performance.
                </div>
              ) : (
                <div className='bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b border-zinc-700'>
                        <th className='p-4 text-left font-medium text-zinc-400'>
                          Post Type
                        </th>
                        <th className='p-4 text-right font-medium text-zinc-400'>
                          Posts
                        </th>
                        <th className='p-4 text-right font-medium text-zinc-400'>
                          Avg Engagement
                        </th>
                        <th className='p-4 text-right font-medium text-zinc-400'>
                          Avg Save Rate
                        </th>
                        <th className='p-4 text-right font-medium text-zinc-400'>
                          Total Likes
                        </th>
                        <th className='p-4 text-right font-medium text-zinc-400'>
                          Total Saves
                        </th>
                        <th className='p-4 text-right font-medium text-zinc-400'>
                          Total Comments
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {byType.map((row) => (
                        <tr
                          key={row.post_type}
                          className='border-b border-zinc-800 hover:bg-zinc-800/50'
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
                <div className='bg-zinc-900 rounded-lg border border-zinc-700 p-8 text-center text-zinc-400'>
                  No category data yet.
                </div>
              ) : (
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  {byCategory.map((row) => (
                    <div
                      key={row.post_type}
                      className='bg-zinc-900 rounded-lg border border-zinc-700 p-4'
                    >
                      <div className='text-sm text-zinc-400 capitalize mb-1'>
                        {(row as any).content_category || 'Unknown'}
                      </div>
                      <div className='text-2xl font-bold text-lunary-primary-400'>
                        {formatRate(row._avg.save_rate)}
                      </div>
                      <div className='text-xs text-zinc-500 mt-1'>
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
                <div className='bg-zinc-900 rounded-lg border border-zinc-700 p-8 text-center text-zinc-400'>
                  No posts recorded yet.
                </div>
              ) : (
                <div className='bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b border-zinc-700'>
                        <th className='p-4 text-left font-medium text-zinc-400'>
                          #
                        </th>
                        <th className='p-4 text-left font-medium text-zinc-400'>
                          Type
                        </th>
                        <th className='p-4 text-left font-medium text-zinc-400'>
                          Category
                        </th>
                        <th className='p-4 text-right font-medium text-zinc-400'>
                          Engagement
                        </th>
                        <th className='p-4 text-right font-medium text-zinc-400'>
                          Likes
                        </th>
                        <th className='p-4 text-right font-medium text-zinc-400'>
                          Saves
                        </th>
                        <th className='p-4 text-right font-medium text-zinc-400'>
                          Comments
                        </th>
                        <th className='p-4 text-right font-medium text-zinc-400'>
                          Posted
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPosts.map((post, i) => (
                        <tr
                          key={post.id}
                          className='border-b border-zinc-800 hover:bg-zinc-800/50'
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
                          <td className='p-4 text-right text-zinc-400'>
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
        <div className='mt-8 bg-zinc-900 rounded-lg p-6 border border-zinc-700'>
          <h3 className='text-xl font-bold mb-4'>Quick Links</h3>
          <div className='flex flex-wrap gap-4'>
            <a
              href='/admin/instagram-preview'
              className='px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-white font-medium transition-colors'
            >
              Content Preview
            </a>
            <a
              href='/admin/scheduler'
              className='px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-white font-medium transition-colors'
            >
              Scheduler
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
