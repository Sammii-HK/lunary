'use client';

import { usePathname } from 'next/navigation';
import {
  BookMarked,
  Eclipse,
  Notebook,
  Sparkles,
  User,
  Circle,
} from 'lucide-react';
import Link from 'next/link';

export const Navbar = () => {
  const pathname = usePathname();

  // Hide navbar on marketing pages
  const isMarketingRoute =
    pathname === '/welcome' ||
    pathname === '/pricing' ||
    pathname?.startsWith('/admin');

  if (isMarketingRoute) {
    return null;
  }

  return (
    <nav className='sticky bottom-0 z-50 flex w-full justify-center border-t border-stone-800 bg-zinc-950/95 backdrop-blur'>
      <div className='relative flex w-full max-w-3xl items-end justify-between px-4 py-2 text-white md:px-6'>
        <div className='flex flex-1 items-end justify-start gap-4'>
          <NavLink href='/' icon={Eclipse} label='Home' activePath={pathname} />
          <NavLink
            href='/tarot'
            icon={Sparkles}
            label='Tarot'
            activePath={pathname}
          />
        </div>

        <div className='absolute left-1/2 top-0 -translate-x-1/2 -translate-y-6'>
          <PrimaryNavLink
            href='/book-of-shadows'
            icon={Notebook}
            label='Book of Shadows'
            activePath={pathname}
          />
        </div>

        <div className='flex flex-1 items-end justify-end gap-4'>
          <NavLink
            href='/horoscope'
            icon={Circle}
            label='Horoscope'
            activePath={pathname}
          />
          <NavLink
            href='/grimoire'
            icon={BookMarked}
            label='Grimoire'
            activePath={pathname}
          />
          <NavLink
            href='/profile'
            icon={User}
            label='Account'
            activePath={pathname}
          />
        </div>
      </div>
    </nav>
  );
};

const isActive = (pathname: string | null, href: string) => {
  if (!pathname) return false;
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
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition ${
        active ? 'text-zinc-200' : 'text-zinc-400 hover:text-zinc-200'
      }`}
    >
      <Icon className='h-5 w-5' />
      <span className='hidden text-[10px] uppercase tracking-wide md:block'>
        {label}
      </span>
    </Link>
  );
};

const PrimaryNavLink = ({
  href,
  icon: Icon,
  label,
  activePath,
}: NavLinkProps) => {
  const active = isActive(activePath, href);
  return (
    <Link
      href={href}
      className='group relative inline-flex items-center justify-center'
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full border-2 shadow-lg transition ${
          active
            ? 'border-zinc-600 bg-zinc-800 text-white'
            : 'border-zinc-700 bg-zinc-900 text-zinc-300 group-hover:border-zinc-600 group-hover:text-white'
        }`}
      >
        <Icon className='h-7 w-7 text-purple-200' />
      </div>
      <span className='absolute -bottom-6 whitespace-nowrap text-[11px] uppercase tracking-wide text-zinc-400'>
        {label}
      </span>
    </Link>
  );
};
