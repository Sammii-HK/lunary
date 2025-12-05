'use client';

import { JazzReactProvider } from 'jazz-tools/react';
import { MyAppAccount, CustomProfile } from '../../schema';

// Jazz is now READ-ONLY for data migration
// Auth is handled by better-auth with Postgres (Jazz fallback server-side only)
export function LunaryJazzProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <JazzReactProvider
      sync={{ peer: 'wss://cloud.jazz.tools/?key=sam@lunary.com' }}
      AccountSchema={MyAppAccount}
    >
      {children}
    </JazzReactProvider>
  );
}

// Register the Account schema so `useAccount` returns our custom `MyAppAccount`
declare module 'jazz-tools/react' {
  interface Register {
    Account: typeof MyAppAccount;
    Profile: typeof CustomProfile;
  }
}
