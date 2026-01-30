import {
  analyzeContextNeeds,
  estimateContextCost,
  getPresetRequirements,
} from '@/lib/ai/context-optimizer';

describe('Context Optimization System', () => {
  describe('analyzeContextNeeds', () => {
    it('should always include basic cosmic context', () => {
      const requirements = analyzeContextNeeds('anything');

      expect(requirements.needsBasicCosmic).toBe(true);
    });

    it('should detect transit keywords', () => {
      const queries = [
        'What transits am I experiencing?',
        'How are these aspects affecting me?',
        'What planetary influences are active?',
      ];

      queries.forEach((query) => {
        const requirements = analyzeContextNeeds(query);
        expect(requirements.needsPersonalTransits).toBe(true);
      });
    });

    it('should detect natal pattern keywords', () => {
      const queries = [
        'What patterns are in my natal chart?',
        'Tell me about my stellium',
        'Do I have a grand trine?',
        'What about my birth chart patterns?',
      ];

      queries.forEach((query) => {
        const requirements = analyzeContextNeeds(query);
        expect(requirements.needsNatalPatterns).toBe(true);
      });
    });

    it('should detect planetary return keywords', () => {
      const queries = [
        'Tell me about my Saturn return',
        'When is my Jupiter return?',
        'Is there a return happening?',
      ];

      queries.forEach((query) => {
        const requirements = analyzeContextNeeds(query);
        expect(requirements.needsPlanetaryReturns).toBe(true);
      });
    });

    it('should detect progressed chart keywords', () => {
      const queries = [
        'What about my progressed chart?',
        'How have I evolved?',
        'What has changed in my chart?',
      ];

      queries.forEach((query) => {
        const requirements = analyzeContextNeeds(query);
        expect(requirements.needsProgressedChart).toBe(true);
      });
    });

    it('should detect eclipse keywords', () => {
      const queries = [
        'Are there any eclipses affecting me?',
        'Tell me about eclipse portals',
        'What transformations are happening?',
      ];

      queries.forEach((query) => {
        const requirements = analyzeContextNeeds(query);
        expect(requirements.needsEclipses).toBe(true);
      });
    });

    it('should detect tarot pattern keywords', () => {
      const queries = [
        'Interpret my tarot reading',
        'What cards have I been getting?',
        'What patterns are in my tarot?',
      ];

      queries.forEach((query) => {
        const requirements = analyzeContextNeeds(query);
        expect(requirements.needsTarotPatterns).toBe(true);
      });
    });

    it('should detect journal history keywords', () => {
      const queries = [
        'Reflect on my journal entries',
        'What have I wrote recently?',
        'Review my entries this week',
      ];

      queries.forEach((query) => {
        const requirements = analyzeContextNeeds(query);
        expect(requirements.needsJournalHistory).toBe(true);
      });
    });

    it('should handle multiple requirements in single query', () => {
      const query =
        'Tell me about my Saturn return and current transits and progressed chart';

      const requirements = analyzeContextNeeds(query);

      expect(requirements.needsPersonalTransits).toBe(true);
      expect(requirements.needsPlanetaryReturns).toBe(true);
      expect(requirements.needsProgressedChart).toBe(true);
    });

    it('should handle simple queries with minimal requirements', () => {
      const query = "What's the moon phase?";

      const requirements = analyzeContextNeeds(query);

      expect(requirements.needsBasicCosmic).toBe(true);
      expect(requirements.needsPersonalTransits).toBe(false);
      expect(requirements.needsNatalPatterns).toBe(false);
      expect(requirements.needsPlanetaryReturns).toBe(false);
      expect(requirements.needsProgressedChart).toBe(false);
      expect(requirements.needsEclipses).toBe(false);
      expect(requirements.needsTarotPatterns).toBe(false);
      expect(requirements.needsJournalHistory).toBe(false);
    });

    it('should be case-insensitive', () => {
      const lower = analyzeContextNeeds('what transits am i experiencing?');
      const upper = analyzeContextNeeds('WHAT TRANSITS AM I EXPERIENCING?');
      const mixed = analyzeContextNeeds('What TRANSITS Am I Experiencing?');

      expect(lower.needsPersonalTransits).toBe(true);
      expect(upper.needsPersonalTransits).toBe(true);
      expect(mixed.needsPersonalTransits).toBe(true);
    });
  });

  describe('estimateContextCost', () => {
    it('should calculate token cost for basic cosmic only', () => {
      const requirements = {
        needsBasicCosmic: true,
        needsPersonalTransits: false,
        needsNatalPatterns: false,
        needsPlanetaryReturns: false,
        needsProgressedChart: false,
        needsEclipses: false,
        needsTarotPatterns: false,
        needsJournalHistory: false,
      };

      const result = estimateContextCost(requirements);

      expect(result.estimatedTokens).toBe(150);
      expect(result.components.basicCosmic).toBe(150);
      expect(result.components.personalTransits).toBe(0);
    });

    it('should calculate token cost for multiple modules', () => {
      const requirements = {
        needsBasicCosmic: true,
        needsPersonalTransits: true,
        needsNatalPatterns: true,
        needsPlanetaryReturns: false,
        needsProgressedChart: false,
        needsEclipses: false,
        needsTarotPatterns: false,
        needsJournalHistory: false,
      };

      const result = estimateContextCost(requirements);

      expect(result.estimatedTokens).toBe(150 + 300 + 200); // 650
      expect(result.components.basicCosmic).toBe(150);
      expect(result.components.personalTransits).toBe(300);
      expect(result.components.natalPatterns).toBe(200);
    });

    it('should calculate full context cost', () => {
      const requirements = {
        needsBasicCosmic: true,
        needsPersonalTransits: true,
        needsNatalPatterns: true,
        needsPlanetaryReturns: true,
        needsProgressedChart: true,
        needsEclipses: true,
        needsTarotPatterns: true,
        needsJournalHistory: true,
      };

      const result = estimateContextCost(requirements);

      const expectedTotal = 150 + 300 + 200 + 100 + 250 + 200 + 150 + 400;
      expect(result.estimatedTokens).toBe(expectedTotal); // 1750
    });

    it('should include component breakdown', () => {
      const requirements = {
        needsBasicCosmic: true,
        needsPersonalTransits: true,
        needsNatalPatterns: false,
        needsPlanetaryReturns: false,
        needsProgressedChart: false,
        needsEclipses: false,
        needsTarotPatterns: false,
        needsJournalHistory: false,
      };

      const result = estimateContextCost(requirements);

      expect(result.components).toHaveProperty('basicCosmic');
      expect(result.components).toHaveProperty('personalTransits');
      expect(result.components).toHaveProperty('natalPatterns');
      expect(result.components).toHaveProperty('planetaryReturns');
      expect(result.components).toHaveProperty('progressedChart');
      expect(result.components).toHaveProperty('eclipses');
      expect(result.components).toHaveProperty('tarotPatterns');
      expect(result.components).toHaveProperty('journalHistory');
    });

    it('should handle zero requirements (only basic cosmic)', () => {
      const requirements = {
        needsBasicCosmic: false,
        needsPersonalTransits: false,
        needsNatalPatterns: false,
        needsPlanetaryReturns: false,
        needsProgressedChart: false,
        needsEclipses: false,
        needsTarotPatterns: false,
        needsJournalHistory: false,
      };

      const result = estimateContextCost(requirements);

      expect(result.estimatedTokens).toBe(0);
    });
  });

  describe('getPresetRequirements', () => {
    it('should provide quick_cosmic preset', () => {
      const preset = getPresetRequirements('quick_cosmic');

      expect(preset.needsBasicCosmic).toBe(true);
      expect(preset.needsPersonalTransits).toBe(false);
      expect(preset.needsNatalPatterns).toBe(false);
      expect(preset.needsTarotPatterns).toBe(true);
    });

    it('should provide deep_analysis preset', () => {
      const preset = getPresetRequirements('deep_analysis');

      expect(preset.needsBasicCosmic).toBe(true);
      expect(preset.needsPersonalTransits).toBe(true);
      expect(preset.needsNatalPatterns).toBe(true);
      expect(preset.needsPlanetaryReturns).toBe(true);
      expect(preset.needsProgressedChart).toBe(true);
      expect(preset.needsEclipses).toBe(true);
    });

    it('should provide tarot_focus preset', () => {
      const preset = getPresetRequirements('tarot_focus');

      expect(preset.needsBasicCosmic).toBe(true);
      expect(preset.needsTarotPatterns).toBe(true);
      expect(preset.needsPersonalTransits).toBe(false);
      expect(preset.needsNatalPatterns).toBe(false);
    });

    it('should provide journal_reflection preset', () => {
      const preset = getPresetRequirements('journal_reflection');

      expect(preset.needsBasicCosmic).toBe(true);
      expect(preset.needsPersonalTransits).toBe(true);
      expect(preset.needsTarotPatterns).toBe(true);
      expect(preset.needsJournalHistory).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should produce consistent results for same query', () => {
      const query = 'Tell me about my Saturn return';

      const result1 = analyzeContextNeeds(query);
      const result2 = analyzeContextNeeds(query);

      expect(result1).toEqual(result2);
    });

    it('should optimize simple query to minimal tokens', () => {
      const query = "What's the cosmic weather?";

      const requirements = analyzeContextNeeds(query);
      const { estimatedTokens } = estimateContextCost(requirements);

      // Should be significantly less than full context (1750 tokens)
      expect(estimatedTokens).toBeLessThan(500);
    });

    it('should build comprehensive context for complex query', () => {
      const query =
        'Give me a deep astrological analysis including transits, patterns, progressions, and eclipses';

      const requirements = analyzeContextNeeds(query);
      const { estimatedTokens } = estimateContextCost(requirements);

      // Should include multiple modules
      expect(requirements.needsPersonalTransits).toBe(true);
      expect(requirements.needsNatalPatterns).toBe(true);
      expect(requirements.needsProgressedChart).toBe(true);
      expect(requirements.needsEclipses).toBe(true);

      // Should be closer to full context cost
      expect(estimatedTokens).toBeGreaterThan(1000);
    });

    it('should demonstrate significant savings on typical queries', () => {
      const fullRequirements = {
        needsBasicCosmic: true,
        needsPersonalTransits: true,
        needsNatalPatterns: true,
        needsPlanetaryReturns: true,
        needsProgressedChart: true,
        needsEclipses: true,
        needsTarotPatterns: true,
        needsJournalHistory: true,
      };

      const fullCost = estimateContextCost(fullRequirements).estimatedTokens;

      const typicalQueries = [
        "What's the moon phase?",
        'Tell me about my Saturn return',
        'What transits am I experiencing?',
        'Interpret my tarot reading',
      ];

      const optimizedCosts = typicalQueries.map((query) => {
        const requirements = analyzeContextNeeds(query);
        return estimateContextCost(requirements).estimatedTokens;
      });

      const averageOptimizedCost =
        optimizedCosts.reduce((sum, cost) => sum + cost, 0) /
        optimizedCosts.length;

      const savingsPercent =
        ((fullCost - averageOptimizedCost) / fullCost) * 100;

      // Should save at least 50% on average
      expect(savingsPercent).toBeGreaterThan(50);
    });
  });

  describe('Performance', () => {
    it('should analyze context needs quickly', () => {
      const query = 'Tell me about my transits and progressed chart';

      const startTime = Date.now();
      analyzeContextNeeds(query);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(10); // Should be nearly instant
    });

    it('should estimate costs quickly', () => {
      const requirements = {
        needsBasicCosmic: true,
        needsPersonalTransits: true,
        needsNatalPatterns: true,
        needsPlanetaryReturns: true,
        needsProgressedChart: true,
        needsEclipses: true,
        needsTarotPatterns: true,
        needsJournalHistory: true,
      };

      const startTime = Date.now();
      estimateContextCost(requirements);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5); // Should be nearly instant
    });
  });
});
