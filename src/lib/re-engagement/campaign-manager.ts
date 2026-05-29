import { sql } from '@vercel/postgres';

export type CampaignType =
  | '7days_inactive'
  | '14days_inactive'
  | '30days_inactive'
  | 'missed_streak'
  | 'milestone'
  | 'insights_ready'
  | 'free_2days_inactive'
  | 'free_7days_inactive'
  | 'free_14days_inactive'
  | 'free_major_transit'
  | 'winback_30d'
  | 'weekly_reading';

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

export interface DormantFreeUser {
  userId: string;
  email: string;
  name: string | null;
  birthChart: unknown;
}

/**
 * Dormant free-user selection for reactivation.
 *
 * This is the canonical query for the reactivation sequence. It does NOT lean
 * on subscriptions.created_at or subscriptions.updated_at: a cold or dormant
 * user is, by definition, someone whose row stopped changing, so a
 * created_at-anchored drip (the welcome-drip cron) will never pick them up.
 * Instead we select on real activity recency in user_sessions.
 *
 * A user qualifies when:
 *   - they are on the free tier
 *   - they have activated at least once (>=1 session, filters bot/ghost rows)
 *   - they have had NO session in the last `daysInactive` days
 *   - they DID have a session inside an outer window (`maxDaysInactive`), so we
 *     only target the recently-dormant pool and never email truly ancient or
 *     never-activated addresses. Pass `null` to disable the outer bound.
 *
 * @param daysInactive    minimum days of silence to qualify (inner cutoff)
 * @param maxDaysInactive outer cutoff: ignore users dormant longer than this
 * @param limit           batch size per run
 */
export async function getDormantFreeUsers(
  daysInactive: number,
  maxDaysInactive: number | null = null,
  limit: number = 100,
): Promise<DormantFreeUser[]> {
  try {
    const innerCutoff = new Date();
    innerCutoff.setDate(innerCutoff.getDate() - daysInactive);

    const outerCutoff = new Date();
    if (maxDaysInactive !== null) {
      outerCutoff.setDate(outerCutoff.getDate() - maxDaysInactive);
    }

    const result = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email AS email,
        s.user_name AS name,
        up.birth_chart
      FROM subscriptions s
      LEFT JOIN user_profiles up ON s.user_id = up.user_id
      WHERE s.user_email IS NOT NULL
        AND s.status = 'free'
        AND EXISTS (
          SELECT 1 FROM user_sessions us2
          WHERE us2.user_id = s.user_id
        )
        AND NOT EXISTS (
          SELECT 1 FROM user_sessions us
          WHERE us.user_id = s.user_id
            AND us.session_timestamp >= ${innerCutoff.toISOString()}
        )
        AND (
          ${maxDaysInactive === null}
          OR EXISTS (
            SELECT 1 FROM user_sessions us3
            WHERE us3.user_id = s.user_id
              AND us3.session_timestamp >= ${outerCutoff.toISOString()}
          )
        )
      LIMIT ${limit}
    `;

    return result.rows.map((row) => ({
      userId: row.user_id,
      email: row.email,
      name: row.name ?? null,
      birthChart: row.birth_chart,
    }));
  } catch (error) {
    console.error(
      '[Campaign Manager] Error getting dormant free users:',
      error,
    );
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
