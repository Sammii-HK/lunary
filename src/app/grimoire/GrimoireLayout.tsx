import type { ReactNode } from 'react';
import GrimoireLayoutClient, {
  GrimoireLayoutProps,
  GrimoireSearchParams,
} from './GrimoireLayoutClient';
import { GrimoireClientIslands } from './GrimoireClientIslands';

export type { GrimoireSearchParams };

export default function GrimoireLayout(props: GrimoireLayoutProps) {
  return (
    <GrimoireChromeServer>
      <GrimoireClientIslands>
        <GrimoireLayoutClient {...props} />
      </GrimoireClientIslands>
    </GrimoireChromeServer>
  );
}

function GrimoireChromeServer({ children }: { children: ReactNode }) {
  return (
    <div className='min-h-full w-full bg-surface-base text-content-primary'>
      {children}
    </div>
  );
}
