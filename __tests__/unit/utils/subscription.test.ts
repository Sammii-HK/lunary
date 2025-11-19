import { syncSubscriptionToProfile } from 'utils/subscription';

// Mock the schema module
jest.mock('../../../schema', () => ({
  Subscription: {
    create: jest.fn((data: any) => ({
      ...data,
      _owner: 'mock-owner',
    })),
  },
}));

// Mock fetch for Stripe API calls
global.fetch = jest.fn();

describe('Subscription Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('syncSubscriptionToProfile - Plan Type Fallback Fix', () => {
    const mockProfile = {
      $jazz: {
        set: jest.fn(),
      },
      _owner: 'mock-owner',
    };

    it('should default unknown plan types to free instead of annual', async () => {
      // Mock fetch to return subscription data with unknown plan type
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          subscription: {
            id: 'sub_test123',
            status: 'active',
            plan: 'unknown_plan_type_that_does_not_exist',
            customerId: 'cus_test123',
            trial_end: null,
            current_period_end: Math.floor(Date.now() / 1000) + 86400,
            items: {
              data: [
                {
                  price: {
                    recurring: {
                      interval: 'month',
                    },
                  },
                },
              ],
            },
          },
        }),
      });

      const result = await syncSubscriptionToProfile(
        mockProfile,
        'cus_test123',
      );

      expect(result.success).toBe(true);
      expect(mockProfile.$jazz.set).toHaveBeenCalled();

      // Get the subscription data that was set
      const setCall = (mockProfile.$jazz.set as jest.Mock).mock.calls.find(
        (call) => call[0] === 'subscription',
      );

      expect(setCall).toBeDefined();
      if (setCall) {
        const subscriptionData = setCall[1];
        // CRITICAL: Should default to 'free', NOT 'lunary_plus_ai_annual'
        expect(subscriptionData.plan).toBe('free');
        expect(subscriptionData.plan).not.toBe('lunary_plus_ai_annual');
      }
    });

    it('should not create subscription when no subscription data found', async () => {
      // Mock fetch to return no subscription
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'No subscriptions found',
        }),
      });

      const result = await syncSubscriptionToProfile(
        mockProfile,
        'cus_test123',
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('No subscription data found');
      // Should not create a subscription when none exists
      expect(mockProfile.$jazz.set).not.toHaveBeenCalled();
    });

    it('should preserve valid plan types', async () => {
      const testCases = [
        { input: 'free', expected: 'free' },
        { input: 'monthly', expected: 'lunary_plus' }, // monthly gets converted to lunary_plus
        { input: 'yearly', expected: 'lunary_plus_ai_annual' }, // yearly gets converted to lunary_plus_ai_annual
        { input: 'lunary_plus', expected: 'lunary_plus' },
        { input: 'lunary_plus_ai', expected: 'lunary_plus_ai' },
        { input: 'lunary_plus_ai_annual', expected: 'lunary_plus_ai_annual' },
      ];

      for (const { input, expected } of testCases) {
        jest.clearAllMocks();
        (mockProfile.$jazz.set as jest.Mock).mockClear();

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            subscription: {
              id: 'sub_test123',
              status: 'active',
              plan: input,
              customerId: 'cus_test123',
              trial_end: null,
              current_period_end: Math.floor(Date.now() / 1000) + 86400,
              items: {
                data: [
                  {
                    price: {
                      recurring: {
                        interval:
                          input === 'lunary_plus_ai_annual' ||
                          input === 'yearly'
                            ? 'year'
                            : 'month',
                      },
                    },
                  },
                ],
              },
            },
          }),
        });

        const result = await syncSubscriptionToProfile(
          mockProfile,
          'cus_test123',
        );

        expect(result.success).toBe(true);

        const setCall = (mockProfile.$jazz.set as jest.Mock).mock.calls.find(
          (call) => call[0] === 'subscription',
        );

        expect(setCall).toBeDefined();
        if (setCall) {
          const subscriptionData = setCall[1];
          // Plan should match expected (may be converted from generic terms)
          expect(subscriptionData.plan).toBe(expected);
        }
      }
    });

    it('should handle empty string plan by falling back to interval detection', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          subscription: {
            id: 'sub_test123',
            status: 'active',
            plan: '', // Empty string falls back to interval detection
            customerId: 'cus_test123',
            trial_end: null,
            current_period_end: Math.floor(Date.now() / 1000) + 86400,
            items: {
              data: [
                {
                  price: {
                    recurring: {
                      interval: 'month', // Will map to lunary_plus
                    },
                  },
                },
              ],
            },
          },
        }),
      });

      const result = await syncSubscriptionToProfile(
        mockProfile,
        'cus_test123',
      );

      expect(result.success).toBe(true);

      const setCall = (mockProfile.$jazz.set as jest.Mock).mock.calls.find(
        (call) => call[0] === 'subscription',
      );

      expect(setCall).toBeDefined();
      if (setCall) {
        const subscriptionData = setCall[1];
        // Empty string falls back to interval detection, which maps monthly to lunary_plus
        expect(subscriptionData.plan).toBe('lunary_plus');
      }
    });

    it('should handle invalid plan types that are not in allowed list', async () => {
      const invalidPlans = [
        'premium',
        'pro',
        'enterprise',
        'invalid_plan',
        'lunary_plus_ai_annual_old', // Close but not exact match
      ];

      for (const invalidPlan of invalidPlans) {
        jest.clearAllMocks();
        (mockProfile.$jazz.set as jest.Mock).mockClear();

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            subscription: {
              id: 'sub_test123',
              status: 'active',
              plan: invalidPlan,
              customerId: 'cus_test123',
              trial_end: null,
              current_period_end: Math.floor(Date.now() / 1000) + 86400,
              items: {
                data: [
                  {
                    price: {
                      recurring: {
                        interval: 'month',
                      },
                    },
                  },
                ],
              },
            },
          }),
        });

        const result = await syncSubscriptionToProfile(
          mockProfile,
          'cus_test123',
        );

        expect(result.success).toBe(true);

        const setCall = (mockProfile.$jazz.set as jest.Mock).mock.calls.find(
          (call) => call[0] === 'subscription',
        );

        expect(setCall).toBeDefined();
        if (setCall) {
          const subscriptionData = setCall[1];
          // Should default to 'free' for invalid plans, NOT annual
          expect(subscriptionData.plan).toBe('free');
          expect(subscriptionData.plan).not.toBe('lunary_plus_ai_annual');
        }
      }
    });
  });
});
