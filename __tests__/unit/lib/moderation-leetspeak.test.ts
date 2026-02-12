import {
  containsBlockedContent,
  validateInsightText,
} from '@/lib/moon-circles/moderation';

describe('moderation leetspeak detection', () => {
  it('catches standard blocked phrases', () => {
    expect(containsBlockedContent('I want to kill myself')).toBe(true);
    expect(containsBlockedContent('suicide')).toBe(true);
    expect(containsBlockedContent('rape')).toBe(true);
  });

  it('catches leetspeak evasion', () => {
    expect(containsBlockedContent('k1ll myself')).toBe(true);
    expect(containsBlockedContent('su1c1de')).toBe(true);
    expect(containsBlockedContent('r@pe')).toBe(true);
    expect(containsBlockedContent('r4pe')).toBe(true);
    expect(containsBlockedContent('$uicide')).toBe(true);
    expect(containsBlockedContent('murd3r')).toBe(true);
  });

  it('catches separator evasion within words', () => {
    expect(containsBlockedContent('s-u-i-c-i-d-e')).toBe(true);
    expect(containsBlockedContent('r_a_p_e')).toBe(true);
    expect(containsBlockedContent('s.u.i.c.i.d.e')).toBe(true);
    expect(containsBlockedContent('m*u*r*d*e*r')).toBe(true);
  });

  it('is case insensitive', () => {
    expect(containsBlockedContent('SUICIDE')).toBe(true);
    expect(containsBlockedContent('Kill Myself')).toBe(true);
    expect(containsBlockedContent('K1LL MYSELF')).toBe(true);
  });

  it('allows legitimate content', () => {
    expect(containsBlockedContent('The moon is beautiful tonight')).toBe(false);
    expect(
      containsBlockedContent('Mercury retrograde is killing my vibes'),
    ).toBe(false);
    expect(containsBlockedContent('I feel great about my birth chart')).toBe(
      false,
    );
  });

  it('validates through validateInsightText', () => {
    const result = validateInsightText('su1c1de');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('passes valid text through validateInsightText', () => {
    const result = validateInsightText('What does my Saturn return mean?');
    expect(result.isValid).toBe(true);
  });

  it('rejects empty text through validateInsightText', () => {
    const result = validateInsightText('');
    expect(result.isValid).toBe(false);
  });
});
