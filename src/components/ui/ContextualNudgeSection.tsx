import { ContextualNudgeButton } from '../grimoire/ContextualNudgeButton';
import { ContextualNudge } from '@/lib/grimoire/getContextualNudge';
import { Heading } from './Heading';

export function ContextualNudgeSection({
  nudge,
  location,
}: {
  nudge: ContextualNudge;
  location: string;
}) {
  return (
    <section className='relative bg-gradient-to-br from-lunary-primary-900/40 via-lunary-highlight-900/30 to-lunary-primary-900/40 border border-lunary-primary-600/50 rounded-xl p-6 sm:p-8 md:p-10 my-6 md:my-8 text-center overflow-hidden shadow-lg shadow-lunary-primary-900/20'>
      {/* Decorative background elements */}
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.08),transparent_50%)]' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.05),transparent_50%)]' />

      <div className='relative z-10'>
        <Heading
          as='h2'
          variant='h3'
          className='text-lunary-primary-100 mb-4 break-words font-semibold tracking-tight'
        >
          {nudge.headline}
        </Heading>
        <div className='max-w-2xl mx-auto'>
          <p className='text-zinc-300 mb-6 leading-relaxed text-sm md:text-base whitespace-pre-line'>
            {nudge.subline}
          </p>
        </div>
        <ContextualNudgeButton nudge={nudge} location={location} />
      </div>
    </section>
  );
}
