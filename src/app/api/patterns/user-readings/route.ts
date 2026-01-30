/**
 * API route to fetch user's actual tarot readings for pattern analysis
 * Replaces seeded generation with real database data
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get timeFrame from query params (default 30 days)
    const searchParams = request.nextUrl.searchParams;
    const timeFrameDays = parseInt(searchParams.get('days') || '30', 10);

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeFrameDays);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Query actual database readings
    const result = await sql`
      SELECT cards, created_at
      FROM tarot_readings
      WHERE user_id = ${userId}
        AND spread_slug = 'daily-tarot'
        AND created_at >= ${startDateStr}::date
        AND created_at < CURRENT_DATE
        AND archived_at IS NULL
      ORDER BY created_at DESC
    `;

    // Extract and format cards
    const readings = result.rows
      .map((row) => {
        try {
          const cardsData =
            typeof row.cards === 'string' ? JSON.parse(row.cards) : row.cards;

          if (Array.isArray(cardsData) && cardsData.length > 0) {
            const cardData = cardsData[0];
            if (cardData.card) {
              return {
                name: cardData.card.name,
                keywords: cardData.card.keywords || [],
                information: cardData.card.information || '',
                createdAt: row.created_at,
              };
            }
          }
          return null;
        } catch (error) {
          console.error('Error parsing card data:', error);
          return null;
        }
      })
      .filter((card): card is NonNullable<typeof card> => card !== null);

    return NextResponse.json({
      success: true,
      readings,
      count: readings.length,
      timeFrameDays,
    });
  } catch (error) {
    console.error('Error fetching user readings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
