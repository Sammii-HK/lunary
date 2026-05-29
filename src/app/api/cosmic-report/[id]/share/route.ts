import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { createShareToken, buildShareUrl } from '@/lib/cosmic-report/share';
import { requireUser, UnauthorizedError } from '@/lib/ai/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, context: any) {
  try {
    const user = await requireUser(request);

    const { params } = context as { params: { id: string } };
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid report id' },
        { status: 400 },
      );
    }

    const shareToken = createShareToken();

    // Scope to the requesting user's own report to prevent IDOR. A caller
    // must not be able to publish or mint a share token for someone else's
    // report by enumerating sequential ids.
    const result = await sql`
      UPDATE cosmic_reports
      SET share_token = ${shareToken}, is_public = true
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    `;

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Report not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      share_url: buildShareUrl(shareToken),
      share_token: shareToken,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }
    console.error('Failed to create report share link:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to create share link' },
      { status: 500 },
    );
  }
}
