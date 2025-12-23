import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getYearAnalysis } from '@/lib/tarot/year-analysis';

export async function GET(request: NextRequest) {
  try {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    if (!isVercelCron) {
      if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const lastYear = currentYear - 1;

    if (isVercelCron && (now.getUTCMonth() !== 0 || now.getUTCDate() !== 1)) {
      return NextResponse.json({
        success: true,
        message: 'Not Jan 1 UTC, skipping yearly tarot analysis',
        currentYear,
        lastYear,
      });
    }

    let users;
    try {
      users = await sql`
        SELECT DISTINCT
          s.user_id,
          s.user_name,
          ps.preferences->>'name' as display_name,
          ps.preferences->>'birthday' as birthday
        FROM subscriptions s
        LEFT JOIN push_subscriptions ps ON ps.user_id = s.user_id
        WHERE s.status IN ('active', 'trial', 'trialing')
          AND s.plan_type IN ('lunary_plus_ai', 'lunary_plus_ai_annual')
        GROUP BY s.user_id, s.user_name, ps.preferences
      `;
    } catch (error: any) {
      if (error?.code === '42P01') {
        users = await sql`
          SELECT DISTINCT
            user_id,
            user_name
          FROM subscriptions
          WHERE status IN ('active', 'trial', 'trialing')
            AND plan_type IN ('lunary_plus_ai', 'lunary_plus_ai_annual')
        `;
      } else {
        throw error;
      }
    }

    if (!users || users.rows.length === 0) {
      return NextResponse.json({
        success: true,
        usersProcessed: 0,
        message: 'No eligible users found',
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const results: Array<{
      userId: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const user of users.rows) {
      try {
        const userId = user.user_id;
        const userName = user.display_name || user.user_name || undefined;
        const userBirthday = user.birthday || undefined;

        await Promise.all([
          getYearAnalysis(userId, lastYear, userName, userBirthday),
          getYearAnalysis(userId, currentYear, userName, userBirthday),
        ]);

        successCount++;
        results.push({ userId, success: true });
      } catch (error) {
        errorCount++;
        results.push({
          userId: user.user_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      currentYear,
      lastYear,
      usersProcessed: users.rows.length,
      successes: successCount,
      errors: errorCount,
      results,
    });
  } catch (error) {
    console.error('❌ Yearly tarot analysis cron failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
