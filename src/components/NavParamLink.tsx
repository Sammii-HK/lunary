'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type NavParamLinkProps = React.ComponentProps<typeof Link> & {
  preserveNavParams?: boolean;
};

export function NavParamLink({
  href,
  preserveNavParams = true,
  ...rest
}: NavParamLinkProps) {
  const searchParams = useSearchParams();
  const navOverride = searchParams?.get('nav');
  const fromParam = searchParams?.get('from');

  const resolvedHref = useMemo(() => {
    if (!preserveNavParams) return href;
    if (typeof href !== 'string') return href;
    if (!navOverride && !fromParam) return href;
    if (/^(https?:)?\/\//i.test(href)) return href;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return href;

    const baseUrl = new URL(href, 'https://lunary.app');
    if (navOverride && !baseUrl.searchParams.get('nav')) {
      baseUrl.searchParams.set('nav', navOverride);
    }
    if (fromParam && !baseUrl.searchParams.get('from')) {
      baseUrl.searchParams.set('from', fromParam);
    }

    const query = baseUrl.searchParams.toString();
    return `${baseUrl.pathname}${query ? `?${query}` : ''}${baseUrl.hash}`;
  }, [href, navOverride, fromParam, preserveNavParams]);

  return <Link href={resolvedHref} {...rest} />;
}
