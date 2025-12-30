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
    const data = await response.json();
    if (!data?.success && !data?.error && Array.isArray(data?.errors)) {
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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
