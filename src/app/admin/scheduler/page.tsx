'use client';

import { useState } from 'react';
import {
  socialPrefillUrls,
  copyToClipboard,
  downloadAsTextFile,
  type PostData,
} from '../../../../utils/socialPrefill';

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
  postContent?: string;
  details?: any;
  succulentResponse?: any;
  timestamp?: string;
}

export default function SchedulerAdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScheduleResult | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [testMode, setTestMode] = useState(true);
  const [currentPostData, setCurrentPostData] = useState<PostData | null>(null);

  const scheduleToday = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Get today's date
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      // Fetch cosmic content for today
      const cosmicResponse = await fetch(`/api/og/cosmic-post?date=${dateStr}`);

      if (!cosmicResponse.ok) {
        throw new Error(
          `Failed to fetch cosmic content: ${cosmicResponse.status} ${cosmicResponse.statusText}`,
        );
      }

      const cosmicContent = await cosmicResponse.json();
      console.log('🌟 Cosmic content received:', cosmicContent);

      // // Get daily hashtags using simple thematic selection
      // const themes = [
      //   ['#tarot', '#dailytarot', '#tarotreading', '#divination'],
      //   ['#horoscope', '#astrology', '#zodiac', '#planetary'],
      //   ['#mooncycles', '#moonphases', '#lunar', '#celestial'],
      // ];

      const seed = new Date(dateStr).getDate();
      // const hashtags = themes
      //   .map((theme, i) => theme[(seed + i) % theme.length])
      //   .join(' ');

      // Format the social media post (Twitter-friendly)
      const socialContent = [
        cosmicContent.highlights.slice(0, 1)[0], // Just the first highlight point
        '',
        'Daily cosmic guidance at lunary.app',
        // hashtags,
      ].join('\n');

      console.log('📝 Social content created:', socialContent);

      // Schedule for 15 minutes from now for testing
      const scheduledDateTime = new Date();
      scheduledDateTime.setMinutes(scheduledDateTime.getMinutes() + 15);

      // Get the correct base URL for the image
      const baseUrl = window.location.origin;
      const imageUrl = `${baseUrl}/api/og/cosmic/${dateStr}`;

      console.log('🖼️ Image URL:', imageUrl);

      const postData = {
        accountGroupId:
          process.env.NEXT_PUBLIC_SUCCULENT_ACCOUNT_GROUP_ID || 'test_group_id',
        content: socialContent,
        platforms: ['instagram', 'x'],
        scheduledDate: scheduledDateTime.toISOString(),
        media: [
          {
            type: 'image',
            url: imageUrl,
            alt: `${cosmicContent.primaryEvent.name} - ${cosmicContent.primaryEvent.energy}. Daily cosmic guidance and astronomical insights.`,
          },
        ],
      };

      console.log('📤 Post data prepared:', {
        contentLength: postData.content.length,
        platforms: postData.platforms,
        scheduledDate: postData.scheduledDate,
        media: postData.media,
      });

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

      // Store the post data for prefill buttons
      setCurrentPostData({
        content: socialContent,
        imageUrl: imageUrl,
        scheduledDate: postData.scheduledDate,
        platforms: postData.platforms,
        alt: postData.media[0]?.alt,
      });
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
            <div className='flex gap-2'>
              <button
                onClick={scheduleToday}
                disabled={loading}
                className='bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 px-4 py-2 rounded font-medium text-white transition-colors'
              >
                {loading ? '⏳ Creating Post...' : "⚡ Test Today's Post"}
              </button>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const today = new Date();
                    const dateStr = today.toISOString().split('T')[0];
                    const response = await fetch(
                      `/api/og/cosmic-post?date=${dateStr}`,
                    );
                    const data = await response.json();
                    setResult({
                      success: response.ok,
                      message: response.ok
                        ? 'Cosmic API working correctly'
                        : 'Cosmic API failed',
                      error: response.ok
                        ? undefined
                        : 'Failed to fetch cosmic content',
                      postContent: response.ok
                        ? JSON.stringify(data, null, 2)
                        : undefined,
                    } as ScheduleResult);
                  } catch (error) {
                    setResult({
                      success: false,
                      message: 'Failed to test cosmic API',
                      error:
                        error instanceof Error
                          ? error.message
                          : 'Unknown error',
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className='bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 px-4 py-2 rounded font-medium text-white transition-colors'
              >
                {loading ? '⏳ Testing...' : '🔍 Test Cosmic API'}
              </button>
            </div>
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

            <div className='mb-4'>
              <p className='mb-2'>{result.message || result.error}</p>

              {/* Show detailed error information if available */}
              {(result as any)?.details && (
                <div className='mt-3 p-3 bg-black/30 rounded border border-zinc-700'>
                  <h5 className='text-sm font-semibold mb-2 text-zinc-300'>
                    🔍 Error Details:
                  </h5>
                  <div className='text-xs text-zinc-400 space-y-1'>
                    {(result as any).details.type && (
                      <div>
                        <span className='font-medium'>Type:</span>{' '}
                        {(result as any).details.type}
                      </div>
                    )}
                    {(result as any).details.name && (
                      <div>
                        <span className='font-medium'>Error Name:</span>{' '}
                        {(result as any).details.name}
                      </div>
                    )}
                    {(result as any).details.status && (
                      <div>
                        <span className='font-medium'>HTTP Status:</span>{' '}
                        {(result as any).details.status}{' '}
                        {(result as any).details.statusText}
                      </div>
                    )}
                    {(result as any).details.responseText && (
                      <div>
                        <span className='font-medium'>Response:</span>
                        <pre className='mt-1 text-xs bg-black/50 p-2 rounded overflow-x-auto'>
                          {(result as any).details.responseText}
                        </pre>
                      </div>
                    )}
                    {(result as any).details.stack && (
                      <details className='mt-2'>
                        <summary className='cursor-pointer text-zinc-300 hover:text-zinc-200'>
                          Stack Trace
                        </summary>
                        <pre className='mt-1 text-xs bg-black/50 p-2 rounded overflow-x-auto whitespace-pre-wrap'>
                          {(result as any).details.stack}
                        </pre>
                      </details>
                    )}
                    {(result as any).timestamp && (
                      <div className='text-xs text-zinc-500 mt-2'>
                        Time:{' '}
                        {new Date((result as any).timestamp).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Show Succulent API response if available */}
              {(result as any)?.succulentResponse && (
                <div className='mt-3 p-3 bg-black/30 rounded border border-zinc-700'>
                  <h5 className='text-sm font-semibold mb-2 text-zinc-300'>
                    🔗 Succulent API Response:
                  </h5>
                  <pre className='text-xs text-zinc-400 overflow-x-auto whitespace-pre-wrap'>
                    {JSON.stringify((result as any).succulentResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>

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

            {/* Show prefill buttons for successful posts */}
            {result.success && currentPostData && (
              <div className='mt-6'>
                <h4 className='font-medium mb-3 text-zinc-200'>
                  🚀 Open in Applications:
                </h4>
                <div className='bg-black/30 p-4 rounded border border-zinc-700'>
                  <p className='text-sm text-zinc-400 mb-4'>
                    Click any button to open the corresponding app with your
                    content prefilled:
                  </p>

                  {/* Social Media Platforms */}
                  <div className='mb-6'>
                    <h5 className='text-sm font-semibold text-zinc-300 mb-3'>
                      Social Media
                    </h5>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                      <button
                        onClick={() =>
                          window.open(
                            socialPrefillUrls.twitter(currentPostData),
                            '_blank',
                          )
                        }
                        className='bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium text-white transition-colors flex items-center justify-center'
                      >
                        𝕏 Twitter
                      </button>
                      <button
                        onClick={() =>
                          window.open(
                            socialPrefillUrls.facebook(currentPostData),
                            '_blank',
                          )
                        }
                        className='bg-blue-800 hover:bg-blue-900 px-3 py-2 rounded text-sm font-medium text-white transition-colors flex items-center justify-center'
                      >
                        📘 Facebook
                      </button>
                      <button
                        onClick={() =>
                          window.open(
                            socialPrefillUrls.linkedin(currentPostData),
                            '_blank',
                          )
                        }
                        className='bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded text-sm font-medium text-white transition-colors flex items-center justify-center'
                      >
                        💼 LinkedIn
                      </button>
                      <button
                        onClick={() =>
                          socialPrefillUrls.instagram(currentPostData)
                        }
                        className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-3 py-2 rounded text-sm font-medium text-white transition-colors flex items-center justify-center'
                      >
                        📸 Instagram
                      </button>
                      <button
                        onClick={() =>
                          window.open(
                            socialPrefillUrls.pinterest(currentPostData),
                            '_blank',
                          )
                        }
                        className='bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm font-medium text-white transition-colors flex items-center justify-center'
                      >
                        📌 Pinterest
                      </button>
                      <button
                        onClick={() =>
                          window.open(
                            socialPrefillUrls.reddit(currentPostData),
                            '_blank',
                          )
                        }
                        className='bg-orange-600 hover:bg-orange-700 px-3 py-2 rounded text-sm font-medium text-white transition-colors flex items-center justify-center'
                      >
                        🤖 Reddit
                      </button>
                      <button
                        onClick={() =>
                          window.open(
                            socialPrefillUrls.tumblr(currentPostData),
                            '_blank',
                          )
                        }
                        className='bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded text-sm font-medium text-white transition-colors flex items-center justify-center'
                      >
                        🌀 Tumblr
                      </button>
                    </div>
                  </div>

                  {/* Messaging Apps */}
                  <div className='mb-6'>
                    <h5 className='text-sm font-semibold text-zinc-300 mb-3'>
                      Messaging
                    </h5>
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                      <button
                        onClick={() =>
                          window.open(
                            socialPrefillUrls.whatsapp(currentPostData),
                            '_blank',
                          )
                        }
                        className='bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm font-medium text-white transition-colors flex items-center justify-center'
                      >
                        💬 WhatsApp
                      </button>
                      <button
                        onClick={() =>
                          window.open(
                            socialPrefillUrls.telegram(currentPostData),
                            '_blank',
                          )
                        }
                        className='bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded text-sm font-medium text-white transition-colors flex items-center justify-center'
                      >
                        ✈️ Telegram
                      </button>
                      <button
                        onClick={() =>
                          window.open(
                            socialPrefillUrls.email(currentPostData),
                            '_blank',
                          )
                        }
                        className='bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded text-sm font-medium text-white transition-colors flex items-center justify-center'
                      >
                        ✉️ Email
                      </button>
                    </div>
                  </div>

                  {/* Utility Actions */}
                  <div>
                    <h5 className='text-sm font-semibold text-zinc-300 mb-3'>
                      Utilities
                    </h5>
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                      <button
                        onClick={async () => {
                          const success = await copyToClipboard(
                            currentPostData.content,
                          );
                          if (success) {
                            alert('📋 Content copied to clipboard!');
                          } else {
                            alert(
                              '❌ Failed to copy content. Please try again.',
                            );
                          }
                        }}
                        className='bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm font-medium text-white transition-colors flex items-center justify-center'
                      >
                        📋 Copy Text
                      </button>
                      <button
                        onClick={async () => {
                          const fullData = `${currentPostData.content}\n\nImage: ${currentPostData.imageUrl}`;
                          const success = await copyToClipboard(fullData);
                          if (success) {
                            alert(
                              '📋 Content and image URL copied to clipboard!',
                            );
                          } else {
                            alert(
                              '❌ Failed to copy content. Please try again.',
                            );
                          }
                        }}
                        className='bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm font-medium text-white transition-colors flex items-center justify-center'
                      >
                        📋 Copy All
                      </button>
                      <button
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[0];
                          downloadAsTextFile(
                            currentPostData,
                            `cosmic-post-${today}.txt`,
                          );
                        }}
                        className='bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm font-medium text-white transition-colors flex items-center justify-center'
                      >
                        📥 Download
                      </button>
                    </div>
                  </div>

                  <div className='mt-4 pt-4 border-t border-zinc-600'>
                    <p className='text-xs text-zinc-500'>
                      💡 <strong>Tip:</strong> Instagram doesn't support URL
                      prefilling, so the content will be copied to your
                      clipboard instead. For best results with images, save or
                      screenshot the generated cosmic image first.
                    </p>
                  </div>
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
              <p className='text-xs text-zinc-500 mt-2'>
                💡 <strong>Debugging tip:</strong> The enhanced error logging
                will now show if these variables are missing or malformed. Check
                the server logs or use the "Test Today's Post" button to see
                detailed error information.
              </p>
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
