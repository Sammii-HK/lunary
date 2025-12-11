'use client';

import { redirect } from 'next/navigation';
import { ServiceWorkerDebug } from '@/components/ServiceWorkerDebug';
import { PWAReadyChecker } from '@/components/PWAReadyChecker';
import { PWARedirectTracker } from '@/components/PWARedirectTracker';
import { PWAGuard } from '../pwa-guard';

export default function PWADebugFullPage() {
  if (process.env.NODE_ENV === 'production') {
    redirect('/');
  }
  return (
    <div className='p-4 space-y-4'>
      <h1 className='text-2xl font-bold'>PWA Debug Tools</h1>
      <p className='text-sm text-zinc-400'>
        All PWA debugging components on one page
      </p>
      <div className='space-y-4'>
        <ServiceWorkerDebug />
        <PWAReadyChecker />
        <PWARedirectTracker />
        <PWAGuard />
      </div>
    </div>
  );
}
