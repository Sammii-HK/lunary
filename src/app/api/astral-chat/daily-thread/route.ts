import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/ai/auth';
import { buildDailyThreadModules } from '@/lib/daily-thread/generator';
import { DailyThreadModuleType } from '@/lib/daily-thread/types';
import dayjs from 'dayjs';

/**
 * GET /api/astral-chat/daily-thread?date=YYYY-MM-DD&forceRefresh=false
 * Fetch or generate modules for specified date
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const forceRefresh = searchParams.get('forceRefresh') === 'true';
    const moduleType = searchParams.get('type') as DailyThreadModuleType | null;

    const date = dateParam ? dayjs(dateParam).toDate() : new Date();

    // Get user profile for name and birthday
    const { sql } = await import('@vercel/postgres');
    const profileResult = await sql`
      SELECT name, birthday
      FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    const userName = profileResult.rows[0]?.name || undefined;
    const userBirthday = profileResult.rows[0]?.birthday || undefined;

    // Build or get modules
    const modules = await buildDailyThreadModules(
      user.id,
      date,
      forceRefresh,
      userName,
      userBirthday,
      moduleType || undefined,
    );

    return NextResponse.json({
      modules,
      hasMore: false, // Always false for daily thread (max 3 modules)
      date: dayjs(date).format('YYYY-MM-DD'),
    });
  } catch (error) {
    console.error('[Daily Thread API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily thread modules' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/astral-chat/daily-thread/action
 * Handle module actions (dismiss, journal creation, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const { action, moduleId, payload } = body;

    if (!action || !moduleId) {
      return NextResponse.json(
        { error: 'Missing action or moduleId' },
        { status: 400 },
      );
    }

    // Handle different action types
    switch (action) {
      case 'dismiss':
        // For now, we don't track dismissals per module
        // Could add a dismissed_modules table in the future
        return NextResponse.json({ success: true });

      case 'journal':
        // Create journal entry with prefilled prompt
        const prompt = payload?.prompt || 'Daily reflection';
        // Redirect to journal creation with prompt
        return NextResponse.json({
          success: true,
          redirect: `/book-of-shadows?prompt=${encodeURIComponent(prompt)}`,
        });

      case 'ritual':
        // Could trigger ritual suggestion or creation
        return NextResponse.json({ success: true });

      case 'view':
        // Handle view action (e.g., open past entry)
        if (payload?.href) {
          return NextResponse.json({
            success: true,
            redirect: payload.href,
          });
        }
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Daily Thread API] Error handling action:', error);
    return NextResponse.json(
      { error: 'Failed to handle action' },
      { status: 500 },
    );
  }
}
