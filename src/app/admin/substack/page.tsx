'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Send,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Calendar,
  History,
  AlertCircle,
  Share2,
  Image,
  Download,
  Copy,
} from 'lucide-react';

interface SubstackPost {
  title: string;
  content: string;
  subtitle?: string;
  tags?: string[];
}

interface PreviewData {
  free: SubstackPost;
  paid: SubstackPost;
  metadata: {
    weekStart: string;
    weekEnd: string;
    weekNumber: number;
    freeWordCount: number;
    paidWordCount: number;
  };
}

interface PublishResult {
  success: boolean;
  postUrl?: string;
  error?: string;
  tier: 'free' | 'paid';
}

interface BackfillResult {
  weekOffset: number;
  weekStart: string;
  free: PublishResult;
  paid: PublishResult;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

export default function SubstackManagerPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [publishResults, setPublishResults] = useState<{
    free?: PublishResult;
    paid?: PublishResult;
  }>({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<{
    checking: boolean;
    authenticated: boolean | null;
    message: string;
  }>({
    checking: false,
    authenticated: null,
    message: '',
  });

  const [backfillRange, setBackfillRange] = useState({ start: -1, end: -4 });
  const [backfillResults, setBackfillResults] = useState<BackfillResult[]>([]);
  const [backfillProgress, setBackfillProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const [socialContent, setSocialContent] = useState<{
    images: Record<string, string>;
    captions: { short: string; medium: string; long: string };
    hashtags: string[];
    platforms: Record<string, Record<string, string>>;
  } | null>(null);

  const weekOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    for (let i = 4; i >= -52; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + i * 7);
      const weekStart = getWeekStart(targetDate);
      options.push({
        offset: i,
        label: formatWeekRange(weekStart),
        weekStart,
      });
    }
    return options;
  }, []);

  const loadPreview = async () => {
    setLoading('preview');
    try {
      const response = await fetch(`/api/substack/preview?week=${weekOffset}`);
      const data = await response.json();

      if (data.success) {
        setPreview(data);
      } else {
        alert(`Failed to load preview: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      alert('Failed to load preview. Check console for details.');
    } finally {
      setLoading(null);
    }
  };

  const verifyConnection = async () => {
    setVerificationStatus({
      checking: true,
      authenticated: null,
      message: 'Checking connection...',
    });
    try {
      const response = await fetch('/api/substack/verify');
      const data = await response.json();

      setVerificationStatus({
        checking: false,
        authenticated: data.authenticated || false,
        message: data.message || data.error || 'Verification completed',
      });
    } catch (error) {
      setVerificationStatus({
        checking: false,
        authenticated: false,
        message: 'Failed to verify connection',
      });
    }
  };

  const publishPosts = async (tier: 'free' | 'paid' | 'both') => {
    setLoading(`publish-${tier}`);
    try {
      const response = await fetch('/api/substack/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekOffset,
          publishFree: tier === 'free' || tier === 'both',
          publishPaid: tier === 'paid' || tier === 'both',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPublishResults(data.results);
        if (data.results.free?.success || data.results.paid?.success) {
          alert('Posts published successfully!');
        } else {
          alert('Publishing completed with some errors. Check results below.');
        }
      } else {
        alert(`Failed to publish: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error publishing:', error);
      alert('Failed to publish. Check console for details.');
    } finally {
      setLoading(null);
    }
  };

  const generateSocialContent = async () => {
    setLoading('social');
    try {
      const response = await fetch(`/api/social/generate?week=${weekOffset}`);
      const data = await response.json();
      setSocialContent({
        images: data.images,
        captions: data.captions,
        hashtags: data.hashtags,
        platforms: data.platforms,
      });
    } catch (error) {
      console.error('Error generating social content:', error);
      alert('Failed to generate social content');
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const runBackfill = async () => {
    const weeksToProcess: number[] = [];
    // Process oldest weeks first so they appear in chronological order on the blog
    // (most recently published posts appear at the top of the blog)
    for (let i = backfillRange.end; i <= backfillRange.start; i++) {
      weeksToProcess.push(i);
    }

    if (weeksToProcess.length === 0) {
      alert('No weeks selected for backfill');
      return;
    }

    if (
      !confirm(
        `This will publish ${weeksToProcess.length} weeks of posts (${weeksToProcess.length * 2} total posts) in chronological order (oldest first). Continue?`,
      )
    ) {
      return;
    }

    setLoading('backfill');
    setBackfillResults([]);
    setBackfillProgress({ current: 0, total: weeksToProcess.length });

    const results: BackfillResult[] = [];

    for (let i = 0; i < weeksToProcess.length; i++) {
      const offset = weeksToProcess[i];
      setBackfillProgress({ current: i + 1, total: weeksToProcess.length });

      try {
        const response = await fetch('/api/substack/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weekOffset: offset,
            publishFree: true,
            publishPaid: true,
          }),
        });

        const data = await response.json();
        const weekStart = getWeekStart(new Date());
        weekStart.setDate(weekStart.getDate() + offset * 7);

        results.push({
          weekOffset: offset,
          weekStart: weekStart.toISOString(),
          free: data.results?.free || {
            success: false,
            tier: 'free',
            error: data.error,
          },
          paid: data.results?.paid || {
            success: false,
            tier: 'paid',
            error: data.error,
          },
        });

        setBackfillResults([...results]);

        if (i < weeksToProcess.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        const weekStart = getWeekStart(new Date());
        weekStart.setDate(weekStart.getDate() + offset * 7);

        results.push({
          weekOffset: offset,
          weekStart: weekStart.toISOString(),
          free: {
            success: false,
            tier: 'free',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          paid: {
            success: false,
            tier: 'paid',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        setBackfillResults([...results]);
      }
    }

    setLoading(null);
    setBackfillProgress(null);

    const successCount = results.filter(
      (r) => r.free.success && r.paid.success,
    ).length;
    alert(
      `Backfill complete: ${successCount}/${results.length} weeks published successfully`,
    );
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-6'>
          <Link href='/admin'>
            <Button variant='ghost' className='mb-4'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Admin
            </Button>
          </Link>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-3xl font-bold mb-2'>Substack Manager</h1>
              <p className='text-zinc-400'>
                Generate and publish weekly Substack posts (Free: $0, Paid:
                $3/month)
              </p>
            </div>
            <Button
              onClick={verifyConnection}
              disabled={verificationStatus.checking}
              variant='outline'
              className='bg-zinc-800 hover:bg-zinc-700'
            >
              {verificationStatus.checking ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Checking...
                </>
              ) : (
                <>
                  <Eye className='h-4 w-4 mr-2' />
                  Verify Connection
                </>
              )}
            </Button>
          </div>
          {verificationStatus.authenticated !== null && (
            <div
              className={`mt-4 p-3 rounded-lg border ${
                verificationStatus.authenticated
                  ? 'bg-lunary-success/10 border-lunary-success/20 text-lunary-success'
                  : 'bg-lunary-error/10 border-lunary-error/20 text-lunary-error'
              }`}
            >
              <p className='text-sm font-medium'>
                {verificationStatus.authenticated
                  ? '✓ Connected'
                  : '✗ Not Connected'}
              </p>
              <p className='text-xs mt-1 opacity-80'>
                {verificationStatus.message}
              </p>
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
          <Card className='bg-zinc-900 border-zinc-800'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='h-5 w-5' />
                Single Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Select Week
                  </label>
                  <select
                    value={weekOffset}
                    onChange={(e) => setWeekOffset(parseInt(e.target.value))}
                    className='w-full bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm'
                  >
                    {weekOptions.map((opt) => (
                      <option key={opt.offset} value={opt.offset}>
                        {opt.offset === 0
                          ? `This Week (${opt.label})`
                          : opt.offset > 0
                            ? `+${opt.offset} weeks (${opt.label})`
                            : `${opt.offset} weeks (${opt.label})`}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={loadPreview}
                  disabled={loading === 'preview'}
                  className='w-full'
                  variant='outline'
                >
                  {loading === 'preview' ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Eye className='mr-2 h-4 w-4' />
                      Preview Posts
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-zinc-900 border-zinc-800'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Send className='h-5 w-5' />
                Publish Selected Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <Button
                  onClick={() => publishPosts('both')}
                  disabled={!!loading || !preview}
                  className='w-full'
                  variant='default'
                >
                  {loading === 'publish-both' ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className='mr-2 h-4 w-4' />
                      Publish Both
                    </>
                  )}
                </Button>
                <div className='grid grid-cols-2 gap-2'>
                  <Button
                    onClick={() => publishPosts('free')}
                    disabled={!!loading || !preview}
                    variant='outline'
                    size='sm'
                  >
                    {loading === 'publish-free' ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      'Free Only'
                    )}
                  </Button>
                  <Button
                    onClick={() => publishPosts('paid')}
                    disabled={!!loading || !preview}
                    variant='outline'
                    size='sm'
                  >
                    {loading === 'publish-paid' ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      'Paid Only'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-zinc-900 border-zinc-800'>
            <CardHeader>
              <CardTitle>Publishing Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {publishResults.free && (
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Free Post</span>
                    {publishResults.free.success ? (
                      <div className='flex items-center gap-2'>
                        <CheckCircle className='h-4 w-4 text-lunary-success' />
                        {publishResults.free.postUrl && (
                          <a
                            href={publishResults.free.postUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-lunary-secondary hover:underline'
                          >
                            <ExternalLink className='h-3 w-3' />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className='flex items-center gap-2'>
                        <XCircle className='h-4 w-4 text-red-500' />
                        <span className='text-xs text-lunary-error'>
                          {publishResults.free.error?.substring(0, 30)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {publishResults.paid && (
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Paid Post</span>
                    {publishResults.paid.success ? (
                      <div className='flex items-center gap-2'>
                        <CheckCircle className='h-4 w-4 text-lunary-success' />
                        {publishResults.paid.postUrl && (
                          <a
                            href={publishResults.paid.postUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-lunary-secondary hover:underline'
                          >
                            <ExternalLink className='h-3 w-3' />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className='flex items-center gap-2'>
                        <XCircle className='h-4 w-4 text-red-500' />
                        <span className='text-xs text-lunary-error'>
                          {publishResults.paid.error?.substring(0, 30)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {!publishResults.free && !publishResults.paid && (
                  <p className='text-sm text-zinc-500'>
                    No posts published yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className='bg-zinc-900 border-zinc-800 mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <History className='h-5 w-5' />
              Batch Backfill
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center gap-2 p-3 bg-lunary-accent/10 border border-lunary-accent/20 rounded-lg'>
                <AlertCircle className='h-5 w-5 text-lunary-accent flex-shrink-0' />
                <p className='text-sm text-lunary-accent-200'>
                  Backfill publishes multiple weeks at once. Start with a small
                  range (1-2 weeks) to test before doing a larger backfill.
                </p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Oldest Week (publish first)
                  </label>
                  <select
                    value={backfillRange.end}
                    onChange={(e) =>
                      setBackfillRange({
                        ...backfillRange,
                        end: parseInt(e.target.value),
                      })
                    }
                    className='w-full bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm'
                  >
                    {weekOptions
                      .filter((opt) => opt.offset < 0)
                      .map((opt) => (
                        <option key={opt.offset} value={opt.offset}>
                          {opt.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Newest Week (publish last)
                  </label>
                  <select
                    value={backfillRange.start}
                    onChange={(e) =>
                      setBackfillRange({
                        ...backfillRange,
                        start: parseInt(e.target.value),
                      })
                    }
                    className='w-full bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm'
                  >
                    {weekOptions
                      .filter(
                        (opt) =>
                          opt.offset < 0 && opt.offset >= backfillRange.end,
                      )
                      .map((opt) => (
                        <option key={opt.offset} value={opt.offset}>
                          {opt.label}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <p className='text-sm text-zinc-400'>
                  {Math.abs(backfillRange.start - backfillRange.end) + 1} weeks
                  selected (
                  {(Math.abs(backfillRange.start - backfillRange.end) + 1) * 2}{' '}
                  posts)
                </p>
                <Button
                  onClick={runBackfill}
                  disabled={!!loading}
                  variant='default'
                >
                  {loading === 'backfill' ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {backfillProgress
                        ? `${backfillProgress.current}/${backfillProgress.total}`
                        : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <History className='mr-2 h-4 w-4' />
                      Start Backfill
                    </>
                  )}
                </Button>
              </div>

              {backfillResults.length > 0 && (
                <div className='mt-4 space-y-2 max-h-64 overflow-y-auto'>
                  <p className='text-sm font-medium text-zinc-300'>
                    Backfill Results:
                  </p>
                  {backfillResults.map((result, idx) => (
                    <div
                      key={idx}
                      className='flex items-center justify-between p-2 bg-zinc-800 rounded text-sm'
                    >
                      <span className='text-zinc-300'>
                        {new Date(result.weekStart).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                          },
                        )}
                      </span>
                      <div className='flex items-center gap-3'>
                        <span className='flex items-center gap-1'>
                          Free:
                          {result.free.success ? (
                            <CheckCircle className='h-4 w-4 text-lunary-success' />
                          ) : (
                            <XCircle className='h-4 w-4 text-red-500' />
                          )}
                        </span>
                        <span className='flex items-center gap-1'>
                          Paid:
                          {result.paid.success ? (
                            <CheckCircle className='h-4 w-4 text-lunary-success' />
                          ) : (
                            <XCircle className='h-4 w-4 text-red-500' />
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className='bg-zinc-900 border-zinc-800 mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Share2 className='h-5 w-5' />
              Social Media Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <p className='text-sm text-zinc-400'>
                  Generate images and captions for the selected week
                </p>
                <Button
                  onClick={generateSocialContent}
                  disabled={!!loading}
                  variant='outline'
                >
                  {loading === 'social' ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Image className='mr-2 h-4 w-4' />
                      Generate Content
                    </>
                  )}
                </Button>
              </div>

              {socialContent && (
                <div className='space-y-6'>
                  <div>
                    <p className='text-sm font-medium mb-3'>Images</p>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                      {Object.entries(socialContent.images).map(
                        ([format, url]) => (
                          <div key={format} className='space-y-2'>
                            <div className='aspect-square bg-zinc-800 rounded overflow-hidden'>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt={`${format} format preview`}
                                className='w-full h-full object-cover'
                              />
                            </div>
                            <div className='flex items-center justify-between'>
                              <span className='text-xs text-zinc-400 capitalize'>
                                {format}
                              </span>
                              <a
                                href={url}
                                download={`lunary-${format}.png`}
                                className='text-purple-400 hover:text-purple-300'
                              >
                                <Download className='h-4 w-4' />
                              </a>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <p className='text-sm font-medium mb-3'>Captions</p>
                    <div className='space-y-3'>
                      {Object.entries(socialContent.captions).map(
                        ([length, caption]) => (
                          <div key={length} className='bg-zinc-800 rounded p-3'>
                            <div className='flex items-center justify-between mb-2'>
                              <span className='text-xs text-zinc-400 capitalize'>
                                {length}
                              </span>
                              <button
                                onClick={() => copyToClipboard(caption)}
                                className='text-purple-400 hover:text-purple-300'
                              >
                                <Copy className='h-4 w-4' />
                              </button>
                            </div>
                            <p className='text-sm text-zinc-300'>{caption}</p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <p className='text-sm font-medium mb-2'>Hashtags</p>
                    <div className='flex flex-wrap gap-2'>
                      {socialContent.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className='text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded'
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(socialContent.hashtags.join(' '))
                      }
                      className='text-xs text-purple-400 hover:text-purple-300 mt-2'
                    >
                      Copy all hashtags
                    </button>
                  </div>

                  <div>
                    <p className='text-sm font-medium mb-3'>
                      Platform-Ready Captions
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      {Object.entries(socialContent.platforms).map(
                        ([platform, content]) => (
                          <div
                            key={platform}
                            className='bg-zinc-800 rounded p-3'
                          >
                            <div className='flex items-center justify-between mb-2'>
                              <span className='text-sm font-medium capitalize'>
                                {platform}
                              </span>
                            </div>
                            {Object.entries(content).map(([type, text]) => (
                              <div key={type} className='mb-2'>
                                <div className='flex items-center justify-between'>
                                  <span className='text-xs text-zinc-500 capitalize'>
                                    {type}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(text)}
                                    className='text-purple-400 hover:text-purple-300'
                                  >
                                    <Copy className='h-3 w-3' />
                                  </button>
                                </div>
                                <p className='text-xs text-zinc-400 mt-1 line-clamp-2'>
                                  {text}
                                </p>
                              </div>
                            ))}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {preview && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card className='bg-zinc-900 border-zinc-800'>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span>Free Post Preview</span>
                  <Badge variant='outline'>Free</Badge>
                </CardTitle>
                <p className='text-sm text-zinc-400'>
                  {preview.metadata.freeWordCount} words
                </p>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <h3 className='font-semibold mb-1'>{preview.free.title}</h3>
                    {preview.free.subtitle && (
                      <p className='text-sm text-zinc-400 italic'>
                        {preview.free.subtitle}
                      </p>
                    )}
                  </div>
                  <div className='bg-zinc-950 rounded p-4 max-h-96 overflow-y-auto'>
                    <pre className='text-xs whitespace-pre-wrap font-mono'>
                      {preview.free.content.substring(0, 1000)}
                      {preview.free.content.length > 1000 && '...'}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-zinc-900 border-zinc-800'>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span>Paid Post Preview</span>
                  <Badge variant='default'>$3/month</Badge>
                </CardTitle>
                <p className='text-sm text-zinc-400'>
                  {preview.metadata.paidWordCount} words
                </p>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <h3 className='font-semibold mb-1'>{preview.paid.title}</h3>
                    {preview.paid.subtitle && (
                      <p className='text-sm text-zinc-400 italic'>
                        {preview.paid.subtitle}
                      </p>
                    )}
                  </div>
                  <div className='bg-zinc-950 rounded p-4 max-h-96 overflow-y-auto'>
                    <pre className='text-xs whitespace-pre-wrap font-mono'>
                      {preview.paid.content.substring(0, 1000)}
                      {preview.paid.content.length > 1000 && '...'}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {preview && (
          <Card className='bg-zinc-900 border-zinc-800 mt-6'>
            <CardHeader>
              <CardTitle>Week Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                <div>
                  <p className='text-zinc-400'>Week Start</p>
                  <p className='font-medium'>
                    {new Date(preview.metadata.weekStart).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className='text-zinc-400'>Week End</p>
                  <p className='font-medium'>
                    {new Date(preview.metadata.weekEnd).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className='text-zinc-400'>Week Number</p>
                  <p className='font-medium'>{preview.metadata.weekNumber}</p>
                </div>
                <div>
                  <p className='text-zinc-400'>Year</p>
                  <p className='font-medium'>
                    {new Date(preview.metadata.weekStart).getFullYear()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
