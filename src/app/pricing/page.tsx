'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Capacitor } from '@capacitor/core';
import { IOSPaywall } from '@/components/IOSPaywall';
import { useUser } from '@/context/UserContext';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import { NewsletterSignupForm } from '@/components/NewsletterSignupForm';
import {
  PRICING_PLANS,
  getPricingPlansWithStripeData,
  type PricingPlan,
} from '../../../utils/pricing';
import { createCheckoutSession } from '../../../utils/stripe';
import {
  Check,
  Sparkles,
  Star,
  ChevronDown,
  ChevronUp,
  Tag,
} from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuthStatus } from '@/components/AuthStatus';
import { useCurrency, formatPrice } from '../../hooks/useCurrency';
import { getPriceForCurrency } from '../../../utils/stripe-prices';
import { FAQStructuredData } from '@/components/FAQStructuredData';
import { conversionTracking } from '@/lib/analytics';
import { MarketingFooter } from '@/components/MarketingFooter';
import { createProductSchema, renderJsonLd } from '@/lib/schema';
import { AuthComponent } from '@/components/Auth';
import { useModal } from '@/hooks/useModal';
import { PricingComparisonTable } from '@/components/PricingComparisonTable';
import { CTA_COPY } from '@/lib/cta-copy';
import { FAQAccordion } from '@/components/FAQ';
import { getPricingFAQs } from '@/lib/faq-helpers';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { getABTestMetadataFromVariant } from '@/lib/ab-test-tracking';

const formatChatFeature = (plan: PricingPlan): string | undefined => {
  if (!plan.chatLabel) return undefined;
  if (typeof plan.chatLimitPerDay === 'number') {
    return `${plan.chatLabel} (up to ${plan.chatLimitPerDay} messages/day)`;
  }
  return plan.chatLabel;
};

const formatTrialFeature = (plan: PricingPlan): string | undefined => {
  if (plan.trialDays && plan.trialDays > 0) {
    return `${plan.trialDays}-day free trial`;
  }
  return undefined;
};

const buildPlanFeatures = (plan: PricingPlan): string[] => {
  const derived = [formatChatFeature(plan), formatTrialFeature(plan)].filter(
    Boolean,
  ) as string[];
  return [...plan.features, ...derived];
};
export default function PricingPage() {
  // null = not yet determined (SSR or first frame), false = web, true = iOS
  const [isNativeIOS, setIsNativeIOS] = useState<boolean | null>(null);
  useEffect(() => {
    setIsNativeIOS(
      Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios',
    );
  }, []);
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [pendingCheckout, setPendingCheckout] = useState<{
    priceId: string;
    planId: string;
    planInterval: 'month' | 'year';
  } | null>(null);

  // A/B Test: Track PostHog variants
  const pricingCtaVariant = useFeatureFlagVariant('pricing_cta_test');
  const pricingDisplayVariant = useFeatureFlagVariant('pricing_display_test');

  useModal({
    isOpen: showAuthModal,
    onClose: () => {
      setShowAuthModal(false);
      setPendingCheckout(null);
    },
    closeOnClickOutside: false,
  });

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
        const dynamicPlans = await getPricingPlansWithStripeData(currency);
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

    const promo = params.get('promo') || params.get('coupon');
    if (promo) {
      setPromoCode(promo.toUpperCase());
      setShowPromoInput(true);
    }

    loadPricingPlans();
  }, [currency]);

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

  const startCheckout = async (
    priceId: string,
    planId: string,
    planInterval: 'month' | 'year',
  ) => {
    if (!priceId) return;

    setLoading(planId);
    const planLabel = planInterval === 'year' ? 'yearly_plan' : 'monthly_plan';

    // Track upgrade click with A/B test metadata
    const ctaMetadata = getABTestMetadataFromVariant(
      'pricing_cta_test',
      pricingCtaVariant,
    );
    if (ctaMetadata) {
      import('@/lib/analytics').then(({ trackEvent }) => {
        trackEvent('upgrade_clicked', {
          featureName: `${planId}-${planLabel}`,
          pagePath: '/pricing',
          metadata: ctaMetadata,
        });
      });
    } else {
      conversionTracking.upgradeClicked(`${planId}-${planLabel}`, '/pricing');
    }

    try {
      const storedReferralCode = localStorage.getItem('lunary_referral_code');
      const currentUserId = authState.user?.id || user?.id;
      const currentUserEmail = user?.email || authState.user?.email;

      const checkout = await createCheckoutSession(
        priceId,
        subscription.customerId,
        storedReferralCode || undefined,
        undefined,
        currentUserId,
        currentUserEmail,
        promoCode.trim() || undefined,
      );

      if (checkout.portalUrl) {
        window.location.href = checkout.portalUrl;
        return;
      }

      if (checkout.url) {
        window.location.href = checkout.url;
        return;
      }

      throw new Error('Missing checkout URL from response');
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleSubscribe = async (
    priceId: string,
    planId: string,
    planInterval: 'month' | 'year',
  ) => {
    if (!authState.isAuthenticated) {
      setPendingCheckout({ priceId, planId, planInterval });
      setShowAuthModal(true);
      return;
    }

    await startCheckout(priceId, planId, planInterval);
  };

  const handleAuthSuccess = async () => {
    const pending = pendingCheckout;
    setShowAuthModal(false);
    setPendingCheckout(null);
    if (!pending) {
      return;
    }

    await startCheckout(pending.priceId, pending.planId, pending.planInterval);
  };

  const faqs = getPricingFAQs();
  const [openFAQId, setOpenFAQId] = useState<string | null>(null);

  // Track page view on mount with A/B test data
  useEffect(() => {
    const ctaMetadata = getABTestMetadataFromVariant(
      'pricing_cta_test',
      pricingCtaVariant,
    );
    const displayMetadata = getABTestMetadataFromVariant(
      'pricing_display_test',
      pricingDisplayVariant,
    );

    // Track with whichever A/B test is active (prefer CTA test)
    const abMetadata = ctaMetadata || displayMetadata || {};

    if (Object.keys(abMetadata).length > 0) {
      // Track pricing_page_viewed as impression event with A/B test metadata
      import('@/lib/analytics').then(({ trackEvent }) => {
        trackEvent('pricing_page_viewed', {
          metadata: abMetadata,
        });
      });
    } else {
      conversionTracking.pageViewed('/pricing');
    }
  }, [pricingCtaVariant, pricingDisplayVariant]);

  const productSchemas = useMemo(
    () =>
      pricingPlans.map((plan) =>
        createProductSchema({
          name: plan.name,
          description: plan.description,
          price: plan.price,
          priceCurrency: 'USD',
          interval: plan.interval,
          features: buildPlanFeatures(plan),
          sku: plan.id,
        }),
      ),
    [pricingPlans],
  );

  // While platform is being detected, show blank (avoids hydration flash)
  if (isNativeIOS === null) {
    return <div className='min-h-screen bg-zinc-950' />;
  }

  // On iOS, always use Apple IAP — never Stripe
  if (isNativeIOS) {
    return (
      <div className='min-h-screen bg-zinc-950 flex flex-col justify-center px-6 py-12'>
        <div className='max-w-sm mx-auto w-full'>
          <h1 className='text-2xl font-semibold text-zinc-100 text-center mb-2'>
            Lunary+
          </h1>
          <p className='text-sm text-zinc-400 text-center mb-8'>
            Unlock your full cosmic experience
          </p>
          <IOSPaywall
            onSuccess={() => {
              window.location.href = '/app';
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <FAQStructuredData faqs={faqs} />
      {productSchemas.map((schema, index) => (
        <span key={index}>{renderJsonLd(schema)}</span>
      ))}
      <div className='min-h-fit bg-[#0a0a0f] text-zinc-100 flex flex-col'>
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

            <h1 className='text-2xl md:text-6xl font-light tracking-tight mb-6'>
              Your cosmic journey
              <br />
              <span className='text-lunary-accent-300'>starts here</span>
            </h1>

            <p className='text-base md:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed mb-4'>
              Start with free access to your birth chart, moon phases, and
              general cosmic insights. Upgrade for personalized readings based
              on your exact birth chart.
            </p>
            <div className='flex items-center justify-center gap-4 text-sm text-zinc-500'>
              <div className='flex items-center gap-2'>
                <Check className='w-4 h-4 text-lunary-primary-400' />
                <span>No credit card required</span>
              </div>
              <div className='flex items-center gap-2'>
                <Check className='w-4 h-4 text-lunary-primary-400' />
                <span>Cancel anytime</span>
              </div>
            </div>
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

        {/* Promo Code */}
        <section className='relative pb-4'>
          <div className='flex justify-center'>
            {showPromoInput ? (
              <div className='flex items-center gap-2'>
                <div className='relative'>
                  <Tag className='absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500' />
                  <input
                    type='text'
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder='Enter code'
                    className='pl-9 pr-3 py-2 w-44 rounded-lg bg-zinc-900/80 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-lunary-primary-600 transition-colors'
                  />
                </div>
                {promoCode && (
                  <span className='text-xs text-lunary-primary-400'>
                    Applied at checkout
                  </span>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowPromoInput(true)}
                className='text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5'
              >
                <Tag className='w-3 h-3' />
                Have a promo code?
              </button>
            )}
          </div>
        </section>

        {/* Which Plan Guide */}
        <section className='relative pb-12'>
          <div className='max-w-4xl mx-auto px-6'>
            <div className='p-6 md:p-8 bg-zinc-900/40 rounded-2xl border border-zinc-800/60'>
              <h3 className='text-lg md:text-xl font-light text-zinc-100 mb-6 text-center'>
                Which plan is right for me?
              </h3>
              <div className='space-y-3 text-sm'>
                <div className='flex flex-col md:flex-row md:justify-between gap-2 md:gap-4 py-2 border-b border-zinc-800/50'>
                  <span className='text-zinc-400'>
                    Try astrology for the first time
                  </span>
                  <span className='text-lunary-primary-300 font-medium'>
                    Free
                  </span>
                </div>
                <div className='flex flex-col md:flex-row md:justify-between gap-2 md:gap-4 py-2 border-b border-zinc-800/50'>
                  <span className='text-zinc-400'>
                    Build a daily check-in habit
                  </span>
                  <span className='text-lunary-primary-300 font-medium'>
                    Lunary+ ($4.99/mo)
                  </span>
                </div>
                <div className='flex flex-col md:flex-row md:justify-between gap-2 md:gap-4 py-2'>
                  <span className='text-zinc-400'>
                    Explore your patterns in depth with your Astral Guide
                  </span>
                  <span className='text-lunary-primary-300 font-medium'>
                    Lunary+ Pro ($8.99/mo)
                  </span>
                </div>
              </div>
              <p className='text-xs text-zinc-500 mt-6 text-center'>
                Still not sure?{' '}
                <Link
                  href='#pricing-plans'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  Compare features below
                </Link>
              </p>
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
                  const planFeatures = buildPlanFeatures(plan);
                  const visibleFeatures = isExpanded
                    ? planFeatures
                    : planFeatures.slice(0, 6);
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

                      <div className='mb-3 md:mb-6'>
                        <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                          {plan.name}
                        </h3>
                        <p className='text-sm text-lunary-200 mb-2'>
                          {plan.subtitle}
                        </p>
                        <p className='text-sm text-zinc-400'>
                          {plan.description}
                        </p>
                      </div>

                      <div className='mb-6'>
                        {isFree ? (
                          <div className='text-3xl md:text-4xl font-light'>
                            Free
                          </div>
                        ) : (
                          <div>
                            <span className='text-3xl md:text-4xl font-light'>
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
                            <span className='text-zinc-400'>{feature}</span>
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
                            href={
                              authState.isAuthenticated
                                ? '/app'
                                : '/auth?signup=true'
                            }
                            className='w-full block text-center py-3 rounded-xl border border-zinc-800 text-zinc-400 text-sm font-medium hover:bg-zinc-800/50 transition-colors'
                          >
                            {authState.isAuthenticated
                              ? CTA_COPY.pricing.openApp
                              : CTA_COPY.auth.createChart}
                          </Link>
                        ) : (subscriptionStatus === 'active' ||
                            subscriptionStatus === 'trial') &&
                          subscription.plan === plan.id ? (
                          <Link
                            href='/profile'
                            className='w-full block text-center py-3 rounded-xl border border-lunary-primary-600 bg-lunary-primary-900 text-lunary-accent-300 text-sm font-medium hover:bg-lunary-primary-800 transition-colors'
                          >
                            {CTA_COPY.pricing.currentPlan}
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
                                if (authState.isAuthenticated) {
                                  window.location.href = '/profile';
                                } else {
                                  window.location.href = '/auth?signup=true';
                                }
                                return;
                              }
                              handleSubscribe(priceId, plan.id, plan.interval);
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
                              authState.isAuthenticated ? (
                                CTA_COPY.pricing.openApp
                              ) : (
                                CTA_COPY.auth.createChart
                              )
                            ) : (
                              CTA_COPY.pricing.startTrial
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
              All paid plans include a free trial. Cancel anytime.
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
                  title: 'Personal Tarot Card',
                  desc: 'Daily card drawn from your birth chart with transit timeline context',
                },
                {
                  title: 'Personal Transit Impacts',
                  desc: 'See how current planets affect your chart, with tarot transit timeline',
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
                  title: 'Tarot Pattern Analysis',
                  desc: 'Track recurring themes and card trends across up to 6 months of readings',
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
          </div>
        </section>

        {/* Detailed Comparison */}
        <section className='relative py-20 border-t border-zinc-800/50'>
          <div className='max-w-6xl mx-auto px-6'>
            <h2 className='text-2xl md:text-3xl font-light text-center mb-12'>
              Feature comparison
            </h2>
            <PricingComparisonTable />
          </div>
        </section>

        {/* FAQ */}
        <section className='relative py-20 border-t border-zinc-800/50 bg-zinc-900/20'>
          <div className='max-w-3xl mx-auto px-6'>
            <h2 className='text-2xl md:text-3xl font-light text-center mb-12'>
              Common questions
            </h2>

            <div className='space-y-4'>
              {faqs.map((faq) => (
                <FAQAccordion
                  key={faq.id}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQId === faq.id}
                  onToggle={() =>
                    setOpenFAQId(openFAQId === faq.id ? null : faq.id)
                  }
                />
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
              Ready to get your birth chart?
            </h2>
            <p className='text-zinc-400 mb-8'>
              Create your chart for free using your exact birth time and
              location.
            </p>
            <SmartTrialButton />
          </div>
        </section>

        <div className='mt-auto'>
          <MarketingFooter />
        </div>
      </div>

      {showAuthModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-zinc-900 rounded-lg p-4 sm:p-6 w-full max-w-md relative mx-4 sm:mx-0'>
            <button
              onClick={() => {
                setShowAuthModal(false);
                setPendingCheckout(null);
              }}
              className='absolute top-2 right-2 sm:top-4 sm:right-4 text-zinc-400 hover:text-white text-xl'
            >
              ×
            </button>

            <div className='text-center mb-4 sm:mb-6'>
              <h3 className='text-lg sm:text-xl font-bold text-white mb-2'>
                Create your account
              </h3>
              <p className='text-zinc-300 text-xs sm:text-sm'>
                Sign up to continue to checkout and start your free trial.
              </p>
            </div>

            <AuthComponent
              compact={false}
              defaultToSignUp={true}
              onSuccess={handleAuthSuccess}
            />
          </div>
        </div>
      )}
    </>
  );
}
