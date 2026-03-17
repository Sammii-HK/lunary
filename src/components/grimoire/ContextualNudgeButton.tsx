'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStatus } from '@/components/AuthStatus';
import { Button } from '@/components/ui/button';
import { ContextualNudge } from '@/lib/grimoire/getContextualNudge';
import { trackCtaClick, trackCtaImpression } from '@/lib/analytics';

interface ContextualNudgeButtonProps {
  nudge: ContextualNudge;
  location?: string;
}

export function ContextualNudgeButton({
  nudge,
  location = 'seo_contextual_nudge',
}: ContextualNudgeButtonProps) {
  const authState = useAuthStatus();
  const router = useRouter();
  const pathname = usePathname() || '';
  const impressionTracked = useRef(false);

  // Track impression when component mounts
  useEffect(() => {
    if (!impressionTracked.current) {
      impressionTracked.current = true;
      trackCtaImpression({
        hub: nudge.hub,
        ctaId: 'contextual_nudge',
        location,
        label: nudge.buttonLabel,
        href: nudge.href,
        pagePath: pathname,
        exampleType: nudge.exampleType,
        exampleText: nudge.exampleText,
        ctaVariant: nudge.ctaVariant,
        ctaHeadline: nudge.ctaHeadline,
        ctaSubline: nudge.ctaSubline,
        abTest: 'seo_cta_copy',
        abVariant: nudge.ctaVariant,
      });
    }
  }, [nudge, location, pathname]);

  const navigateToHref = () => {
    if (nudge.href) {
      router.push(nudge.href);
    }
  };

  const handleClick = () => {
    trackCtaClick({
      hub: nudge.hub,
      ctaId: 'contextual_nudge',
      location,
      label: nudge.buttonLabel,
      href: nudge.href,
      pagePath: pathname,
      exampleType: nudge.exampleType,
      exampleText: nudge.exampleText,
      ctaVariant: nudge.ctaVariant,
      ctaHeadline: nudge.ctaHeadline,
      ctaSubline: nudge.ctaSubline,
      abTest: 'seo_cta_copy',
      abVariant: nudge.ctaVariant,
    });

    if (nudge.action === 'link') {
      navigateToHref();
      return;
    }

    if (!authState.isAuthenticated) {
      const params = new URLSearchParams({
        hub: nudge.hub,
        headline: nudge.headline,
        subline: nudge.subline,
        location,
        pagePath: pathname,
      });
      router.push(`/signup/chart?${params.toString()}`);
      return;
    }

    navigateToHref();
  };

  return (
    <Button
      variant='lunary-soft'
      onClick={handleClick}
      className='min-w-[200px] py-6 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105'
    >
      {nudge.buttonLabel}
    </Button>
  );
}
