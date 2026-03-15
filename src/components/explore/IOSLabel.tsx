'use client';

import { useIsNativeIOS } from '@/hooks/useNativePlatform';
import { iosLabel } from '@/lib/ios-labels';

/**
 * Renders iOS-friendly text when running on native iOS,
 * otherwise renders the original children unchanged.
 */
export function IOSLabel({ children }: { children: string }) {
  const isNativeIOS = useIsNativeIOS();
  return <>{iosLabel(children, isNativeIOS)}</>;
}
