'use client';

import dynamic from 'next/dynamic';
import type { ContextualNudge } from '@/lib/grimoire/getContextualNudge';

interface StickyBottomCTAProps {
  nudge: ContextualNudge;
}

// The sticky CTA bar renders nothing until the reader scrolls 15% or dwells
// ~10s, and is invisible to crawlers. Lazy-load with ssr:false so its JS and
// the auth/analytics hooks stay out of the initial grimoire-page bundle.
const StickyBottomCTAImpl = dynamic(() => import('./StickyBottomCTAImpl'), {
  ssr: false,
});

export function StickyBottomCTA(props: StickyBottomCTAProps) {
  return <StickyBottomCTAImpl {...props} />;
}
