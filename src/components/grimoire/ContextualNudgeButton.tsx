'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStatus } from '@/components/AuthStatus';
import { Button } from '@/components/ui/button';
import { ContextualNudge } from '@/lib/grimoire/getContextualNudge';
import { trackCtaClick, trackCtaImpression } from '@/lib/analytics';
import { buildSignupChartUrl, seoSignupSourceForPath } from '@/lib/urls';

interface ContextualNudgeButtonProps {
  nudge: ContextualNudge;
  location?: string;
}

export function ContextualNudgeButton({
  nudge,
  location = 'seo_contextual_nudge',
}: ContextualNudgeButtonProps) {
  const authState = useAuthStatus();
  const pathname = usePathname() || '';
  const impressionTracked = useRef(false);

  // Track impression when component mounts
  // A/B test is scoped per hub so we can compare copy variants within each hub
  const abTestName = `seo_cta_${nudge.hub}`;
  const abVariantIndex = nudge.ctaVariant?.split('_').pop() || '0';
  const signupHref = buildSignupChartUrl({
    source: seoSignupSourceForPath(pathname),
    medium: 'cta',
    campaign: 'chart_signup',
    content: location,
    hub: nudge.hub,
    headline: nudge.headline,
    subline: nudge.subline,
    location,
    pagePath: pathname,
  });
  const targetHref =
    (nudge.action === 'link' || authState.isAuthenticated
      ? nudge.href
      : signupHref) || signupHref;

  useEffect(() => {
    if (!impressionTracked.current) {
      impressionTracked.current = true;
      trackCtaImpression({
        hub: nudge.hub,
        ctaId: 'contextual_nudge',
        location,
        label: nudge.buttonLabel,
        href: targetHref,
        pagePath: pathname,
        exampleType: nudge.exampleType,
        exampleText: nudge.exampleText,
        ctaVariant: nudge.ctaVariant,
        ctaHeadline: nudge.ctaHeadline,
        ctaSubline: nudge.ctaSubline,
        abTest: abTestName,
        abVariant: abVariantIndex,
      });
    }
  }, [nudge, location, pathname, abTestName, abVariantIndex, targetHref]);

  const handleClick = () => {
    trackCtaClick({
      hub: nudge.hub,
      ctaId: 'contextual_nudge',
      location,
      label: nudge.buttonLabel,
      href: targetHref,
      pagePath: pathname,
      exampleType: nudge.exampleType,
      exampleText: nudge.exampleText,
      ctaVariant: nudge.ctaVariant,
      ctaHeadline: nudge.ctaHeadline,
      ctaSubline: nudge.ctaSubline,
      abTest: abTestName,
      abVariant: abVariantIndex,
    });
  };

  return (
    <Button
      variant='lunary-soft'
      asChild
      className='min-w-[200px] py-6 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105'
    >
      <Link href={targetHref} onClick={handleClick}>
        {nudge.buttonLabel}
      </Link>
    </Button>
  );
}
