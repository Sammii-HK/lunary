import { Heading } from '@/components/ui/Heading';
import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';

const PAGE_LIMIT = 8;

const getFeaturedTestimonials = async () => {
  return prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: PAGE_LIMIT,
  });
};

export default async function TestimonialsPage() {
  const testimonials = await getFeaturedTestimonials();

  return (
    <main className='flex flex-col min-h-screen w-full px-4 py-16'>
      <div className='mx-auto w-full max-w-5xl space-y-10'>
        <section className='space-y-4 text-center md:text-left'>
          <p className='text-xs tracking-[0.4em] uppercase text-lunary-accent'>
            Featured Voices
          </p>
          <Heading as='h1' variant='h1'>
            Stories curated from our community.
          </Heading>
          <p className='text-base text-zinc-300'>
            These testimonials were handpicked by the Lunary team. They
            highlight how cosmic guidance, rituals, and the app experience
            glassify into meaningful change.
          </p>
        </section>

        <section className='space-y-6'>
          {testimonials.length === 0 ? (
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
