import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';

export const runtime = 'nodejs';

/**
 * POST /api/admin/video-scripts/fix-punctuation
 *
 * Adds sentence-ending punctuation to every line of every video script
 * that doesn't already have it. This ensures TTS pauses between lines.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json().catch(() => ({}));
    const weekStart = body.weekStart as string | undefined;

    // Fetch all scripts (optionally filtered by week)
    const scripts = weekStart
      ? await sql`
          SELECT id, full_script
          FROM video_scripts
          WHERE full_script IS NOT NULL
            AND scheduled_date >= ${weekStart}::date
            AND scheduled_date < (${weekStart}::date + INTERVAL '7 days')
        `
      : await sql`
          SELECT id, full_script
          FROM video_scripts
          WHERE full_script IS NOT NULL
        `;

    let updated = 0;
    let skipped = 0;

    for (const row of scripts.rows) {
      const original = row.full_script as string;
      const fixed = ensureLinePunctuation(original);

      if (fixed === original) {
        skipped++;
        continue;
      }

      await sql`
        UPDATE video_scripts
        SET full_script = ${fixed}
        WHERE id = ${row.id}
      `;
      updated++;
    }

    return NextResponse.json({
      success: true,
      total: scripts.rows.length,
      updated,
      skipped,
    });
  } catch (error) {
    console.error('Error fixing punctuation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * Ensure every non-empty line ends with sentence punctuation.
 */
function ensureLinePunctuation(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      if (/[.!?,;:\-—]$/.test(trimmed)) return trimmed;
      return `${trimmed}.`;
    })
    .join('\n');
}
