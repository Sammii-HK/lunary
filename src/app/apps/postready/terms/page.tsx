import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';
import { MarketingBreadcrumbs } from '@/components/MarketingBreadcrumbs';

export const metadata: Metadata = {
  title: 'Terms of Service | PostReady',
  description:
    'Terms of service for the PostReady iOS app, including subscriptions, acceptable use, and third-party services.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://lunary.app/apps/postready/terms',
  },
};

export default function PostReadyTermsOfServicePage() {
  const lastUpdated = 'April 23, 2026';

  return (
    <div className='min-h-screen bg-surface-base text-content-primary flex flex-col pt-16'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <MarketingBreadcrumbs />
        <div className='mb-8'>
          <h1 className='text-2xl md:text-4xl font-semibold text-content-primary mb-4'>
            Terms of Service: PostReady
          </h1>
          <p className='text-sm text-content-muted'>
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <p className='text-content-secondary leading-relaxed'>
              These Terms of Service (&quot;Terms&quot;) govern your access to
              and use of PostReady, an iOS application for recording, editing,
              and exporting short-form video, provided by Lunar Computing, Inc.
              (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
            </p>
            <p className='text-content-secondary leading-relaxed'>
              By downloading or using PostReady, you agree to be bound by these
              Terms. If you do not agree, you may not use PostReady.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              1. Licence
            </h2>
            <p className='text-content-secondary leading-relaxed mb-4'>
              Subject to your compliance with these Terms, we grant you a
              limited, personal, non-exclusive, non-transferable, revocable
              licence to download and use PostReady on Apple devices you own or
              control, for your own content creation.
            </p>
            <p className='text-content-secondary leading-relaxed mb-4'>
              You may not:
            </p>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              <li>Copy, modify, or create derivative works of PostReady</li>
              <li>
                Reverse engineer, decompile, disassemble, or attempt to derive
                the source code
              </li>
              <li>Sublicense, lease, loan, rent, or transfer PostReady</li>
              <li>Use PostReady to build a competing product</li>
              <li>
                Remove or alter any proprietary notices, labels, or marks in
                PostReady
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              2. Age requirement
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              You must be at least 16 years of age to use PostReady. By using
              PostReady, you represent and warrant that you meet this
              eligibility requirement.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              3. Subscriptions and in-app purchases
            </h2>

            <h3 className='text-xl font-medium text-content-primary mb-3'>
              3.1 Plans and pricing
            </h3>
            <p className='text-content-secondary leading-relaxed mb-4'>
              PostReady offers the following paid plans, sold via Apple in-app
              purchase:
            </p>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              <li>
                <strong>Monthly subscription:</strong> £3.99 per month,
                auto-renewing every month.
              </li>
              <li>
                <strong>Annual subscription:</strong> £29.99 per year,
                auto-renewing every year.
              </li>
              <li>
                <strong>Lifetime:</strong> £99.00 one-off purchase, not a
                subscription, no renewal.
              </li>
            </ul>
            <p className='text-content-secondary leading-relaxed mt-4'>
              Prices may vary by storefront and currency, and are shown to you
              in your local currency at the time of purchase. Apple may adjust
              prices in line with its payment processing rules.
            </p>

            <h3 className='text-xl font-medium text-content-primary mb-3 mt-6'>
              3.2 Free trial
            </h3>
            <p className='text-content-secondary leading-relaxed'>
              Subscription plans may include a 7-day free trial for eligible
              users. If you do not cancel at least 24 hours before the trial
              ends, the subscription will automatically renew at the price of
              the selected plan, and your payment method will be charged.
            </p>

            <h3 className='text-xl font-medium text-content-primary mb-3 mt-6'>
              3.3 Auto-renewal
            </h3>
            <p className='text-content-secondary leading-relaxed'>
              Subscriptions automatically renew at the end of each billing cycle
              unless cancelled at least 24 hours before the end of the current
              period. Your payment method will be charged for the renewal within
              24 hours prior to the end of the current period.
            </p>

            <h3 className='text-xl font-medium text-content-primary mb-3 mt-6'>
              3.4 Cancellation
            </h3>
            <p className='text-content-secondary leading-relaxed'>
              You can cancel your subscription at any time from iOS Settings,
              via <em>Apple ID → Subscriptions → PostReady</em>. Cancellation
              takes effect at the end of the current billing period; you keep
              access until then. Deleting the app does not cancel a
              subscription.
            </p>

            <h3 className='text-xl font-medium text-content-primary mb-3 mt-6'>
              3.5 Refunds
            </h3>
            <p className='text-content-secondary leading-relaxed'>
              All purchases are processed by Apple. Refund requests must be
              submitted to Apple via{' '}
              <a
                href='https://support.apple.com/en-us/HT204084'
                target='_blank'
                rel='noopener noreferrer'
                className='text-lunary-primary-400 hover:text-content-brand'
              >
                Apple&apos;s refund process
              </a>
              . We cannot issue refunds directly.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              4. Your content
            </h2>
            <p className='text-content-secondary leading-relaxed mb-4'>
              You retain all rights to any videos, audio, images, transcripts,
              and other content you create or import in PostReady. PostReady
              does not claim ownership of your content, does not acquire any
              licence to it, and does not upload it to our servers. Your content
              stays on your device unless you choose to export or share it.
            </p>
            <p className='text-content-secondary leading-relaxed'>
              You are solely responsible for the content you create, including
              ensuring that you have the rights to any music, footage, or
              likenesses you include.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              5. Acceptable use
            </h2>
            <p className='text-content-secondary leading-relaxed mb-4'>
              You agree to use PostReady only for lawful, personal content
              creation. You may not use PostReady to create, store, or export
              content that:
            </p>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              <li>
                Constitutes hate speech, harassment, threats, or incitement of
                violence
              </li>
              <li>
                Infringes any third party&apos;s copyright, trademark, or other
                intellectual property rights
              </li>
              <li>
                Impersonates any person or entity, or misrepresents your
                affiliation with any person or entity
              </li>
              <li>
                Depicts sexual content involving minors or any other unlawful
                content
              </li>
              <li>
                Violates any applicable law, regulation, or third-party rights
              </li>
            </ul>
            <p className='text-content-secondary leading-relaxed mt-4'>
              You also agree not to attempt to gain unauthorised access to
              PostReady or its related systems, to use automated tools against
              PostReady, or to interfere with its normal operation.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              6. Third-party services
            </h2>
            <p className='text-content-secondary leading-relaxed mb-4'>
              PostReady integrates with the following third-party services. By
              using a feature that relies on one of them, you also agree to that
              provider&apos;s terms and privacy policy:
            </p>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              <li>
                <strong>Apple:</strong> the App Store, Sign in with Apple,
                iCloud, and in-app purchase billing. Governed by Apple&apos;s
                terms.
              </li>
              <li>
                <strong>RevenueCat:</strong> manages subscription status on our
                behalf. See{' '}
                <a
                  href='https://www.revenuecat.com/terms'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-lunary-primary-400 hover:text-content-brand'
                >
                  RevenueCat terms
                </a>
                .
              </li>
              <li>
                <strong>ElevenLabs (BYOK, optional):</strong> if you add your
                own ElevenLabs API key, your requests are sent directly from
                your device to ElevenLabs under your own account. See{' '}
                <a
                  href='https://elevenlabs.io/terms'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-lunary-primary-400 hover:text-content-brand'
                >
                  ElevenLabs terms
                </a>
                .
              </li>
              <li>
                <strong>Pexels (BYOK, optional):</strong> if you add your own
                Pexels API key, your b-roll requests are sent directly from your
                device to Pexels under your own account. See{' '}
                <a
                  href='https://www.pexels.com/terms-of-service/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-lunary-primary-400 hover:text-content-brand'
                >
                  Pexels terms
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              7. Disclaimer of warranties
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              PostReady is provided &quot;as is&quot; and &quot;as
              available&quot;, without warranties of any kind, whether express
              or implied, including warranties of merchantability, fitness for a
              particular purpose, and non-infringement. We do not warrant that
              PostReady will be uninterrupted, error-free, or that defects will
              be corrected. You use PostReady at your own risk.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              8. Limitation of liability
            </h2>
            <p className='text-content-secondary leading-relaxed mb-4'>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              <li>
                We are not liable for any indirect, incidental, special,
                consequential, or punitive damages
              </li>
              <li>
                We are not liable for loss of data, lost profits, business
                interruption, or loss of goodwill
              </li>
              <li>
                Our total aggregate liability to you for all claims arising out
                of or relating to PostReady is limited to the greater of the
                amount you paid us for PostReady in the 12 months preceding the
                claim, or £50
              </li>
            </ul>
            <p className='text-content-secondary leading-relaxed mt-4'>
              Nothing in these Terms limits liability that cannot be limited
              under applicable law, including for death or personal injury
              caused by our negligence, or for fraud or fraudulent
              misrepresentation.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              9. Termination
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              We may suspend or terminate your access to PostReady if you
              materially breach these Terms. You may stop using PostReady at any
              time by deleting the app from your device. Termination does not
              automatically cancel an active subscription; cancel your
              subscription separately in iOS Settings as described in section
              3.4.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              10. Changes to these terms
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              We may update these Terms from time to time. When we do, we will
              update the &quot;Last Updated&quot; date at the top of this page,
              and where appropriate we will notify you in-app. Continued use of
              PostReady after the changes take effect constitutes acceptance of
              the updated Terms.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              11. Governing law
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              These Terms are governed by the laws of England and Wales. Any
              disputes arising out of or relating to these Terms or PostReady
              are subject to the exclusive jurisdiction of the courts of England
              and Wales, without prejudice to any mandatory consumer protection
              rights you may have under the laws of your country of residence.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              12. Contact us
            </h2>
            <div className='p-4 border border-stroke-subtle bg-surface-elevated/30 rounded-xl'>
              <p className='text-content-secondary'>
                <strong>Lunar Computing, Inc.</strong>
                <br />
                131 Continental Dr, Suite 305
                <br />
                Newark, DE 19713, USA
                <br />
                <br />
                Email:{' '}
                <a
                  href='mailto:hello@lunary.app'
                  className='text-lunary-primary-400 hover:text-content-brand'
                >
                  hello@lunary.app
                </a>
              </p>
            </div>
          </section>

          <section className='pt-8 border-t border-stroke-subtle'>
            <h2 className='text-lg font-medium text-content-primary mb-4'>
              Related Policies
            </h2>
            <div className='flex flex-wrap gap-4'>
              <Link
                href='/apps/postready/privacy'
                className='text-lunary-primary-400 hover:text-content-brand text-sm'
              >
                PostReady Privacy Policy
              </Link>
              <Link
                href='/apps/terms'
                className='text-lunary-primary-400 hover:text-content-brand text-sm'
              >
                Lunary iOS Apps Terms
              </Link>
              <Link
                href='/terms'
                className='text-lunary-primary-400 hover:text-content-brand text-sm'
              >
                Lunary Web Terms
              </Link>
            </div>
          </section>
        </div>
      </div>
      <div className='mt-auto'>
        <MarketingFooter />
      </div>
    </div>
  );
}
