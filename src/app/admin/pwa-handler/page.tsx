'use client';

import { PWAHandler } from '@/components/PWAHandler';

export default function AdminPwaHandlerPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-white'>
      <div className='mx-auto flex max-w-5xl flex-col gap-6 py-12 px-4 sm:px-8'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-semibold tracking-tight text-white'>
            Admin PWA Handler
          </h1>
          <p className='text-sm text-zinc-400'>
            This view renders the same PWA prompt components that show inside
            the app, but it ignores dismissals and never fires analytics so you
            can retest the flow at any time.
          </p>
        </div>
        <div className='flex flex-col gap-4 rounded-3xl border border-zinc-800/80 bg-zinc-950/70 p-6 shadow-2xl shadow-black/50'>
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
