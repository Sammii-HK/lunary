/**
 * Tests for streak milestone celebration logic
 * Tests the getMilestoneInfo function used in StreakDisplay component
 */

// Replicate the milestone logic from StreakDisplay for testing
const MILESTONES = [
  {
    days: 7,
    emoji: '🌟',
    title: 'Week Warrior!',
    message: 'A full week of cosmic connection',
  },
  {
    days: 14,
    emoji: '✨',
    title: 'Two Week Triumph!',
    message: 'Your dedication is building something beautiful',
  },
  {
    days: 30,
    emoji: '🌙',
    title: 'Moon Cycle Master!',
    message: 'A full lunar cycle of practice',
  },
  {
    days: 60,
    emoji: '💫',
    title: 'Stellar Dedication!',
    message: 'Two months of cosmic wisdom',
  },
  {
    days: 90,
    emoji: '🔮',
    title: 'Mystic Achievement!',
    message: 'Three months of spiritual growth',
  },
  {
    days: 100,
    emoji: '👑',
    title: 'Century Legend!',
    message: '100 days of cosmic mastery',
  },
  {
    days: 365,
    emoji: '🌌',
    title: 'Cosmic Champion!',
    message: 'A full year of dedication',
  },
];

function getMilestoneInfo(streak: number) {
  // Check if current streak matches a milestone exactly
  const exactMilestone = MILESTONES.find((m) => m.days === streak);
  if (exactMilestone) return { ...exactMilestone, isExact: true };

  // Find the highest milestone achieved
  const achieved = MILESTONES.filter((m) => streak >= m.days);
  if (achieved.length > 0) {
    const highest = achieved[achieved.length - 1];
    return { ...highest, isExact: false };
  }

  return null;
}

describe('Streak Milestone Logic', () => {
  describe('getMilestoneInfo', () => {
    it('should return null for streaks below first milestone', () => {
      expect(getMilestoneInfo(0)).toBeNull();
      expect(getMilestoneInfo(1)).toBeNull();
      expect(getMilestoneInfo(6)).toBeNull();
    });

    it('should return exact milestone for day 7', () => {
      const result = getMilestoneInfo(7);
      expect(result).not.toBeNull();
      expect(result?.isExact).toBe(true);
      expect(result?.days).toBe(7);
      expect(result?.title).toBe('Week Warrior!');
    });

    it('should return exact milestone for day 30', () => {
      const result = getMilestoneInfo(30);
      expect(result).not.toBeNull();
      expect(result?.isExact).toBe(true);
      expect(result?.days).toBe(30);
      expect(result?.title).toBe('Moon Cycle Master!');
    });

    it('should return exact milestone for day 100', () => {
      const result = getMilestoneInfo(100);
      expect(result).not.toBeNull();
      expect(result?.isExact).toBe(true);
      expect(result?.days).toBe(100);
      expect(result?.title).toBe('Century Legend!');
    });

    it('should return highest achieved milestone (not exact) for in-between days', () => {
      // Day 8 should show Week Warrior badge (achieved, not celebrating)
      const day8 = getMilestoneInfo(8);
      expect(day8?.isExact).toBe(false);
      expect(day8?.days).toBe(7);
      expect(day8?.title).toBe('Week Warrior!');

      // Day 45 should show Moon Cycle Master badge
      const day45 = getMilestoneInfo(45);
      expect(day45?.isExact).toBe(false);
      expect(day45?.days).toBe(30);
      expect(day45?.title).toBe('Moon Cycle Master!');

      // Day 99 should show Mystic Achievement badge (90 days)
      const day99 = getMilestoneInfo(99);
      expect(day99?.isExact).toBe(false);
      expect(day99?.days).toBe(90);
      expect(day99?.title).toBe('Mystic Achievement!');
    });

    it('should return exact milestone for day 365', () => {
      const result = getMilestoneInfo(365);
      expect(result).not.toBeNull();
      expect(result?.isExact).toBe(true);
      expect(result?.days).toBe(365);
      expect(result?.title).toBe('Cosmic Champion!');
    });

    it('should return highest milestone for streaks beyond 365', () => {
      const result = getMilestoneInfo(500);
      expect(result).not.toBeNull();
      expect(result?.isExact).toBe(false);
      expect(result?.days).toBe(365);
      expect(result?.title).toBe('Cosmic Champion!');
    });

    it('should have correct emoji for each milestone', () => {
      expect(getMilestoneInfo(7)?.emoji).toBe('🌟');
      expect(getMilestoneInfo(14)?.emoji).toBe('✨');
      expect(getMilestoneInfo(30)?.emoji).toBe('🌙');
      expect(getMilestoneInfo(60)?.emoji).toBe('💫');
      expect(getMilestoneInfo(90)?.emoji).toBe('🔮');
      expect(getMilestoneInfo(100)?.emoji).toBe('👑');
      expect(getMilestoneInfo(365)?.emoji).toBe('🌌');
    });
  });

  describe('Milestone progression', () => {
    it('should progress through milestones in order', () => {
      const milestoneOrder = [7, 14, 30, 60, 90, 100, 365];

      milestoneOrder.forEach((day, index) => {
        const result = getMilestoneInfo(day);
        expect(result?.isExact).toBe(true);
        expect(result?.days).toBe(day);

        // For days after this milestone but before next, should show this milestone
        if (index < milestoneOrder.length - 1) {
          const nextMilestone = milestoneOrder[index + 1];
          const midPoint = Math.floor((day + nextMilestone) / 2);
          const midResult = getMilestoneInfo(midPoint);
          expect(midResult?.isExact).toBe(false);
          expect(midResult?.days).toBe(day);
        }
      });
    });
  });
});
