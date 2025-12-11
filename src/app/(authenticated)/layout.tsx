'use client';

import { AstronomyContextProvider } from '@/context/AstronomyContext';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AstronomyContextProvider>{children}</AstronomyContextProvider>;
}
