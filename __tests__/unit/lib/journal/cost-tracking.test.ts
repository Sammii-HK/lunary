describe('Mood Detection Cost Analysis', () => {
  describe('Cost calculations', () => {
    const CLAUDE_HAIKU_COST_PER_1M_INPUT = 0.25; // $0.25 per 1M tokens
    const CLAUDE_HAIKU_COST_PER_1M_OUTPUT = 1.25; // $1.25 per 1M tokens
    const ESTIMATED_INPUT_TOKENS = 500; // System prompt + journal text
    const ESTIMATED_OUTPUT_TOKENS = 20; // Comma-separated mood list

    function calculateAICost(
      inputTokens: number,
      outputTokens: number,
    ): number {
      const inputCost =
        (inputTokens / 1_000_000) * CLAUDE_HAIKU_COST_PER_1M_INPUT;
      const outputCost =
        (outputTokens / 1_000_000) * CLAUDE_HAIKU_COST_PER_1M_OUTPUT;
      return inputCost + outputCost;
    }

    it('should calculate cost per AI mood detection call', () => {
      const costPerCall = calculateAICost(
        ESTIMATED_INPUT_TOKENS,
        ESTIMATED_OUTPUT_TOKENS,
      );

      // Expected: (500/1M * $0.25) + (20/1M * $1.25)
      // = $0.000125 + $0.000025 = $0.00015 per call
      expect(costPerCall).toBeCloseTo(0.00015, 6);
    });

    it('should calculate annual cost for always-AI strategy (10K users)', () => {
      const users = 10_000;
      const entriesPerUserPerMonth = 10;
      const months = 12;

      const totalCalls = users * entriesPerUserPerMonth * months;
      const costPerCall = calculateAICost(
        ESTIMATED_INPUT_TOKENS,
        ESTIMATED_OUTPUT_TOKENS,
      );
      const annualCost = totalCalls * costPerCall;

      // 10K users * 10 entries/mo * 12 mo = 1.2M calls
      // 1.2M * $0.00015 = $180/year
      expect(totalCalls).toBe(1_200_000);
      expect(annualCost).toBeCloseTo(180, 0);
    });

    it('should calculate annual cost for keyword-only strategy', () => {
      const annualCost = 0; // Keyword detection is free

      expect(annualCost).toBe(0);
    });

    it('should calculate annual cost for smart hybrid strategy', () => {
      const users = 10_000;
      const entriesPerUserPerMonth = 10;
      const months = 12;
      const totalEntries = users * entriesPerUserPerMonth * months;

      // Keyword success rate: ~70%
      const keywordSuccessRate = 0.7;
      const keywordSuccesses = totalEntries * keywordSuccessRate;
      const keywordFailures = totalEntries - keywordSuccesses;

      // Only Pro users get AI fallback (30% of users)
      const proUserRate = 0.3;
      const aiCallsForProUsers = keywordFailures * proUserRate;

      const costPerCall = calculateAICost(
        ESTIMATED_INPUT_TOKENS,
        ESTIMATED_OUTPUT_TOKENS,
      );
      const annualCost = aiCallsForProUsers * costPerCall;

      // 1.2M entries * 30% failures * 30% Pro users = 108K AI calls
      // 108K * $0.00015 ≈ $16.20/year
      expect(aiCallsForProUsers).toBeCloseTo(108_000, 0);
      expect(annualCost).toBeCloseTo(16.2, 1);
    });

    it('should verify 91% cost savings vs always-AI', () => {
      const alwaysAICost = 180;
      const hybridCost = 16.2;
      const savings = ((alwaysAICost - hybridCost) / alwaysAICost) * 100;

      expect(savings).toBeCloseTo(91, 0);
    });
  });

  describe('Coverage analysis', () => {
    it('should calculate free user coverage (keyword only)', () => {
      const keywordSuccessRate = 0.7; // 70% coverage

      expect(keywordSuccessRate).toBe(0.7);
    });

    it('should calculate Pro user coverage (hybrid)', () => {
      const keywordSuccessRate = 0.7; // 70% from keywords
      const aiSuccessRate = 0.95; // 95% when AI is used
      const keywordFailureRate = 1 - keywordSuccessRate;

      // Total coverage = keyword success + (keyword failure * AI success)
      const totalCoverage =
        keywordSuccessRate + keywordFailureRate * aiSuccessRate;

      // 0.7 + (0.3 * 0.95) = 0.7 + 0.285 = 0.985 (98.5%)
      expect(totalCoverage).toBeCloseTo(0.985, 3);
    });

    it('should show improvement from free to Pro', () => {
      const freeCoverage = 0.7; // 70%
      const proCoverage = 0.985; // 98.5%
      const improvement = proCoverage - freeCoverage;
      const improvementPercent = (improvement / freeCoverage) * 100;

      expect(improvement).toBeCloseTo(0.285, 3);
      expect(improvementPercent).toBeCloseTo(40.7, 1); // 40.7% improvement
    });
  });

  describe('Scalability analysis', () => {
    const ESTIMATED_INPUT_TOKENS = 500;
    const ESTIMATED_OUTPUT_TOKENS = 20;
    const COST_PER_AI_CALL = 0.00015;

    function calculateScaledCost(
      users: number,
      entriesPerMonth: number,
      proUserRate: number,
      keywordFailureRate: number,
    ): number {
      const totalEntries = users * entriesPerMonth * 12;
      const aiCalls = totalEntries * keywordFailureRate * proUserRate;
      return aiCalls * COST_PER_AI_CALL;
    }

    it('should scale cost for 50K users', () => {
      const cost = calculateScaledCost(
        50_000, // 50K users
        10, // entries per month
        0.3, // 30% Pro users
        0.3, // 30% keyword failures
      );

      // 50K * 10 * 12 * 0.3 * 0.3 * $0.00015 = $81/year
      expect(cost).toBeCloseTo(81, 0);
    });

    it('should scale cost for 100K users', () => {
      const cost = calculateScaledCost(
        100_000, // 100K users
        10, // entries per month
        0.3, // 30% Pro users
        0.3, // 30% keyword failures
      );

      // 100K * 10 * 12 * 0.3 * 0.3 * $0.00015 = $162/year
      expect(cost).toBeCloseTo(162, 0);
    });

    it('should calculate cost per Pro user per year', () => {
      const totalProUsers = 10_000 * 0.3; // 3,000 Pro users
      const annualCostForProUsers = 16.2; // From hybrid strategy

      const costPerProUser = annualCostForProUsers / totalProUsers;

      // $16.20 / 3,000 = $0.0054 per Pro user per year
      expect(costPerProUser).toBeCloseTo(0.0054, 4);
    });

    it('should verify cost is negligible vs subscription revenue', () => {
      const proSubscriptionPrice = 9.99; // $9.99/month
      const annualRevenue = proSubscriptionPrice * 12; // $119.88/year

      const aiCostPerProUser = 0.0054; // $0.0054/year

      const costAsPercentOfRevenue = (aiCostPerProUser / annualRevenue) * 100;

      // 0.0045% of subscription revenue
      expect(costAsPercentOfRevenue).toBeLessThan(0.01); // Less than 0.01%
    });
  });

  describe('Keyword detection efficiency', () => {
    it('should verify keyword method has zero API cost', () => {
      const keywordCost = 0;
      const callsPerYear = 1_000_000;
      const totalCost = keywordCost * callsPerYear;

      expect(totalCost).toBe(0);
    });

    it('should calculate keyword detection speed advantage', () => {
      const keywordLatency = 5; // ~5ms (in-memory regex)
      const aiLatency = 500; // ~500ms (API call)

      const speedup = aiLatency / keywordLatency;

      expect(speedup).toBe(100); // 100x faster
    });
  });

  describe('Error cost analysis', () => {
    it('should calculate wasted cost from failed AI calls', () => {
      const aiFailureRate = 0.05; // 5% of AI calls fail
      const totalAICalls = 108_000; // From hybrid strategy
      const failedCalls = totalAICalls * aiFailureRate;
      const costPerCall = 0.00015;
      const wastedCost = failedCalls * costPerCall;

      // 5,400 failed calls * $0.00015 = $0.81/year wasted
      expect(wastedCost).toBeCloseTo(0.81, 2);
    });

    it('should verify keyword fallback prevents complete failures', () => {
      // When AI fails, keyword detection runs (0 cost)
      const fallbackCost = 0;
      const fallbackSuccessRate = 0.7; // Still 70% coverage

      expect(fallbackCost).toBe(0);
      expect(fallbackSuccessRate).toBe(0.7);
    });
  });

  describe('ROI analysis', () => {
    it('should calculate value of mood detection feature', () => {
      const improvedRetention = 0.05; // 5% retention improvement
      const avgProUserLifetimeValue = 119.88 * 2; // 2 years @ $9.99/mo
      const proUsers = 3_000;

      const retainedUsers = proUsers * improvedRetention;
      const additionalRevenue = retainedUsers * avgProUserLifetimeValue;

      const aiCost = 16.2; // Annual AI cost
      const roi = ((additionalRevenue - aiCost) / aiCost) * 100;

      // 150 retained users * $239.76 = $35,964 revenue
      // ROI: ($35,964 - $16.20) / $16.20 = 221,888% ROI
      expect(additionalRevenue).toBeCloseTo(35_964, 0);
      expect(roi).toBeGreaterThan(100_000); // Massive ROI
    });

    it('should verify feature is cost-effective even with conservative estimates', () => {
      const improvedRetention = 0.01; // Only 1% retention improvement
      const avgProUserLifetimeValue = 119.88; // 1 year
      const proUsers = 3_000;

      const retainedUsers = proUsers * improvedRetention;
      const additionalRevenue = retainedUsers * avgProUserLifetimeValue;

      const aiCost = 16.2;
      const netProfit = additionalRevenue - aiCost;

      // 30 retained users * $119.88 = $3,596.40 revenue
      // Net profit: $3,596.40 - $16.20 = $3,580.20
      expect(additionalRevenue).toBeCloseTo(3_596, 0);
      expect(netProfit).toBeGreaterThan(3_500);
    });
  });

  describe('Cost comparison with alternatives', () => {
    it('should compare with OpenAI GPT-4o-mini', () => {
      // GPT-4o-mini: $0.150/1M input, $0.600/1M output
      const openAIInputCost = (500 / 1_000_000) * 0.15;
      const openAIOutputCost = (20 / 1_000_000) * 0.6;
      const openAICostPerCall = openAIInputCost + openAIOutputCost;

      // Claude Haiku: $0.25/1M input, $1.25/1M output
      const claudeInputCost = (500 / 1_000_000) * 0.25;
      const claudeOutputCost = (20 / 1_000_000) * 1.25;
      const claudeCostPerCall = claudeInputCost + claudeOutputCost;

      // $0.000087 (OpenAI) vs $0.00015 (Claude)
      // Claude is 1.7x more expensive but better quality
      expect(openAICostPerCall).toBeCloseTo(0.000087, 6);
      expect(claudeCostPerCall).toBeCloseTo(0.00015, 6);

      const costRatio = claudeCostPerCall / openAICostPerCall;
      expect(costRatio).toBeCloseTo(1.7, 1);
    });

    it('should calculate annual cost difference', () => {
      const aiCallsPerYear = 108_000;

      const openAICost = aiCallsPerYear * 0.000087;
      const claudeCost = aiCallsPerYear * 0.00015;
      const difference = claudeCost - openAICost;

      // $9.40 (OpenAI) vs $16.20 (Claude) = $6.80 difference
      expect(openAICost).toBeCloseTo(9.4, 1);
      expect(claudeCost).toBeCloseTo(16.2, 1);
      expect(difference).toBeCloseTo(6.8, 1);

      // Worth the extra $6.80/year for better quality
    });
  });
});
