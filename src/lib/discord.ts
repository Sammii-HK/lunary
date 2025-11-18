const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

type DiscordField = {
  name: string;
  value: string;
  inline?: boolean;
};

type DiscordNotificationInput = {
  content?: string;
  title?: string;
  description?: string;
  url?: string;
  fields?: DiscordField[];
  footer?: string;
  username?: string;
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
    payload.embeds = [
      {
        title: input.title,
        description: input.description,
        url: input.url,
        fields: input.fields?.slice(0, 25),
        footer: input.footer ? { text: input.footer } : undefined,
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
