import { sql } from '@vercel/postgres';
import { randomUUID } from 'node:crypto';

type ActivityType =
  | 'session'
  | 'ai_chat'
  | 'tarot'
  | 'moon_circle'
  | 'collection'
  | 'birth_chart'
  | 'cosmic_state'
  | 'notification'
  | 'conversion';

type NotificationType =
  | 'cosmic_pulse'
  | 'moon_circle'
  | 'cosmic_changes'
  | 'weekly_report'
  | string;

export interface TrackActivityInput {
  userId: string;
  activityType: ActivityType | string;
  activityDate?: Date | string;
  count?: number;
  metadata?: Record<string, any>;
}

export interface StartAiSessionInput {
  userId: string;
  mode?: string;
}

export interface EndAiSessionInput {
  sessionId: string;
  messageCount?: number;
  tokenCount?: number;
  completed?: boolean;
}

export interface RecordAiInteractionInput {
  userId: string;
  mode?: string;
  tokensIn: number;
  tokensOut: number;
  messageCount?: number;
  completed?: boolean;
  metadata?: Record<string, any>;
}

export interface TrackConversionInput {
  userId: string;
  conversionType: 'free_to_paid' | 'trial_to_paid' | 'upgrade' | string;
  fromPlan?: string | null;
  toPlan?: string | null;
  triggerFeature?: string | null;
  daysToConvert?: number | null;
  metadata?: Record<string, any>;
}

export interface TrackNotificationEventInput {
  userId: string;
  notificationType: NotificationType;
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked';
  notificationId?: string;
  metadata?: Record<string, any>;
}

const toISODate = (value?: Date | string) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid activity date');
  }
  return date.toISOString().slice(0, 10);
};

const toJson = (value?: Record<string, any>) =>
  value ? JSON.stringify(value) : null;

export async function trackActivity({
  userId,
  activityType,
  activityDate,
  count = 1,
  metadata,
}: TrackActivityInput) {
  // No-op: Activity tracking now handled by PostHog client-side
  // This function is kept for backwards compatibility with existing callers
  return;
}

export async function startAiSession({
  userId,
  mode,
}: StartAiSessionInput): Promise<string> {
  const sessionId = randomUUID();
  await sql`
    INSERT INTO analytics_ai_usage (
      user_id,
      session_id,
      message_count,
      token_count,
      mode,
      completed,
      created_at
    ) VALUES (
      ${userId},
      ${sessionId},
      0,
      0,
      ${mode || null},
      false,
      NOW()
    )
    ON CONFLICT (session_id) DO NOTHING
  `;

  return sessionId;
}

export async function endAiSession({
  sessionId,
  messageCount = 0,
  tokenCount = 0,
  completed = true,
}: EndAiSessionInput) {
  await sql`
    UPDATE analytics_ai_usage
    SET
      message_count = ${messageCount},
      token_count = ${tokenCount},
      completed = ${completed},
      completed_at = NOW()
    WHERE session_id = ${sessionId}
  `;
}

export async function recordAiInteraction({
  userId,
  mode,
  tokensIn,
  tokensOut,
  messageCount = 2,
  completed = true,
  metadata,
}: RecordAiInteractionInput) {
  const sessionId = await startAiSession({ userId, mode });
  await endAiSession({
    sessionId,
    messageCount,
    tokenCount: tokensIn + tokensOut,
    completed,
  });

  await trackActivity({
    userId,
    activityType: 'ai_chat',
    metadata: {
      ...metadata,
      session_id: sessionId,
      mode,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
      message_count: messageCount,
    },
  });

  return sessionId;
}

export async function trackConversionEvent({
  userId,
  conversionType,
  fromPlan,
  toPlan,
  triggerFeature,
  daysToConvert,
  metadata,
}: TrackConversionInput) {
  await sql`
    INSERT INTO analytics_conversions (
      user_id,
      conversion_type,
      from_plan,
      to_plan,
      trigger_feature,
      days_to_convert,
      metadata
    ) VALUES (
      ${userId},
      ${conversionType},
      ${fromPlan || null},
      ${toPlan || null},
      ${triggerFeature || null},
      ${typeof daysToConvert === 'number' ? daysToConvert : null},
      ${toJson(metadata)}
    )
  `;

  await trackActivity({
    userId,
    activityType: 'conversion',
    metadata: {
      conversion_type: conversionType,
      trigger_feature: triggerFeature,
    },
  });
}

export async function trackNotificationEvent({
  userId,
  notificationType,
  eventType,
  notificationId,
  metadata,
}: TrackNotificationEventInput) {
  await sql`
    INSERT INTO analytics_notification_events (
      user_id,
      notification_type,
      event_type,
      notification_id,
      metadata
    ) VALUES (
      ${userId},
      ${notificationType},
      ${eventType},
      ${notificationId || null},
      ${toJson(metadata)}
    )
  `;

  if (eventType === 'opened' || eventType === 'clicked') {
    await trackActivity({
      userId,
      activityType: 'notification',
      metadata: {
        notification_type: notificationType,
        event_type: eventType,
      },
    });
  }
}

export async function recordFeatureUsage(
  options: TrackActivityInput & {
    feature: string;
  },
) {
  const { feature, ...rest } = options;
  await trackActivity({
    ...rest,
    activityType: `feature:${feature}`,
    metadata: {
      ...(rest.metadata || {}),
      feature,
    },
  });
}

export interface TrackDiscordInteractionInput {
  discordId: string;
  lunaryUserId?: string;
  interactionType:
    | 'command'
    | 'button_click'
    | 'account_linked'
    | 'account_created';
  commandName?: string;
  buttonAction?: string;
  destinationUrl?: string;
  feature?: string;
  campaign?: string;
  metadata?: Record<string, any>;
}

export async function trackDiscordInteraction(
  input: TrackDiscordInteractionInput,
) {
  try {
    await sql`
      INSERT INTO analytics_discord_interactions (
        discord_id,
        lunary_user_id,
        interaction_type,
        command_name,
        button_action,
        destination_url,
        feature,
        campaign,
        metadata
      ) VALUES (
        ${input.discordId},
        ${input.lunaryUserId || null},
        ${input.interactionType},
        ${input.commandName || null},
        ${input.buttonAction || null},
        ${input.destinationUrl || null},
        ${input.feature || null},
        ${input.campaign || null},
        ${input.metadata ? JSON.stringify(input.metadata) : null}
      )
    `;

    // Also track as user activity if lunary_user_id exists
    if (input.lunaryUserId && input.interactionType === 'command') {
      await trackActivity({
        userId: input.lunaryUserId,
        activityType: `discord_${input.commandName || 'interaction'}`,
        metadata: {
          discord_id: input.discordId,
          source: 'discord',
          feature: input.feature,
          campaign: input.campaign,
        },
      });
    }
  } catch (error) {
    console.error('[analytics] Failed to track Discord interaction:', error);
  }
}
