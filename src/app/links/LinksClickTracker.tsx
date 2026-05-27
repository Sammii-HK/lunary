'use client';

import { ReactNode, useEffect } from 'react';
import { conversionTracking } from '@/lib/analytics';

type LinksClickTrackerProps = {
  children: ReactNode;
};

export function LinksClickTracker({ children }: LinksClickTrackerProps) {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>('a[data-links-id]');
      if (!anchor) return;

      const linkId = anchor.dataset.linksId;
      if (!linkId) return;

      void conversionTracking.ctaClicked({
        hub: 'links',
        ctaId: `links:${linkId}`,
        location: 'links_page',
        label: anchor.dataset.linksLabel || anchor.textContent?.trim(),
        href: anchor.href,
        pagePath: '/links',
        funnelVersion: 'links-warm-router-2026-05',
        step: anchor.dataset.linksStep || 'link_click',
      });
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return <>{children}</>;
}
