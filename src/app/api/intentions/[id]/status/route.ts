import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const collectionId = parseInt(id, 10);

    if (isNaN(collectionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid intention ID' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { status } = body;

    const validStatuses = [
      'active',
      'progressing',
      'blocked',
      'manifested',
      'released',
    ];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status. Must be one of: ' + validStatuses.join(', '),
        },
        { status: 400 },
      );
    }

    // Verify ownership and that it's an intention
    const existing = await sql`
      SELECT id, content, category FROM collections
      WHERE id = ${collectionId} AND user_id = ${user.id} AND category = 'intention'
    `;

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Intention not found' },
        { status: 404 },
      );
    }

    const currentContent = existing.rows[0].content;
    const now = new Date().toISOString();

    // Build updated content
    const updatedContent = {
      ...currentContent,
      status,
      ...(status === 'manifested' ? { manifestedAt: now } : {}),
      ...(status === 'released' ? { releasedAt: now } : {}),
    };

    await sql`
      UPDATE collections
      SET content = ${JSON.stringify(updatedContent)}::jsonb, updated_at = NOW()
      WHERE id = ${collectionId} AND user_id = ${user.id}
    `;

    // Track manifestation progress
    try {
      const { incrementProgress } = await import('@/lib/progress/server');
      const subResult = await sql`
        SELECT status, plan_type FROM subscriptions WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 1
      `;
      const sub = subResult.rows[0];
      const isPro =
        sub?.status === 'active' ||
        sub?.status === 'trial' ||
        sub?.status === 'trialing';

      if (status === 'manifested') {
        // Mark manifested: +25 XP (5 actions worth)
        await incrementProgress(user.id, 'manifestation', 5, isPro);
      } else if (status === 'progressing' || status === 'blocked') {
        // Progress note: +3 XP (1 action)
        await incrementProgress(user.id, 'manifestation', 1, isPro);
      }
    } catch (progressError) {
      console.warn('[Intentions] Failed to track progress:', progressError);
    }

    return NextResponse.json({
      success: true,
      intention: {
        id: collectionId,
        status,
        content: updatedContent,
      },
    });
  } catch (error) {
    console.error('Error updating intention status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
