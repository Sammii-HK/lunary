'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

const isDev = process.env.NODE_ENV === 'development';

class ErrorBoundary extends React.Component<
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
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Production: Clean, user-friendly error page
      if (!isDev) {
        return (
          <div className='min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4'>
            <div className='text-center max-w-md'>
              <div className='mb-6'>
                <Image
                  src='/icons/dotty/moon-phases/new-moon.svg'
                  alt='Moon'
                  width={80}
                  height={80}
                  className='mx-auto opacity-60'
                />
              </div>
              <h2 className='text-2xl font-semibold mb-3'>
                Something went wrong
              </h2>
              <p className='text-zinc-400 mb-6'>
                The stars have momentarily misaligned. Let's get you back on
                track.
              </p>
              <div className='flex gap-3 justify-center'>
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className='px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm'
                >
                  Try Again
                </button>
                <Link
                  href='/'
                  className='px-5 py-2.5 bg-lunary-primary-600 hover:bg-lunary-primary-500 rounded-lg transition-colors text-sm'
                >
                  Return Home
                </Link>
              </div>
            </div>
          </div>
        );
      }

      // Development: Detailed error info for debugging
      return (
        <div className='min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4'>
          <div className='text-center max-w-md'>
            <h2 className='text-xl font-bold mb-4'>🌙 Something went wrong</h2>
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
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
export { ErrorBoundary };
