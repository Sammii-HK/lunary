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
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className='min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4'>
            <div className='text-center max-w-md'>
              <h2 className='text-xl font-bold mb-4'>
                🌙 Something went wrong
              </h2>
              <p className='text-zinc-400 mb-2'>
                Don't worry - the cosmic energy is still flowing
              </p>
              {this.state.error && (
                <details className='text-left text-xs text-zinc-500 mt-4 mb-4 p-3 bg-zinc-900 rounded'>
                  <summary className='cursor-pointer mb-2'>
                    Error details (click to expand)
                  </summary>
                  <pre className='overflow-auto text-[10px]'>
                    {this.state.error.message}
                    {this.state.error.stack && (
                      <>
                        {'\n\n'}
                        {this.state.error.stack}
                      </>
                    )}
                  </pre>
                </details>
              )}
              <button
                onClick={() => this.setState({ hasError: false })}
                className='px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors'
              >
                Try Again
              </button>
              <p className='text-xs text-zinc-500 mt-4'>
                Check browser console for more details
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
