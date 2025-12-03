import { NextRequest, NextResponse } from 'next/server';
import { getWeeklyInsights } from '@/lib/rituals/weekly-insights';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    const session = await auth.api.getSession({
      headers: new Headers({ cookie: cookieHeader }),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const insights = await getWeeklyInsights(session.user.id);

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Failed to get weekly insights:', error);
    return NextResponse.json(
      {
        mainTransits: [],
        moonPhases: [],
        energyThemes: [],
        dominantTheme: 'reflection',
      },
      { status: 200 },
    );
  }
}
