'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'jazz-tools/react';
import {
  PRICING_PLANS,
  getPricingPlansWithStripeData,
  hasFeatureAccess,
  getTrialDaysRemaining,
  type PricingPlan,
} from '../../../utils/pricing';
import { createCheckoutSession, stripePromise } from '../../../utils/stripe';
import { Check, Star, Zap } from 'lucide-react';

export default function PricingPage() {
  const { me } = useAccount();
  const [loading, setLoading] = useState<string | null>(null);
  const [pricingPlans, setPricingPlans] =
    useState<PricingPlan[]>(PRICING_PLANS);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Load dynamic pricing plans with Stripe trial data on component mount
  useEffect(() => {
    async function loadPricingPlans() {
      try {
        const dynamicPlans = await getPricingPlansWithStripeData();
        setPricingPlans(dynamicPlans);
      } catch (error) {
        console.error('Error loading dynamic pricing plans:', error);
        // Keep the static plans as fallback
      } finally {
        setLoadingPlans(false);
      }
    }

    loadPricingPlans();
  }, []);

  const subscription = (me?.profile as any)?.subscription;
  const subscriptionStatus = subscription?.status || 'free';
  const trialDaysRemaining = getTrialDaysRemaining(subscription?.trialEndsAt);

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (!priceId) return;

    setLoading(planId);

    try {
      const { sessionId } = await createCheckoutSession(
        priceId,
        subscription?.stripeCustomerId,
      );

      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    // <div className='min-h-screen bg-gradient-to-br from-zinc-900 via-purple-900/20 to-zinc-900'>
    <div className='min-h-screen from-zinc-900 via-purple-900/20 to-zinc-900'>
      {/* Header */}
      <div className='max-w-md mx-auto px-4 py-8'>
        <div className='text-center space-y-4'>
          <h1 className='text-3xl font-light text-white leading-tight'>
            Your Personal
            <br />
            <span className='bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
              Cosmic Blueprint
            </span>
          </h1>

          <p className='text-lg text-zinc-300'>
            Experience astrology tailored specifically to YOU. Start your free
            trial and discover the profound difference personalized cosmic
            insights make.
          </p>

          {subscriptionStatus === 'trial' && (
            <div className='bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg p-3 border border-purple-500/30'>
              <div className='flex items-center gap-2 justify-center'>
                <Zap className='w-4 h-4 text-yellow-400' />
                <span className='text-yellow-300 font-medium text-sm'>
                  {trialDaysRemaining} days left in your free trial
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className='max-w-md mx-auto px-4 pb-8'>
        {loadingPlans ? (
          <div className='flex justify-center items-center py-8'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400'></div>
            <span className='ml-3 text-zinc-400 text-sm'>
              Loading pricing information...
            </span>
          </div>
        ) : (
          <div className='space-y-6'>
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-lg p-6 border ${
                  plan.popular
                    ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/50'
                    : 'bg-zinc-800/50 border-zinc-700'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
                    <div className='bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1'>
                      <Star className='w-3 h-3' />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Savings Badge */}
                {plan.savings && (
                  <div className='absolute -top-3 right-3'>
                    <div className='bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium'>
                      {plan.savings}
                    </div>
                  </div>
                )}

                <div className='space-y-4'>
                  {/* Plan Header */}
                  <div className='text-center space-y-2'>
                    <h3 className='text-xl font-semibold text-white'>
                      {plan.name}
                    </h3>
                    <p className='text-zinc-400 text-sm'>{plan.description}</p>

                    <div className='py-3'>
                      {plan.price === 0 ? (
                        <div className='text-2xl font-bold text-white'>
                          Free
                        </div>
                      ) : (
                        <div className='space-y-1'>
                          <div className='text-3xl font-bold text-white'>
                            ${plan.price}
                            <span className='text-base font-normal text-zinc-400'>
                              /{plan.interval}
                            </span>
                          </div>
                          {plan.interval === 'year' && (
                            <div className='text-xs text-zinc-400'>
                              Just $3.33/month billed annually
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className='space-y-2'>
                    {plan.features.map((feature, index) => (
                      <div key={index} className='flex items-start gap-2'>
                        <Check className='w-3 h-3 text-green-400 mt-0.5 flex-shrink-0' />
                        <span className='text-zinc-300 text-xs'>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <div className='pt-3'>
                    {plan.id === 'free' ? (
                      <Link
                        href='/'
                        className='w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-lg font-medium transition-colors text-center block text-sm'
                      >
                        Current Plan
                      </Link>
                    ) : subscriptionStatus === 'active' &&
                      subscription?.plan === plan.id ? (
                      <div className='w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium text-center text-sm'>
                        Current Plan
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          handleSubscribe(plan.stripePriceId, plan.id)
                        }
                        disabled={loading === plan.id || !plan.stripePriceId}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 text-sm ${
                          plan.popular
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                            : 'bg-white text-zinc-900 hover:bg-zinc-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {loading === plan.id ? (
                          <div className='flex items-center justify-center gap-2'>
                            <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin'></div>
                            Loading...
                          </div>
                        ) : subscriptionStatus === 'trial' ? (
                          'Upgrade Now'
                        ) : (
                          `Start ${plan.interval === 'month' ? '7' : '14'}-Day Free Trial`
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className='max-w-md mx-auto px-4 py-8'>
        <h2 className='text-2xl font-light text-white text-center mb-6'>
          Frequently Asked Questions
        </h2>

        <div className='space-y-4'>
          <div className='bg-zinc-800/50 rounded-lg p-4'>
            <h3 className='text-base font-medium text-white mb-2'>
              What's included in the free trial?
            </h3>
            <p className='text-zinc-300 text-sm'>
              Get full access to all premium features including your complete
              birth chart analysis, personalized daily horoscopes, tarot
              patterns, and cosmic insights. No credit card required to start.
            </p>
          </div>

          <div className='bg-zinc-800/50 rounded-lg p-4'>
            <h3 className='text-base font-medium text-white mb-2'>
              Can I cancel anytime?
            </h3>
            <p className='text-zinc-300 text-sm'>
              Absolutely. Cancel your subscription at any time through your
              account settings. You'll continue to have access to premium
              features until the end of your billing period.
            </p>
          </div>

          <div className='bg-zinc-800/50 rounded-lg p-4'>
            <h3 className='text-base font-medium text-white mb-2'>
              How accurate are the birth chart calculations?
            </h3>
            <p className='text-zinc-300 text-sm'>
              We use professional-grade astronomical algorithms to calculate
              planetary positions accurate to within minutes of arc, the same
              precision used by professional astrologers.
            </p>
          </div>

          <div className='bg-zinc-800/50 rounded-lg p-4'>
            <h3 className='text-base font-medium text-white mb-2'>
              What makes this different from other astrology apps?
            </h3>
            <p className='text-zinc-300 text-sm'>
              Unlike apps that give generic horoscopes, every insight is
              calculated from your exact birth chart. We respect your
              intelligence with thoughtful guidance, never prescriptive advice.
            </p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className='max-w-md mx-auto px-4 py-8 text-center'>
        <div className='bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-6 border border-purple-700/30'>
          <h3 className='text-xl font-light text-white mb-3'>
            Ready to discover your cosmic blueprint?
          </h3>
          <p className='text-zinc-300 mb-4 text-sm'>
            See how personalized astrology transforms your understanding. Try
            free with no commitment required.
          </p>
          <Link
            href='/profile'
            className='inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl text-sm'
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
