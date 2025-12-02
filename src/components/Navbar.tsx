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

export const Navbar = () => {
  const pathname = usePathname();
  const { isSubscribed } = useSubscription();
  const { hasUnreadMessage } = useRitualBadge(isSubscribed);

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
    '/cosmic-state',
    '/cosmic-report-generator',
    '/blog',
    '/pricing',
    '/shop',
    '/moon-circles',
    '/collections',
    '/forecast',
    '/explore',
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
    <nav className='fixed bottom-0 z-[100] flex w-full justify-center border-t border-stone-800 bg-zinc-950/95 backdrop-blur'>
      <div className='flex w-full h-12 md:h-14 items-center justify-around px-2 py-2 text-white max-w-lg'>
        <NavLink href='/app' icon={Home} label='Home' activePath={pathname} />
        <NavLink
          href='/tarot'
          icon={Layers}
          label='Tarot'
          activePath={pathname}
        />
        <NavLink
          href='/horoscope'
          icon={Orbit}
          label='Horoscope'
          activePath={pathname}
        />
        <NavLink
          href='/guide'
          icon={MessageCircle}
          label='Guide'
          activePath={pathname}
          showBadge={hasUnreadMessage}
        />
        <NavLink
          href='/explore'
          icon={MoreHorizontal}
          label='More'
          activePath={pathname}
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
      '/cosmic-state',
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
};

const NavLink = ({
  href,
  icon: Icon,
  label,
  activePath,
  showBadge,
}: NavLinkProps) => {
  const active = isActive(activePath, href);
  return (
    <Link
      href={href}
      className={`relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition ${
        active ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      <div className='relative'>
        <Icon
          className='h-4 w-4 md:h-5 md:w-5'
          strokeWidth={active ? 2 : 1.5}
        />
        {showBadge && (
          <span className='absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-500' />
        )}
      </div>
      <span className='text-[10px] uppercase tracking-wide'>{label}</span>
    </Link>
  );
};
