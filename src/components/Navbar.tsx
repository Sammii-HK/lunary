'use client';

import { usePathname } from 'next/navigation';
import {
  BookMarked,
  Eclipse,
  Notebook,
  Sparkles,
  User,
  WandSparkles,
} from 'lucide-react';
import Link from 'next/link';
import { ExploreMenu } from './ExploreMenu';

export const Navbar = () => {
  const pathname = usePathname();

  // Hide navbar on marketing pages
  const isMarketingRoute =
    pathname === '/' ||
    pathname === '/welcome' ||
    pathname === '/pricing' ||
    pathname?.startsWith('/admin');

  if (isMarketingRoute) {
    return null;
  }

  return (
    <nav className='sticky bottom-0 z-[100] flex w-full justify-center border-t border-stone-800 bg-zinc-950/95 backdrop-blur'>
      <div className='flex w-full max-w-3xl items-center justify-between px-4 py-3 text-white md:justify-evenly md:px-6'>
        <NavLink
          href='/app'
          icon={Eclipse}
          label='Home'
          activePath={pathname}
        />
        <NavLink
          href='/tarot'
          icon={Sparkles}
          label='Tarot'
          activePath={pathname}
        />
        <NavLink
          href='/horoscope'
          icon={WandSparkles}
          label='Horoscope'
          activePath={pathname}
        />
        <NavLink
          href='/book-of-shadows'
          icon={Notebook}
          label='Book of Shadows'
          activePath={pathname}
        />
        <NavLink
          href='/grimoire'
          icon={BookMarked}
          label='Grimoire'
          activePath={pathname}
        />
        <ExploreMenu />
        <NavLink
          href='/profile'
          icon={User}
          label='Account'
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
  return pathname === href || pathname.startsWith(`${href}/`);
};

type NavLinkProps = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  activePath: string | null;
};

const NavLink = ({ href, icon: Icon, label, activePath }: NavLinkProps) => {
  const active = isActive(activePath, href);
  const isBookOfShadows = href === '/book-of-shadows';
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs transition md:flex-1 md:min-w-0 ${
        active
          ? isBookOfShadows
            ? 'text-purple-300'
            : 'text-zinc-200'
          : 'text-zinc-400 hover:text-zinc-200'
      }`}
    >
      <Icon className={`h-5 w-5 ${isBookOfShadows ? 'text-purple-200' : ''}`} />
      <span className='hidden text-[10px] uppercase tracking-wide md:block md:text-center md:leading-tight md:w-full md:break-words'>
        {label}
      </span>
    </Link>
  );
};
