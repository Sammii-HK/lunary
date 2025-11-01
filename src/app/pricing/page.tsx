'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'jazz-tools/react';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import {
  PRICING_PLANS,
  getPricingPlansWithStripeData,
  hasFeatureAccess,
  getTrialDaysRemaining,
  type PricingPlan,
} from '../../../utils/pricing';
import { createCheckoutSession, stripePromise } from '../../../utils/stripe';
import { Check, Star, Zap } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuthStatus } from '@/components/AuthStatus';

export default function PricingPage() {
  const { me } = useAccount();
  const subscription = useSubscription();
  const authState = useAuthStatus();
  const [loading, setLoading] = useState<string | null>(null);
  const [pricingPlans, setPricingPlans] =
    useState<PricingPlan[]>(PRICING_PLANS);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    async function loadPricingPlans() {
      try {
        const dynamicPlans = await getPricingPlansWithStripeData();
        setPricingPlans(dynamicPlans);
      } catch (error) {
        console.error('Error loading dynamic pricing plans:', error);
      } finally {
        setLoadingPlans(false);
      }
    }

    loadPricingPlans();
  }, []);

  const subscriptionStatus = subscription.status || 'free';
  const trialDaysRemaining = subscription.trialDaysRemaining;

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (!priceId) return;

    setLoading(planId);

    try {
      const { sessionId } = await createCheckoutSession(
        priceId,
        subscription.customerId,
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
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {/* Navigation */}
      <nav className='relative z-10 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <Link
              href='/'
              className='text-xl font-medium text-zinc-100 tracking-tight'
            >
              Lunary
            </Link>
            <div className='hidden sm:flex items-center gap-6'>
              <Link
                href='/welcome'
                className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
              >
                Features
              </Link>
              <Link
                href='/'
                className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
              >
                Daily Insights
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className='relative overflow-hidden border-b border-zinc-800/50'>
        <div className='absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-transparent to-transparent'></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-28 lg:py-32'>
          <div className='text-center max-w-4xl mx-auto space-y-6 sm:space-y-8'>
            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-zinc-100 leading-tight tracking-tight'>
              Simple,{' '}
              <span className='font-normal text-purple-300/80'>
                transparent
              </span>
              <br className='hidden sm:block' />
              <span className='sm:hidden'> </span>
              pricing
            </h1>

            <p className='text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light'>
              Start your free trial. No credit card required. Cancel anytime.
            </p>

            {subscriptionStatus === 'trial' && (
              <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10'>
                <Zap className='w-4 h-4 text-purple-300/80' strokeWidth={1.5} />
                <span className='text-sm text-purple-300/80 font-medium'>
                  {trialDaysRemaining} days left in your free trial
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className='py-16 sm:py-20 md:py-24 lg:py-28 border-b border-zinc-800/50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {loadingPlans ? (
            <div className='flex justify-center items-center py-20'>
              <div className='flex items-center gap-3'>
                <div className='w-5 h-5 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin'></div>
                <span className='text-zinc-400 text-sm'>
                  Loading pricing information...
                </span>
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-8 max-w-6xl mx-auto'>
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-lg p-6 md:p-8 border transition-colors ${
                    plan.popular
                      ? 'border-purple-500/30 bg-zinc-900/50 hover:bg-zinc-900/70 md:scale-105 md:-mt-2'
                      : 'border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50'
                  }`}
                >
                  {plan.popular && (
                    <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
                      <div className='flex items-center gap-1 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10'>
                        <Star
                          className='w-3 h-3 text-purple-300/80'
                          strokeWidth={1.5}
                        />
                        <span className='text-xs font-medium text-purple-300/80'>
                          Most Popular
                        </span>
                      </div>
                    </div>
                  )}

                  {plan.savings && (
                    <div className='absolute -top-3 right-3'>
                      <div className='px-2 py-1 rounded-full border border-zinc-700 bg-zinc-800/50'>
                        <span className='text-xs font-medium text-zinc-400'>
                          {plan.savings}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className='space-y-6'>
                    {/* Plan Header */}
                    <div className='space-y-2'>
                      <h3 className='text-xl md:text-2xl font-medium text-zinc-100'>
                        {plan.name}
                      </h3>
                      <p className='text-sm md:text-base text-zinc-400 leading-relaxed'>
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className='pb-2'>
                      {plan.price === 0 ? (
                        <div className='text-3xl md:text-4xl font-light text-zinc-100'>
                          Free
                        </div>
                      ) : (
                        <div className='space-y-1'>
                          <div className='text-4xl md:text-5xl font-light text-zinc-100'>
                            ${plan.price}
                            <span className='text-base md:text-lg font-normal text-zinc-400 ml-1'>
                              /{plan.interval}
                            </span>
                          </div>
                          {plan.interval === 'year' && (
                            <div className='text-xs md:text-sm text-zinc-500'>
                              Just $3.33/month billed annually
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className='space-y-3 pt-4 border-t border-zinc-800/50'>
                      {plan.features.map((feature, index) => (
                        <div key={index} className='flex items-start gap-3'>
                          <Check
                            className='w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0'
                            strokeWidth={1.5}
                          />
                          <span className='text-sm md:text-base text-zinc-400 leading-relaxed'>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className='pt-4'>
                      {plan.id === 'free' && subscriptionStatus === 'free' ? (
                        <Link
                          href='/'
                          className='w-full block text-center py-3 px-4 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800/70 text-zinc-300 text-sm font-medium transition-colors'
                        >
                          Current Plan
                        </Link>
                      ) : (subscriptionStatus === 'active' ||
                          subscriptionStatus === 'trial') &&
                        subscription.plan === plan.id ? (
                        <Link
                          href='/profile'
                          className='w-full block text-center py-3 px-4 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/15 text-purple-300/90 text-sm font-medium transition-colors'
                        >
                          Current Plan
                          {subscriptionStatus === 'trial'
                            ? ` (${trialDaysRemaining} days left)`
                            : ''}
                        </Link>
                      ) : (
                        <button
                          onClick={() =>
                            handleSubscribe(plan.stripePriceId, plan.id)
                          }
                          disabled={loading === plan.id || !plan.stripePriceId}
                          className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                            plan.popular
                              ? 'bg-purple-500/10 hover:bg-purple-500/15 text-purple-300/90 border border-purple-500/20 hover:border-purple-500/30'
                              : 'bg-zinc-800/50 hover:bg-zinc-800/70 text-zinc-300 border border-zinc-700'
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
      </section>

      {/* FAQ Section */}
      <section className='py-16 sm:py-20 md:py-24 lg:py-28 border-b border-zinc-800/50 bg-zinc-900/20'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12 md:mb-16 space-y-4'>
            <h2 className='text-3xl sm:text-4xl md:text-5xl font-light text-zinc-100'>
              Frequently Asked Questions
            </h2>
            <p className='text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
              Everything you need to know about getting started.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8'>
            <div className='p-6 md:p-8 rounded-lg border border-zinc-800/50 bg-zinc-900/30'>
              <h3 className='text-lg md:text-xl font-medium text-zinc-100 mb-3'>
                What's included in the free trial?
              </h3>
              <p className='text-sm md:text-base text-zinc-400 leading-relaxed'>
                Get full access to all personalized features including your
                complete birth chart analysis, personalized daily horoscopes,
                tarot patterns, and cosmic insights. No credit card required to
                start.
              </p>
            </div>

            <div className='p-6 md:p-8 rounded-lg border border-zinc-800/50 bg-zinc-900/30'>
              <h3 className='text-lg md:text-xl font-medium text-zinc-100 mb-3'>
                Can I cancel anytime?
              </h3>
              <p className='text-sm md:text-base text-zinc-400 leading-relaxed'>
                Absolutely. Cancel your subscription at any time through your
                account settings. You'll continue to have access to premium
                features until the end of your billing period.
              </p>
            </div>

            <div className='p-6 md:p-8 rounded-lg border border-zinc-800/50 bg-zinc-900/30'>
              <h3 className='text-lg md:text-xl font-medium text-zinc-100 mb-3'>
                How accurate are the birth chart calculations?
              </h3>
              <p className='text-sm md:text-base text-zinc-400 leading-relaxed'>
                We use accurate astronomical algorithms to calculate planetary
                positions precise to your exact birth time, date, and location.
                Every calculation considers your unique cosmic signature.
              </p>
            </div>

            <div className='p-6 md:p-8 rounded-lg border border-zinc-800/50 bg-zinc-900/30'>
              <h3 className='text-lg md:text-xl font-medium text-zinc-100 mb-3'>
                What makes this different from other astrology apps?
              </h3>
              <p className='text-sm md:text-base text-zinc-400 leading-relaxed'>
                Unlike apps that give generic horoscopes, every insight is
                calculated from your exact birth chart. We respect your
                intelligence with thoughtful guidance, never prescriptive
                advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className='py-16 sm:py-20 md:py-24 lg:py-28'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8'>
          <h2 className='text-3xl sm:text-4xl md:text-5xl font-light text-zinc-100'>
            Ready to discover your cosmic blueprint?
          </h2>
          <p className='text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed'>
            Experience astrology that's actually about you. No credit card
            required. Cancel anytime.
          </p>

          <div className='pt-4'>
            <SmartTrialButton
              size='md'
              variant='primary'
              className='inline-block'
            >
              Start Free Trial
            </SmartTrialButton>
          </div>

          <div className='pt-8'>
            <Link
              href='/welcome'
              className='text-sm text-zinc-500 hover:text-zinc-400 transition-colors inline-block'
            >
              Learn more about features →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-zinc-800/50 py-8 sm:py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-zinc-500'>
            <div>© {new Date().getFullYear()} Lunary</div>
            <div className='flex gap-4 sm:gap-6'>
              <Link
                href='/welcome'
                className='hover:text-zinc-400 transition-colors'
              >
                Features
              </Link>
              <Link href='/' className='hover:text-zinc-400 transition-colors'>
                Daily Insights
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
