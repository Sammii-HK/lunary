'use client';

import { usePathname } from 'next/navigation';
import {
  Home,
  Layers,
  Orbit,
  MessageCircle,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRitualBadge } from '@/hooks/useRitualBadge';
import { useSubscription } from '@/hooks/useSubscription';
import { hapticService } from '@/services/native/haptic-service';
import { useIsNativeIOS } from '@/hooks/useNativePlatform';
import { iosLabel } from '@/lib/ios-labels';

export const Navbar = () => {
  const pathname = usePathname();
  const { isSubscribed } = useSubscription();
  const { hasUnreadMessage } = useRitualBadge(isSubscribed);
  const isNativeIOS = useIsNativeIOS();

  if (!pathname) {
    return null;
  }

  const appPages = [
    '/app',
    '/tarot',
    '/horoscope',
    '/birth-chart',
    '/guide',
    '/book-of-shadows',
    '/grimoire',
    '/profile',
    '/cosmic-report-generator',
    '/blog',
    '/pricing',
    ...(isNativeIOS ? [] : ['/shop']),
    '/moon-circles',
    '/collections',
    '/forecast',
    '/explore',
    '/community',
  ];

  const coreMarketingRoutes = ['/', '/welcome', '/help', '/auth'];

  const isCoreMarketingRoute =
    coreMarketingRoutes.includes(pathname) || pathname.startsWith('/admin');

  const isAppPage = appPages.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`),
  );

  if (isCoreMarketingRoute) {
    return null;
  }

  if (!isAppPage) {
    return null;
  }

  return (
    <nav
      className='fixed bottom-0 z-[100] flex w-full justify-center border-t border-stroke-subtle bg-surface-base/95 backdrop-blur'
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className='flex w-full items-center justify-around px-2 py-1 text-content-primary max-w-lg'>
        <NavLink
          href='/app'
          icon={Home}
          label='Home'
          activePath={pathname}
          dataNav='home'
        />
        <NavLink
          href='/tarot'
          icon={Layers}
          label={iosLabel('Tarot', isNativeIOS)}
          activePath={pathname}
          dataNav='tarot'
        />
        <NavLink
          href='/horoscope'
          icon={Orbit}
          label='Transits'
          activePath={pathname}
          dataNav='horoscope'
        />
        <NavLink
          href='/guide'
          icon={MessageCircle}
          label='Guide'
          activePath={pathname}
          showBadge={hasUnreadMessage}
          dataNav='guide'
        />
        <NavLink
          href='/explore'
          icon={MoreHorizontal}
          label='More'
          activePath={pathname}
          dataNav='explore'
        />
      </div>
    </nav>
  );
};

const isActive = (pathname: string | null, href: string) => {
  if (!pathname) return false;
  if (href === '/app') return pathname === '/app' || pathname === '/';
  if (href === '/') return pathname === '/';
  if (href === '/explore') {
    const explorePages = [
      '/explore',
      '/grimoire',
      '/profile',
      '/birth-chart',
      '/book-of-shadows/journal',
      '/blog',
      '/pricing',
      '/shop',
      '/moon-circles',
      '/collections',
      '/forecast',
      '/cosmic-report-generator',
      '/community',
    ];
    return explorePages.some(
      (page) => pathname === page || pathname.startsWith(`${page}/`),
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

type NavLinkProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  activePath: string | null;
  showBadge?: boolean;
  dataNav?: string;
};

const NavLink = ({
  href,
  icon: Icon,
  label,
  activePath,
  showBadge,
  dataNav,
}: NavLinkProps) => {
  const active = isActive(activePath, href);

  const handleClick = () => {
    if (!active) {
      hapticService.light();
    }
  };

  return (
    <Link
      href={href}
      data-nav={dataNav}
      onClick={handleClick}
      className={`relative flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition ${
        active
          ? 'text-lunary-secondary'
          : 'text-content-brand hover:text-content-secondary'
      }`}
    >
      <div className='relative'>
        <Icon className='h-6 w-6' strokeWidth={active ? 2 : 1.5} />
        {showBadge && (
          <span className='absolute -top-1 -right-1 h-2 w-2 rounded-full bg-lunary-primary' />
        )}
      </div>
      <span className='text-[10px] tracking-wide'>{label}</span>
    </Link>
  );
};
