'use client';

import { ReactNode } from 'react';
import { useIsNativeIOS } from '@/hooks/useNativePlatform';

export function HideOnNativeIOS({ children }: { children: ReactNode }) {
  const isNativeIOS = useIsNativeIOS();
  if (isNativeIOS) return null;
  return <>{children}</>;
}
