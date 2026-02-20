import { NextResponse } from 'next/server';
import { updateVideoScriptStatus } from '@/lib/social/video-script-generator';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/video-scripts/[id]
 *
 * Update a video script's status.
 * Body: { status: 'draft' | 'approved' | 'used' }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const scriptId = parseInt(id, 10);

    if (isNaN(scriptId)) {
      return NextResponse.json({ error: 'Invalid script ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['draft', 'approved', 'used'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be draft, approved, or used.' },
        { status: 400 },
      );
    }

    await updateVideoScriptStatus(scriptId, status);

    return NextResponse.json({
      success: true,
      message: `Script ${scriptId} updated to status: ${status}`,
    });
  } catch (error) {
    console.error('Error updating video script:', error);
    return NextResponse.json(
      {
        error: 'Failed to update video script',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
