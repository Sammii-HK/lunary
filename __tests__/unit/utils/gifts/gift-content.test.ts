import {
  simpleHash,
  generateTarotPull,
  generateCosmicEncouragement,
  generateGiftContent,
  GIFT_TYPES,
} from '@/utils/gifts/gift-content';

describe('gift-content', () => {
  describe('simpleHash', () => {
    it('returns a positive number', () => {
      expect(simpleHash('test')).toBeGreaterThanOrEqual(0);
    });

    it('returns consistent results for same input', () => {
      const a = simpleHash('hello-world');
      const b = simpleHash('hello-world');
      expect(a).toBe(b);
    });

    it('returns different results for different inputs', () => {
      const a = simpleHash('user1:user2:2026-01-01');
      const b = simpleHash('user1:user3:2026-01-01');
      expect(a).not.toBe(b);
    });
  });

  describe('generateTarotPull', () => {
    it('returns a valid tarot pull content', () => {
      const result = generateTarotPull('sender1', 'recipient1', '2026-01-01');
      expect(result.cardName).toBeTruthy();
      expect(result.keywords).toBeDefined();
      expect(Array.isArray(result.keywords)).toBe(true);
      expect(result.message).toBeTruthy();
      expect(result.suit).toBeTruthy();
    });

    it('is deterministic for same inputs', () => {
      const a = generateTarotPull('sender1', 'recipient1', '2026-01-01');
      const b = generateTarotPull('sender1', 'recipient1', '2026-01-01');
      expect(a.cardName).toBe(b.cardName);
      expect(a.suit).toBe(b.suit);
    });

    it('returns different cards for different sender/recipient combos', () => {
      const a = generateTarotPull('sender1', 'recipient1', '2026-01-01');
      const b = generateTarotPull('sender1', 'recipient2', '2026-01-01');
      // Different inputs should produce different cards (with high probability)
      // This could theoretically collide, but is extremely unlikely
      expect(a.cardName !== b.cardName || a.suit !== b.suit).toBe(true);
    });

    it('returns different cards for different dates', () => {
      const a = generateTarotPull('sender1', 'recipient1', '2026-01-01');
      const b = generateTarotPull('sender1', 'recipient1', '2026-01-02');
      expect(a.cardName !== b.cardName || a.suit !== b.suit).toBe(true);
    });
  });

  describe('generateCosmicEncouragement', () => {
    it('returns a valid encouragement content', () => {
      const result = generateCosmicEncouragement(
        'sender1',
        'Aries',
        '2026-01-01',
      );
      expect(result.affirmation).toBeTruthy();
      expect(result.recipientSign).toBe('Aries');
    });

    it('is deterministic for same inputs', () => {
      const a = generateCosmicEncouragement('sender1', 'Cancer', '2026-01-01');
      const b = generateCosmicEncouragement('sender1', 'Cancer', '2026-01-01');
      expect(a.affirmation).toBe(b.affirmation);
    });

    it('returns different affirmations for different signs', () => {
      const aries = generateCosmicEncouragement(
        'sender1',
        'Aries',
        '2026-01-01',
      );
      const pisces = generateCosmicEncouragement(
        'sender1',
        'Pisces',
        '2026-01-01',
      );
      // Different signs have different pools, very likely different
      expect(aries.affirmation).not.toBe(pisces.affirmation);
    });

    it('falls back to Aries for unknown sign', () => {
      const result = generateCosmicEncouragement(
        'sender1',
        'Unknown',
        '2026-01-01',
      );
      expect(result.affirmation).toBeTruthy();
      expect(result.recipientSign).toBe('Unknown');
    });
  });

  describe('generateGiftContent', () => {
    it('returns tarot pull content for tarot_pull type', () => {
      const result = generateGiftContent(
        'tarot_pull',
        'sender',
        'recipient',
        'Aries',
      );
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('cardName');
      expect(result).toHaveProperty('suit');
    });

    it('returns cosmic encouragement content for cosmic_encouragement type', () => {
      const result = generateGiftContent(
        'cosmic_encouragement',
        'sender',
        'recipient',
        'Leo',
      );
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('affirmation');
      expect(result).toHaveProperty('recipientSign');
    });

    it('returns null for unknown gift type', () => {
      const result = generateGiftContent(
        'unknown_type',
        'sender',
        'recipient',
        'Leo',
      );
      expect(result).toBeNull();
    });
  });

  describe('GIFT_TYPES', () => {
    it('contains tarot_pull and cosmic_encouragement', () => {
      const ids = GIFT_TYPES.map((g) => g.id);
      expect(ids).toContain('tarot_pull');
      expect(ids).toContain('cosmic_encouragement');
    });

    it('each type has required fields', () => {
      for (const giftType of GIFT_TYPES) {
        expect(giftType.id).toBeTruthy();
        expect(giftType.name).toBeTruthy();
        expect(giftType.description).toBeTruthy();
        expect(giftType.icon).toBeTruthy();
      }
    });
  });
});
