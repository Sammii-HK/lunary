import type { Metadata } from 'next';
import Link from 'next/link';

import { Heading } from '@/components/ui/Heading';
import TimingAssistantCard from '@/components/timing-assistant/TimingAssistantCard';

export const metadata: Metadata = {
  title: 'Timing Assistant · Lunary',
  description:
    'Find three supportive dates in the next month for launches, asks, commitments, and other timed decisions.',
};

export default function TimingAssistantPage() {
  return (
    <div className='h-full overflow-auto'>
      <div className='mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 pb-16 sm:p-6'>
        <header className='flex flex-col gap-2'>
          <Heading as='h1' variant='h1'>
            Timing Assistant
          </Heading>
          <p className='text-sm leading-relaxed text-content-secondary'>
            Ask for a single thing you want to time. Lunary scans the next month
            and returns three ranked dates from your chart and the live sky. For
            a yes/no answer about today, use{' '}
            <Link href='/app/decide' className='text-content-brand underline'>
              Decide
            </Link>
            .
          </p>
        </header>

        <TimingAssistantCard />
      </div>
    </div>
  );
}
