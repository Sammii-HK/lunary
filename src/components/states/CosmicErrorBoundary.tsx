'use client';

import {
  Component,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { motion } from 'motion/react';
import { RefreshCcw, Flag } from 'lucide-react';
import classNames from 'classnames';

interface CosmicErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback. Receives the error and a reset() helper. */
  fallback?:
    | ReactNode
    | ((args: { error: Error; reset: () => void }) => ReactNode);
  /** Custom reset behaviour. Defaults to clearing internal state and reloading the page. */
  reset?: () => void;
  /** Optional tag forwarded to analytics for debugging. */
  boundary?: string;
}

interface CosmicErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Themed React error boundary. Renders a "the cosmos is recalibrating"
 * panel with a retry + report action. Logs to console and best-effort
 * to PostHog/Sentry if either is wired into window.
 */
export class CosmicErrorBoundary extends Component<
  CosmicErrorBoundaryProps,
  CosmicErrorBoundaryState
> {
  constructor(props: CosmicErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): CosmicErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Always log so devs can find it.
    // eslint-disable-next-line no-console
    console.error('[CosmicErrorBoundary] caught error:', error, errorInfo);

    // Best-effort forward to whichever analytics is available on window.
    if (typeof window !== 'undefined') {
      try {
        const w = window as unknown as {
          Sentry?: {
            captureException: (e: unknown, ctx?: unknown) => void;
          };
          posthog?: { capture: (event: string, props?: unknown) => void };
        };
        if (w.Sentry?.captureException) {
          w.Sentry.captureException(error, {
            contexts: { react: errorInfo },
            tags: { boundary: this.props.boundary ?? 'cosmic' },
          });
        }
        if (w.posthog?.capture) {
          w.posthog.capture('cosmic_error_boundary_triggered', {
            boundary: this.props.boundary ?? 'cosmic',
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
          });
        }
      } catch {
        // analytics must never crash the boundary itself
      }
    }
  }

  reset = () => {
    if (this.props.reset) {
      this.props.reset();
      this.setState({ hasError: false, error: null });
      return;
    }
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleReport = () => {
    const err = this.state.error;
    // For now, just log — founder can wire to Sentry/Slack later.
    // eslint-disable-next-line no-console
    console.warn('[CosmicErrorBoundary] user-reported error:', {
      message: err?.message,
      stack: err?.stack,
      boundary: this.props.boundary ?? 'cosmic',
    });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { fallback } = this.props;
    if (fallback) {
      if (typeof fallback === 'function') {
        return fallback({
          error: this.state.error ?? new Error('Unknown error'),
          reset: this.reset,
        });
      }
      return fallback;
    }

    return (
      <DefaultErrorFallback onReset={this.reset} onReport={this.handleReport} />
    );
  }
}

/* ------------------------------------------------------------------ */
/* Default themed fallback UI                                          */
/* ------------------------------------------------------------------ */

function DefaultErrorFallback({
  onReset,
  onReport,
}: {
  onReset: () => void;
  onReport: () => void;
}) {
  return (
    <div
      role='alert'
      className={classNames(
        'relative overflow-hidden',
        'rounded-2xl border border-stroke-subtle bg-surface-elevated',
        'px-5 py-7 sm:px-7 sm:py-9',
      )}
    >
      {/* Cosmic backdrop — small, in the corner */}
      <CornerBackdrop />

      <div className='relative z-10 flex flex-col items-center text-center gap-4 max-w-md mx-auto'>
        <h3 className='text-lg sm:text-xl font-medium text-content-primary'>
          The cosmos is recalibrating
        </h3>
        <p className='text-sm text-content-secondary leading-relaxed'>
          Something went sideways. The skies will clear.
        </p>

        <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mt-1'>
          <button
            type='button'
            onClick={onReset}
            className={classNames(
              'inline-flex items-center justify-center gap-1.5',
              'rounded-full px-4 py-2 text-sm font-medium',
              'bg-lunary-primary text-white',
              'hover:bg-lunary-primary-600 active:bg-lunary-primary-700',
              'transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-lunary-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
            )}
          >
            <RefreshCcw className='w-3.5 h-3.5' aria-hidden='true' />
            Try again
          </button>

          <button
            type='button'
            onClick={onReport}
            className={classNames(
              'inline-flex items-center gap-1.5',
              'text-xs text-content-muted hover:text-content-primary',
              'underline-offset-2 hover:underline',
              'transition-colors',
            )}
          >
            <Flag className='w-3 h-3' aria-hidden='true' />
            Report this
          </button>
        </div>
      </div>
    </div>
  );
}

function CornerBackdrop() {
  return (
    <svg
      viewBox='-50 -50 100 100'
      className='absolute -top-6 -right-6 w-32 h-32 opacity-60 pointer-events-none'
      aria-hidden='true'
      focusable='false'
    >
      <defs>
        <radialGradient id='cosmic-err-bg' cx='50%' cy='50%' r='60%'>
          <stop offset='0%' stopColor='rgb(132 88 216)' stopOpacity='0.45' />
          <stop offset='70%' stopColor='rgb(132 88 216)' stopOpacity='0.08' />
          <stop offset='100%' stopColor='rgb(132 88 216)' stopOpacity='0' />
        </radialGradient>
      </defs>
      <circle cx='0' cy='0' r='48' fill='url(#cosmic-err-bg)' />
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 72, 144, 216, 288].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const r = 28;
          return (
            <motion.circle
              key={i}
              cx={Math.cos(rad) * r}
              cy={Math.sin(rad) * r}
              r={0.6 + (i % 2) * 0.4}
              fill='#fff8e7'
              animate={{ opacity: [0.3, 0.85, 0.3] }}
              transition={{
                duration: 2.4 + i * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            />
          );
        })}
      </motion.g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* HOC wrapper                                                         */
/* ------------------------------------------------------------------ */

/**
 * Convenience HOC: wrap any component in a CosmicErrorBoundary.
 *
 *   const SafeChart = withCosmicErrorBoundary(BirthChart);
 */
export function withCosmicErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  boundaryOptions?: Omit<CosmicErrorBoundaryProps, 'children'>,
): ComponentType<P> {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';

  function WithCosmicErrorBoundary(props: P) {
    return (
      <CosmicErrorBoundary {...boundaryOptions}>
        <WrappedComponent {...props} />
      </CosmicErrorBoundary>
    );
  }

  WithCosmicErrorBoundary.displayName = `withCosmicErrorBoundary(${displayName})`;
  return WithCosmicErrorBoundary;
}

export default CosmicErrorBoundary;
