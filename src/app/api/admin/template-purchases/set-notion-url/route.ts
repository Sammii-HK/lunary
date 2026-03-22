import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';
import { apiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

const KNOWN_TEMPLATE_IDS = new Set([
  'tarot-journal',
  'moon-planner-2026',
  'rune-journal',
  'angel-numbers-journal',
  'digital-grimoire',
]);

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const { templateId, notionShareUrl } = body;

    if (!templateId || !notionShareUrl) {
      return apiError('templateId and notionShareUrl are required', 400);
    }

    if (!KNOWN_TEMPLATE_IDS.has(templateId)) {
      return apiError(
        `Unknown templateId. Must be one of: ${[...KNOWN_TEMPLATE_IDS].join(', ')}`,
        400,
      );
    }

    if (
      !notionShareUrl.startsWith('https://www.notion.so/') &&
      !notionShareUrl.startsWith('https://notion.so/')
    ) {
      return apiError(
        'notionShareUrl must start with https://www.notion.so/ or https://notion.so/',
        400,
      );
    }

    const result = await sql`
      UPDATE template_purchases
      SET notion_share_url = ${notionShareUrl}
      WHERE template_id = ${templateId}
    `;

    return NextResponse.json({ updated: result.rowCount ?? 0 });
  } catch (error) {
    console.error('[admin] set-notion-url error:', error);
    return apiError(
      error instanceof Error ? error.message : 'Unknown error',
      500,
    );
  }
}
