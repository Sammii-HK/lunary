import { Heading } from '@/components/ui/Heading';
import { CycleSummaryCard } from '@/components/personal-cycles/CycleSummaryCard';

export const metadata = {
  title: 'Personal Cycles - Lunary',
  description:
    'See where you are right now in five interlocking life cycles: Saturn return, Jupiter return, profection year, current lunation, and solar return.',
};

export default function CyclesPage() {
  return (
    <div className='h-full overflow-auto' data-testid='personal-cycles-page'>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 pb-16'>
        <header className='space-y-2'>
          <Heading as='h1' variant='h1'>
            Personal Cycles
          </Heading>
          <p className='text-sm text-content-secondary'>
            Five interlocking life cycles, one snapshot. Tap any track to drop
            into the full breakdown.
          </p>
        </header>

        <CycleSummaryCard />
      </div>
    </div>
  );
}
