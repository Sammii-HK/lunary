'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { NavParamLink } from '@/components/NavParamLink';
import { trackCtaClick, trackCtaImpression } from '@/lib/analytics';

type SEOCTAButtonProps = {
  href: string;
  label: string;
  hub: string;
  location?: string;
};

export function SEOCTAButton({
  href,
  label,
  hub,
  location = 'seo_cta',
}: SEOCTAButtonProps) {
  const pathname = usePathname() || '';
  const impressionTracked = useRef(false);

  useEffect(() => {
    if (!impressionTracked.current) {
      impressionTracked.current = true;
      trackCtaImpression({
        hub,
        ctaId: 'seo_cta_button',
        location,
        label,
        href,
        pagePath: pathname,
      });
    }
  }, [hub, location, label, href, pathname]);

  const handleClick = () => {
    trackCtaClick({
      hub,
      ctaId: 'seo_cta_button',
      location,
      label,
      href,
      pagePath: pathname,
    });
  };

  return (
    <NavParamLink
      href={href}
      onClick={handleClick}
      className='inline-block px-5 sm:px-6 py-2 sm:py-3 bg-lunary-primary hover:bg-lunary-primary-400 text-white rounded-lg font-medium transition-colors '
    >
      {label}
    </NavParamLink>
  );
}
