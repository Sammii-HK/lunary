'use client';

import { useEffect } from 'react';

export function AdminCanonicalRemover() {
  useEffect(() => {
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.remove();
    }
  }, []);

  return null;
}
