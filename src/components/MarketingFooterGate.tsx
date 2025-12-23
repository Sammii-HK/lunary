'use client';

import { useSearchParams } from 'next/navigation';
import { MarketingFooter } from '@/components/MarketingFooter';

interface MarketingFooterGateProps {
  force?: boolean;
}

export function MarketingFooterGate({
  force = false,
}: MarketingFooterGateProps) {
  const searchParams = useSearchParams();
  const navOverride = searchParams?.get('nav');

  if (!force && navOverride !== 'marketing') {
    return null;
  }

  return <MarketingFooter />;
}
