import { NextResponse } from 'next/server';
import {
  getIndexNowConfig,
  isIndexNowConfigured,
  submitIndexNowUrls,
} from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (!isIndexNowConfigured()) {
      return NextResponse.json(
        { error: 'IndexNow is not configured. Set INDEXNOW_KEY first.' },
        { status: 503 },
      );
    }

    const { publishSecret } = getIndexNowConfig();
    const providedSecret =
      request.headers.get('x-indexnow-secret') ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    if (!publishSecret || publishSecret !== providedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized IndexNow submission.' },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { urls?: string[] };
    const urls = Array.isArray(body.urls) ? body.urls : [];
    const result = await submitIndexNowUrls(urls);

    return NextResponse.json({
      success: true,
      submittedCount: result.submitted.length,
      submitted: result.submitted,
      status: result.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'IndexNow submission failed',
      },
      { status: 500 },
    );
  }
}
