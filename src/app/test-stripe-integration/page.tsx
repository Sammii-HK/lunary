'use client';

import { useState, useEffect } from 'react';
import { getStripeProducts, getTrialPeriodForPrice } from '../../../utils/stripe';
import { getPricingPlansWithStripeData, getTrialDaysFromStripe } from '../../../utils/pricing';

export default function TestStripeIntegrationPage() {
  const [stripeProducts, setStripeProducts] = useState<any[]>([]);
  const [trialDays, setTrialDays] = useState<{ monthly: number; yearly: number } | null>(null);
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
  const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

  useEffect(() => {
    async function testStripeIntegration() {
      try {
        setLoading(true);
        
        console.log('Testing Stripe integration...');
        console.log('Monthly Price ID:', monthlyPriceId);
        console.log('Yearly Price ID:', yearlyPriceId);

        // Test fetching all Stripe products
        const products = await getStripeProducts();
        console.log('Stripe Products:', products);
        setStripeProducts(products);

        // Test fetching trial days from Stripe
        const trialData = await getTrialDaysFromStripe();
        console.log('Trial Days from Stripe:', trialData);
        setTrialDays(trialData);

        // Test dynamic pricing plans
        const dynamicPlans = await getPricingPlansWithStripeData();
        console.log('Dynamic Pricing Plans:', dynamicPlans);
        setPricingPlans(dynamicPlans);

        // Test individual price ID lookups
        if (monthlyPriceId) {
          const monthlyTrial = await getTrialPeriodForPrice(monthlyPriceId);
          console.log('Monthly Trial Period:', monthlyTrial);
        }

        if (yearlyPriceId) {
          const yearlyTrial = await getTrialPeriodForPrice(yearlyPriceId);
          console.log('Yearly Trial Period:', yearlyTrial);
        }

      } catch (err) {
        console.error('Error testing Stripe integration:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    testStripeIntegration();
  }, [monthlyPriceId, yearlyPriceId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-purple-900/20 to-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-light text-white mb-8">Stripe Integration Test</h1>
        
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            <span className="ml-3 text-zinc-400">Testing Stripe integration...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-6">
            <h3 className="text-red-400 font-medium mb-2">Error</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {/* Environment Variables */}
            <div className="bg-zinc-800/50 rounded-lg p-6">
              <h2 className="text-xl font-medium text-white mb-4">Environment Variables</h2>
              <div className="space-y-2 text-sm">
                <div className="text-zinc-300">
                  <span className="text-zinc-400">Monthly Price ID:</span> {monthlyPriceId || 'Not set'}
                </div>
                <div className="text-zinc-300">
                  <span className="text-zinc-400">Yearly Price ID:</span> {yearlyPriceId || 'Not set'}
                </div>
              </div>
            </div>

            {/* Trial Days */}
            {trialDays && (
              <div className="bg-zinc-800/50 rounded-lg p-6">
                <h2 className="text-xl font-medium text-white mb-4">Trial Days from Stripe</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-zinc-700/50 rounded p-4">
                    <div className="text-purple-400 font-medium">Monthly</div>
                    <div className="text-white text-2xl">{trialDays.monthly} days</div>
                  </div>
                  <div className="bg-zinc-700/50 rounded p-4">
                    <div className="text-purple-400 font-medium">Yearly</div>
                    <div className="text-white text-2xl">{trialDays.yearly} days</div>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Pricing Plans */}
            <div className="bg-zinc-800/50 rounded-lg p-6">
              <h2 className="text-xl font-medium text-white mb-4">Dynamic Pricing Plans</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {pricingPlans.map((plan) => (
                  <div key={plan.id} className="bg-zinc-700/50 rounded p-4">
                    <h3 className="text-white font-medium">{plan.name}</h3>
                    <p className="text-zinc-400 text-sm mb-2">{plan.description}</p>
                    <div className="text-purple-400">${plan.price}/{plan.interval}</div>
                    <div className="mt-2">
                      <div className="text-xs text-zinc-500">Features:</div>
                      <ul className="text-xs text-zinc-400 mt-1">
                        {plan.features.slice(0, 3).map((feature: string, idx: number) => (
                          <li key={idx} className="truncate">• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stripe Products */}
            <div className="bg-zinc-800/50 rounded-lg p-6">
              <h2 className="text-xl font-medium text-white mb-4">All Stripe Products</h2>
              <div className="space-y-4">
                {stripeProducts.map((product) => (
                  <div key={product.id} className="bg-zinc-700/50 rounded p-4">
                    <h3 className="text-white font-medium">{product.name}</h3>
                    <p className="text-zinc-400 text-sm">{product.description}</p>
                    <div className="mt-2">
                      <div className="text-xs text-zinc-500">Prices:</div>
                      <div className="grid md:grid-cols-2 gap-2 mt-1">
                        {product.prices.map((price: any) => (
                          <div key={price.id} className="bg-zinc-600/50 rounded p-2 text-xs">
                            <div className="text-zinc-300">
                              ${(price.amount / 100).toFixed(2)}/{price.interval}
                            </div>
                            <div className="text-purple-400">
                              Trial: {price.trial_period_days} days
                            </div>
                            <div className="text-zinc-500">ID: {price.id}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 