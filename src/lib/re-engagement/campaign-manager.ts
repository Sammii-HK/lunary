import { sql } from '@vercel/postgres';

export type CampaignType =
  | '7days_inactive'
  | '14days_inactive'
  | '30days_inactive'
  | 'missed_streak'
  | 'milestone'
  | 'insights_ready';

export interface CampaignUser {
  userId: string;
  email: string;
  campaignType: CampaignType;
  metadata?: Record<string, any>;
}

export async function hasReceivedCampaign(
  userId: string,
  campaignType: CampaignType,
  daysAgo: number = 7,
): Promise<boolean> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    const result = await sql`
      SELECT COUNT(*) as count
      FROM re_engagement_campaigns
      WHERE user_id = ${userId}
        AND campaign_type = ${campaignType}
        AND sent_at >= ${cutoffDate.toISOString()}
    `;

    return parseInt(result.rows[0]?.count || '0') > 0;
  } catch (error) {
    console.error('[Campaign Manager] Error checking campaign:', error);
    return false;
  }
}

export async function recordCampaignSent(
  userId: string,
  campaignType: CampaignType,
  metadata?: Record<string, any>,
): Promise<void> {
  try {
    await sql`
      INSERT INTO re_engagement_campaigns (user_id, campaign_type, metadata, sent_at)
      VALUES (${userId}, ${campaignType}, ${metadata ? JSON.stringify(metadata) : null}::JSONB, NOW())
    `;
  } catch (error) {
    console.error('[Campaign Manager] Error recording campaign:', error);
  }
}

export async function getInactiveUsers(daysInactive: number): Promise<
  Array<{
    userId: string;
    email: string;
    lastActivity: Date | null;
  }>
> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    // Get users with no activity in analytics_user_activity
    // Use subscriptions table to get user emails
    const result = await sql`
      SELECT DISTINCT 
        sub.user_id, 
        sub.user_email as email, 
        MAX(aua.activity_date) as last_activity
      FROM subscriptions sub
      LEFT JOIN analytics_user_activity aua ON aua.user_id = sub.user_id
      WHERE sub.user_email IS NOT NULL
      GROUP BY sub.user_id, sub.user_email
      HAVING MAX(aua.activity_date) < ${cutoffDate.toISOString().split('T')[0]}::DATE
         OR MAX(aua.activity_date) IS NULL
      LIMIT 100
    `;

    return result.rows.map((row) => ({
      userId: row.user_id,
      email: row.user_email,
      lastActivity: row.last_activity ? new Date(row.last_activity) : null,
    }));
  } catch (error) {
    console.error('[Campaign Manager] Error getting inactive users:', error);
    return [];
  }
}

export async function getUsersWithMissedStreaks(): Promise<
  Array<{
    userId: string;
    email: string;
    streak: number;
  }>
> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await sql`
      SELECT us.user_id, sub.user_email as email, us.current_streak
      FROM user_streaks us
      INNER JOIN subscriptions sub ON sub.user_id = us.user_id
      WHERE us.current_streak > 0
        AND (
          us.last_check_in IS NULL
          OR us.last_check_in::text < ${today}
        )
        AND sub.user_email IS NOT NULL
      LIMIT 50
    `;

    return result.rows.map((row) => ({
      userId: row.user_id,
      email: row.user_email,
      streak: row.current_streak,
    }));
  } catch (error) {
    console.error('[Campaign Manager] Error getting missed streaks:', error);
    return [];
  }
}

export async function getMilestoneUsers(): Promise<
  Array<{
    userId: string;
    email: string;
    milestone: string;
  }>
> {
  try {
    // Check for 30 days since signup (using subscriptions table created_at)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await sql`
      SELECT sub.user_id, sub.user_email as email, sub.created_at
      FROM subscriptions sub
      WHERE sub.user_email IS NOT NULL
        AND sub.created_at >= ${thirtyDaysAgo.toISOString()}
        AND sub.created_at < ${new Date(thirtyDaysAgo.getTime() + 86400000).toISOString()}
      LIMIT 50
    `;

    return result.rows.map((row) => ({
      userId: row.user_id,
      email: row.user_email,
      milestone: "You've been on your cosmic journey for 30 days!",
    }));
  } catch (error) {
    console.error('[Campaign Manager] Error getting milestone users:', error);
    return [];
  }
}
