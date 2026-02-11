import { describe, it, expect } from '@jest/globals';
import { getSurvivalContent } from '@/lib/retrograde/survival-content';

describe('getSurvivalContent', () => {
  it('returns content for day 1', () => {
    const content = getSurvivalContent(1);
    expect(content.dos).toHaveLength(3);
    expect(content.donts).toHaveLength(3);
    expect(content.journalPrompt).toBeTruthy();
    expect(content.tip).toBeTruthy();
  });

  it('returns different content for different days', () => {
    const day1 = getSurvivalContent(1);
    const day2 = getSurvivalContent(2);
    expect(day1.journalPrompt).not.toBe(day2.journalPrompt);
  });

  it('cycles content for days beyond the array length', () => {
    const day1 = getSurvivalContent(1);
    const day8 = getSurvivalContent(8); // 7 entries, so day 8 = day 1
    expect(day1.journalPrompt).toBe(day8.journalPrompt);
  });

  it('handles day 0 gracefully', () => {
    const content = getSurvivalContent(0);
    expect(content.dos).toBeDefined();
    expect(content.donts).toBeDefined();
  });

  it('handles negative days gracefully', () => {
    const content = getSurvivalContent(-1);
    expect(content.dos).toBeDefined();
    expect(content.donts).toBeDefined();
  });

  it('every day has exactly 3 dos and 3 donts', () => {
    for (let day = 1; day <= 7; day++) {
      const content = getSurvivalContent(day);
      expect(content.dos).toHaveLength(3);
      expect(content.donts).toHaveLength(3);
    }
  });
});
