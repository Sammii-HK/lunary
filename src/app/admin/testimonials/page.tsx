'use client';

import { useEffect, useMemo, useState } from 'react';

type AdminTestimonial = {
  id: number;
  name: string;
  message: string;
  isPublished: boolean;
  createdAt: string;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadTestimonials = async () => {
      try {
        const response = await fetch('/api/admin/testimonials');
        if (!response.ok) {
          throw new Error('Unable to fetch testimonials');
        }
        const data = await response.json();
        if (mounted) {
          setTestimonials(data.testimonials);
        }
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load testimonials',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTestimonials();

    return () => {
      mounted = false;
    };
  }, []);

  const sortedTestimonials = useMemo(
    () =>
      testimonials.slice().sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }),
    [testimonials],
  );

  const toggleFeatured = async (id: number, isPublished: boolean) => {
    setBusyId(id);
    setFeedback(null);

    try {
      const response = await fetch('/api/admin/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isPublished }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? 'Unable to update testimonial');
      }

      const data = await response.json();
      setTestimonials((current) =>
        current.map((testimonial) =>
          testimonial.id === data.testimonial.id
            ? data.testimonial
            : testimonial,
        ),
      );
      setFeedback(
        `${data.testimonial.name} is now ${
          data.testimonial.isPublished ? 'featured' : 'unfeatured'
        }.`,
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Failed to update testimonial',
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className='flex flex-col min-h-screen w-full px-4 py-16'>
      <div className='mx-auto w-full max-w-6xl space-y-8'>
        <section className='space-y-3'>
          <p className='text-xs tracking-[0.4em] uppercase text-lunary-accent'>
            Testimonial Admin
          </p>
          <h1 className='text-3xl font-semibold text-white'>
            Select featured testimonials
          </h1>
          <p className='text-sm text-zinc-400'>
            Toggle the star button to publish testimonials across the featured
            page. Only the ones marked as featured will appear on the
            `/testimonials` widget.
          </p>
        </section>

        {error && (
          <div className='rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300'>
            {error}
          </div>
        )}

        {feedback && (
          <div className='rounded-2xl border border-lunary-success/60 bg-lunary-success/10 px-4 py-3 text-sm text-lunary-success'>
            {feedback}
          </div>
        )}

        {loading ? (
          <div className='rounded-3xl border border-zinc-800/60 bg-zinc-900/60 p-10 text-center text-sm text-zinc-400'>
            Loading testimonials…
          </div>
        ) : sortedTestimonials.length === 0 ? (
          <div className='rounded-3xl border border-zinc-800/60 bg-zinc-900/60 p-10 text-center text-sm text-zinc-400'>
            No testimonials have been submitted yet.
          </div>
        ) : (
          <div className='grid gap-4'>
            {sortedTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className='rounded-3xl border border-zinc-800/60 bg-zinc-900/60 p-6 shadow-[0px_10px_25px_rgba(0,0,0,0.45)]'
              >
                <div className='flex items-center justify-between gap-4'>
                  <div className='text-xs uppercase tracking-[0.4em] text-zinc-500'>
                    #{testimonial.id} · {formatDate(testimonial.createdAt)}
                  </div>
                  <button
                    type='button'
                    disabled={busyId === testimonial.id}
                    onClick={() =>
                      toggleFeatured(testimonial.id, !testimonial.isPublished)
                    }
                    className={`rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] transition ${
                      testimonial.isPublished
                        ? 'border-lunary-success text-lunary-success'
                        : 'border-zinc-600 text-zinc-400'
                    } ${busyId === testimonial.id ? 'opacity-60' : 'hover:border-white hover:text-white'}`}
                  >
                    {testimonial.isPublished ? 'Featured' : 'Feature'}
                  </button>
                </div>
                <p className='mt-4 text-sm text-zinc-300 leading-relaxed'>
                  {testimonial.message}
                </p>
                <p className='mt-4 text-xs text-zinc-500 uppercase tracking-[0.4em]'>
                  — {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
