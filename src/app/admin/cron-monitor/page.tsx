'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Clock,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Zap,
  Activity,
} from 'lucide-react';

interface CronResult {
  success: boolean;
  message: string;
  summary?: {
    total: number;
    successful: number;
    failed: number;
    successRate: string;
  };
  results?:
    | Array<{
        name: string;
        platforms: string[];
        status: string;
        error?: string;
        postId?: string;
        scheduledDate?: string;
      }>
    | Record<string, any>; // Can be array or object
}

export default function CronMonitorPage() {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<CronResult | null>(null);
  const [logs, setLogs] = useState<string>('');

  const triggerDailyCron = async () => {
    setLoading(true);
    setLogs('🚀 Triggering daily cron job manually...\n');

    try {
      const response = await fetch('/api/cron/test-daily-posts', {
        method: 'GET',
      });

      const result = await response.json();
      // Handle nested structure - cronResult might have results.dailyPosts.results
      const cronResult = result.cronResult;
      if (cronResult?.results && !Array.isArray(cronResult.results)) {
        // If results is an object, try to extract the array from dailyPosts
        if (cronResult.results.dailyPosts?.results) {
          cronResult.results = cronResult.results.dailyPosts.results;
        } else {
          // If no array found, set to empty array
          cronResult.results = [];
        }
      }
      setLastResult(cronResult);

      setLogs(
        (prev) =>
          prev + `\n✅ Cron job completed\n${JSON.stringify(result, null, 2)}`,
      );
    } catch (error) {
      setLogs(
        (prev) =>
          prev +
          `\n❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const triggerMoonCircle = async (date?: string, force?: boolean) => {
    setLoading(true);
    const dateStr = date || new Date().toISOString().split('T')[0];
    setLogs(
      `🌙 Creating Moon Circle for ${dateStr}${force ? ' (force)' : ''}...\n`,
    );

    try {
      const response = await fetch('/api/cron/moon-circles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: dateStr, force }),
      });

      const result = await response.json();
      setLastResult(result);

      if (result.success) {
        setLogs(
          (prev) =>
            prev +
            `\n✅ Moon Circle ${result.moonCircleGenerated ? 'created' : 'check completed'}\n${JSON.stringify(result, null, 2)}`,
        );
      } else {
        setLogs(
          (prev) =>
            prev +
            `\n❌ Moon Circle creation failed: ${result.error || result.message}\n${JSON.stringify(result, null, 2)}`,
        );
      }
    } catch (error) {
      setLogs(
        (prev) =>
          prev +
          `\n❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const checkCronStatus = async () => {
    setLoading(true);
    try {
      // Check Vercel cron status (if available)
      setLogs('📊 Checking cron job status...\n');

      // Show the consolidated schedule
      const cronSchedule = {
        'master-cron': '0 8 * * * (8 AM UTC daily)',
        'daily-posts':
          'Every day - 5 posts across all platforms (12PM, 3PM, 6PM, 9PM, 12AM UTC)',
        'weekly-blog': 'Sundays - Generate blog content and newsletter',
        'monthly-moon-packs':
          '15th of each month - Generate monthly moon packs',
        'quarterly-moon-packs':
          '15th of Jan/Apr/Jul/Oct - Generate quarterly packs',
        'yearly-moon-packs': 'July 1st - Generate yearly packs',
      };

      setLogs(
        (prev) =>
          prev +
          `\n📅 Cron Schedule:\n${Object.entries(cronSchedule)
            .map(([name, schedule]) => `${name}: ${schedule}`)
            .join('\n')}`,
      );
    } catch (error) {
      setLogs(
        (prev) =>
          prev +
          `\n❌ Error checking status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2 flex items-center gap-2'>
          <Activity className='h-8 w-8' />
          Cron Job Monitor
        </h1>
        <p className='text-muted-foreground'>
          Monitor and manually trigger scheduled tasks
        </p>
      </div>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Zap className='h-5 w-5' />
              Daily Posts
            </CardTitle>
            <CardDescription>Trigger daily social media posts</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={triggerDailyCron}
              disabled={loading}
              className='w-full'
            >
              <Play className='h-4 w-4 mr-2' />
              {loading ? 'Running...' : 'Trigger Now'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg flex items-center gap-2'>
              🌙 Moon Circle
            </CardTitle>
            <CardDescription>Create Moon Circle for today</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <Button
              onClick={() => triggerMoonCircle()}
              disabled={loading}
              className='w-full'
              variant='outline'
            >
              <Play className='h-4 w-4 mr-2' />
              Check/Create
            </Button>
            <Button
              onClick={() => triggerMoonCircle(undefined, true)}
              disabled={loading}
              className='w-full'
              variant='destructive'
              size='sm'
            >
              Force Recreate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Clock className='h-5 w-5' />
              Schedule Status
            </CardTitle>
            <CardDescription>Check cron job schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={checkCronStatus}
              disabled={loading}
              variant='outline'
              className='w-full'
            >
              <Calendar className='h-4 w-4 mr-2' />
              Check Status
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg'>Master Cron</CardTitle>
            <CardDescription>Consolidated schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <Badge variant='secondary' className='w-full justify-center'>
                8 AM UTC Daily
              </Badge>
              <div className='text-xs text-muted-foreground text-center'>
                + Weekly/Monthly tasks as needed
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Result */}
      {lastResult && (
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              {lastResult.success ? (
                <CheckCircle className='h-5 w-5 text-green-500' />
              ) : (
                <XCircle className='h-5 w-5 text-red-500' />
              )}
              Last Execution Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='mb-4'>{lastResult.message}</p>

            {lastResult.summary && (
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold'>
                    {lastResult.summary.total}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Total Posts
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>
                    {lastResult.summary.successful}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Successful
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-red-600'>
                    {lastResult.summary.failed}
                  </div>
                  <div className='text-sm text-muted-foreground'>Failed</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold'>
                    {lastResult.summary.successRate}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Success Rate
                  </div>
                </div>
              </div>
            )}

            {lastResult.results && Array.isArray(lastResult.results) && (
              <div className='space-y-2'>
                <h4 className='font-semibold'>Post Results:</h4>
                {lastResult.results.map((result, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-3 border rounded-lg'
                  >
                    <div>
                      <div className='font-medium'>{result.name}</div>
                      <div className='text-sm text-muted-foreground'>
                        {result.platforms.join(', ')}
                      </div>
                      {result.scheduledDate && (
                        <div className='text-xs text-muted-foreground'>
                          Scheduled:{' '}
                          {new Date(result.scheduledDate).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      {result.status === 'success' ? (
                        <>
                          <CheckCircle className='h-4 w-4 text-green-500' />
                          <Badge variant='secondary'>Success</Badge>
                        </>
                      ) : (
                        <>
                          <XCircle className='h-4 w-4 text-red-500' />
                          <Badge variant='destructive'>Failed</Badge>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5' />
            Execution Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={logs}
            readOnly
            placeholder='Logs will appear here when you trigger cron jobs...'
            className='min-h-[300px] font-mono text-sm'
          />
          {logs && (
            <Button
              variant='outline'
              size='sm'
              className='mt-2'
              onClick={() => setLogs('')}
            >
              Clear Logs
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Troubleshooting Tips */}
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>Troubleshooting Tips</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm'>
          <p>
            <strong>Only getting 1 post?</strong> Check that all 5 posts are
            being sent to Succulent with proper scheduled times.
          </p>
          <p>
            <strong>Posts not appearing?</strong> Verify your
            SUCCULENT_SECRET_KEY and SUCCULENT_ACCOUNT_GROUP_ID environment
            variables.
          </p>
          <p>
            <strong>Image errors?</strong> Check that your OG image endpoints
            are working: /api/og/cosmic, /api/og/crystal, etc.
          </p>
          <p>
            <strong>Timing issues?</strong> The master cron runs at 8 AM UTC
            daily with 4-hour buffer before first post.
          </p>
          <p>
            <strong>Weekly content?</strong> Blog posts and newsletters are
            generated every Sunday automatically.
          </p>
          <p>
            <strong>Moon packs?</strong> Generated on the 15th of each month,
            with quarterly and yearly variants.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
