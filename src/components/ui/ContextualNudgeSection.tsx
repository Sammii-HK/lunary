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
    <section className='bg-gradient-to-r from-lunary-primary-900/30 to-lunary-highlight-900/30 border border-lunary-primary-700 rounded-lg p-6 sm:p-8 my-4 md:my-6 text-center overflow-x-hidden'>
      <Heading
        as='h2'
        variant='h3'
        className='text-lunary-primary-200 mb-3 break-words'
      >
        {nudge.headline}
      </Heading>
      <p className='text-zinc-200 mb-5 leading-relaxed text-xs md:text-sm'>
        {nudge.subline}
      </p>
      <ContextualNudgeButton nudge={nudge} location={location} />
    </section>
  );
}
