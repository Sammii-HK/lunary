import {
  detectMilestones,
  getDaysUntilBirthday,
} from '@/utils/milestones/detection';

describe('milestones/detection', () => {
  const baseUser = {
    userId: 'user-1',
    birthday: null as string | null,
    birthChart: null as Record<string, { sign?: string }> | null,
    signupAt: null as string | null,
    tarotReadingCount: 0,
    journalCount: 0,
    longestStreak: 0,
    currentStreak: 0,
  };

  const baseCosmic = {
    currentMoonSign: undefined as string | undefined,
    currentDate: new Date('2026-03-15'),
  };

  describe('reading count milestones', () => {
    it('detects 10 readings milestone', () => {
      const user = { ...baseUser, tarotReadingCount: 12 };
      const milestones = detectMilestones(user, baseCosmic);
      const reading10 = milestones.find(
        (m) => m.definition.key === '10_tarot_readings',
      );
      expect(reading10).toBeDefined();
      expect(reading10!.definition.type).toBe('reading_count');
    });

    it('detects multiple reading milestones at once', () => {
      const user = { ...baseUser, tarotReadingCount: 55 };
      const milestones = detectMilestones(user, baseCosmic);
      const readingMilestones = milestones.filter(
        (m) => m.definition.type === 'reading_count',
      );
      // Should have 10, 25, 50
      expect(readingMilestones.length).toBe(3);
    });

    it('does not detect milestones below threshold', () => {
      const user = { ...baseUser, tarotReadingCount: 5 };
      const milestones = detectMilestones(user, baseCosmic);
      const readingMilestones = milestones.filter(
        (m) => m.definition.type === 'reading_count',
      );
      expect(readingMilestones.length).toBe(0);
    });
  });

  describe('journal count milestones', () => {
    it('detects 25 journal entries milestone', () => {
      const user = { ...baseUser, journalCount: 30 };
      const milestones = detectMilestones(user, baseCosmic);
      const journal = milestones.filter(
        (m) => m.definition.type === 'journal_count',
      );
      // Should have 10 and 25
      expect(journal.length).toBe(2);
    });
  });

  describe('streak milestones', () => {
    it('detects streak from longestStreak', () => {
      const user = { ...baseUser, longestStreak: 35, currentStreak: 5 };
      const milestones = detectMilestones(user, baseCosmic);
      const streaks = milestones.filter((m) => m.definition.type === 'streak');
      // 7 and 30 day streaks
      expect(streaks.length).toBe(2);
    });

    it('uses max of currentStreak and longestStreak', () => {
      const user = { ...baseUser, longestStreak: 5, currentStreak: 40 };
      const milestones = detectMilestones(user, baseCosmic);
      const streaks = milestones.filter((m) => m.definition.type === 'streak');
      // 7 and 30
      expect(streaks.length).toBe(2);
    });
  });

  describe('app anniversary milestones', () => {
    it('detects 1 month anniversary', () => {
      const user = {
        ...baseUser,
        signupAt: '2026-01-15',
      };
      const cosmic = { ...baseCosmic, currentDate: new Date('2026-03-15') };
      const milestones = detectMilestones(user, cosmic);
      const anniversary = milestones.find(
        (m) => m.definition.type === 'app_anniversary',
      );
      expect(anniversary).toBeDefined();
    });

    it('detects 6 and 12 month anniversaries', () => {
      const user = {
        ...baseUser,
        signupAt: '2025-01-15',
      };
      const cosmic = { ...baseCosmic, currentDate: new Date('2026-03-15') };
      const milestones = detectMilestones(user, cosmic);
      const anniversaries = milestones.filter(
        (m) => m.definition.type === 'app_anniversary',
      );
      // 1, 6, 12 months (14 months since signup)
      expect(anniversaries.length).toBe(3);
    });

    it('does not detect anniversary without signupAt', () => {
      const milestones = detectMilestones(baseUser, baseCosmic);
      const anniversary = milestones.filter(
        (m) => m.definition.type === 'app_anniversary',
      );
      expect(anniversary.length).toBe(0);
    });
  });

  describe('solar return detection', () => {
    it('detects birthday in 7 days', () => {
      const user = { ...baseUser, birthday: '1990-03-22' };
      const cosmic = { ...baseCosmic, currentDate: new Date('2026-03-15') };
      const milestones = detectMilestones(user, cosmic);
      const solarReturn = milestones.find(
        (m) => m.definition.type === 'solar_return',
      );
      expect(solarReturn).toBeDefined();
      expect(solarReturn!.data.daysUntil).toBe(7);
    });

    it('detects birthday in 3 days', () => {
      const user = { ...baseUser, birthday: '1990-03-18' };
      const cosmic = { ...baseCosmic, currentDate: new Date('2026-03-15') };
      const milestones = detectMilestones(user, cosmic);
      const solarReturn = milestones.find(
        (m) => m.definition.type === 'solar_return',
      );
      expect(solarReturn).toBeDefined();
      expect(solarReturn!.data.daysUntil).toBe(3);
    });

    it('detects birthday today', () => {
      const user = { ...baseUser, birthday: '1990-03-15' };
      const cosmic = { ...baseCosmic, currentDate: new Date('2026-03-15') };
      const milestones = detectMilestones(user, cosmic);
      const solarReturn = milestones.find(
        (m) => m.definition.type === 'solar_return',
      );
      expect(solarReturn).toBeDefined();
      expect(solarReturn!.data.daysUntil).toBe(0);
    });

    it('does not detect birthday on other days', () => {
      const user = { ...baseUser, birthday: '1990-03-25' };
      const cosmic = { ...baseCosmic, currentDate: new Date('2026-03-15') };
      const milestones = detectMilestones(user, cosmic);
      const solarReturn = milestones.find(
        (m) => m.definition.type === 'solar_return',
      );
      expect(solarReturn).toBeUndefined();
    });
  });

  describe('lunar return detection', () => {
    it('detects when current moon matches natal moon', () => {
      const user = {
        ...baseUser,
        birthChart: { Moon: { sign: 'Cancer' } },
      };
      const cosmic = {
        ...baseCosmic,
        currentMoonSign: 'Cancer',
      };
      const milestones = detectMilestones(user, cosmic);
      const lunarReturn = milestones.find(
        (m) => m.definition.type === 'lunar_return',
      );
      expect(lunarReturn).toBeDefined();
      expect(lunarReturn!.data.natalMoonSign).toBe('Cancer');
    });

    it('does not detect when moon signs do not match', () => {
      const user = {
        ...baseUser,
        birthChart: { Moon: { sign: 'Cancer' } },
      };
      const cosmic = {
        ...baseCosmic,
        currentMoonSign: 'Aries',
      };
      const milestones = detectMilestones(user, cosmic);
      const lunarReturn = milestones.find(
        (m) => m.definition.type === 'lunar_return',
      );
      expect(lunarReturn).toBeUndefined();
    });

    it('does not detect without birth chart', () => {
      const cosmic = {
        ...baseCosmic,
        currentMoonSign: 'Cancer',
      };
      const milestones = detectMilestones(baseUser, cosmic);
      const lunarReturn = milestones.find(
        (m) => m.definition.type === 'lunar_return',
      );
      expect(lunarReturn).toBeUndefined();
    });
  });

  describe('getDaysUntilBirthday', () => {
    it('returns 0 for birthday today', () => {
      // Use local-time constructor to avoid UTC/local timezone mismatch
      const now = new Date(2026, 5, 15, 0, 0, 0); // June 15
      const result = getDaysUntilBirthday('June 15, 1990', now);
      expect(result).toBe(0);
    });

    it('returns positive days for upcoming birthday', () => {
      const now = new Date(2026, 5, 15, 0, 0, 0); // June 15
      const result = getDaysUntilBirthday('June 20, 1990', now);
      expect(result).toBe(5);
    });

    it('wraps to next year if birthday has passed', () => {
      const now = new Date(2026, 5, 15, 0, 0, 0); // June 15
      const result = getDaysUntilBirthday('January 1, 1990', now);
      expect(result).not.toBeNull();
      expect(result!).toBeGreaterThan(0);
      expect(result!).toBeLessThanOrEqual(366);
    });

    it('returns null for invalid date', () => {
      expect(getDaysUntilBirthday('not-a-date', new Date())).toBeNull();
    });
  });
});
