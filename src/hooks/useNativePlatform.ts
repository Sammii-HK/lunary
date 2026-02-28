'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

// Module-level cache — computed once, shared across all components
let cachedPlatform: string | null = null;

function getPlatformCached(): string {
  if (cachedPlatform === null) {
    cachedPlatform = Capacitor.getPlatform();
  }
  return cachedPlatform;
}

export function useIsNativeIOS(): boolean | null {
  const [value, setValue] = useState<boolean | null>(null);

  useEffect(() => {
    setValue(Capacitor.isNativePlatform() && getPlatformCached() === 'ios');
  }, []);

  return value;
}
