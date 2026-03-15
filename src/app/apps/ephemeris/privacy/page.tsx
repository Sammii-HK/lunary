import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';
import { MarketingBreadcrumbs } from '@/components/MarketingBreadcrumbs';

export const metadata: Metadata = {
  title: "Privacy Policy | Astrologer's Ephemeris",
  description:
    "Privacy policy for the Astrologer's Ephemeris iOS app. Learn how your data is protected.",
  robots: 'index, follow',
  alternates: {
    canonical: 'https://lunary.app/apps/ephemeris/privacy',
  },
};

export default function EphemerisPrivacyPage() {
  const lastUpdated = 'March 14, 2026';

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pt-16'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <MarketingBreadcrumbs />
        <div className='mb-8'>
          <h1 className='text-2xl md:text-4xl font-semibold text-white mb-4'>
            Privacy Policy: Astrologer&apos;s Ephemeris
          </h1>
          <p className='text-sm text-zinc-400'>Last Updated: {lastUpdated}</p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <p className='text-zinc-300 leading-relaxed'>
              Lunar Computing, Inc. (&quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;) develops the Astrologer&apos;s Ephemeris iOS app.
              This Privacy Policy explains how we handle your information when
              you use the Ephemeris app.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              1. Information We Collect
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              1.1 Information You Provide
            </h3>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Sign in with Apple Account:</strong> When you sign in
                using Apple ID, we receive an Apple user identifier. Your actual
                Apple email is not shared with us.
              </li>
              <li>
                <strong>Chart Data and Notes:</strong> Birth charts you save,
                annotations you add to ephemeris data, and event logs
              </li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              1.2 Information Collected Automatically
            </h3>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Device Information:</strong> iOS version, device model,
                device identifier (for crash reporting only)
              </li>
              <li>
                <strong>Usage Analytics:</strong> Which ephemeris dates you
                query, features used, and session duration
              </li>
              <li>
                <strong>Crash Data:</strong> Error logs to help us improve
                stability and calculation accuracy
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              2. How We Use Your Information
            </h2>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Authenticate your account and sync your saved charts and notes
              </li>
              <li>Improve app stability and calculation accuracy</li>
              <li>
                Understand which ephemeris features are most useful to
                astrologers
              </li>
              <li>
                Send you important updates about the app (authentication,
                critical bug fixes)
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              3. Data Storage and CloudKit
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              Your saved birth charts, annotations, and event logs are stored
              securely using Apple&apos;s CloudKit service. CloudKit encryption
              in transit is end-to-end. Your data is associated with your Apple
              account and syncs across your Apple devices via CloudKit. We do
              not have access to unencrypted CloudKit data; only you and Apple
              have access.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              4. Location Services (Optional)
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              Ephemeris may access your device location with your permission to
              automatically determine your timezone for accurate astronomical
              calculations. Your location data is never stored, transmitted to
              servers, or used for any other purpose. You can manually enter
              your timezone instead of enabling location access.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              5. Astronomical Data
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              Ephemeris calculations are performed locally on your device using
              the astronomy-engine library (MIT-licensed). No astronomical data
              or calculation results are sent to our servers. All computations
              happen on your device.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              6. Third-Party Services
            </h2>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Apple CloudKit:</strong> Secure data synchronization
                across your Apple devices
              </li>
              <li>
                <strong>RevenueCat:</strong> In-app purchase management (does
                not access your charts or notes)
              </li>
              <li>
                <strong>Sentry:</strong> Crash reporting and error tracking
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              7. Do We Sell Your Data?
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              No. We do not sell, share, or monetize your personal data. Your
              birth charts, annotations, and event logs are private to you and
              synced only to your own Apple devices via CloudKit.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              8. Your Rights
            </h2>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Access:</strong> Request information about what data we
                hold
              </li>
              <li>
                <strong>Deletion:</strong> Delete your account and all
                associated data
              </li>
              <li>
                <strong>Data Portability:</strong> Export your charts and notes
              </li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              To exercise these rights or contact us about your data, email{' '}
              <a
                href='mailto:privacy@lunary.app'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                privacy@lunary.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              9. Contact Us
            </h2>
            <div className='p-4 border border-zinc-800 bg-zinc-900/30 rounded-xl'>
              <p className='text-zinc-300'>
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
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  privacy@lunary.app
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
                href='/apps/terms'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                App Terms of Service
              </Link>
              <Link
                href='/privacy'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
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
