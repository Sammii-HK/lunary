import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await sql`
      SELECT 
        id,
        date,
        event_key,
        event_type,
        event_name,
        event_priority,
        sent_by,
        sent_at
      FROM notification_sent_events
      WHERE date >= CURRENT_DATE - INTERVAL '1 day' * ${days}
      ORDER BY sent_at DESC
      LIMIT ${limit}
    `;

    const summary = await sql`
      SELECT 
        event_type,
        COUNT(*) as count,
        MAX(sent_at) as last_sent
      FROM notification_sent_events
      WHERE date >= CURRENT_DATE - INTERVAL '1 day' * ${days}
      GROUP BY event_type
      ORDER BY count DESC
    `;

    return NextResponse.json({
      notifications: result.rows.map((row) => ({
        id: row.id,
        date: row.date,
        eventKey: row.event_key,
        eventType: row.event_type,
        eventName: row.event_name,
        priority: row.event_priority,
        sentBy: row.sent_by,
        sentAt: row.sent_at,
      })),
      summary: summary.rows.map((row) => ({
        type: row.event_type,
        count: Number(row.count),
        lastSent: row.last_sent,
      })),
      count: result.rows.length,
    });
  } catch (error) {
    console.error('[admin/notifications/sent-history] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
