const originalWebhook = process.env.DISCORD_WEBHOOK_URL;
const originalFetch = global.fetch;

const setFetchMock = () => {
  const fetchMock = jest.fn();
  (global as any).fetch = fetchMock;
  return fetchMock;
};

const resetEnvironment = () => {
  process.env.DISCORD_WEBHOOK_URL = originalWebhook;
  if (originalFetch) {
    global.fetch = originalFetch;
  } else {
    delete (global as any).fetch;
  }
};

describe('sendDiscordNotification', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    resetEnvironment();
  });

  it('returns skipped response when webhook is not configured', async () => {
    process.env.DISCORD_WEBHOOK_URL = '';
    const { sendDiscordNotification } = await import('@/lib/discord');

    const result = await sendDiscordNotification({
      title: 'Test',
      description: 'Testing skip path',
    });

    expect(result.skipped).toBe(true);
    expect(result.ok).toBe(false);
  });

  it('posts to Discord webhook when configured', async () => {
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.test/webhook';
    const fetchMock = setFetchMock();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
      text: async () => '',
    });

    const { sendDiscordNotification } = await import('@/lib/discord');

    const result = await sendDiscordNotification({
      content: 'Cosmic alert triggered',
      title: 'Lunar Event',
      description: 'Full Moon in Taurus',
      fields: [{ name: 'Priority', value: '10', inline: true }],
    });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://discord.test/webhook');

    const body = JSON.parse(options.body);
    expect(body.content).toBe('Cosmic alert triggered');
    expect(body.username).toBe('Lunary Alerts');
    expect(body.allowed_mentions).toEqual({ parse: [] });
    expect(body.embeds[0].title).toBe('Lunar Event');
    expect(body.embeds[0].fields[0]).toEqual({
      name: 'Priority',
      value: '10',
      inline: true,
    });
  });

  it('retries once when Discord responds with an error', async () => {
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.test/webhook';
    const fetchMock = setFetchMock();
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Error',
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        text: async () => '',
      });

    const { sendDiscordNotification } = await import('@/lib/discord');

    const result = await sendDiscordNotification({
      title: 'Retry Event',
      description: 'Attempt twice',
    });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
