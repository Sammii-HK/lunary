import {
  generateFreeSubstackPost,
  generatePaidSubstackPost,
} from 'utils/substack/contentFormatter';
import { SUBSTACK_CONFIG, getAppUrlWithUtm } from '@/config/substack';

describe('Substack Utilities', () => {
  describe('SUBSTACK_CONFIG', () => {
    it('should have required configuration', () => {
      expect(SUBSTACK_CONFIG).toHaveProperty('publicationUrl');
      expect(SUBSTACK_CONFIG).toHaveProperty('email');
      expect(SUBSTACK_CONFIG).toHaveProperty('password');
      expect(SUBSTACK_CONFIG).toHaveProperty('pricing');
      expect(SUBSTACK_CONFIG).toHaveProperty('utm');
    });

    it('should have correct pricing configuration', () => {
      expect(SUBSTACK_CONFIG.pricing.monthly).toBe(3);
      expect(SUBSTACK_CONFIG.pricing.currency).toBe('USD');
    });

    it('should have UTM parameters for both tiers', () => {
      expect(SUBSTACK_CONFIG.utm.free).toHaveProperty('source', 'substack');
      expect(SUBSTACK_CONFIG.utm.free).toHaveProperty('medium', 'email');
      expect(SUBSTACK_CONFIG.utm.paid).toHaveProperty('source', 'substack');
      expect(SUBSTACK_CONFIG.utm.paid).toHaveProperty('medium', 'email');
    });
  });

  describe('getAppUrlWithUtm', () => {
    it('should generate URL with free tier UTM parameters', () => {
      const url = getAppUrlWithUtm('free');
      expect(url).toContain('utm_source=substack');
      expect(url).toContain('utm_medium=email');
      expect(url).toContain('utm_campaign=weekly_free');
    });

    it('should generate URL with paid tier UTM parameters', () => {
      const url = getAppUrlWithUtm('paid');
      expect(url).toContain('utm_source=substack');
      expect(url).toContain('utm_medium=email');
      expect(url).toContain('utm_campaign=weekly_paid');
    });

    it('should include base app URL', () => {
      const url = getAppUrlWithUtm('free');
      expect(url).toContain(SUBSTACK_CONFIG.appUrl);
    });
  });

  describe('Content Formatter', () => {
    const mockWeeklyData = {
      weekStart: new Date('2024-01-15'),
      weekEnd: new Date('2024-01-21'),
      weekNumber: 3,
      title: 'Test Week Title',
      subtitle: 'Test Week Subtitle',
      summary: 'Test week summary',
      planetaryHighlights: [
        {
          planet: 'Mercury',
          event: 'enters-sign' as const,
          date: new Date('2024-01-18'),
          description: 'Mercury enters Aquarius',
          significance: 'medium' as const,
          details: {
            fromSign: 'Capricorn',
            toSign: 'Aquarius',
          },
        },
      ],
      retrogradeChanges: [],
      moonPhases: [
        {
          date: new Date('2024-01-16'),
          phase: 'New Moon',
          time: '12:00 PM',
          sign: 'Capricorn',
          energy: 'New beginnings',
          guidance: 'Set intentions',
          ritualSuggestions: ['Set intentions', 'New moon ritual'],
        },
      ],
      crystalRecommendations: [
        {
          date: new Date('2024-01-15'),
          crystal: 'Amethyst',
          reason: 'Calming energy',
          usage: 'Meditation',
          chakra: 'Crown',
          intention: 'Peace',
        },
      ],
      bestDaysFor: {
        manifestation: {
          dates: [new Date('2024-01-16')],
          reason: 'New moon energy',
        },
      },
      signIngresses: [],
      seasonalEvents: [],
      majorAspects: [],
      dailyForecasts: [],
      magicalTiming: {
        powerDays: [],
        voidOfCourseMoon: [],
      },
      generatedAt: new Date().toISOString(),
      year: 2024,
    };

    describe('generateFreeSubstackPost', () => {
      it('should generate a free post with required fields', () => {
        const post = generateFreeSubstackPost(mockWeeklyData);

        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('content');
        expect(typeof post.title).toBe('string');
        expect(typeof post.content).toBe('string');
        expect(post.title.length).toBeGreaterThan(0);
        expect(post.content.length).toBeGreaterThan(0);
      });

      it('should include week information in content', () => {
        const post = generateFreeSubstackPost(mockWeeklyData);
        expect(post.content).toContain('week');
      });

      it('should include moon phase information if available', () => {
        const post = generateFreeSubstackPost(mockWeeklyData);
        if (mockWeeklyData.moonPhases.length > 0) {
          expect(post.content.toLowerCase()).toContain('moon');
        }
      });

      it('should include UTM link to app', () => {
        const post = generateFreeSubstackPost(mockWeeklyData);
        const freeUrl = getAppUrlWithUtm('free');
        expect(post.content).toContain(freeUrl);
      });
    });

    describe('generatePaidSubstackPost', () => {
      it('should generate a paid post with required fields', () => {
        const post = generatePaidSubstackPost(mockWeeklyData);

        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('content');
        expect(typeof post.title).toBe('string');
        expect(typeof post.content).toBe('string');
        expect(post.title.length).toBeGreaterThan(0);
        expect(post.content.length).toBeGreaterThan(0);
      });

      it('should include week information in content', () => {
        const post = generatePaidSubstackPost(mockWeeklyData);
        expect(post.content).toContain('week');
      });

      it('should include planetary transit information if available', () => {
        const post = generatePaidSubstackPost(mockWeeklyData);
        if (mockWeeklyData.planetaryHighlights.length > 0) {
          expect(post.content.toLowerCase()).toContain('mercury');
        }
      });

      it('should include UTM link to app', () => {
        const post = generatePaidSubstackPost(mockWeeklyData);
        const paidUrl = getAppUrlWithUtm('paid');
        expect(post.content).toContain(paidUrl);
      });

      it('should have more detailed content than free post', () => {
        const freePost = generateFreeSubstackPost(mockWeeklyData);
        const paidPost = generatePaidSubstackPost(mockWeeklyData);

        expect(paidPost.content.length).toBeGreaterThanOrEqual(
          freePost.content.length,
        );
      });
    });

    it('should handle empty weekly data gracefully', () => {
      const emptyData = {
        weekStart: new Date('2024-01-15'),
        weekEnd: new Date('2024-01-21'),
        weekNumber: 1,
        title: 'Empty Week',
        subtitle: 'No events',
        summary: 'A quiet week',
        planetaryHighlights: [],
        retrogradeChanges: [],
        moonPhases: [],
        crystalRecommendations: [],
        bestDaysFor: {},
        majorAspects: [],
        dailyForecasts: [],
        magicalTiming: {
          powerDays: [],
          voidOfCourseMoon: [],
        },
      };

      const freePost = generateFreeSubstackPost(emptyData);
      const paidPost = generatePaidSubstackPost(emptyData);

      expect(freePost.title).toBeDefined();
      expect(freePost.content).toBeDefined();
      expect(paidPost.title).toBeDefined();
      expect(paidPost.content).toBeDefined();
    });
  });
});
