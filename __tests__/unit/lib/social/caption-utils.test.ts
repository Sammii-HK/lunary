import {
  buildFallbackCaption,
  validateCaption,
  validateSpokenHook,
} from '@/lib/social/caption-utils';

describe('caption utils', () => {
  it('rejects forbidden hook openings and word count violations', () => {
    const reasons = validateSpokenHook('Today we cover Mars retrograde.');
    expect(reasons.some((r) => r.includes('forbidden'))).toBe(true);
    const longHook =
      'Most people misunderstand the role of Mars retrograde timing shifts.';
    const longReasons = validateSpokenHook(longHook);
    expect(longReasons.some((r) => r.includes('6-12 words'))).toBe(false);
  });

  it('builds a 4-line fallback caption with required footer', () => {
    const caption = buildFallbackCaption({
      script: 'Mars retrograde slows decision making. Watch for delays.',
      themeName: 'Mars Wisdom',
      facetTitle: 'Mars Retrograde',
      facetFocus: 'timing and patience',
      platform: 'instagram',
    });
    const validation = validateCaption(caption, 'Mars Wisdom');
    expect(validation.lines.length).toBe(4);
    expect(validation.lines[3]).toBe('Read more on the Lunary blog.');
  });
});
