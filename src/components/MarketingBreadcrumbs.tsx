'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type MarketingBreadcrumbItem = {
  label: string;
  href?: string;
};

interface MarketingBreadcrumbsProps {
  items?: MarketingBreadcrumbItem[];
  labelOverrides?: Record<string, string>;
}

const defaultLabelOverrides: Record<string, string> = {
  about: 'About',
  'api-terms': 'API Terms',
  'acceptable-use': 'Acceptable Use',
  accessibility: 'Accessibility',
  cookies: 'Cookie Policy',
  dmca: 'DMCA Policy',
  help: 'Help Center',
  legal: 'Legal',
  press: 'Press',
  'press-kit': 'Press Kit',
  privacy: 'Privacy Policy',
  product: 'Product',
  'product-hunt': 'Product Hunt',
  refund: 'Refund Policy',
  resources: 'Resources',
  'referral-terms': 'Referral Terms',
  terms: 'Terms of Service',
  trademark: 'Trademark Guidelines',
};

const formatSegmentLabel = (segment: string) =>
  segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const buildItemsFromPath = (
  pathname: string,
  overrides: Record<string, string>,
): MarketingBreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return [{ label: 'Home' }];
  }

  const items: MarketingBreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    ...segments.map((segment, index) => ({
      label: overrides[segment] || formatSegmentLabel(segment),
      href: '/' + segments.slice(0, index + 1).join('/'),
    })),
  ];

  items[items.length - 1] = {
    ...items[items.length - 1],
    href: undefined,
  };

  return items;
};

export function MarketingBreadcrumbs({
  items,
  labelOverrides,
}: MarketingBreadcrumbsProps) {
  const pathname = usePathname();
  const resolvedItems =
    items ||
    (pathname
      ? buildItemsFromPath(pathname, {
          ...defaultLabelOverrides,
          ...labelOverrides,
        })
      : []);

  if (resolvedItems.length === 0) {
    return null;
  }

  return (
    <nav className='text-sm text-zinc-400 mb-6'>
      {resolvedItems.map((item, index) => {
        const isLast = index === resolvedItems.length - 1;
        const content = item.href ? (
          <Link
            href={item.href}
            className='hover:text-zinc-200 transition-colors'
          >
            {item.label}
          </Link>
        ) : (
          <span className='text-zinc-200'>{item.label}</span>
        );

        return (
          <span key={`${item.label}-${index}`}>
            {content}
            {!isLast && <span className='mx-2 text-zinc-600'>/</span>}
          </span>
        );
      })}
    </nav>
  );
}
