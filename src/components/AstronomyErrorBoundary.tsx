'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary specifically for astronomy-related components
 *
 * Catches errors related to missing AstronomyContext or other astronomy failures
 * and prevents them from crashing the entire app
 */
export class AstronomyErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log to monitoring service
    if (typeof window !== 'undefined') {
      if ((window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          contexts: {
            react: errorInfo,
          },
          tags: {
            boundary: 'astronomy',
          },
        });
      }

      if ((window as any).posthog) {
        (window as any).posthog.capture('astronomy_error_boundary_triggered', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
        });
      }
    }

    console.error('AstronomyErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise show nothing
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Silent failure - just don't render the astronomy component
      // This prevents broken UI from showing
      return null;
    }

    return this.props.children;
  }
}
