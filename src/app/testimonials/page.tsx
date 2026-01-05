'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

type Testimonial = {
  id: number;
  name: string;
  message: string;
  createdAt: string;
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        if (!response.ok) {
          throw new Error('Unable to load testimonials');
        }

        const payload = await response.json();
        if (!mounted) return;
        setTestimonials(payload.testimonials ?? []);
      } catch (err) {
        if (!mounted) return;
        setError(
          err instanceof Error ? err.message : 'Unable to load testimonials.',
        );
      }
    };

    loadTestimonials();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className='flex flex-col min-h-screen w-full px-4 py-16'>
      <div className='mx-auto w-full max-w-5xl space-y-10'>
        <section className='space-y-4 text-center md:text-left'>
          <p className='text-xs tracking-[0.4em] uppercase text-lunary-accent'>
            Featured Voices
          </p>
          <h1 className='text-3xl font-semibold leading-tight text-white md:text-4xl lg:text-5xl'>
            Stories curated from our community.
          </h1>
          <p className='text-base text-zinc-300'>
            These testimonials were handpicked by the Lunary team. They
            highlight how cosmic guidance, rituals, and the app experience
            glassify into meaningful change.
          </p>
        </section>

        <section className='space-y-6'>
          {error && (
            <div className='rounded-3xl border border-red-500/40 bg-red-500/10 p-8 text-center text-sm text-red-300'>
              {error}
            </div>
          )}
          {testimonials === null ? (
            <div className='rounded-3xl border border-zinc-800/60 bg-zinc-900/60 p-8 text-center text-sm text-zinc-400'>
              Loading stories…
            </div>
          ) : testimonials.length === 0 ? (
            <div className='rounded-3xl border border-zinc-800/60 bg-zinc-900/60 p-8 text-center text-sm text-zinc-400'>
              No featured testimonials yet. Check back soon for fresh stories.
            </div>
          ) : (
            <div className='grid gap-6 md:grid-cols-2'>
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.id}
                  className='flex flex-col rounded-3xl border border-zinc-800/60 bg-zinc-900/60 p-6 shadow-[0px_15px_30px_rgba(0,0,0,0.35)] transition hover:border-lunary-secondary'
                >
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    “{testimonial.message}”
                  </p>
                  <div className='mt-6 flex flex-col gap-1 text-xs uppercase tracking-[0.3em] text-zinc-500'>
                    <span className='text-sm font-semibold uppercase tracking-[0.3em] text-white'>
                      {testimonial.name}
                    </span>
                    <span>
                      Shared{' '}
                      {formatDistanceToNow(new Date(testimonial.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
