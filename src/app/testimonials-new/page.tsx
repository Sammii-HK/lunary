import { Heading } from '@/components/ui/Heading';
import { TestimonialForm } from '@/components/TestimonialForm';

export default function TestimonialsPage() {
  return (
    <main className='flex flex-col min-h-screen px-4 py-16 w-full'>
      <div className='mx-auto w-full max-w-5xl space-y-10'>
        <section className='space-y-4 text-center md:text-left'>
          <p className='text-xs tracking-[0.4em] uppercase text-lunary-accent'>
            Your Voice
          </p>
          <Heading as='h1' variant='h1'>
            Share the impact Lunary has had on your cosmic journey.
          </Heading>
          <p className='text-base text-zinc-300'>
            We read every testimonial and may feature the ones that inspire us.
            Provide as much detail as you like; your story helps other cosmic
            seekers discover Lunary.
          </p>
        </section>

        <section className='grid gap-8 lg:grid-cols-[1.1fr,0.9fr]'>
          <TestimonialForm allowRepeat />

          <div className='rounded-3xl border border-zinc-800/60 bg-gradient-to-b from-lunary-secondary/5 to-zinc-900/40 p-8'>
            <h2 className='text-lg font-semibold text-white'>
              Need inspiration?
            </h2>
            <p className='mt-3 text-sm text-zinc-300'>
              Tell us about one of the following:
            </p>
            <ul className='mt-4 space-y-3 text-sm text-zinc-300'>
              <li>• A cosmic insight that changed how you make decisions.</li>
              <li>• How Lunary helped you build a ritual you love.</li>
              <li>• Feedback on what keeps you coming back to the app.</li>
            </ul>
            <p className='mt-6 text-xs uppercase tracking-[0.4em] text-zinc-500'>
              We treat every story with care.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
