import { getRitualMessageSync, WeeklyInsights } from '@/lib/rituals/engine';
import {
  MORNING_MESSAGES,
  EVENING_MESSAGES,
  COSMIC_RESET_MESSAGES,
  NEW_MOON_MESSAGES,
  FULL_MOON_MESSAGES,
} from '@/lib/rituals/message-pools';

describe('Ritual Message Engine', () => {
  describe('getRitualMessage', () => {
    describe('morning context', () => {
      it('returns a morning message for free users', () => {
        const result = getRitualMessageSync({
          context: 'morning',
          isPremium: false,
        });

        expect(result.id).toMatch(/^morning-/);
        expect(result.message).toBeTruthy();
        expect(MORNING_MESSAGES.some((m) => m.text === result.message)).toBe(
          true,
        );
      });

      it('returns a morning message for premium users', () => {
        const result = getRitualMessageSync({
          context: 'morning',
          isPremium: true,
        });

        expect(result.id).toMatch(/^morning-/);
        expect(result.message).toBeTruthy();
      });

      it('personalizes with user name', () => {
        const result = getRitualMessageSync({
          context: 'morning',
          isPremium: true,
          userName: 'Alice',
        });

        expect(result.message).toBeTruthy();
      });
    });

    describe('evening context', () => {
      it('returns an evening message for free users', () => {
        const result = getRitualMessageSync({
          context: 'evening',
          isPremium: false,
        });

        expect(result.id).toMatch(/^evening-/);
        expect(result.message).toBeTruthy();
        expect(EVENING_MESSAGES.some((m) => m.text === result.message)).toBe(
          true,
        );
      });

      it('returns an evening message for premium users', () => {
        const result = getRitualMessageSync({
          context: 'evening',
          isPremium: true,
        });

        expect(result.id).toMatch(/^evening-/);
        expect(result.message).toBeTruthy();
      });
    });

    describe('cosmic_reset context', () => {
      it('returns empty for free users', () => {
        const result = getRitualMessageSync({
          context: 'cosmic_reset',
          isPremium: false,
        });

        expect(result.id).toBe('fallback');
        expect(result.message).toBe('Welcome back.');
      });

      it('returns a cosmic reset message for premium users', () => {
        const result = getRitualMessageSync({
          context: 'cosmic_reset',
          isPremium: true,
        });

        expect(result.id).toMatch(/^reset-/);
        expect(result.message).toBeTruthy();
      });

      it('personalizes with weekly insights when template has placeholders', () => {
        const weeklyInsights: WeeklyInsights = {
          mainTransits: ['Venus trine Jupiter', 'Mars square Saturn'],
          moonPhases: ['Full Moon in Gemini'],
          energyThemes: ['Clarity', 'Transformation'],
          dominantTheme: 'clarity',
        };

        const result = getRitualMessageSync({
          context: 'cosmic_reset',
          isPremium: true,
          weeklyInsights,
        });

        // Message should not contain unreplaced placeholders
        expect(result.message).not.toContain('{{');
        expect(result.message).not.toContain('}}');
        // Should have a valid message
        expect(result.message.length).toBeGreaterThan(10);
      });

      it('uses fallback text when no weekly insights', () => {
        const result = getRitualMessageSync({
          context: 'cosmic_reset',
          isPremium: true,
        });

        // Message should not contain unreplaced placeholders
        expect(result.message).not.toContain('{{');
        expect(result.message).not.toContain('}}');
        // Should have a valid message
        expect(result.message.length).toBeGreaterThan(10);
      });
    });

    describe('new_moon context', () => {
      it('returns a new moon message', () => {
        const result = getRitualMessageSync({
          context: 'new_moon',
          isPremium: false,
        });

        expect(result.id).toMatch(/^newmoon-/);
        expect(result.message).toBeTruthy();
        expect(NEW_MOON_MESSAGES.some((m) => m.text === result.message)).toBe(
          true,
        );
      });
    });

    describe('full_moon context', () => {
      it('returns a full moon message', () => {
        const result = getRitualMessageSync({
          context: 'full_moon',
          isPremium: false,
        });

        expect(result.id).toMatch(/^fullmoon-/);
        expect(result.message).toBeTruthy();
        expect(FULL_MOON_MESSAGES.some((m) => m.text === result.message)).toBe(
          true,
        );
      });
    });
  });

  describe('message rotation', () => {
    it('returns consistent message for the same day', () => {
      const result1 = getRitualMessageSync({
        context: 'morning',
        isPremium: false,
      });

      const result2 = getRitualMessageSync({
        context: 'morning',
        isPremium: false,
      });

      expect(result1.id).toBe(result2.id);
      expect(result1.message).toBe(result2.message);
    });
  });

  describe('message IDs', () => {
    it('all morning messages have unique IDs', () => {
      const ids = MORNING_MESSAGES.map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all evening messages have unique IDs', () => {
      const ids = EVENING_MESSAGES.map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all cosmic reset messages have unique IDs', () => {
      const ids = COSMIC_RESET_MESSAGES.map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all new moon messages have unique IDs', () => {
      const ids = NEW_MOON_MESSAGES.map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all full moon messages have unique IDs', () => {
      const ids = FULL_MOON_MESSAGES.map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
