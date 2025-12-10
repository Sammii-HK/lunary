'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Store,
  CircleDot,
  FolderOpen,
  FileText,
  Globe,
  ChevronDown,
  Calendar,
  BookOpen,
  Tag,
} from 'lucide-react';

type ExploreItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const exploreItems: ExploreItem[] = [
  {
    href: '/blog',
    label: 'Blog',
    icon: BookOpen,
  },
  {
    href: '/pricing',
    label: 'Pricing',
    icon: Tag,
  },
  {
    href: '/shop',
    label: 'Shop',
    icon: Store,
  },
  {
    href: '/moon-circles',
    label: 'Moon Circles',
    icon: CircleDot,
  },
  {
    href: '/collections',
    label: 'Collections',
    icon: FolderOpen,
  },
  {
    href: '/forecast',
    label: '2026 Forecast',
    icon: Calendar,
  },
  {
    href: '/cosmic-report-generator',
    label: 'Cosmic Report Generator',
    icon: FileText,
  },
  {
    href: '/cosmic-state',
    label: 'Cosmic State',
    icon: Globe,
  },
];

export const ExploreMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isActive = exploreItems.some((item) => {
    if (item.href === '/') return pathname === '/';
    return pathname === item.href || pathname?.startsWith(`${item.href}/`);
  });

  return (
    <div ref={menuRef} className='relative md:flex-1 md:min-w-0'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs transition w-full md:flex-1 ${
          isActive ? 'text-zinc-200' : 'text-zinc-400 hover:text-zinc-200'
        }`}
        aria-label='Explore menu'
        aria-expanded={isOpen}
      >
        <div className='relative'>
          <Globe className='h-5 w-5' />
          {isOpen && (
            <ChevronDown className='absolute -bottom-1 -right-1 h-3 w-3 text-zinc-400' />
          )}
        </div>
        <span className='hidden text-[10px] uppercase tracking-wide md:block md:text-center md:leading-tight md:w-full md:break-words'>
          Explore
        </span>
      </button>

      {isOpen && (
        <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl z-50'>
          <div className='p-2 space-y-1'>
            {exploreItems.map((item) => {
              const ItemIcon = item.icon;
              const itemActive =
                pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={`${item.href}?from=explore`}
                  onClick={() => {
                    setIsOpen(false);
                    // Track that user is navigating from explore menu
                    sessionStorage.setItem('lunary_nav_context', 'explore');
                  }}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                    itemActive
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <ItemIcon className='h-4 w-4 flex-shrink-0' />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
