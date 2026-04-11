'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

const isDev = process.env.NODE_ENV === 'development';
const RELOAD_KEY = 'lunary_error_reload';

function isChunkLoadError(error: Error): boolean {
  const msg = error.message || '';
  return (
    msg.includes('Loading chunk') ||
    msg.includes('ChunkLoadError') ||
    msg.includes('Loading CSS chunk') ||
    msg.includes('Minified React error #130') ||
    msg.includes('Minified React error #423') ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Element type is invalid') ||
    error.name === 'ChunkLoadError'
  );
}

function isCapacitorWebError(error: Error): boolean {
  const msg = error.message || '';
  return (
    msg.includes('not supported in this plugin') ||
    msg.includes('not implemented on web') ||
    msg.includes('Web not supported')
  );
}

class Boundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    if (isCapacitorWebError(error)) {
      return { hasError: false };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (isCapacitorWebError(error)) {
      if (isDev) {
        console.warn('[Capacitor] Suppressed web plugin error:', error.message);
      }
      return;
    }

    console.error('ErrorBoundary caught an error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);

    if (isChunkLoadError(error) && typeof window !== 'undefined') {
      const lastReload = sessionStorage.getItem(RELOAD_KEY);
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10_000) {
        sessionStorage.setItem(RELOAD_KEY, String(now));
        window.location.reload();
      }
    }
  }

  handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-screen bg-surface-base text-content-primary flex items-center justify-center p-4'>
          <div className='text-center max-w-md'>
            <h2 className='text-xl font-bold mb-4'>Something went wrong</h2>
            <p className='text-content-muted mb-2'>
              Don't worry - the cosmic energy is still flowing
            </p>
            {isDev && this.state.error && (
              <details className='text-left text-xs text-content-muted mt-4 mb-4 p-3 bg-surface-elevated rounded'>
                <summary className='mb-2'>Error details</summary>
                <pre className='overflow-auto text-[10px]'>
                  {this.state.error.message}
                  {this.state.error.stack
                    ? `\n\n${this.state.error.stack}`
                    : ''}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleRefresh}
              className='px-4 py-2 bg-surface-overlay hover:bg-surface-overlay rounded transition-colors'
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundaryWrapper({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return <Boundary fallback={fallback}>{children}</Boundary>;
}
