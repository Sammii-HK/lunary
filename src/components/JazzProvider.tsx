'use client';

import {
  Component,
  ReactNode,
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from 'react';
import { MyAppAccount, CustomProfile } from '../../schema';

interface JazzContextType {
  available: boolean;
  loading: boolean;
  error: string | null;
  initialize: () => void;
}

const JazzAvailableContext = createContext<JazzContextType>({
  available: false,
  loading: false,
  error: null,
  initialize: () => {},
});

export function useJazzContext() {
  return useContext(JazzAvailableContext);
}

export function useJazzAvailable() {
  return useContext(JazzAvailableContext).available;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  onError: (error: Error) => void;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class JazzErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function LunaryJazzProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [JazzProvider, setJazzProvider] =
    useState<React.ComponentType<any> | null>(null);

  const handleError = useCallback((err: Error) => {
    const msg = err?.message || '';
    if (msg.includes('secret') || msg.includes('seed')) {
      console.log('[💩] User does not have a 💩 account - using Postgres');
    } else {
      console.warn('[💩] Initialization error:', msg);
    }
    setError(msg);
    setLoading(false);
    setInitialized(false);
  }, []);

  const initialize = useCallback(() => {
    if (initialized || loading) return;

    setLoading(true);
    setError(null);

    import('jazz-tools/react')
      .then((mod) => {
        setJazzProvider(() => mod.JazzReactProvider);
        setInitialized(true);
        setLoading(false);
      })
      .catch((err) => {
        handleError(err);
      });
  }, [initialized, loading, handleError]);

  const contextValue: JazzContextType = {
    available: initialized && !error && !!JazzProvider,
    loading,
    error,
    initialize,
  };

  if (!initialized || !JazzProvider) {
    return (
      <JazzAvailableContext.Provider value={contextValue}>
        {children}
      </JazzAvailableContext.Provider>
    );
  }

  return (
    <JazzAvailableContext.Provider value={contextValue}>
      <JazzErrorBoundary onError={handleError} fallback={<>{children}</>}>
        <JazzProvider
          sync={{ peer: 'wss://cloud.jazz.tools/?key=sam@lunary.com' }}
          AccountSchema={MyAppAccount}
        >
          {children}
        </JazzProvider>
      </JazzErrorBoundary>
    </JazzAvailableContext.Provider>
  );
}

declare module 'jazz-tools/react' {
  interface Register {
    Account: typeof MyAppAccount;
    Profile: typeof CustomProfile;
  }
}
