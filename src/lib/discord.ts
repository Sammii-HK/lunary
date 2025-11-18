const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

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
};

type DiscordSendResult =
  | { ok: true; status: number }
  | { ok: false; status?: number; skipped?: boolean; error?: string };

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export function isDiscordNotificationsEnabled() {
  return Boolean(DISCORD_WEBHOOK_URL);
}

export async function sendDiscordNotification(
  input: DiscordNotificationInput,
): Promise<DiscordSendResult> {
  if (!DISCORD_WEBHOOK_URL) {
    return { ok: false, skipped: true };
  }

  const payload: Record<string, any> = {
    username: input.username || 'Lunary Alerts',
    allowed_mentions: { parse: [] },
  };

  if (input.content) {
    payload.content = input.content;
  }

  if (input.title || input.description || input.fields?.length || input.url) {
    const colorMap: Record<DiscordColor, number> = {
      success: 0x00ff00, // Green
      error: 0xff0000, // Red
      warning: 0xffff00, // Yellow
      info: 0x0099ff, // Blue
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
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return { ok: true, status: response.status };
      }

      const errorText = await response.text();
      console.error(
        `[discord] attempt ${attempt} failed (${response.status}):`,
        errorText,
      );

      if (attempt === 2) {
        return {
          ok: false,
          status: response.status,
          error: `Discord webhook failed with status ${response.status}`,
        };
      }
    } catch (error) {
      console.error(`[discord] attempt ${attempt} error:`, error);
      if (attempt === 2) {
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

  return sendDiscordNotification({
    title: input.title,
    description,
    url: input.url,
    fields: input.fields,
    color,
  });
}
