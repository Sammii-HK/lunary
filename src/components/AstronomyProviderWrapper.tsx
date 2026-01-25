'use client';

import { ReactNode } from 'react';
import { AstronomyContextProvider } from '@/context/AstronomyContext';

export function AstronomyProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <AstronomyContextProvider>{children}</AstronomyContextProvider>;
}
