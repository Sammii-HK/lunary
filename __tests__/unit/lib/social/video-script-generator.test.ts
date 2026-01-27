import {
  buildHookForTopic,
  sanitizeVideoScriptLines,
  validateVideoHook,
} from '@/lib/social/video-script-generator';

const countWords = (text: string) =>
  text
    .replace(/[.!?]+$/, '')
    .split(/\s+/)
    .filter(Boolean).length;

describe('video script hook validation', () => {
  it('builds a valid hook for New Moon', () => {
    const hook = buildHookForTopic('New Moon');
    const issues = validateVideoHook(hook, 'New Moon', 'new moon meaning');
    expect(issues.length).toBe(1);
    expect(hook).toContain('New Moon');
    const words = countWords(hook);
    expect(words).toBeGreaterThanOrEqual(8);
    expect(words).toBeLessThanOrEqual(14);
  });

  it('sanitizes truncated script lines', () => {
    const lines = [
      'The Moon moves through eight phases in 29.5 days, each.',
      'A stable second sentence is complete.',
    ];
    const sanitized = sanitizeVideoScriptLines(lines, {
      topic: 'The Moon',
      category: 'lunar',
      sourceSnippet: 'Lunar phases describe a repeating rhythm for attention.',
    });
    expect(sanitized).toHaveLength(2);
    expect(sanitized[0]).toMatch(/The Moon/);
    expect(sanitized[0]).not.toMatch(/(each\.|the\.|begin at\.|:\s*$)/i);
    sanitized.forEach((line) => {
      expect(/(each\.|the\.|begin at\.|:\s*$)/i.test(line)).toBe(false);
    });
  });
});
