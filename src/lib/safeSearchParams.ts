'use client';

import { useSearchParams } from 'next/navigation';

export function useSafeSearchParams() {
  const params = useSearchParams();
  return params ?? new URLSearchParams();
}
