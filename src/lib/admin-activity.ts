import { sql } from '@vercel/postgres';

export type ActivityType =
  | 'cron_execution'
  | 'pack_generation'
  | 'calendar_creation'
  | 'moon_circle_creation'
  | 'content_creation'
  | 'admin_action';

export type ActivityCategory =
  | 'automation'
  | 'content'
  | 'shop'
  | 'notifications'
  | 'admin';

export type ActivityStatus = 'success' | 'failed' | 'pending' | 'skipped';

export interface ActivityLogInput {
  activityType: ActivityType;
  activityCategory: ActivityCategory;
  status: ActivityStatus;
  message?: string;
  metadata?: Record<string, any>;
  errorMessage?: string;
  executionTimeMs?: number;
}

export async function logActivity(input: ActivityLogInput): Promise<void> {
  try {
    // Try to create table if it doesn't exist (idempotent)
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS admin_activity_log (
          id SERIAL PRIMARY KEY,
          activity_type TEXT NOT NULL,
          activity_category TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          message TEXT,
          metadata JSONB DEFAULT '{}'::jsonb,
          error_message TEXT,
          execution_time_ms INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      // Create indexes if they don't exist
      await sql`CREATE INDEX IF NOT EXISTS idx_admin_activity_log_type ON admin_activity_log(activity_type)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_admin_activity_log_category ON admin_activity_log(activity_category)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_admin_activity_log_status ON admin_activity_log(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC)`;
    } catch (createError: any) {
      // Table might already exist, or we don't have CREATE permissions
      if (createError?.code !== '42P07') {
        // 42P07 is "relation already exists" - that's fine
        console.warn(
          '[admin-activity] Could not ensure table exists:',
          createError?.message,
        );
      }
    }

    await sql`
      INSERT INTO admin_activity_log (
        activity_type,
        activity_category,
        status,
        message,
        metadata,
        error_message,
        execution_time_ms
      ) VALUES (
        ${input.activityType},
        ${input.activityCategory},
        ${input.status},
        ${input.message || null},
        ${input.metadata ? JSON.stringify(input.metadata) : null},
        ${input.errorMessage || null},
        ${input.executionTimeMs || null}
      )
    `;
  } catch (error: any) {
    // Don't fail the main operation if logging fails
    if (error?.code === '42P01') {
      console.warn(
        '[admin-activity] Table does not exist. Run the database setup script to create it.',
      );
    } else {
      console.error(
        '[admin-activity] Failed to log activity:',
        error?.message || error,
      );
    }
  }
}

export async function getRecentActivity(limit: number = 50) {
  try {
    // Try to create table if it doesn't exist (idempotent)
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS admin_activity_log (
          id SERIAL PRIMARY KEY,
          activity_type TEXT NOT NULL,
          activity_category TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          message TEXT,
          metadata JSONB DEFAULT '{}'::jsonb,
          error_message TEXT,
          execution_time_ms INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      await sql`CREATE INDEX IF NOT EXISTS idx_admin_activity_log_type ON admin_activity_log(activity_type)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_admin_activity_log_category ON admin_activity_log(activity_category)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_admin_activity_log_status ON admin_activity_log(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC)`;
    } catch (createError: any) {
      // Table might already exist, or we don't have CREATE permissions
      if (createError?.code !== '42P07') {
        console.warn(
          '[admin-activity] Could not ensure table exists:',
          createError?.message,
        );
        // If we can't create the table, return empty array instead of failing
        return [];
      }
    }

    const result = await sql`
      SELECT 
        id,
        activity_type,
        activity_category,
        status,
        message,
        metadata,
        error_message,
        execution_time_ms,
        created_at
      FROM admin_activity_log
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return result.rows || [];
  } catch (error: any) {
    // Always return empty array on error, don't throw
    if (error?.code === '42P01') {
      console.warn(
        '[admin-activity] Table does not exist. Run the database setup script to create it.',
      );
    } else {
      console.error(
        '[admin-activity] Failed to fetch admin activity:',
        error?.message || error,
      );
    }
    return [];
  }
}

export async function getActivityByType(
  activityType: ActivityType,
  limit: number = 20,
) {
  try {
    const result = await sql`
      SELECT 
        id,
        activity_type,
        activity_category,
        status,
        message,
        metadata,
        error_message,
        execution_time_ms,
        created_at
      FROM admin_activity_log
      WHERE activity_type = ${activityType}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return result.rows;
  } catch (error) {
    console.error('Failed to fetch activity by type:', error);
    return [];
  }
}

export async function getActivityStats(days: number = 7) {
  try {
    const result = await sql`
      SELECT 
        activity_type,
        activity_category,
        status,
        COUNT(*) as count,
        AVG(execution_time_ms) as avg_execution_time_ms
      FROM admin_activity_log
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY activity_type, activity_category, status
      ORDER BY count DESC
    `;

    return result.rows;
  } catch (error) {
    console.error('Failed to fetch activity stats:', error);
    return [];
  }
}
