import {
  MORNING_MESSAGES,
  EVENING_MESSAGES,
  COSMIC_RESET_MESSAGES,
  NEW_MOON_MESSAGES,
  FULL_MOON_MESSAGES,
  MESSAGE_POOLS,
  RitualMessage,
} from '@/lib/rituals/message-pools';

describe('Ritual Message Pools', () => {
  describe('MORNING_MESSAGES', () => {
    it('has at least 20 messages', () => {
      expect(MORNING_MESSAGES.length).toBeGreaterThanOrEqual(20);
    });

    it('all messages have required properties', () => {
      MORNING_MESSAGES.forEach((message: RitualMessage) => {
        expect(message.id).toBeTruthy();
        expect(message.text).toBeTruthy();
        expect(typeof message.id).toBe('string');
        expect(typeof message.text).toBe('string');
      });
    });

    it('all IDs start with morning-', () => {
      MORNING_MESSAGES.forEach((message: RitualMessage) => {
        expect(message.id).toMatch(/^morning-/);
      });
    });

    it('no message contains spam or promotional language', () => {
      const spamPatterns = [
        /buy/i,
        /subscribe/i,
        /upgrade/i,
        /discount/i,
        /offer/i,
      ];
      MORNING_MESSAGES.forEach((message: RitualMessage) => {
        spamPatterns.forEach((pattern) => {
          expect(message.text).not.toMatch(pattern);
        });
      });
    });
  });

  describe('EVENING_MESSAGES', () => {
    it('has at least 15 messages', () => {
      expect(EVENING_MESSAGES.length).toBeGreaterThanOrEqual(15);
    });

    it('all messages have required properties', () => {
      EVENING_MESSAGES.forEach((message: RitualMessage) => {
        expect(message.id).toBeTruthy();
        expect(message.text).toBeTruthy();
      });
    });

    it('all IDs start with evening-', () => {
      EVENING_MESSAGES.forEach((message: RitualMessage) => {
        expect(message.id).toMatch(/^evening-/);
      });
    });
  });

  describe('COSMIC_RESET_MESSAGES', () => {
    it('has at least 10 messages', () => {
      expect(COSMIC_RESET_MESSAGES.length).toBeGreaterThanOrEqual(10);
    });

    it('all messages have required properties', () => {
      COSMIC_RESET_MESSAGES.forEach((message: RitualMessage) => {
        expect(message.id).toBeTruthy();
        expect(message.text).toBeTruthy();
      });
    });

    it('all IDs start with reset-', () => {
      COSMIC_RESET_MESSAGES.forEach((message: RitualMessage) => {
        expect(message.id).toMatch(/^reset-/);
      });
    });

    it('all messages contain personalization placeholders', () => {
      COSMIC_RESET_MESSAGES.forEach((message: RitualMessage) => {
        const hasPlaceholder =
          message.text.includes('{{mainTransits}}') ||
          message.text.includes('{{moonPhases}}') ||
          message.text.includes('{{dominantTheme}}');
        expect(hasPlaceholder).toBe(true);
      });
    });
  });

  describe('NEW_MOON_MESSAGES', () => {
    it('has at least 15 messages', () => {
      expect(NEW_MOON_MESSAGES.length).toBeGreaterThanOrEqual(15);
    });

    it('all messages have required properties', () => {
      NEW_MOON_MESSAGES.forEach((message: RitualMessage) => {
        expect(message.id).toBeTruthy();
        expect(message.text).toBeTruthy();
      });
    });

    it('all IDs start with newmoon-', () => {
      NEW_MOON_MESSAGES.forEach((message: RitualMessage) => {
        expect(message.id).toMatch(/^newmoon-/);
      });
    });
  });

  describe('FULL_MOON_MESSAGES', () => {
    it('has at least 15 messages', () => {
      expect(FULL_MOON_MESSAGES.length).toBeGreaterThanOrEqual(15);
    });

    it('all messages have required properties', () => {
      FULL_MOON_MESSAGES.forEach((message: RitualMessage) => {
        expect(message.id).toBeTruthy();
        expect(message.text).toBeTruthy();
      });
    });

    it('all IDs start with fullmoon-', () => {
      FULL_MOON_MESSAGES.forEach((message: RitualMessage) => {
        expect(message.id).toMatch(/^fullmoon-/);
      });
    });
  });

  describe('MESSAGE_POOLS', () => {
    it('exports all message pools', () => {
      expect(MESSAGE_POOLS.morning).toBe(MORNING_MESSAGES);
      expect(MESSAGE_POOLS.evening).toBe(EVENING_MESSAGES);
      expect(MESSAGE_POOLS.cosmic_reset).toBe(COSMIC_RESET_MESSAGES);
      expect(MESSAGE_POOLS.new_moon).toBe(NEW_MOON_MESSAGES);
      expect(MESSAGE_POOLS.full_moon).toBe(FULL_MOON_MESSAGES);
    });

    it('all pools are non-empty', () => {
      Object.values(MESSAGE_POOLS).forEach((pool) => {
        expect(pool.length).toBeGreaterThan(0);
      });
    });
  });

  describe('message quality', () => {
    const allMessages = [
      ...MORNING_MESSAGES,
      ...EVENING_MESSAGES,
      ...COSMIC_RESET_MESSAGES,
      ...NEW_MOON_MESSAGES,
      ...FULL_MOON_MESSAGES,
    ];

    it('no messages are too short', () => {
      allMessages.forEach((message: RitualMessage) => {
        expect(message.text.length).toBeGreaterThan(20);
      });
    });

    it('no messages are too long', () => {
      allMessages.forEach((message: RitualMessage) => {
        expect(message.text.length).toBeLessThan(500);
      });
    });

    it('all messages end with proper punctuation', () => {
      allMessages.forEach((message: RitualMessage) => {
        const lastChar = message.text.trim().slice(-1);
        expect(['.', '?', '!'].includes(lastChar)).toBe(true);
      });
    });
  });
});
