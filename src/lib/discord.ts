const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';
const DISCORD_WEBHOOK_ANALYTICS = process.env.DISCORD_WEBHOOK_ANALYTICS || '';
const DISCORD_WEBHOOK_URGENT = process.env.DISCORD_WEBHOOK_URGENT || '';
const DISCORD_WEBHOOK_TODO = process.env.DISCORD_WEBHOOK_TODO || '';
const DISCORD_WEBHOOK_GENERAL = process.env.DISCORD_WEBHOOK_GENERAL || '';
const DISCORD_WEBHOOK_USER_INTERACTIONS =
  process.env.DISCORD_WEBHOOK_USER_INTERACTIONS || '';

export type DiscordCategory =
  | 'analytics'
  | 'urgent'
  | 'todo'
  | 'general'
  | 'user_interactions'
  | 'default';

type DiscordField = {
  name: string;
  value: string;
  inline?: boolean;
};

export type DiscordColor = 'success' | 'error' | 'warning' | 'info';

type DiscordNotificationInput = {
  content?: string;
  title?: string;
  description?: string;
  url?: string;
  fields?: DiscordField[];
  footer?: string;
  username?: string;
  color?: DiscordColor | number;
  category?: DiscordCategory;
  dedupeKey?: string;
  minPriority?: 'low' | 'normal' | 'high' | 'emergency';
};

type DiscordSendResult =
  | { ok: true; status: number }
  | { ok: false; status?: number; skipped?: boolean; error?: string };

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const QUIET_HOURS_START = parseInt(
  process.env.DISCORD_QUIET_HOURS_START || '22',
);
const QUIET_HOURS_END = parseInt(process.env.DISCORD_QUIET_HOURS_END || '8');

const RATE_LIMITS: Record<DiscordCategory, number> = {
  urgent: Infinity,
  analytics: Infinity,
  todo: 5,
  general: 15,
  user_interactions: Infinity,
  default: 15,
};

const DEDUPE_TTLS: Record<DiscordCategory, number> = {
  urgent: 1 * 60 * 60 * 1000,
  analytics: 24 * 60 * 60 * 1000,
  todo: 24 * 60 * 60 * 1000,
  general: 24 * 60 * 60 * 1000,
  user_interactions: 0,
  default: 24 * 60 * 60 * 1000,
};

function getWebhookUrl(category: DiscordCategory): string {
  switch (category) {
    case 'analytics':
      return DISCORD_WEBHOOK_ANALYTICS || DISCORD_WEBHOOK_URL;
    case 'urgent':
      return DISCORD_WEBHOOK_URGENT || DISCORD_WEBHOOK_URL;
    case 'todo':
      return DISCORD_WEBHOOK_TODO || DISCORD_WEBHOOK_URL;
    case 'general':
      return DISCORD_WEBHOOK_GENERAL || DISCORD_WEBHOOK_URL;
    case 'user_interactions':
      return DISCORD_WEBHOOK_USER_INTERACTIONS || DISCORD_WEBHOOK_URL;
    default:
      return DISCORD_WEBHOOK_URL;
  }
}

async function checkDeduplication(
  dedupeKey: string,
  category: DiscordCategory,
): Promise<boolean> {
  if (category === 'urgent' || category === 'user_interactions') {
    return false;
  }

  try {
    const { sql } = await import('@vercel/postgres');
    const { formatTimestamp } = await import('@/lib/analytics/date-range');
    const ttl = DEDUPE_TTLS[category];
    const cutoff = new Date(Date.now() - ttl);
    const cutoffFormatted = formatTimestamp(cutoff);

    const result = await sql`
      SELECT COUNT(*) as count
      FROM discord_notification_log
      WHERE dedupe_key = ${dedupeKey}
      AND category = ${category}
      AND sent_at > ${cutoffFormatted}
    `;

    return parseInt(result.rows[0]?.count || '0') > 0;
  } catch (error) {
    console.error('[discord] Deduplication check failed:', error);
    return false;
  }
}

async function checkRateLimit(category: DiscordCategory): Promise<boolean> {
  if (category === 'urgent' || category === 'user_interactions') {
    return false;
  }

  const limit = RATE_LIMITS[category];
  if (limit === Infinity) {
    return false;
  }

  try {
    const { sql } = await import('@vercel/postgres');
    const { formatTimestamp } = await import('@/lib/analytics/date-range');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneHourAgoFormatted = formatTimestamp(oneHourAgo);

    const result = await sql`
      SELECT COUNT(*) as count
      FROM discord_notification_log
      WHERE category = ${category}
      AND sent_at > ${oneHourAgoFormatted}
    `;

    return parseInt(result.rows[0]?.count || '0') >= limit;
  } catch (error) {
    console.error('[discord] Rate limit check failed:', error);
    return false;
  }
}

function isQuietHours(): boolean {
  const now = new Date();
  const hour = now.getUTCHours();
  return hour >= QUIET_HOURS_START || hour < QUIET_HOURS_END;
}

async function logNotification(
  dedupeKey: string,
  category: DiscordCategory,
  title?: string,
  recipientCount: number = 0,
): Promise<void> {
  try {
    const { sql } = await import('@vercel/postgres');
    await sql`
      INSERT INTO discord_notification_log (dedupe_key, category, title, recipient_count)
      VALUES (${dedupeKey}, ${category}, ${title || null}, ${recipientCount})
      ON CONFLICT DO NOTHING
    `;
  } catch (error) {
    console.error('[discord] Failed to log notification:', error);
  }
}

async function shouldSendNotification(
  input: DiscordNotificationInput,
): Promise<{ shouldSend: boolean; reason?: string }> {
  const category = input.category || 'default';
  const webhookUrl = getWebhookUrl(category);

  if (!webhookUrl) {
    return { shouldSend: false, reason: 'No webhook configured' };
  }

  if (category === 'urgent') {
    return { shouldSend: true };
  }

  if (input.dedupeKey) {
    const isDuplicate = await checkDeduplication(input.dedupeKey, category);
    if (isDuplicate) {
      return {
        shouldSend: false,
        reason: 'Duplicate notification (recently sent)',
      };
    }
  }

  const isRateLimited = await checkRateLimit(category);
  if (isRateLimited) {
    return {
      shouldSend: false,
      reason: `Rate limit exceeded (${RATE_LIMITS[category]}/hour)`,
    };
  }

  if (category === 'analytics') {
    return { shouldSend: false, reason: 'Analytics queued for daily summary' };
  }

  // Quiet hours check (urgent notifications bypass this, already handled above)
  if (isQuietHours()) {
    return {
      shouldSend: false,
      reason: 'Quiet hours (10 PM - 8 AM UTC)',
    };
  }

  if (input.minPriority) {
    const priorityOrder = {
      low: 1,
      normal: 2,
      high: 3,
      emergency: 4,
    };
    const inputPriority =
      priorityOrder[input.minPriority as keyof typeof priorityOrder] || 2;
    if (inputPriority < 2) {
      return {
        shouldSend: false,
        reason: 'Priority too low (filtered)',
      };
    }
  }

  return { shouldSend: true };
}

export function isDiscordNotificationsEnabled(category?: DiscordCategory) {
  if (category) {
    return Boolean(getWebhookUrl(category));
  }
  return Boolean(DISCORD_WEBHOOK_URL);
}

export async function sendDiscordNotification(
  input: DiscordNotificationInput,
): Promise<DiscordSendResult> {
  const check = await shouldSendNotification(input);
  if (!check.shouldSend) {
    if (
      check.reason?.includes('Duplicate') ||
      check.reason?.includes('Rate limit')
    ) {
      console.log(`[discord] Skipped: ${check.reason}`);
    }

    const category = input.category || 'default';
    if (
      category === 'analytics' ||
      check.reason?.includes('Analytics queued')
    ) {
      await queueAnalyticsEvent({
        category: 'analytics',
        eventType: 'notification',
        title: input.title || 'Analytics Event',
        dedupeKey: input.dedupeKey,
        metadata: {
          description: input.description,
          url: input.url,
          fields: input.fields,
          skippedReason: check.reason,
        },
      });
    } else {
      await logAnalyticsEvent({
        category,
        eventType: 'skipped',
        title: input.title,
        dedupeKey: input.dedupeKey,
        skippedReason: check.reason,
        rateLimited: check.reason?.includes('Rate limit') || false,
        quietHoursSkipped: check.reason?.includes('Quiet hours') || false,
      });
    }

    return { ok: false, skipped: true };
  }

  const category = input.category || 'default';
  const webhookUrl = getWebhookUrl(category);
  if (!webhookUrl) {
    return { ok: false, skipped: true };
  }

  const categoryLabel =
    category && category !== 'default' ? `[${category.toUpperCase()}]` : '';

  const payload: Record<string, any> = {
    username: input.username || `Lunary Alerts ${categoryLabel}`.trim(),
    allowed_mentions: { parse: [] },
  };

  if (input.content) {
    payload.content = input.content;
  }

  if (input.title || input.description || input.fields?.length || input.url) {
    const colorMap: Record<DiscordColor, number> = {
      success: 0x00ff00,
      error: 0xff0000,
      warning: 0xffff00,
      info: 0x0099ff,
    };

    const embedColor =
      typeof input.color === 'number'
        ? input.color
        : input.color
          ? colorMap[input.color]
          : undefined;

    payload.embeds = [
      {
        title: input.title,
        description: input.description,
        url: input.url,
        fields: input.fields?.slice(0, 25),
        footer: input.footer ? { text: input.footer } : undefined,
        color: embedColor,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (input.dedupeKey) {
          await logNotification(
            input.dedupeKey,
            category,
            input.title,
            input.fields?.length || 0,
          );
        }

        await logAnalyticsEvent({
          category,
          eventType: 'sent',
          title: input.title,
          dedupeKey: input.dedupeKey,
        });

        return { ok: true, status: response.status };
      }

      const errorText = await response.text();
      console.error(
        `[discord] attempt ${attempt} failed (${response.status}):`,
        errorText,
      );

      if (attempt === 2) {
        await logAnalyticsEvent({
          category,
          eventType: 'failed',
          title: input.title,
          dedupeKey: input.dedupeKey,
          skippedReason: `HTTP ${response.status}`,
        });

        return {
          ok: false,
          status: response.status,
          error: `Discord webhook failed with status ${response.status}`,
        };
      }
    } catch (error) {
      console.error(`[discord] attempt ${attempt} error:`, error);
      if (attempt === 2) {
        await logAnalyticsEvent({
          category,
          eventType: 'failed',
          title: input.title,
          dedupeKey: input.dedupeKey,
          skippedReason:
            error instanceof Error ? error.message : 'Unknown error',
        });

        return {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : 'Unknown Discord webhook error',
        };
      }
    }

    await sleep(400);
  }

  return { ok: false, error: 'Discord webhook failed unexpectedly' };
}

export interface AdminNotificationInput {
  title: string;
  message: string;
  url?: string;
  priority?: 'low' | 'normal' | 'high' | 'emergency';
  fields?: DiscordField[];
  category?: DiscordCategory;
  dedupeKey?: string;
}

export async function sendDiscordAdminNotification(
  input: AdminNotificationInput,
): Promise<DiscordSendResult> {
  const colorMap: Record<string, DiscordColor> = {
    low: 'info',
    normal: 'info',
    high: 'warning',
    emergency: 'error',
  };

  const color = colorMap[input.priority || 'normal'] || 'info';

  const description = input.message
    .replace(/<b>/g, '**')
    .replace(/<\/b>/g, '**')
    .replace(/<i>/g, '*')
    .replace(/<\/i>/g, '*')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '');

  const category =
    input.category ||
    (input.priority === 'emergency' || input.priority === 'high'
      ? 'urgent'
      : undefined);

  return sendDiscordNotification({
    title: input.title,
    description,
    url: input.url,
    fields: input.fields,
    color,
    category,
    dedupeKey: input.dedupeKey,
    minPriority: input.priority === 'low' ? 'normal' : undefined,
  });
}

export interface AnalyticsEventInput {
  category: DiscordCategory;
  eventType: string;
  title?: string;
  dedupeKey?: string;
  metadata?: Record<string, any>;
}

export async function queueAnalyticsEvent(
  input: AnalyticsEventInput,
): Promise<void> {
  try {
    const { sql } = await import('@vercel/postgres');
    await sql`
      INSERT INTO discord_notification_analytics (
        category, event_type, title, dedupe_key, metadata
      )
      VALUES (
        ${input.category},
        ${input.eventType},
        ${input.title || null},
        ${input.dedupeKey || null},
        ${input.metadata ? JSON.stringify(input.metadata) : null}
      )
    `;
  } catch (error) {
    console.error('[discord] Failed to queue analytics event:', error);
  }
}

async function logAnalyticsEvent(
  input: AnalyticsEventInput & {
    skippedReason?: string;
    rateLimited?: boolean;
    quietHoursSkipped?: boolean;
  },
): Promise<void> {
  try {
    const { sql } = await import('@vercel/postgres');
    await sql`
      INSERT INTO discord_notification_analytics (
        category, event_type, title, dedupe_key, skipped_reason, rate_limited, quiet_hours_skipped
      )
      VALUES (
        ${input.category},
        ${input.eventType},
        ${input.title || null},
        ${input.dedupeKey || null},
        ${input.skippedReason || null},
        ${input.rateLimited || false},
        ${input.quietHoursSkipped || false}
      )
    `;
  } catch (error) {
    console.error('[discord] Failed to log analytics event:', error);
  }
}
