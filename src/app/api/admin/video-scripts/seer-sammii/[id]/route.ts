import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { updateVideoScriptStatus } from '@/lib/social/video-scripts/database';

/**
 * PATCH — Update Seer Sammii script status
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const body = await request.json();
    const status = body.status as 'draft' | 'approved' | 'used';

    if (!['draft', 'approved', 'used'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be draft, approved, or used.' },
        { status: 400 },
      );
    }

    await updateVideoScriptStatus(parseInt(id, 10), status);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Seer Sammii] PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update script' },
      { status: 500 },
    );
  }
}
