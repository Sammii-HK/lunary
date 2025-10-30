'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
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
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className='min-h-screen bg-zinc-950 text-white flex items-center justify-center'>
            <div className='text-center'>
              <h2 className='text-xl font-bold mb-4'>
                🌙 Something went wrong
              </h2>
              <p className='text-zinc-400 mb-4'>
                Don't worry - the cosmic energy is still flowing
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className='px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors'
              >
                Try Again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
