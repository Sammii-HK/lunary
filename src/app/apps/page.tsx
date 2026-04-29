import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';
import { MarketingNavbar } from '@/components/MarketingNavbar';
import { activeAppPolicies } from '@/data/app-policy-pages';

export const metadata: Metadata = {
  title: 'iOS Apps | Lunar Computing',
  description:
    'iOS apps from Lunar Computing, with privacy and support pages for each active app.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://lunary.app/apps',
  },
};

export default function AppsIndexPage() {
  return (
    <div className='min-h-screen bg-surface-base text-content-primary flex flex-col'>
      <MarketingNavbar />

      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full'>
        <div className='mb-14'>
          <p className='text-lunary-primary-400 text-sm font-medium uppercase tracking-widest mb-3'>
            Lunar Computing
          </p>
          <h1 className='text-3xl md:text-5xl font-semibold text-content-primary mb-4'>
            iOS Apps
          </h1>
          <p className='text-content-muted text-lg max-w-xl'>
            Privacy and support pages for the active Lunar Computing iOS app
            portfolio. Most app data stays on your device, with iCloud sync and
            optional permissions only where the app feature needs them.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {activeAppPolicies.map((app) => (
            <div
              key={app.slug}
              className='p-6 rounded-2xl border border-stroke-subtle bg-surface-elevated/40'
            >
              <div className='flex items-start justify-between mb-3'>
                <div>
                  <h2 className='text-lg font-semibold text-content-primary mb-1'>
                    {app.name}
                  </h2>
                  <p className='text-sm text-content-muted'>{app.category}</p>
                </div>
              </div>
              <p className='text-content-secondary text-sm leading-relaxed mb-2'>
                {app.summary}
              </p>
              <div className='flex flex-wrap gap-4 mt-4'>
                <Link
                  href={`/apps/${app.slug}/privacy`}
                  className='text-lunary-primary-400 hover:text-content-brand text-sm transition-colors'
                >
                  Privacy
                </Link>
                <Link
                  href={`/apps/${app.slug}/support`}
                  className='text-lunary-primary-400 hover:text-content-brand text-sm transition-colors'
                >
                  Support
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-14 pt-10 border-t border-stroke-subtle'>
          <p className='text-content-muted text-sm mb-4'>Legal</p>
          <div className='flex flex-wrap gap-6'>
            <Link
              href='/apps/terms'
              className='text-content-muted hover:text-content-brand text-sm transition-colors'
            >
              Terms of Service
            </Link>
            {activeAppPolicies.map((app) => (
              <Link
                key={app.slug}
                href={`/apps/${app.slug}/privacy`}
                className='text-content-muted hover:text-content-brand text-sm transition-colors'
              >
                {app.name} Privacy
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className='mt-auto'>
        <MarketingFooter />
      </div>
    </div>
  );
}
