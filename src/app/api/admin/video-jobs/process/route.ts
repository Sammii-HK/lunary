import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { POST as processCronPost } from '@/app/api/cron/process-video-jobs/route';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '1';
    const force = url.searchParams.get('force') || '';
    const cronSecret = process.env.CRON_SECRET;

    // Build a synthetic request for the cron handler so we avoid a self-fetch
    // (server-side fetch to localhost:3000 fails with ECONNREFUSED in dev).
    const cronUrl = new URL(
      `/api/cron/process-video-jobs?limit=${encodeURIComponent(limit)}${force ? `&force=${encodeURIComponent(force)}` : ''}`,
      url.origin,
    );
    const cronRequest = new NextRequest(cronUrl.toString(), {
      method: 'POST',
      headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
    });

    const response = await processCronPost(cronRequest);

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: `Video processor returned ${response.status}`,
        },
        { status: 502 },
      );
    }

    if (data && !data.success && !data.error && Array.isArray(data.errors)) {
      const errorSummary = data.errors
        .map((item: { jobId?: number; error?: string }) => {
          const id = item.jobId ?? 'unknown';
          const message = item.error || 'Unknown error';
          return `#${id}: ${message}`;
        })
        .join(' | ');
      if (errorSummary) {
        data.error = errorSummary;
      }
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Failed to trigger video job processor:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
