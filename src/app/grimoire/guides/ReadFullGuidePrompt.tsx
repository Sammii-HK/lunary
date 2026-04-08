import { ArrowRight, BookOpenIcon } from 'lucide-react';
import Link from 'next/link';
import { Heading } from '@/components/ui/Heading';

export function ReadFullGuidePrompt({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className='block p-4 rounded-lg bg-gradient-to-r from-lunary-accent-900/30 to-lunary-rose-900/30 border border-lunary-accent-700 hover:border-lunary-accent-500 transition-colors group'
    >
      <div className='flex items-center justify-between'>
        <div>
          <Heading
            as='h3'
            variant='h3'
            className='text-content-brand-accent group-hover:text-content-brand-accent transition-colors flex items-center gap-2'
          >
            <BookOpenIcon className='w-4 h-4 mr-2 text-content-brand-accent' />
            {title}
          </Heading>
          <p className='text-sm text-content-muted'>{description}</p>
        </div>
        <ArrowRight className='w-4 h-4 text-lunary-accent-400 group-hover:text-content-brand-accent transition-colors' />
      </div>
    </Link>
  );
}
