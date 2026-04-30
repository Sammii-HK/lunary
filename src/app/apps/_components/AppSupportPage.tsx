import { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { MarketingBreadcrumbs } from '@/components/MarketingBreadcrumbs';
import { MarketingFooter } from '@/components/MarketingFooter';
import { ActiveAppPolicy, appPolicyPageMeta } from '@/data/app-policy-pages';

export function createAppSupportMetadata(app: ActiveAppPolicy): Metadata {
  return {
    title: `Support | ${app.name}`,
    description: `Support page for the ${app.name} iOS app, including contact details, privacy links, purchases, and common support topics.`,
    robots: 'index, follow',
    alternates: {
      canonical: `https://lunary.app/apps/${app.slug}/support`,
    },
  };
}

export function AppSupportPage({ app }: { app: ActiveAppPolicy }) {
  return (
    <div className='min-h-screen bg-surface-base text-content-primary flex flex-col pt-16'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <MarketingBreadcrumbs />
        <div className='mb-8'>
          <p className='text-lunary-primary-400 text-sm font-medium uppercase tracking-widest mb-3'>
            App support
          </p>
          <h1 className='text-2xl md:text-4xl font-semibold text-content-primary mb-4'>
            {app.name} support
          </h1>
          <p className='text-content-muted text-base md:text-lg'>
            {app.summary}
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 mb-10'>
          <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/40 p-6'>
            <Mail className='w-6 h-6 text-lunary-primary-400 mb-4' />
            <h2 className='text-xl font-semibold text-content-primary mb-3'>
              Contact support
            </h2>
            <p className='text-sm text-content-muted mb-4'>
              For help with {app.name}, email support with the app name, your
              device model, iOS version, and a short description of the issue.
            </p>
            <a
              href={`mailto:${appPolicyPageMeta.supportEmail}?subject=${encodeURIComponent(
                `${app.name} support`,
              )}`}
              className='text-sm text-lunary-primary-400 hover:text-content-brand transition-colors'
            >
              {appPolicyPageMeta.supportEmail}
            </a>
          </div>

          <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/40 p-6'>
            <h2 className='text-xl font-semibold text-content-primary mb-3'>
              Privacy and purchases
            </h2>
            <p className='text-sm text-content-muted mb-4'>
              {app.privacySummary}
            </p>
            <div className='flex flex-wrap gap-4'>
              <Link
                href={`/apps/${app.slug}/privacy`}
                className='text-sm text-lunary-primary-400 hover:text-content-brand transition-colors'
              >
                Privacy policy
              </Link>
              <Link
                href='/apps/terms'
                className='text-sm text-lunary-primary-400 hover:text-content-brand transition-colors'
              >
                Terms of service
              </Link>
            </div>
          </div>
        </div>

        <section className='rounded-2xl border border-stroke-subtle bg-surface-elevated/30 p-6 mb-10'>
          <h2 className='text-xl font-semibold text-content-primary mb-4'>
            Common support topics
          </h2>
          <ul className='list-disc pl-6 text-content-secondary space-y-2'>
            {app.supportTopics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </section>

        <section className='rounded-2xl border border-stroke-subtle bg-surface-elevated/30 p-6 mb-10'>
          <h2 className='text-xl font-semibold text-content-primary mb-4'>
            Purchases and restores
          </h2>
          <p className='text-content-secondary leading-relaxed'>
            {app.purchases} If premium access does not appear after purchase,
            use the restore purchases option inside the app, then restart the
            app. Subscription cancellation and refunds are handled by Apple from
            iOS Settings or reportaproblem.apple.com.
          </p>
        </section>

        <section className='rounded-2xl border border-stroke-subtle bg-surface-elevated/30 p-6'>
          <h2 className='text-xl font-semibold text-content-primary mb-4'>
            Data and permissions
          </h2>
          <p className='text-content-secondary leading-relaxed mb-4'>
            {app.cloudSync}
          </p>
          {app.permissions.length > 0 && (
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              {app.permissions.map((permission) => (
                <li key={permission.name}>
                  <strong>{permission.name}:</strong> {permission.detail}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className='mt-auto'>
        <MarketingFooter />
      </div>
    </div>
  );
}
