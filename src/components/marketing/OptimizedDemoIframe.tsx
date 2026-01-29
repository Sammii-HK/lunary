'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface OptimizedDemoIframeProps {
  /**
   * Load strategy:
   * - 'eager': Load immediately (for above-the-fold)
   * - 'lazy': Load when near viewport (for below-the-fold)
   */
  loading?: 'eager' | 'lazy';

  /**
   * Preload strategy:
   * - true: Preload the page in <head> for fastest load
   * - false: No preload
   */
  preload?: boolean;
}

export function OptimizedDemoIframe({
  loading = 'eager',
  preload = true,
}: OptimizedDemoIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadStartTime] = useState(Date.now());
  const [loadTime, setLoadTime] = useState<number | null>(null);

  // For lazy loading, use intersection observer
  const { ref: observerRef, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
    rootMargin: '200px', // Start loading 200px before visible
  });

  // Preload the iframe page for instant load
  useEffect(() => {
    if (!preload || typeof window === 'undefined') return;

    // Add preload link to head
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = '/demo-preview';
    link.as = 'document';
    document.head.appendChild(link);

    // Also prefetch for even faster subsequent loads
    const prefetchLink = document.createElement('link');
    prefetchLink.rel = 'prefetch';
    prefetchLink.href = '/demo-preview';
    document.head.appendChild(prefetchLink);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(prefetchLink);
    };
  }, [preload]);

  // Track load performance
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'DEMO_READY') {
        const time = Date.now() - loadStartTime;
        setLoadTime(time);
        console.log(`[Demo Iframe] Loaded in ${time}ms`);

        // Send performance metric to analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'timing_complete', {
            name: 'demo_iframe_load',
            value: time,
            event_category: 'Performance',
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loadStartTime]);

  // Determine if we should render iframe
  const shouldLoad = loading === 'eager' || inView;

  return (
    <div
      ref={observerRef}
      className='relative w-full max-w-[393px] mx-auto'
      style={{ height: '750px' }}
    >
      {/* iPhone frame */}
      <div
        className='relative w-full h-full bg-zinc-950 rounded-[2.5rem] border border-zinc-800 overflow-hidden'
        style={{
          boxShadow:
            '0 18px 28px rgba(0, 0, 0, 0.28), 0 0 22px rgba(178, 126, 255, 0.18)',
        }}
      >
        {shouldLoad ? (
          <iframe
            ref={iframeRef}
            src='/demo-preview'
            title='Lunary Demo'
            width='393'
            height='750'
            loading={loading}
            sandbox='allow-scripts allow-same-origin allow-top-navigation-by-user-activation'
            allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
            style={{
              border: 'none',
              width: '100%',
              height: '100%',
              display: 'block',
            }}
            referrerPolicy='no-referrer'
            {...({ importance: 'high' } as any)}
          />
        ) : (
          // Placeholder while lazy loading
          <div className='flex items-center justify-center h-full bg-zinc-950'>
            <div className='animate-pulse text-zinc-500 text-sm'>
              Loading demo...
            </div>
          </div>
        )}
      </div>

      {/* Caption */}
      <div className='mt-4 text-center space-y-1'>
        <p className='text-xs text-zinc-400'>
          Live preview using real cosmic data for today
        </p>
      </div>
    </div>
  );
}
