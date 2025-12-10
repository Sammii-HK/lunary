'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import { Button } from '@/components/ui/button';
import { NewsletterSignupForm } from '@/components/NewsletterSignupForm';
import {
  PRICING_PLANS,
  getPricingPlansWithStripeData,
  type PricingPlan,
} from '../../../utils/pricing';
import { createCheckoutSession } from '../../../utils/stripe';
import { loadStripe } from '@stripe/stripe-js';
import {
  Check,
  Sparkles,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuthStatus } from '@/components/AuthStatus';
import { useCurrency, formatPrice } from '../../hooks/useCurrency';
import { getPriceForCurrency } from '../../../utils/stripe-prices';
import { FAQStructuredData } from '@/components/FAQStructuredData';
import { conversionTracking } from '@/lib/analytics';
import { MarketingFooter } from '@/components/MarketingFooter';
import { createProductSchema, renderJsonLd } from '@/lib/schema';

export default function PricingPage() {
  const { user } = useUser();
  const subscription = useSubscription();
  const authState = useAuthStatus();
  const currency = useCurrency();
  const [loading, setLoading] = useState<string | null>(null);
  const [pricingPlans, setPricingPlans] =
    useState<PricingPlan[]>(PRICING_PLANS);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(
    'monthly',
  );

  const togglePlanExpanded = (planId: string) => {
    setExpandedPlans((prev) => {
      const next = new Set(prev);
      if (next.has(planId)) {
        next.delete(planId);
      } else {
        next.add(planId);
      }
      return next;
    });
  };

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

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('lunary_referral_code', ref);
    }

    loadPricingPlans();
  }, []);

  const subscriptionStatus = subscription.status || 'free';
  const trialDaysRemaining = subscription.trialDaysRemaining;

  // Compute prices with currency mapping - simplified to show monthly vs annual
  const plansWithCurrency = useMemo(() => {
    return pricingPlans.map((plan) => {
      if (plan.price === 0) return plan;

      const currencyPrice = getPriceForCurrency(plan.id as any, currency);
      const displayPrice = currencyPrice?.amount || plan.price;
      const displayCurrency = currencyPrice?.currency.toUpperCase() || currency;

      let calculatedSavings: string | undefined = plan.savings;
      if (plan.interval === 'year' && plan.id === 'lunary_plus_ai_annual') {
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

      return {
        ...plan,
        displayPrice,
        displayCurrency,
        currencyPriceId: currencyPrice?.priceId || undefined,
        calculatedSavings,
      };
    });
  }, [pricingPlans, currency]);

  // Get the main plans for display
  const freePlan = plansWithCurrency.find((p) => p.id === 'free');
  const plusPlan = plansWithCurrency.find((p) => p.id === 'lunary_plus');
  const aiPlan = plansWithCurrency.find((p) => p.id === 'lunary_plus_ai');
  const annualPlan = plansWithCurrency.find(
    (p) => p.id === 'lunary_plus_ai_annual',
  );

  // Display plans based on billing cycle
  const displayPlans =
    billingCycle === 'monthly'
      ? [freePlan, plusPlan, aiPlan].filter(Boolean)
      : [freePlan, plusPlan, annualPlan].filter(Boolean);

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (!priceId) return;

    setLoading(planId);
    conversionTracking.upgradeClicked(
      planId === 'monthly' ? 'monthly_plan' : 'yearly_plan',
      '/pricing',
    );

    try {
      const storedReferralCode = localStorage.getItem('lunary_referral_code');
      const currentUserId = authState.user?.id || user?.id;

      const { sessionId } = await createCheckoutSession(
        priceId,
        subscription.customerId,
        storedReferralCode || undefined,
        undefined,
        currentUserId,
      );

      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
      );
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
        'Full access to all personalized features including birth chart analysis, daily horoscopes, and AI chat. Credit card required but no payment taken during trial.',
    },
    {
      question: 'Can I cancel anytime?',
      answer:
        "Yes. Cancel through your account settings anytime. You'll keep access until the end of your billing period.",
    },
    {
      question: 'How accurate are the calculations?',
      answer:
        'We use precise astronomical algorithms based on your exact birth time, date, and location.',
    },
    {
      question: 'What makes Lunary different?',
      answer:
        'Every insight is calculated from your exact birth chart - not generic sun sign horoscopes.',
    },
  ];

  const productSchemas = [
    createProductSchema({
      name: 'Lunary Free',
      description:
        'Get a feel for your cosmic rhythm with basic astrology features.',
      price: 0,
      priceCurrency: 'USD',
      features: [
        'Daily moon phases',
        'General tarot card of the day',
        'Basic grimoire access',
      ],
      sku: 'lunary_free',
    }),
    createProductSchema({
      name: 'Lunary+',
      description: 'Personalized astrology based on your exact birth chart.',
      price: 4.99,
      priceCurrency: 'USD',
      interval: 'month',
      features: [
        'Complete birth chart analysis',
        'Personalized daily horoscopes',
        'Personal transit impacts',
        'Moon circle rituals',
        'Crystal recommendations',
      ],
      sku: 'lunary_plus',
    }),
    createProductSchema({
      name: 'Lunary+ AI',
      description: 'Unlimited AI guidance based on your birth chart.',
      price: 7.99,
      priceCurrency: 'USD',
      interval: 'month',
      features: [
        'Everything in Lunary+',
        'Unlimited AI chat',
        'Weekly cosmic reports',
        'Downloadable PDFs',
        'Advanced pattern analysis',
      ],
      sku: 'lunary_plus_ai',
    }),
  ];

  return (
    <>
      <FAQStructuredData faqs={faqs} />
      {productSchemas.map((schema, index) => (
        <span key={index}>{renderJsonLd(schema)}</span>
      ))}
      <div className='min-h-screen bg-[#0a0a0f] text-zinc-100 flex flex-col'>
        {/* Subtle gradient background */}
        <div className='fixed inset-0 bg-gradient-to-b from-lunary-primary-950/20 via-transparent to-transparent pointer-events-none' />

        {/* Header */}
        <section className='relative pt-24 pb-16 md:pt-32 md:pb-20'>
          <div className='max-w-5xl mx-auto px-6 text-center'>
            {subscriptionStatus === 'trial' && trialDaysRemaining ? (
              <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lunary-accent-950 border border-lunary-accent-700 mb-8'>
                <Sparkles className='w-3.5 h-3.5 text-lunary-accent' />
                <span className='text-xs font-medium text-lunary-accent-300'>
                  {trialDaysRemaining} days left in trial
                </span>
              </div>
            ) : subscriptionStatus === 'active' ? (
              <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lunary-success-950 border border-lunary-success-700 mb-8'>
                <Check className='w-3.5 h-3.5 text-lunary-success' />
                <span className='text-xs font-medium text-lunary-success-300'>
                  Active subscription
                </span>
              </div>
            ) : null}

            <h1 className='text-4xl md:text-6xl font-light tracking-tight mb-6'>
              Your cosmic journey
              <br />
              <span className='text-lunary-accent-300'>starts here</span>
            </h1>

            <p className='text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed'>
              Personalized astrology based on your exact birth chart. No generic
              horoscopes.
            </p>
          </div>
        </section>

        {/* Billing Toggle */}
        <section className='relative pb-8'>
          <div className='flex justify-center'>
            <div className='inline-flex items-center p-1 rounded-full bg-zinc-900/80 border border-zinc-800'>
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingCycle === 'annual'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                Annual
                <span className='text-xs px-2 py-0.5 rounded-full bg-lunary-success-900 text-lunary-success border border-lunary-success-700'>
                  Save 25%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section id='pricing-plans' className='relative pb-24 scroll-mt-48'>
          <div className='max-w-5xl mx-auto px-6'>
            <h2 className='sr-only'>Choose Your Plan</h2>
            {loadingPlans ? (
              <div className='flex justify-center py-20'>
                <div className='w-5 h-5 border-2 border-zinc-700 border-t-lunary-primary rounded-full animate-spin' />
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                {displayPlans.map((plan: any, index: number) => {
                  // Most Popular logic:
                  // - Monthly view: Lunary+ is most popular
                  // - Annual view: Annual plan is most popular (not Plus)
                  const isPopular =
                    billingCycle === 'monthly'
                      ? plan.id === 'lunary_plus'
                      : plan.id === 'lunary_plus_ai_annual';
                  const isFree = plan.price === 0;
                  const isExpanded = expandedPlans.has(plan.id);
                  const visibleFeatures = isExpanded
                    ? plan.features
                    : plan.features.slice(0, 6);
                  const hasMoreFeatures = plan.features.length > 6;

                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 border-2 ${
                        isPopular
                          ? 'bg-gradient-to-b from-lunary-primary-950/40 to-zinc-900/60 border-lunary-primary-700 shadow-xl shadow-lunary-primary-950'
                          : 'bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700/60'
                      }`}
                    >
                      {isPopular && (
                        <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                          <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-lunary-primary-900 border border-lunary-primary-700'>
                            <Star
                              className='w-3 h-3 text-lunary-accent'
                              fill='currentColor'
                            />
                            <span className='text-xs font-semibold text-lunary-accent-300'>
                              Most Popular
                            </span>
                          </div>
                        </div>
                      )}

                      <div className='mb-6'>
                        <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                          {plan.name}
                        </h3>
                        <p className='text-sm text-zinc-400'>
                          {plan.description}
                        </p>
                      </div>

                      <div className='mb-6'>
                        {isFree ? (
                          <div className='text-4xl font-light'>Free</div>
                        ) : (
                          <div>
                            <span className='text-4xl font-light'>
                              {formatPrice(
                                plan.displayPrice,
                                plan.displayCurrency,
                              )}
                            </span>
                            <span className='text-zinc-400 ml-1'>
                              /{plan.interval}
                            </span>
                            {plan.interval === 'year' && (
                              <div className='text-xs text-zinc-600 mt-1'>
                                {formatPrice(
                                  plan.displayPrice / 12,
                                  plan.displayCurrency,
                                )}
                                /month
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className='space-y-3 flex-1 mb-6'>
                        {visibleFeatures.map((feature: string, i: number) => (
                          <div key={i} className='flex items-start gap-2.5'>
                            <Check className='w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0' />
                            <span className='text-sm text-zinc-400'>
                              {feature}
                            </span>
                          </div>
                        ))}
                        {hasMoreFeatures && (
                          <button
                            onClick={() => togglePlanExpanded(plan.id)}
                            className='flex items-center gap-1 text-xs text-lunary-secondary hover:text-lunary-accent transition-colors pl-6'
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className='w-3 h-3' />
                                Show less
                              </>
                            ) : (
                              <>
                                <ChevronDown className='w-3 h-3' />+
                                {plan.features.length - 6} more features
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <div className='mt-auto'>
                        {plan.id === 'free' && subscriptionStatus === 'free' ? (
                          <Link
                            href='/'
                            className='w-full block text-center py-3 rounded-xl border border-zinc-800 text-zinc-400 text-sm font-medium hover:bg-zinc-800/50 transition-colors'
                          >
                            Current Plan
                          </Link>
                        ) : (subscriptionStatus === 'active' ||
                            subscriptionStatus === 'trial') &&
                          subscription.plan === plan.id ? (
                          <Link
                            href='/profile'
                            className='w-full block text-center py-3 rounded-xl border border-lunary-primary-600 bg-lunary-primary-900 text-lunary-accent-300 text-sm font-medium hover:bg-lunary-primary-800 transition-colors'
                          >
                            Current Plan
                          </Link>
                        ) : (
                          <button
                            onClick={() => {
                              const priceId =
                                (plan as any).currencyPriceId ||
                                plan.stripePriceId;
                              if (!priceId && !isFree) {
                                alert('Price not available. Please refresh.');
                                return;
                              }
                              if (isFree) {
                                window.location.href = '/';
                                return;
                              }
                              handleSubscribe(priceId, plan.id);
                            }}
                            disabled={loading === plan.id}
                            className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                              isPopular
                                ? 'bg-lunary-primary-900 hover:bg-lunary-primary-800 text-lunary-accent-300 border border-lunary-primary-700'
                                : 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/50'
                            } disabled:opacity-50`}
                          >
                            {loading === plan.id ? (
                              <span className='flex items-center justify-center gap-2'>
                                <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
                                Loading...
                              </span>
                            ) : isFree ? (
                              'Get Started'
                            ) : (
                              'Start Free Trial'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <p className='text-center text-xs text-zinc-600 mt-8'>
              All paid plans include a 7-day free trial. Cancel anytime.
            </p>
          </div>
        </section>

        {/* What's Included */}
        <section className='relative py-20 border-t border-zinc-800/50'>
          <div className='max-w-4xl mx-auto px-6'>
            <h2 className='text-2xl md:text-3xl font-light text-center mb-12'>
              Everything you get with{' '}
              <span className='text-lunary-accent'>Lunary+</span>
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {[
                {
                  title: 'Complete Birth Chart',
                  desc: 'Precise planetary positions based on your exact birth details',
                },
                {
                  title: 'Daily Horoscopes',
                  desc: 'Personalized insights calculated from your natal chart',
                },
                {
                  title: 'Personal Transit Impacts',
                  desc: 'See how current planets specifically affect your chart',
                },
                {
                  title: 'Solar Return Insights',
                  desc: 'Birthday themes & personal year number based on your chart',
                },
                {
                  title: 'Moon Circles',
                  desc: 'New and full moon rituals personalized to your chart',
                },
                {
                  title: 'Crystal Recommendations',
                  desc: 'Personalized crystals based on your birth chart & transits',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className='flex gap-4 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50'
                >
                  <div className='w-8 h-8 rounded-lg bg-lunary-primary-900 flex items-center justify-center flex-shrink-0'>
                    <Check className='w-4 h-4 text-lunary-accent' />
                  </div>
                  <div>
                    <h3 className='text-sm font-medium text-zinc-200 mb-1'>
                      {item.title}
                    </h3>
                    <p className='text-xs text-zinc-400'>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className='mt-12 p-6 rounded-2xl bg-gradient-to-r from-lunary-primary-900/40 via-lunary-secondary-900/30 to-lunary-rose-900/40 border border-lunary-primary-700/50'>
              <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Lunary+ AI includes everything above, plus:
                  </h3>
                  <p className='text-sm text-zinc-400'>
                    Unlimited AI chat, weekly reports, downloadable PDFs, and
                    advanced pattern analysis
                  </p>
                </div>
                <Button variant='lunary' className='flex-shrink-0' asChild>
                  <a href='#pricing-plans'>
                    Choose Plan
                    <ArrowRight className='w-4 h-4' />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className='relative py-20 border-t border-zinc-800/50 bg-zinc-900/20'>
          <div className='max-w-3xl mx-auto px-6'>
            <h2 className='text-2xl md:text-3xl font-light text-center mb-12'>
              Common questions
            </h2>

            <div className='space-y-4'>
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className='p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50'
                >
                  <h3 className='text-sm font-medium text-zinc-200 mb-2'>
                    {faq.question}
                  </h3>
                  <p className='text-sm text-zinc-400 leading-relaxed'>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className='relative py-16 border-t border-zinc-800/50'>
          <div className='max-w-xl mx-auto px-6'>
            <NewsletterSignupForm
              align='center'
              source='pricing_page_section'
              className='border-zinc-800/60 bg-zinc-950/50 shadow-none'
              headline='Not ready yet?'
              description='Get weekly cosmic insights and product updates.'
              ctaLabel='Subscribe'
              successMessage='Welcome! Check your inbox.'
            />
          </div>
        </section>

        {/* Final CTA */}
        <section className='relative py-20 border-t border-zinc-800/50'>
          <div className='max-w-2xl mx-auto px-6 text-center'>
            <h2 className='text-3xl md:text-4xl font-light mb-4'>
              Ready to explore your chart?
            </h2>
            <p className='text-zinc-400 mb-8'>
              Start your free trial today. No payment required.
            </p>
            <SmartTrialButton />
          </div>
        </section>

        <div className='mt-auto'>
          <MarketingFooter />
        </div>
      </div>
    </>
  );
}
