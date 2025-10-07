'use client';

import { JazzReactProvider } from 'jazz-tools/react';
import { AuthProvider } from "jazz-tools/better-auth/auth/react";
import { MyAppAccount } from '../../schema';
import { betterAuthClient } from '@/lib/auth-client';

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
      <AuthProvider betterAuthClient={betterAuthClient}>
        {children}
      </AuthProvider>
    </JazzReactProvider>
  );
}

// Register the Account schema so `useAccount` returns our custom `MyAppAccount`
declare module 'jazz-tools/react' {
  interface Register {
    Account: typeof MyAppAccount;
  }
}
