'use client';

import { useEffect, useRef, useState } from 'react';

type Testimonial = {
  id: number;
  name: string;
  message: string;
};

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [ready, setReady] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/testimonials')
      .then((res) => res.json())
      .then((data) => {
        setTestimonials(data.testimonials ?? []);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || testimonials.length === 0) return;
    const el = trackRef.current;
    if (!el) return;

    let pos = 0;
    let running = true;
    let paused = false;

    el.addEventListener('mouseenter', () => {
      paused = true;
    });
    el.addEventListener('mouseleave', () => {
      paused = false;
    });

    const step = () => {
      if (!running) return;
      if (!paused) {
        pos -= 0.5;
        const half = el.scrollWidth / 2;
        if (pos <= -half) pos = 0;
        el.style.transform = `translateX(${pos}px)`;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);

    return () => {
      running = false;
    };
  }, [ready, testimonials]);

  if (!ready || testimonials.length === 0) return null;

  const items = [...testimonials, ...testimonials];

  return (
    <section className='pt-4 pb-12 md:pt-6 md:pb-20 border-t border-stroke-subtle/30'>
      <div className='max-w-5xl mx-auto px-4 md:px-6 mb-8'>
        <p className='text-center text-xs tracking-[0.3em] uppercase text-content-muted'>
          From the community
        </p>
      </div>

      <div style={{ overflow: 'hidden' }}>
        <div
          ref={trackRef}
          className='flex gap-4'
          style={{ width: 'max-content', willChange: 'transform' }}
        >
          {items.map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              className='shrink-0 w-[300px] md:w-[360px] rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/40 p-5'
            >
              <p className='text-sm text-content-secondary leading-relaxed mb-3'>
                &ldquo;{t.message}&rdquo;
              </p>
              <p className='text-xs text-content-muted tracking-wide'>
                — {t.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
