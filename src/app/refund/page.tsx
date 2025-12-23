'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';
import { MarketingBreadcrumbs } from '@/components/MarketingBreadcrumbs';
import { useAuthStatus } from '@/components/AuthStatus';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function RefundPolicyPage() {
  const lastUpdated = 'December 6, 2025';
  const { isAuthenticated, user } = useAuthStatus();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefundRequest = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to request a refund');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/refund/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit refund request');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pt-16'>
      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <MarketingBreadcrumbs />
        <div className='mb-8'>
          <h1 className='text-4xl font-semibold text-white mb-4'>
            Refund Policy
          </h1>
          <p className='text-sm text-zinc-400'>Last Updated: {lastUpdated}</p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <p className='text-zinc-300 leading-relaxed'>
              This Refund Policy outlines the terms under which Lunar Computing,
              Inc. (&quot;Lunary,&quot; &quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;) provides refunds for subscriptions to our Lunary+
              service.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              1. Subscription Refunds
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              1.1 Monthly Subscriptions
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              For monthly Lunary+ subscriptions, we offer a full refund if you
              request it within 7 days of your initial subscription or any
              renewal date. After 7 days, no refunds will be provided for that
              billing period, but you may cancel to prevent future charges.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              1.2 Annual Subscriptions
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              For annual Lunary+ subscriptions, we offer a prorated refund if
              you request it within 30 days of your initial subscription or
              renewal date. The refund will be calculated based on the unused
              portion of your subscription. After 30 days, no refunds will be
              provided, but you may cancel to prevent future renewals.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              1.3 Trial Periods
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              If you signed up for a free trial and were charged after the trial
              period ended, you may request a refund within 7 days of the first
              charge if you did not use the paid service during that time.
            </p>
          </section>

          {/* Refund Request Form */}
          <section className='p-6 border border-lunary-primary-700 bg-lunary-primary-900/10 rounded-xl'>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Request a Refund
            </h2>

            {submitted ? (
              <div className='flex items-start gap-3 text-lunary-success'>
                <CheckCircle className='h-6 w-6 mt-0.5 shrink-0' />
                <div>
                  <p className='font-medium'>Refund request submitted</p>
                  <p className='text-sm text-zinc-400 mt-1'>
                    We&apos;ll review your request and process eligible refunds
                    within 5-7 business days. You&apos;ll receive an email
                    confirmation.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {!isAuthenticated ? (
                  <div className='text-center py-4'>
                    <p className='text-zinc-400 mb-4'>
                      Please sign in to request a refund
                    </p>
                    <Link
                      href='/auth'
                      className='inline-flex px-6 py-2 rounded-lg bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white font-medium transition-colors'
                    >
                      Sign In
                    </Link>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm text-zinc-400 mb-2'>
                        Reason for refund (optional)
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Let us know why you're requesting a refund..."
                        className='w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-lunary-primary resize-none'
                        rows={3}
                      />
                    </div>

                    {error && (
                      <div className='flex items-center gap-2 text-lunary-error text-sm'>
                        <AlertCircle className='h-4 w-4' />
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleRefundRequest}
                      disabled={submitting}
                      className='w-full py-3 rounded-lg bg-lunary-primary-600 hover:bg-lunary-primary-700 disabled:bg-lunary-primary-600/50 text-white font-medium transition-colors flex items-center justify-center gap-2'
                    >
                      {submitting ? (
                        <>
                          <Loader2 className='h-5 w-5 animate-spin' />
                          Submitting...
                        </>
                      ) : (
                        'Submit Refund Request'
                      )}
                    </button>

                    <p className='text-xs text-zinc-400 text-center'>
                      We&apos;ll automatically check your eligibility based on
                      your subscription date
                    </p>
                  </div>
                )}
              </>
            )}
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              2. Refund Processing
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              Approved refunds will be processed as follows:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Refunds are issued to the original payment method used for the
                purchase
              </li>
              <li>
                Processing time is typically 5-10 business days, depending on
                your payment provider
              </li>
              <li>
                All refunds are processed through Stripe, our payment processor
              </li>
              <li>
                You will receive an email confirmation when your refund is
                processed
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              3. Cancellation vs. Refund
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              Canceling your subscription and requesting a refund are different:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Cancellation:</strong> Stops future billing. You retain
                access to Lunary+ features until the end of your current billing
                period.
              </li>
              <li>
                <strong>Refund:</strong> Returns money for the current or recent
                billing period. Access to Lunary+ features ends immediately upon
                refund processing.
              </li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              You can cancel your subscription anytime from your{' '}
              <Link
                href='/profile'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                Profile Settings
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              4. Digital Goods
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              Due to the nature of digital content, once you have accessed or
              downloaded digital goods (such as cosmic reports, detailed
              readings, or exported data), those specific items are generally
              non-refundable. However, we evaluate each request on a
              case-by-case basis and will work with you to resolve any issues
              with your purchase.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              5. Exceptions
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              We may, at our discretion, provide refunds outside of the standard
              policy in cases such as:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Technical issues that prevented you from using the service
              </li>
              <li>Duplicate charges or billing errors</li>
              <li>Unauthorized transactions (subject to verification)</li>
              <li>
                Service outages lasting more than 24 consecutive hours during
                your billing period
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              6. Chargebacks
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              Before initiating a chargeback with your bank or credit card
              company, please use the refund request form above. We are
              committed to resolving any billing issues quickly and fairly.
              Initiating a chargeback without first attempting to resolve the
              issue with us may result in the suspension of your account.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              7. Changes to This Policy
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              We reserve the right to modify this Refund Policy at any time.
              Changes will be effective immediately upon posting to this page.
              Your continued use of the Service after any changes indicates your
              acceptance of the new policy.
            </p>
          </section>

          <section className='pt-8 border-t border-zinc-800'>
            <h2 className='text-lg font-medium text-white mb-4'>
              Related Policies
            </h2>
            <div className='flex flex-wrap gap-4'>
              <Link
                href='/terms'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Terms of Service
              </Link>
              <Link
                href='/privacy'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Privacy Policy
              </Link>
            </div>
          </section>
        </div>
      </main>
      <div className='mt-auto'>
        <MarketingFooter />
      </div>
    </div>
  );
}
