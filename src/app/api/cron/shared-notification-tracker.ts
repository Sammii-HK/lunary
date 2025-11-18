// Shared notification tracker for daily and 4-hourly cron jobs
// Uses PostgreSQL to persist tracking across serverless invocations

import { sql } from '@vercel/postgres';

export async function getSentEvents(date: string): Promise<Set<string>> {
  try {
    const result = await sql`
      SELECT event_key 
      FROM notification_sent_events 
      WHERE date = ${date}::date
    `;

    const sentEvents = new Set<string>();
    result.rows.forEach((row: any) => {
      sentEvents.add(row.event_key);
    });

    return sentEvents;
  } catch (error) {
    console.error('Error fetching sent events:', error);
    // Fallback to empty set if database query fails
    return new Set();
  }
}

export async function markEventAsSent(
  date: string,
  eventKey: string,
  eventType: string,
  eventName: string,
  eventPriority: number,
  sentBy: 'daily' | '4-hourly',
): Promise<void> {
  try {
    await sql`
      INSERT INTO notification_sent_events (date, event_key, event_type, event_name, event_priority, sent_by)
      VALUES (${date}::date, ${eventKey}, ${eventType}, ${eventName}, ${eventPriority}, ${sentBy})
      ON CONFLICT (date, event_key) DO NOTHING
    `;
  } catch (error) {
    console.error('Error marking event as sent:', error);
    // Don't throw - allow notification to proceed even if tracking fails
  }
}

export async function markEventsAsSent(
  date: string,
  events: Array<{ key: string; type: string; name: string; priority: number }>,
  sentBy: 'daily' | '4-hourly',
): Promise<void> {
  try {
    // Use a transaction to insert all events
    for (const event of events) {
      await sql`
        INSERT INTO notification_sent_events (date, event_key, event_type, event_name, event_priority, sent_by)
        VALUES (${date}::date, ${event.key}, ${event.type}, ${event.name}, ${event.priority}, ${sentBy})
        ON CONFLICT (date, event_key) DO NOTHING
      `;
    }
  } catch (error) {
    console.error('Error marking events as sent:', error);
    // Don't throw - allow notifications to proceed even if tracking fails
  }
}

export async function isEventSent(
  date: string,
  eventKey: string,
): Promise<boolean> {
  try {
    const result = await sql`
      SELECT 1 
      FROM notification_sent_events 
      WHERE date = ${date}::date AND event_key = ${eventKey}
      LIMIT 1
    `;
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking if event sent:', error);
    return false;
  }
}

export async function cleanupOldDates(keepDays: number = 1): Promise<void> {
  try {
    // Only keep data for yesterday and today (1 day buffer for safety)
    // Once the day is over, we don't need to track those events anymore
    await sql`
      DELETE FROM notification_sent_events
      WHERE date < CURRENT_DATE - (${keepDays} || ' days')::INTERVAL
    `;
  } catch (error) {
    console.error('Error cleaning up old dates:', error);
  }
}

export async function getSentEventsCount(date: string): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM notification_sent_events 
      WHERE date = ${date}::date
    `;
    return parseInt(result.rows[0]?.count || '0', 10);
  } catch (error) {
    console.error('Error getting sent events count:', error);
    return 0;
  }
}
