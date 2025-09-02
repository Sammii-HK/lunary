'use client';

import { useState } from 'react';

interface ScheduleResult {
  success: boolean;
  message: string;
  summary?: {
    totalPosts: number;
    successful: number;
    failed: number;
    month: string;
  };
  results?: Array<{
    date: string;
    status: string;
    postId?: string;
    error?: string;
  }>;
  error?: string;
}

export default function SchedulerAdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScheduleResult | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [testMode, setTestMode] = useState(true);

  const scheduleToday = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Get today's date
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      // Fetch cosmic content for today
      const cosmicResponse = await fetch(`/api/og/cosmic-post?date=${dateStr}`);
      const cosmicContent = await cosmicResponse.json();

      // Format the social media post
      const socialContent = [
        `🌟 ${cosmicContent.primaryEvent.name} - ${cosmicContent.primaryEvent.energy}`,
        '',
        `✨ Today's Cosmic Highlights:`,
        ...cosmicContent.highlights
          .slice(0, 3)
          .map((highlight: string) => `• ${highlight}`),
        '',
        `🔮 Guidance: ${cosmicContent.horoscopeSnippet}`,
        '',
        `${cosmicContent.callToAction}`,
        '',
        '#astrology #cosmic #moonphases #astronomy #spirituality #dailyhoroscope #planets #celestial #universe #stargazing',
      ].join('\n');

      // Schedule for right now (or in 1 minute for testing)
      const scheduledDateTime = new Date();
      scheduledDateTime.setMinutes(scheduledDateTime.getMinutes() + 1);

      const postData = {
        accountGroupId:
          process.env.NEXT_PUBLIC_SUCCULENT_ACCOUNT_GROUP_ID || 'test_group_id',
        content: socialContent,
        platforms: ['instagram', 'x'],
        scheduledDate: scheduledDateTime.toISOString(),
        mediaItems: [
          {
            type: 'image',
            url: `${window.location.origin}/api/og/cosmic?date=${dateStr}`,
            altText: `${cosmicContent.primaryEvent.name} - ${cosmicContent.primaryEvent.energy}. Daily cosmic guidance and astronomical insights.`,
          },
        ],
      };

      // Send to Succulent API
      const succulentApiUrl = testMode
        ? 'http://localhost:3001/api/posts'
        : 'https://app.succulent.social/api/posts';

      const response = await fetch('/api/schedule-posts/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postData,
          succulentApiUrl,
          testMode,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: '',
        error: error instanceof Error ? error.message : 'Network error',
      });
    } finally {
      setLoading(false);
    }
  };

  const scheduleMonth = async () => {
    setLoading(true);
    setResult(null);

    try {
      const params = new URLSearchParams();
      if (selectedMonth) params.set('month', selectedMonth);
      if (testMode) params.set('test', 'true');

      const response = await fetch(`/api/schedule-posts?${params}`, {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: '',
        error: error instanceof Error ? error.message : 'Network error',
      });
    } finally {
      setLoading(false);
    }
  };

  const getNextMonth = () => {
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    return next.toISOString().slice(0, 7); // YYYY-MM format
  };

  return (
    <div className='min-h-screen bg-black text-white p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8 text-purple-400'>
          🌟 Cosmic Social Media Scheduler
        </h1>

        <div className='bg-zinc-900 rounded-lg p-6 mb-8'>
          <h2 className='text-xl font-semibold mb-4 text-white'>
            Schedule Posts
          </h2>

          <div className='space-y-4 mb-6'>
            <div>
              <label
                htmlFor='month'
                className='block text-sm font-medium text-zinc-300 mb-2'
              >
                Target Month (leave empty for next month)
              </label>
              <input
                id='month'
                type='month'
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                placeholder={getNextMonth()}
                className='bg-zinc-800 border border-zinc-700 rounded px-3 py-2 w-48 text-white'
              />
              <p className='text-xs text-zinc-500 mt-1'>
                Default:{' '}
                {new Date(getNextMonth() + '-01').toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className='flex items-center'>
              <input
                id='testMode'
                type='checkbox'
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                className='mr-2'
              />
              <label htmlFor='testMode' className='text-sm text-zinc-300'>
                Test Mode (localhost:3001)
              </label>
            </div>
          </div>

          <button
            onClick={scheduleMonth}
            disabled={loading}
            className='bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 px-6 py-3 rounded font-medium text-white transition-colors'
          >
            {loading ? '⏳ Scheduling Posts...' : '🚀 Schedule Month'}
          </button>

          <div className='mt-4 pt-4 border-t border-zinc-700'>
            <h3 className='text-lg font-semibold mb-3 text-zinc-200'>
              🧪 Quick Test
            </h3>
            <p className='text-sm text-zinc-400 mb-3'>
              Test with just today's cosmic post (scheduled 1 minute from now)
            </p>
            <button
              onClick={scheduleToday}
              disabled={loading}
              className='bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 px-4 py-2 rounded font-medium text-white transition-colors'
            >
              {loading ? '⏳ Creating Post...' : "⚡ Test Today's Post"}
            </button>
          </div>
        </div>

        {result && (
          <div
            className={`rounded-lg p-6 mb-8 ${
              result.success
                ? 'bg-green-900/30 border border-green-700'
                : 'bg-red-900/30 border border-red-700'
            }`}
          >
            <h3 className='text-lg font-semibold mb-4 flex items-center'>
              {result.success ? '✅' : '❌'}
              <span className='ml-2'>
                {result.success ? 'Success!' : 'Error'}
              </span>
            </h3>

            <p className='mb-4'>{result.message || result.error}</p>

            {result.summary && (
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                <div className='bg-zinc-800 rounded p-3'>
                  <div className='text-2xl font-bold text-purple-400'>
                    {result.summary.totalPosts}
                  </div>
                  <div className='text-sm text-zinc-400'>Total Posts</div>
                </div>
                <div className='bg-zinc-800 rounded p-3'>
                  <div className='text-2xl font-bold text-green-400'>
                    {result.summary.successful}
                  </div>
                  <div className='text-sm text-zinc-400'>Successful</div>
                </div>
                <div className='bg-zinc-800 rounded p-3'>
                  <div className='text-2xl font-bold text-red-400'>
                    {result.summary.failed}
                  </div>
                  <div className='text-sm text-zinc-400'>Failed</div>
                </div>
                <div className='bg-zinc-800 rounded p-3'>
                  <div className='text-lg font-bold text-blue-400'>
                    {result.summary.month}
                  </div>
                  <div className='text-sm text-zinc-400'>Target Month</div>
                </div>
              </div>
            )}

            {result.results && result.results.length > 0 && (
              <div>
                <h4 className='font-medium mb-3 text-zinc-200'>
                  Post Results:
                </h4>
                <div className='max-h-64 overflow-y-auto space-y-2'>
                  {result.results.map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-2 rounded text-sm ${
                        item.status === 'success'
                          ? 'bg-green-900/30 text-green-300'
                          : 'bg-red-900/30 text-red-300'
                      }`}
                    >
                      <span>{item.date}</span>
                      <span className='flex items-center'>
                        {item.status === 'success' ? '✅' : '❌'}
                        {item.postId && (
                          <code className='ml-2 text-xs bg-black/30 px-1 rounded'>
                            {item.postId}
                          </code>
                        )}
                        {item.error && (
                          <span className='ml-2 text-xs'>{item.error}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show post content preview for single post tests */}
            {(result as any)?.postContent && (
              <div className='mt-6'>
                <h4 className='font-medium mb-3 text-zinc-200'>
                  📱 Post Content Preview:
                </h4>
                <div className='bg-black/30 p-4 rounded border border-zinc-700'>
                  <pre className='whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed'>
                    {(result as any).postContent}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        <div className='bg-zinc-900 rounded-lg p-6'>
          <h3 className='text-lg font-semibold mb-3 text-zinc-200'>
            ⚙️ Setup Instructions
          </h3>

          <div className='space-y-3 text-sm text-zinc-400'>
            <div>
              <strong className='text-zinc-300'>
                1. Environment Variables:
              </strong>
              <pre className='bg-black/50 p-2 rounded mt-1 text-xs overflow-x-auto'>
                {`SUCCULENT_SECRET_KEY=sk_live_your_api_key_here
SUCCULENT_ACCOUNT_GROUP_ID=group_your_group_id_here`}
              </pre>
            </div>

            <div>
              <strong className='text-zinc-300'>
                2. Automated Scheduling (Cron):
              </strong>
              <p className='mt-1'>
                Run this command weekly to schedule the next month:
              </p>
              <pre className='bg-black/50 p-2 rounded mt-1 text-xs overflow-x-auto'>
                {`# Run every Sunday at 10 AM to schedule next month's posts
0 10 * * 0 curl -X POST https://lunary.app/api/schedule-posts`}
              </pre>
            </div>

            <div>
              <strong className='text-zinc-300'>3. Post Format:</strong>
              <ul className='list-disc list-inside mt-1 space-y-1'>
                <li>Posts to Instagram, X (Twitter), Facebook, LinkedIn</li>
                <li>Includes cosmic image generated from your OG system</li>
                <li>Scheduled for 9 AM daily</li>
                <li>Contains cosmic highlights + guidance + hashtags</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
