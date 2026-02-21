import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { generateSeerSammiiScript } from '@/lib/social/video-scripts/seer-sammii/generation';
import {
  ensureVideoScriptsTable,
  saveVideoScript,
  getVideoScripts,
} from '@/lib/social/video-scripts/database';

/**
 * GET — List existing Seer Sammii scripts
 */
export async function GET(request: Request) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    await ensureVideoScriptsTable();
    const scripts = await getVideoScripts({ platform: 'tiktok_creator' });

    return NextResponse.json({
      success: true,
      scripts: scripts.map((s) => ({
        ...s,
        scheduledDate: s.scheduledDate.toISOString(),
        createdAt: s.createdAt?.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[Seer Sammii] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scripts' },
      { status: 500 },
    );
  }
}

/**
 * POST — Generate a new Seer Sammii script
 */
export async function POST(request: Request) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const date = body.date ? new Date(body.date) : new Date();
    const topic = body.topic as string | undefined;

    const script = await generateSeerSammiiScript(date, topic);

    // Save to video_scripts with platform = 'tiktok_creator'
    await ensureVideoScriptsTable();
    const id = await saveVideoScript({
      themeId: 'seer-sammii',
      themeName: 'Seer Sammii',
      facetTitle: script.topic,
      platform: 'tiktok' as const,
      sections: script.talkingPoints.map((point, i) => ({
        name: `Point ${i + 1}`,
        duration: '',
        content: point,
      })),
      fullScript: script.fullScript,
      wordCount: script.wordCount,
      estimatedDuration: script.estimatedDuration,
      scheduledDate: script.scheduledDate,
      status: 'draft',
      metadata: {
        theme: 'SEER SAMMII',
        title: script.topic,
        series: '',
        summary: script.caption,
      },
    });

    return NextResponse.json({
      success: true,
      script: { ...script, id },
    });
  } catch (error) {
    console.error('[Seer Sammii] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 },
    );
  }
}
