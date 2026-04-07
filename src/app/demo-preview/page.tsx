'use client';

import dynamic from 'next/dynamic';

// Completely disable SSR for this page to avoid hydration issues
const DemoClient = dynamic(
  () => import('./DemoClient').then((m) => ({ default: m.DemoClient })),
  {
    ssr: false,
    loading: () => (
      <div className='h-screen w-screen bg-surface-base flex items-center justify-center'>
        <div className='animate-pulse text-content-muted text-sm'>
          Loading demo...
        </div>
      </div>
    ),
  },
);

export default function DemoPreviewPage() {
  return <DemoClient />;
}
