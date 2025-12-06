import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata: Metadata = {
  title: 'Refund Policy | Lunary',
  description:
    "Learn about Lunary's refund policy for subscriptions and digital purchases.",
  robots: 'index, follow',
};

export default function RefundPolicyPage() {
  const lastUpdated = 'December 6, 2025';

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pt-16'>
      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-semibold text-white mb-4'>
            Refund Policy
          </h1>
          <p className='text-sm text-zinc-500'>Last Updated: {lastUpdated}</p>
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

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              2. How to Request a Refund
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              To request a refund, please contact our support team:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Email:{' '}
                <a
                  href='mailto:support@lunary.app'
                  className='text-purple-400 hover:text-purple-300'
                >
                  support@lunary.app
                </a>
              </li>
              <li>Include &quot;Refund Request&quot; in the subject line</li>
              <li>
                Provide the email address associated with your Lunary account
              </li>
              <li>Briefly explain the reason for your refund request</li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              We aim to process refund requests within 5-7 business days.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              3. Refund Processing
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
              4. Cancellation vs. Refund
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
                className='text-purple-400 hover:text-purple-300'
              >
                Profile Settings
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              5. Digital Goods
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
              6. Exceptions
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
              7. Chargebacks
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              Before initiating a chargeback with your bank or credit card
              company, please contact us first. We are committed to resolving
              any billing issues quickly and fairly. Initiating a chargeback
              without first attempting to resolve the issue with us may result
              in the suspension of your account.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              8. Changes to This Policy
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              We reserve the right to modify this Refund Policy at any time.
              Changes will be effective immediately upon posting to this page.
              Your continued use of the Service after any changes indicates your
              acceptance of the new policy.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              9. Contact Us
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              If you have any questions about our Refund Policy, please contact
              us:
            </p>
            <div className='p-4 border border-zinc-800 bg-zinc-900/30 rounded-xl'>
              <p className='text-zinc-300'>
                <strong>Lunar Computing, Inc.</strong>
                <br />
                Email:{' '}
                <a
                  href='mailto:support@lunary.app'
                  className='text-purple-400 hover:text-purple-300'
                >
                  support@lunary.app
                </a>
              </p>
            </div>
          </section>

          <section className='pt-8 border-t border-zinc-800'>
            <h2 className='text-lg font-medium text-white mb-4'>
              Related Policies
            </h2>
            <div className='flex flex-wrap gap-4'>
              <Link
                href='/terms'
                className='text-purple-400 hover:text-purple-300 text-sm'
              >
                Terms of Service
              </Link>
              <Link
                href='/privacy'
                className='text-purple-400 hover:text-purple-300 text-sm'
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
