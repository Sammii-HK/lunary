'use client';

import { useEffect } from 'react';
import { useSafeSearchParams } from '@/lib/safeSearchParams';

export function GrimoireCanonical() {
  const searchParams = useSafeSearchParams();
  const hasQueryParams = searchParams && searchParams.size > 0;

  useEffect(() => {
    if (hasQueryParams) {
      // Add canonical tag pointing to base URL
      const canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        const link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        link.setAttribute('href', 'https://lunary.app/grimoire');
        document.head.appendChild(link);
      } else {
        canonical.setAttribute('href', 'https://lunary.app/grimoire');
      }

      // Add noindex meta tag for query parameter pages
      const robots = document.querySelector('meta[name="robots"]');
      if (!robots) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'robots');
        meta.setAttribute('content', 'noindex, follow');
        document.head.appendChild(meta);
      } else {
        robots.setAttribute('content', 'noindex, follow');
      }
    } else {
      // Remove noindex if on base page
      const robots = document.querySelector('meta[name="robots"]');
      if (robots && robots.getAttribute('content') === 'noindex, follow') {
        robots.remove();
      }
    }
  }, [hasQueryParams]);

  return null;
}
