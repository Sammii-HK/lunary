import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/activate-retrograde-spaces
 * Daily cron: activates/deactivates retrograde check-in spaces based on date.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Activate spaces where today falls within their period
    const activatedResult = await sql`
      UPDATE community_spaces
      SET is_active = true
      WHERE space_type = 'retrograde_checkin'
        AND starts_at <= NOW()
        AND ends_at >= NOW()
        AND is_active = false
      RETURNING slug
    `;

    // Deactivate spaces whose period has ended
    const deactivatedResult = await sql`
      UPDATE community_spaces
      SET is_active = false
      WHERE space_type = 'retrograde_checkin'
        AND ends_at < NOW()
        AND is_active = true
      RETURNING slug
    `;

    const activated = activatedResult.rows.map((r) => r.slug);
    const deactivated = deactivatedResult.rows.map((r) => r.slug);

    console.log(
      `[activate-retrograde-spaces] Activated: ${activated.length}, Deactivated: ${deactivated.length}`,
    );

    return NextResponse.json({
      success: true,
      activated,
      deactivated,
    });
  } catch (error) {
    console.error('[activate-retrograde-spaces] Cron failed', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
