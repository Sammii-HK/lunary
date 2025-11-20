'use client';

import { useState } from 'react';
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
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
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
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
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
                Week Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Week Offset
                  </label>
                  <select
                    value={weekOffset}
                    onChange={(e) => setWeekOffset(parseInt(e.target.value))}
                    className='w-full bg-zinc-800 border-zinc-700 rounded px-3 py-2'
                  >
                    <option value={-1}>Last Week</option>
                    <option value={0}>This Week</option>
                    <option value={1}>Next Week</option>
                  </select>
                </div>
                <Button
                  onClick={loadPreview}
                  disabled={loading === 'preview'}
                  className='w-full'
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
                Publishing
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
                    className='w-full'
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
                    className='w-full'
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
                        <CheckCircle className='h-4 w-4 text-green-500' />
                        {publishResults.free.postUrl && (
                          <a
                            href={publishResults.free.postUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-400 hover:underline'
                          >
                            <ExternalLink className='h-3 w-3' />
                          </a>
                        )}
                      </div>
                    ) : (
                      <XCircle className='h-4 w-4 text-red-500' />
                    )}
                  </div>
                )}
                {publishResults.paid && (
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Paid Post</span>
                    {publishResults.paid.success ? (
                      <div className='flex items-center gap-2'>
                        <CheckCircle className='h-4 w-4 text-green-500' />
                        {publishResults.paid.postUrl && (
                          <a
                            href={publishResults.paid.postUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-400 hover:underline'
                          >
                            <ExternalLink className='h-3 w-3' />
                          </a>
                        )}
                      </div>
                    ) : (
                      <XCircle className='h-4 w-4 text-red-500' />
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
