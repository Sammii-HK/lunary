import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminAuth } from '@/lib/admin-auth';
import { apiError } from '@/lib/api-response';
import { generateDemoVideo } from '@/lib/video/demo-pipeline';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for TTS + render

const RequestSchema = z.object({
  scriptId: z.string().min(1, 'scriptId is required'),
  videoSrc: z.string().optional(),
  format: z
    .enum(['AppDemoVideo', 'AppDemoVideoFeed', 'AppDemoVideoX'])
    .optional(),
});

/**
 * POST /api/video/generate-demo
 *
 * Generate an app demo video from a TikTok script.
 * Admin-only endpoint.
 *
 * Body: { scriptId: string, videoSrc?: string, format?: string }
 * Returns: video record with URL, audio URL, duration, etc.
 */
export async function POST(request: NextRequest) {
  // Auth check
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues.map((i) => i.message).join(', '),
        400,
      );
    }

    const { scriptId, videoSrc, format } = parsed.data;

    console.log(
      `[generate-demo] Request: scriptId="${scriptId}", format="${format ?? 'AppDemoVideo'}"`,
    );

    const record = await generateDemoVideo({
      scriptId,
      videoSrc,
      format,
    });

    return NextResponse.json({
      success: true,
      video: record,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[generate-demo] Pipeline failed:', message);

    // Return specific status codes for known error types
    if (message.includes('Unknown script ID')) {
      return apiError(message, 404);
    }
    if (message.includes('Remotion is not available')) {
      return apiError(message, 503);
    }
    if (message.includes('no voiceover text')) {
      return apiError(message, 422);
    }

    return apiError(`Demo video generation failed: ${message}`, 500);
  }
}
