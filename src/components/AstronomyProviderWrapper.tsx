'use client';

import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type AstronomyProviderComponent = ComponentType<{
  children: ReactNode;
}>;

function isAdminPath(pathname: string | null): boolean {
  const currentPath =
    typeof window !== 'undefined' ? window.location.pathname : (pathname ?? '');

  return currentPath === '/admin' || currentPath.startsWith('/admin/');
}

export function AstronomyProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = isAdminPath(pathname);
  const [Provider, setProvider] = useState<AstronomyProviderComponent | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    if (isAdminRoute) {
      setProvider(null);
      return () => {
        cancelled = true;
      };
    }

    import('@/context/AstronomyContext')
      .then(({ AstronomyContextProvider }) => {
        if (!cancelled) {
          setProvider(() => AstronomyContextProvider);
        }
      })
      .catch((error) => {
        console.error('Failed to load astronomy context provider:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [isAdminRoute]);

  if (isAdminRoute || !Provider) {
    return <>{children}</>;
  }

  return <Provider>{children}</Provider>;
}
