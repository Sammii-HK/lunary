import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '1';
    const force = url.searchParams.get('force') || '';
    const baseUrl = process.env.VERCEL
      ? 'https://lunary.app'
      : 'http://localhost:3000';
    const cronSecret = process.env.CRON_SECRET;

    const response = await fetch(
      `${baseUrl}/api/cron/process-video-jobs?limit=${encodeURIComponent(limit)}${force ? `&force=${encodeURIComponent(force)}` : ''}`,
      {
        method: 'POST',
        headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
      },
    );

    let data: any = null;
    try {
      data = await response.json();
    } catch (parseError) {
      console.warn(
        'Video job processor responded without JSON, returning raw status',
        parseError,
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

    if (data) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(
      {
        success: true,
        warning:
          'Video processor accepted the request; response will arrive asynchronously.',
      },
      { status: 202 },
    );
  } catch (error) {
    console.error('Failed to trigger video job processor:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const cause = (error as any)?.cause;
    const isTimeout =
      cause?.name === 'HeadersTimeoutError' ||
      message?.includes('Headers Timeout');
    if (isTimeout) {
      return NextResponse.json(
        {
          success: true,
          warning:
            'Video job processor is still working. Request timed out waiting for a response.',
        },
        { status: 202 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
