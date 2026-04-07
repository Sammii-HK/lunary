'use client';

import { PWAHandler } from '@/components/PWAHandler';

export default function AdminPwaHandlerPage() {
  return (
    <div className='min-h-screen bg-surface-base text-content-primary'>
      <div className='mx-auto flex max-w-5xl flex-col gap-6 py-12 px-4 sm:px-8'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-semibold tracking-tight text-content-primary'>
            Admin PWA Handler
          </h1>
          <p className='text-sm text-content-muted'>
            This view renders the same PWA prompt components that show inside
            the app, but it ignores dismissals and never fires analytics so you
            can retest the flow at any time.
          </p>
        </div>
        <div className='flex flex-col gap-4 rounded-3xl border border-stroke-subtle/80 bg-surface-base/70 p-6 shadow-2xl shadow-black/50'>
          <PWAHandler
            allowUnauthenticatedInstall
            ignoreDismissed
            forceShowBanner
          />
        </div>
      </div>
    </div>
  );
}
