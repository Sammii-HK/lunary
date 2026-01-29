'use client';

interface ForceMobileLayoutProps {
  children: React.ReactNode;
}

/**
 * Wrapper component for mobile layout forcing.
 * The actual layout forcing is handled by CSS overrides and MutationObserver
 * in demo mode. This component is kept as a pass-through wrapper
 * for potential future use.
 */
export function ForceMobileLayout({ children }: ForceMobileLayoutProps) {
  return <>{children}</>;
}
