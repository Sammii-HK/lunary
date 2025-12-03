import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, context, userId, action } = body;

    if (!messageId || !context) {
      return NextResponse.json(
        { error: 'messageId and context are required' },
        { status: 400 },
      );
    }

    if (action === 'shown') {
      await sql`
        INSERT INTO ritual_message_events (message_id, context, user_id, shown_at, engaged)
        VALUES (${messageId}, ${context}, ${userId || 'anonymous'}, NOW(), false)
      `;
      return NextResponse.json({ success: true, action: 'shown' });
    }

    if (action === 'engaged') {
      await sql`
        UPDATE ritual_message_events
        SET engaged = true, engaged_at = NOW()
        WHERE message_id = ${messageId}
          AND user_id = ${userId || 'anonymous'}
          AND engaged = false
          AND shown_at > NOW() - INTERVAL '24 hours'
      `;
      return NextResponse.json({ success: true, action: 'engaged' });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "shown" or "engaged"' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Failed to track ritual message:', error);
    return NextResponse.json(
      { error: 'Failed to track message' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (messageId) {
      const result = await sql`
        SELECT 
          message_id,
          COUNT(*) as shown,
          COUNT(CASE WHEN engaged = true THEN 1 END) as engaged
        FROM ritual_message_events
        WHERE message_id = ${messageId}
        GROUP BY message_id
      `;

      if (result.rows.length === 0) {
        return NextResponse.json({ shown: 0, engaged: 0, engagementRate: 0 });
      }

      const { shown, engaged } = result.rows[0];
      const engagementRate =
        Number(shown) > 0 ? (Number(engaged) / Number(shown)) * 100 : 0;

      return NextResponse.json({
        shown: Number(shown),
        engaged: Number(engaged),
        engagementRate: Math.round(engagementRate * 10) / 10,
      });
    }

    const result = await sql`
      SELECT 
        message_id,
        context,
        COUNT(*) as shown,
        COUNT(CASE WHEN engaged = true THEN 1 END) as engaged,
        ROUND(COUNT(CASE WHEN engaged = true THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as engagement_rate
      FROM ritual_message_events
      WHERE shown_at > NOW() - INTERVAL '30 days'
      GROUP BY message_id, context
      ORDER BY engagement_rate DESC
    `;

    const lowPerformers = result.rows.filter(
      (row) => Number(row.shown) >= 50 && Number(row.engagement_rate) < 5,
    );

    const highPerformers = result.rows.filter(
      (row) => Number(row.shown) >= 20 && Number(row.engagement_rate) >= 20,
    );

    return NextResponse.json({
      performance: result.rows,
      lowPerformers,
      highPerformers,
      totalMessages: result.rows.length,
    });
  } catch (error) {
    console.error('Failed to get ritual message performance:', error);
    return NextResponse.json(
      { error: 'Failed to get performance data' },
      { status: 500 },
    );
  }
}
