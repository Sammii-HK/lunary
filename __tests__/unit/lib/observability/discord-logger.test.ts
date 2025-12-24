import {
  isDuplicateLog,
  resetDiscordDedupe,
  sanitizeContext,
  shouldSample,
} from '@/lib/observability/discord-logger';

describe('discord logger utilities', () => {
  beforeEach(() => {
    resetDiscordDedupe();
  });

  it('samples info logs based on rate', () => {
    expect(shouldSample('info', 0, () => 0.1)).toBe(false);
    expect(shouldSample('info', 1, () => 0.9)).toBe(true);
    expect(shouldSample('warn', 0, () => 0.0)).toBe(true);
    expect(shouldSample('error', 0, () => 0.0)).toBe(true);
  });

  it('dedupes identical logs within the window', () => {
    const key = 'error|gpt_grimoire_bridge|Failed|venus|tarot|0|Error:boom';
    const now = 1_000_000;
    expect(isDuplicateLog(key, now)).toBe(false);
    expect(isDuplicateLog(key, now + 1_000)).toBe(true);
    expect(isDuplicateLog(key, now + 61_000)).toBe(false);
  });

  it('sanitizes sensitive context fields', () => {
    const sanitized = sanitizeContext({
      authorization: 'Bearer secret',
      cookie: 'session=secret',
      token: 'abc',
      ip: '127.0.0.1',
      userAgent: 'Mozilla',
      safe: 'ok',
    });

    expect(sanitized).toEqual({ safe: 'ok' });
  });
});
