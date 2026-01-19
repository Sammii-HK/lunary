'use client';

import type { ReactNode } from 'react';

export function GrimoireClientIslands({ children }: { children: ReactNode }) {
  // Isolate the interactive grimoire shell so the server layout can be static
  // while any auth, analytics, or theme toggles remain client-only.
  return <>{children}</>;
}
