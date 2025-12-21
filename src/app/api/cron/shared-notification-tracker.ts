// Shared notification tracker for daily and 4-hourly cron jobs
// Uses PostgreSQL to persist tracking across serverless invocations

import { sql } from '@vercel/postgres';

export class DeduplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeduplicationError';
  }
}

// Ensure the notification_sent_events table exists
let tableChecked = false;
async function ensureTableExists(): Promise<void> {
  if (tableChecked) return;

  try {
    // Try to query the table to see if it exists
    await sql`SELECT 1 FROM notification_sent_events LIMIT 1`;
    tableChecked = true;
  } catch (error: any) {
    // Table doesn't exist, create it
    if (error?.code === '42P01') {
      console.log('📋 Creating notification_sent_events table...');
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS notification_sent_events (
            id SERIAL PRIMARY KEY,
            date DATE NOT NULL,
            event_key TEXT NOT NULL,
            event_type TEXT NOT NULL,
            event_name TEXT NOT NULL,
            event_priority INTEGER NOT NULL,
            sent_by TEXT NOT NULL,
            sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(date, event_key)
          )
        `;
        await sql`
          CREATE INDEX IF NOT EXISTS idx_notification_sent_events_date 
          ON notification_sent_events(date)
        `;
        await sql`
          CREATE INDEX IF NOT EXISTS idx_notification_sent_events_event_key 
          ON notification_sent_events(event_key)
        `;
        await sql`
          CREATE INDEX IF NOT EXISTS idx_notification_sent_events_sent_at 
          ON notification_sent_events(sent_at)
        `;
        console.log('✅ notification_sent_events table created successfully');
        tableChecked = true;
      } catch (createError) {
        console.error(
          '❌ Failed to create notification_sent_events table:',
          createError,
        );
        // Don't throw - allow notifications to proceed without deduplication
      }
    } else {
      // Some other error, re-throw
      throw error;
    }
  }
}

export async function getSentEvents(date: string): Promise<Set<string>> {
  try {
    await ensureTableExists();

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
    console.error(
      '⚠️ Error fetching sent events - continuing without deduplication:',
      error,
    );
    // Return empty set instead of throwing - allow notifications to proceed
    // This prevents blocking notifications if the table has issues
    return new Set<string>();
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
    await ensureTableExists();

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
    await ensureTableExists();

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
    await ensureTableExists();

    const result = await sql`
      SELECT 1 
      FROM notification_sent_events 
      WHERE date = ${date}::date AND event_key = ${eventKey}
      LIMIT 1
    `;
    return result.rows.length > 0;
  } catch (error) {
    console.error(
      '⚠️ Error checking if event sent - assuming not sent to allow notification:',
      error,
    );
    // Return false instead of throwing - allow notification to proceed
    // This prevents blocking notifications if the table has issues
    return false;
  }
}

export async function cleanupOldDates(keepDays: number = 1): Promise<void> {
  try {
    await ensureTableExists();

    // Only keep data for yesterday and today (1 day buffer for safety)
    // Once the day is over, we don't need to track those events anymore
    await sql`
      DELETE FROM notification_sent_events
      WHERE date < CURRENT_DATE - (${keepDays} || ' days')::INTERVAL
    `;
  } catch (error) {
    console.error('Error cleaning up old dates:', error);
    // Don't throw - cleanup is not critical
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
