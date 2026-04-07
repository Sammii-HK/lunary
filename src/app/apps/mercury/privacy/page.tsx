import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';
import { MarketingBreadcrumbs } from '@/components/MarketingBreadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy | Is Mercury Retrograde?',
  description:
    'Privacy policy for the Is Mercury Retrograde? iOS app. Learn how your data is protected.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://lunary.app/apps/mercury/privacy',
  },
};

export default function MercuryRetrogadePrivacyPage() {
  const lastUpdated = 'March 14, 2026';

  return (
    <div className='min-h-screen bg-surface-base text-content-primary flex flex-col pt-16'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <MarketingBreadcrumbs />
        <div className='mb-8'>
          <h1 className='text-2xl md:text-4xl font-semibold text-content-primary mb-4'>
            Privacy Policy: Is Mercury Retrograde?
          </h1>
          <p className='text-sm text-content-muted'>
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <p className='text-content-secondary leading-relaxed'>
              Lunar Computing, Inc. (&quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;) develops the Is Mercury Retrograde? iOS app. This
              Privacy Policy explains how we handle your information when you
              use the app.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              1. Information We Collect
            </h2>

            <h3 className='text-xl font-medium text-content-primary mb-3'>
              1.1 Information You Provide
            </h3>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              <li>
                <strong>Sign in with Apple Account (Optional):</strong> If you
                choose to sign in using Apple ID, we receive an Apple user
                identifier. Sign in is optional; the app works fully without it.
                Your actual Apple email is not shared with us.
              </li>
              <li>
                <strong>Notification Preferences:</strong> If you create an
                account, your notification preference settings (for retrograde
                entry, peak, and exit alerts)
              </li>
            </ul>

            <h3 className='text-xl font-medium text-content-primary mb-3 mt-6'>
              1.2 Information Collected Automatically
            </h3>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              <li>
                <strong>Device Information:</strong> iOS version, device model,
                device identifier (for crash reporting only)
              </li>
              <li>
                <strong>Usage Analytics:</strong> How often you open the app and
                which features you use
              </li>
              <li>
                <strong>Crash Data:</strong> Error logs to help us improve
                stability
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              2. How We Use Your Information
            </h2>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              <li>
                Authenticate your account (if you choose to sign in) and sync
                your notification preferences
              </li>
              <li>
                Send push notifications for retrograde events and survival tips
              </li>
              <li>Improve app stability and fix bugs</li>
              <li>
                Understand which features are most useful to develop better
                content
              </li>
              <li>
                Send you important updates about the app (authentication,
                critical bug fixes)
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              3. Data Collection and Local Processing
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              No data is collected by us. The app only reads astronomical
              calculations performed locally on your device using the
              astronomy-engine library (MIT-licensed). No user data, readings,
              or personal information is sent to our servers. All retrograde
              status calculations and survival tips happen entirely on your
              device.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              4. Notification Preferences and CloudKit
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              If you create an account and enable push notifications, your
              notification preferences are synced to your iCloud account via
              CloudKit for safekeeping across your Apple devices. We do not have
              access to unencrypted CloudKit data; only you and Apple have
              access. You can modify your notification preferences at any time,
              and they will sync to your other devices.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              5. Third-Party Services
            </h2>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              <li>
                <strong>Apple CloudKit:</strong> Secure syncing of your
                notification preferences across your Apple devices (if you sign
                in)
              </li>
              <li>
                <strong>RevenueCat:</strong> In-app purchase management (does
                not access your data or preferences)
              </li>
              <li>
                <strong>Sentry:</strong> Crash reporting and error tracking
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              6. Do We Sell Your Data?
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              No. We do not sell, share, or monetize your personal data. Your
              notification preferences are private to you and synced only to
              your own Apple devices via CloudKit.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              7. Your Rights
            </h2>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              <li>
                <strong>Access:</strong> Request information about what data we
                hold
              </li>
              <li>
                <strong>Deletion:</strong> Delete your account and all
                associated data
              </li>
              <li>
                <strong>Data Portability:</strong> Export your notification
                preferences
              </li>
            </ul>
            <p className='text-content-secondary leading-relaxed mt-4'>
              To exercise these rights or contact us about your data, email{' '}
              <a
                href='mailto:privacy@lunary.app'
                className='text-lunary-primary-400 hover:text-content-brand'
              >
                privacy@lunary.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              8. Contact Us
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
                  href='mailto:privacy@lunary.app'
                  className='text-lunary-primary-400 hover:text-content-brand'
                >
                  privacy@lunary.app
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
                href='/apps/terms'
                className='text-lunary-primary-400 hover:text-content-brand text-sm'
              >
                App Terms of Service
              </Link>
              <Link
                href='/privacy'
                className='text-lunary-primary-400 hover:text-content-brand text-sm'
              >
                Lunary Web Privacy
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
