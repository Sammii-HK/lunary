'use client';

import dynamic from 'next/dynamic';

interface GrimoireExitIntentProps {
  hub?: string;
}

// The exit-intent modal renders nothing until the visitor's cursor leaves the
// viewport (after a dwell delay), and has no SEO value. Lazy-load it with
// ssr:false so its JS — plus the auth/analytics hooks it pulls — stays out of
// the initial bundle on every grimoire page.
const GrimoireExitIntentImpl = dynamic(
  () => import('./GrimoireExitIntentImpl'),
  { ssr: false },
);

export function GrimoireExitIntent(props: GrimoireExitIntentProps) {
  return <GrimoireExitIntentImpl {...props} />;
}
