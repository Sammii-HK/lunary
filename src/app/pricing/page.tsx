'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAccount } from 'jazz-tools/react';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import { NewsletterSignupForm } from '@/components/NewsletterSignupForm';
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
import { useCurrency, formatPrice } from '../../hooks/useCurrency';
import { getPriceForCurrency } from '../../../utils/stripe-prices';
import { FAQStructuredData } from '@/components/FAQStructuredData';
import { useConversionTracking } from '@/hooks/useConversionTracking';
import { conversionTracking } from '@/lib/analytics';
import {
  getABTestVariant,
  AB_TESTS,
  trackABTestConversion,
} from '@/lib/ab-testing';

// Metadata is handled in layout.tsx for client components
export default function PricingPage() {
  const { me } = useAccount();
  const subscription = useSubscription();
  const authState = useAuthStatus();
  const { trackEvent } = useConversionTracking();
  const currency = useCurrency();
  const [loading, setLoading] = useState<string | null>(null);
  const [pricingPlans, setPricingPlans] =
    useState<PricingPlan[]>(PRICING_PLANS);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);

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

    // Check for referral code in URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
      // Store in localStorage for checkout
      localStorage.setItem('lunary_referral_code', ref);
    }

    loadPricingPlans();
  }, []);

  const subscriptionStatus = subscription.status || 'free';
  const trialDaysRemaining = subscription.trialDaysRemaining;

  // Compute prices with currency mapping
  const plansWithCurrency = useMemo(() => {
    return pricingPlans.map((plan) => {
      if (plan.price === 0) return plan;

      const currencyPrice = getPriceForCurrency(plan.id as any, currency);
      const displayPrice = currencyPrice?.amount || plan.price;
      const displayCurrency = currencyPrice?.currency.toUpperCase() || currency;

      // Calculate dynamic savings for annual plan
      let calculatedSavings: string | undefined = plan.savings;
      if (plan.interval === 'year' && plan.id === 'lunary_plus_ai_annual') {
        // Find the monthly AI plan price in the same currency
        const monthlyAIPrice = getPriceForCurrency(
          'lunary_plus_ai' as any,
          currency,
        );
        if (monthlyAIPrice) {
          const yearlyCost = monthlyAIPrice.amount * 12;
          const savings = yearlyCost - displayPrice;
          const savingsPercent = Math.round((savings / yearlyCost) * 100);
          calculatedSavings = `Save ${savingsPercent}%`;
        }
      }

      // Always prefer currency-specific price ID, never fall back to env var
      // as it might point to old prices
      return {
        ...plan,
        displayPrice,
        displayCurrency,
        currencyPriceId: currencyPrice?.priceId || undefined, // Don't fall back to old env var
        calculatedSavings,
      };
    });
  }, [pricingPlans, currency]);

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (!priceId) return;

    setLoading(planId);

    conversionTracking.upgradeClicked(
      planId === 'monthly' ? 'monthly_plan' : 'yearly_plan',
      '/pricing',
    );
    try {
      // Get referral code from localStorage if present
      const storedReferralCode = localStorage.getItem('lunary_referral_code');
      const currentUserId =
        authState.user?.id || ((me as any)?.id as string | undefined);

      const { sessionId } = await createCheckoutSession(
        priceId,
        subscription.customerId,
        storedReferralCode || undefined,
        undefined,
        currentUserId,
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

  const faqs = [
    {
      question: "What's included in the free trial?",
      answer:
        'Get full access to all personalized features including your complete birth chart analysis, personalized daily horoscopes, tarot patterns, and cosmic insights. Credit card required but no payment taken during trial.',
    },
    {
      question: 'Can I cancel anytime?',
      answer:
        "Absolutely. Cancel your subscription at any time through your account settings. You'll continue to have access to premium features until the end of your billing period.",
    },
    {
      question: 'How accurate are the birth chart calculations?',
      answer:
        'We use accurate astronomical algorithms to calculate planetary positions precise to your exact birth time, date, and location. Every calculation considers your unique cosmic signature.',
    },
    {
      question: 'Can I use Lunary offline?',
      answer:
        'Yes! Lunary is a Progressive Web App (PWA). Install it on your device for offline access to your birth chart, saved insights, and cosmic data. Works on mobile, tablet, and desktop.',
    },
    {
      question: 'Do you have push notifications?',
      answer:
        'Yes! Once you install Lunary as a PWA and sign in, you can enable push notifications for significant cosmic events, daily insights, and important transits. Stay connected to your cosmic rhythm.',
    },
    {
      question: 'What makes this different from other astrology apps?',
      answer:
        'Unlike apps that give generic horoscopes, every insight is calculated from your exact birth chart. We respect your intelligence with thoughtful guidance, never prescriptive advice.',
    },
  ];

  return (
    <>
      <FAQStructuredData faqs={faqs} />
      <div className='min-h-screen bg-zinc-950 text-zinc-100'>
        {/* Navigation */}
        <nav className='sticky top-0 z-10 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm'>
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
                  href='/blog'
                  className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
                >
                  Blog
                </Link>
                <Link
                  href='/pricing'
                  className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
                >
                  Pricing
                </Link>
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
                <Link
                  href='/help'
                  className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
                >
                  Help
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Header */}
        <section className='relative overflow-hidden border-b border-zinc-800/50'>
          <div className='absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-transparent to-transparent'></div>
          <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24'>
            <div className='text-center max-w-4xl mx-auto space-y-4 sm:space-y-6'>
              <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-zinc-100 leading-[1.1] tracking-tight'>
                Simple,{' '}
                <span className='font-normal text-purple-300/80'>
                  transparent
                </span>
                <br className='hidden sm:block' />
                <span className='sm:hidden'> </span>
                pricing
              </h1>

              {/* A/B Test: CTA Copy */}
              {(() => {
                const ctaVariant = getABTestVariant(AB_TESTS.PRICING_CTA);
                const ctaText =
                  ctaVariant === 'A'
                    ? 'Start your free trial - credit card required but no payment taken. Cancel anytime.'
                    : 'Unlock your cosmic blueprint. Start free trial - credit card required but no charge during trial.';

                return (
                  <p className='text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light'>
                    {ctaText}
                  </p>
                );
              })()}

              {subscriptionStatus === 'trial' && (
                <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mt-2'>
                  <Zap className='w-4 h-4 text-purple-300/90' strokeWidth={2} />
                  <span className='text-sm font-medium text-purple-300/90'>
                    {trialDaysRemaining} days left in your free trial
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className='py-12 sm:py-16 md:py-20 lg:py-24 border-b border-zinc-800/50'>
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
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-6 xl:gap-8 max-w-6xl mx-auto'>
                {plansWithCurrency.map((plan: any) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl p-6 md:p-6 lg:p-7 border transition-all duration-300 flex flex-col ${
                      plan.popular
                        ? 'border-purple-500/40 bg-zinc-900/60 hover:bg-zinc-900/80 shadow-lg shadow-purple-500/10'
                        : 'border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700/50'
                    }`}
                  >
                    {plan.popular && (
                      <div className='absolute -top-3 left-1/2 transform -translate-x-1/2 z-20'>
                        <div className='flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/40 bg-purple-500/15 backdrop-blur-sm'>
                          <Star
                            className='w-3 h-3 text-purple-300/90'
                            strokeWidth={2}
                            fill='currentColor'
                          />
                          <span className='text-xs font-semibold text-purple-300/90'>
                            Most Popular
                          </span>
                        </div>
                      </div>
                    )}

                    {(plan.calculatedSavings || plan.savings) && (
                      <div className='absolute -top-3 right-3 z-20'>
                        <div className='px-2.5 py-1 rounded-full border border-zinc-700/50 bg-zinc-800/80 backdrop-blur-sm'>
                          <span className='text-xs font-semibold text-zinc-300'>
                            {plan.calculatedSavings || plan.savings}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className='space-y-5 flex-1 flex flex-col'>
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
                      <div className='pb-3'>
                        {plan.price === 0 ? (
                          <div className='text-4xl md:text-5xl font-light text-zinc-100'>
                            Free
                          </div>
                        ) : (
                          <div className='space-y-1'>
                            <div className='text-5xl md:text-6xl font-light text-zinc-100 leading-none'>
                              {formatPrice(
                                plan.displayPrice,
                                plan.displayCurrency,
                              )}
                              <span className='text-xl md:text-2xl font-normal text-zinc-400 ml-2'>
                                /{plan.interval}
                              </span>
                            </div>
                            {plan.interval === 'year' && (
                              <div className='text-sm text-zinc-500'>
                                Just{' '}
                                {formatPrice(
                                  plan.displayPrice / 12,
                                  plan.displayCurrency,
                                )}
                                /month billed annually
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <div className='space-y-2.5 pt-4 border-t border-zinc-800/50 flex-1'>
                        {plan.features.map((feature: string, index: number) => (
                          <div key={index} className='flex items-start gap-3'>
                            <Check
                              className='w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0'
                              strokeWidth={2}
                            />
                            <span className='text-sm md:text-base text-zinc-400 leading-relaxed'>
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <div className='pt-4 mt-auto'>
                        {plan.id === 'free' && subscriptionStatus === 'free' ? (
                          <Link
                            href='/'
                            className='w-full block text-center py-3 px-4 rounded-lg border border-zinc-700/50 bg-zinc-800/50 hover:bg-zinc-800/70 text-zinc-300 text-sm font-medium transition-colors'
                          >
                            Current Plan
                          </Link>
                        ) : (subscriptionStatus === 'active' ||
                            subscriptionStatus === 'trial') &&
                          subscription.plan === plan.id ? (
                          <Link
                            href='/profile'
                            className='w-full block text-center py-3 px-4 rounded-lg border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/15 text-purple-300/90 text-sm font-medium transition-colors'
                          >
                            Current Plan
                            {subscriptionStatus === 'trial'
                              ? ` (${trialDaysRemaining} days left)`
                              : ''}
                          </Link>
                        ) : (
                          <button
                            onClick={() => {
                              const priceId =
                                (plan as any).currencyPriceId ||
                                plan.stripePriceId;
                              if (!priceId) {
                                console.error(
                                  'No price ID available for plan:',
                                  plan.id,
                                );
                                alert(
                                  'Price not available. Please refresh the page.',
                                );
                                return;
                              }
                              handleSubscribe(priceId, plan.id);
                            }}
                            disabled={
                              loading === plan.id ||
                              !(
                                (plan as any).currencyPriceId ||
                                plan.stripePriceId
                              )
                            }
                            className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                              plan.popular
                                ? 'bg-purple-500/15 hover:bg-purple-500/20 text-purple-300/90 border-2 border-purple-500/30 hover:border-purple-500/40'
                                : 'bg-zinc-800/50 hover:bg-zinc-800/70 text-zinc-300 border border-zinc-700/50 hover:border-zinc-600/50'
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

        {/* Newsletter CTA */}
        <section className='py-12 sm:py-16 md:py-20 border-b border-zinc-800/50'>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
            <NewsletterSignupForm
              align='center'
              source='pricing_page_section'
              className='border-zinc-800/60 bg-zinc-950/50 shadow-none'
              headline='Stay in the loop with Lunary'
              description='Not ready to upgrade yet? Get weekly product updates, cosmic reports, and special offers delivered to your inbox.'
              ctaLabel='Subscribe to updates'
              successMessage='Welcome aboard! Check your inbox to confirm your subscription.'
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className='py-12 sm:py-16 md:py-20 lg:py-24 border-b border-zinc-800/50 bg-zinc-900/20'>
          <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-10 md:mb-16 space-y-3 sm:space-y-4'>
              <h2 className='text-3xl sm:text-4xl md:text-5xl font-light text-zinc-100'>
                Frequently Asked Questions
              </h2>
              <p className='text-base sm:text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
                Everything you need to know about getting started.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8'>
              <div className='p-6 md:p-8 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/40 transition-colors'>
                <h3 className='text-lg md:text-xl font-medium text-zinc-100 mb-3'>
                  What's included in the free trial?
                </h3>
                <p className='text-sm md:text-base text-zinc-400 leading-relaxed'>
                  Get full access to all personalized features including your
                  complete birth chart analysis, personalized daily horoscopes,
                  tarot patterns, and cosmic insights. Credit card required but
                  no payment taken during trial to start.
                </p>
              </div>

              <div className='p-6 md:p-8 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/40 transition-colors'>
                <h3 className='text-lg md:text-xl font-medium text-zinc-100 mb-3'>
                  Can I cancel anytime?
                </h3>
                <p className='text-sm md:text-base text-zinc-400 leading-relaxed'>
                  Absolutely. Cancel your subscription at any time through your
                  account settings. You'll continue to have access to premium
                  features until the end of your billing period.
                </p>
              </div>

              <div className='p-6 md:p-8 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/40 transition-colors'>
                <h3 className='text-lg md:text-xl font-medium text-zinc-100 mb-3'>
                  How accurate are the birth chart calculations?
                </h3>
                <p className='text-sm md:text-base text-zinc-400 leading-relaxed'>
                  We use accurate astronomical algorithms to calculate planetary
                  positions precise to your exact birth time, date, and
                  location. Every calculation considers your unique cosmic
                  signature.
                </p>
              </div>

              <div className='p-6 md:p-8 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/40 transition-colors'>
                <h3 className='text-lg md:text-xl font-medium text-zinc-100 mb-3'>
                  Can I use Lunary offline?
                </h3>
                <p className='text-sm md:text-base text-zinc-400 leading-relaxed'>
                  Yes! Lunary is a Progressive Web App (PWA). Install it on your
                  device for offline access to your birth chart, saved insights,
                  and cosmic data. Works on mobile, tablet, and desktop.
                </p>
              </div>

              <div className='p-6 md:p-8 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/40 transition-colors'>
                <h3 className='text-lg md:text-xl font-medium text-zinc-100 mb-3'>
                  Do you have push notifications?
                </h3>
                <p className='text-sm md:text-base text-zinc-400 leading-relaxed'>
                  Yes! Once you install Lunary as a PWA and sign in, you can
                  enable push notifications for significant cosmic events, daily
                  insights, and important transits. Stay connected to your
                  cosmic rhythm.
                </p>
              </div>

              <div className='p-6 md:p-8 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/40 transition-colors'>
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
        <section className='py-12 sm:py-16 md:py-20 lg:py-24'>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8'>
            <h2 className='text-3xl sm:text-4xl md:text-5xl font-light text-zinc-100'>
              Ready to discover your cosmic blueprint?
            </h2>
            <p className='text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed'>
              Experience astrology that's actually about you. Credit card
              required but no payment taken during trial. Cancel anytime.
            </p>

            <div className='pt-4'>
              <SmartTrialButton />
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
        <footer className='border-t border-zinc-800/50 py-8 sm:py-10 md:py-12'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm md:text-base text-zinc-500'>
              <div>© {new Date().getFullYear()} Lunary</div>
              <div className='flex gap-4 sm:gap-6 md:gap-8'>
                <Link
                  href='/blog'
                  className='hover:text-zinc-400 transition-colors'
                >
                  Blog
                </Link>
                <Link
                  href='/welcome'
                  className='hover:text-zinc-400 transition-colors'
                >
                  Features
                </Link>
                <Link
                  href='/'
                  className='hover:text-zinc-400 transition-colors'
                >
                  Daily Insights
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
