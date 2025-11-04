'use client';

import { usePathname } from 'next/navigation';

export function ConditionalMainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Marketing and admin routes should not have max-width constraint
  const isMarketingRoute =
    pathname === '/welcome' ||
    pathname === '/pricing' ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/blog') ||
    pathname?.startsWith('/shop');

  return (
    <main
      className={`flex flex-col h-full w-full items-center justify-between font-mono text-sm gap-4 overflow-auto px-4 align-self-middle justify-self-center ${
        isMarketingRoute ? '' : 'max-w-md'
      }`}
    >
      {children}
    </main>
  );
}
