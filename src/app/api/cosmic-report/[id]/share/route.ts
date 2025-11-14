import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { createShareToken, buildShareUrl } from '@/lib/cosmic-report/share';

interface Params {
  id: string;
}

export async function POST(
  _request: Request,
  { params }: { params: Params },
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid report id' },
        { status: 400 },
      );
    }

    const shareToken = createShareToken();

    const result = await sql`
      UPDATE cosmic_reports
      SET share_token = ${shareToken}, is_public = true
      WHERE id = ${id}
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
    console.error('Failed to create report share link:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to create share link' },
      { status: 500 },
    );
  }
}
