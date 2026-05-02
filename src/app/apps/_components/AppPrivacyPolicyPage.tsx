import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingBreadcrumbs } from '@/components/MarketingBreadcrumbs';
import { MarketingFooter } from '@/components/MarketingFooter';
import { ActiveAppPolicy, appPolicyPageMeta } from '@/data/app-policy-pages';

export function createAppPrivacyMetadata(app: ActiveAppPolicy): Metadata {
  return {
    title: `Privacy Policy | ${app.name}`,
    description: `Privacy policy for the ${app.name} iOS app. Learn how local data, optional permissions, iCloud sync, and purchases are handled.`,
    robots: 'index, follow',
    alternates: {
      canonical: `https://lunary.app/apps/${app.slug}/privacy`,
    },
  };
}

export function AppPrivacyPolicyPage({ app }: { app: ActiveAppPolicy }) {
  return (
    <div className='min-h-screen bg-surface-base text-content-primary flex flex-col pt-16'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <MarketingBreadcrumbs />
        <div className='mb-8'>
          <h1 className='text-2xl md:text-4xl font-semibold text-content-primary mb-4'>
            Privacy Policy: {app.name}
          </h1>
          <p className='text-sm text-content-muted'>
            Last updated: {appPolicyPageMeta.lastUpdated}
          </p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <p className='text-content-secondary leading-relaxed'>
              Lunar Computing, Inc. (&quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;) develops the {app.name} iOS app. This Privacy
              Policy explains how {app.name} handles information when you use
              the app.
            </p>
            <p className='text-content-secondary leading-relaxed'>
              {app.privacySummary}
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              1. Data stored in the app
            </h2>
            <p className='text-content-secondary leading-relaxed mb-4'>
              {app.name} is designed around local, on-device storage. Depending
              on which features you use, the app may store:
            </p>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              {app.localData.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className='text-content-secondary leading-relaxed mt-4'>
              This data is used to provide app functionality and is not sold,
              used for advertising, or shared with data brokers.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              2. Optional permissions
            </h2>
            {app.permissions.length > 0 ? (
              <ul className='list-disc pl-6 text-content-secondary space-y-2'>
                {app.permissions.map((permission) => (
                  <li key={permission.name}>
                    <strong>{permission.name}:</strong> {permission.detail}
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-content-secondary leading-relaxed'>
                {app.name} does not require sensitive iOS permissions for its
                core functionality. If a future feature asks for a permission,
                iOS will show the request before access is granted.
              </p>
            )}
            <p className='text-content-secondary leading-relaxed mt-4'>
              You can revoke iOS permissions at any time in Settings. Some app
              features may stop working after a required permission is revoked.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              3. iCloud and on-device processing
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              {app.cloudSync}
            </p>
            <p className='text-content-secondary leading-relaxed mt-4'>
              Apple controls iCloud account authentication and CloudKit
              infrastructure. We do not receive your Apple ID password, payment
              information, or private iCloud account credentials.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              4. Purchases
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              {app.purchases}
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              5. Third-party services
            </h2>
            <p className='text-content-secondary leading-relaxed mb-4'>
              Depending on the features you use, {app.name} may interact with:
            </p>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              {app.thirdParties.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
            <p className='text-content-secondary leading-relaxed mt-4'>
              Third-party services process data according to their own privacy
              policies. We only use them for app functionality, entitlement
              verification, system permissions, or user-requested actions.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              6. Health, wellbeing, and reference content
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              {app.name} is not a medical device and does not provide medical,
              psychological, legal, financial, or other professional advice. Any
              journalling, habit, sleep, reflection, card, crystal, reference,
              or routine content is provided for personal use and
              self-reflection only. It should not be used to diagnose, treat,
              prevent, or make decisions about a health condition.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              7. Your choices
            </h2>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              <li>
                Delete local app data from inside the app where available.
              </li>
              <li>
                Delete the app from your device to remove local app data stored
                in the app sandbox.
              </li>
              <li>
                Manage iCloud data from iOS Settings if you enabled iCloud sync.
              </li>
              <li>
                Cancel or manage subscriptions in iOS Settings under your Apple
                ID subscriptions.
              </li>
              <li>
                Revoke optional permissions, such as Health, Microphone, Speech,
                Camera, Photos, or Notifications, in iOS Settings.
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              8. Contact
            </h2>
            <div className='p-4 border border-stroke-subtle bg-surface-elevated/30 rounded-xl'>
              <p className='text-content-secondary leading-relaxed'>
                For privacy requests, email{' '}
                <a
                  href={`mailto:${appPolicyPageMeta.privacyEmail}`}
                  className='text-lunary-primary-400 hover:text-content-brand'
                >
                  {appPolicyPageMeta.privacyEmail}
                </a>
                . For product support, email{' '}
                <a
                  href={`mailto:${appPolicyPageMeta.supportEmail}`}
                  className='text-lunary-primary-400 hover:text-content-brand'
                >
                  {appPolicyPageMeta.supportEmail}
                </a>
                .
              </p>
            </div>
          </section>

          <section className='pt-8 border-t border-stroke-subtle'>
            <h2 className='text-lg font-medium text-content-primary mb-4'>
              Related pages
            </h2>
            <div className='flex flex-wrap gap-4'>
              <Link
                href={`/apps/${app.slug}/support`}
                className='text-lunary-primary-400 hover:text-content-brand text-sm'
              >
                {app.name} support
              </Link>
              <Link
                href='/apps/terms'
                className='text-lunary-primary-400 hover:text-content-brand text-sm'
              >
                App terms of service
              </Link>
              <Link
                href='/apps'
                className='text-lunary-primary-400 hover:text-content-brand text-sm'
              >
                All apps
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
