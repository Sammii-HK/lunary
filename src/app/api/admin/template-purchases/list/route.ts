import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';
import { apiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const result = await sql`
      SELECT
        template_id,
        COUNT(*) AS total,
        COUNT(CASE WHEN notion_share_url IS NOT NULL THEN 1 END) AS with_url,
        COUNT(CASE WHEN revoked = true THEN 1 END) AS revoked,
        MAX(created_at) AS last_purchase
      FROM template_purchases
      GROUP BY template_id
      ORDER BY last_purchase DESC
    `;

    return NextResponse.json({ purchases: result.rows });
  } catch (error) {
    console.error('[admin] template-purchases list error:', error);
    return apiError(
      error instanceof Error ? error.message : 'Unknown error',
      500,
    );
  }
}
