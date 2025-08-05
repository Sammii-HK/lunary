'use client';

import { JazzReactProvider } from 'jazz-tools/react';
import { MyAppAccount } from '../../schema';

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
  }
}
