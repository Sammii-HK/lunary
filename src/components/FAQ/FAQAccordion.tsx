'use client';

import { ParsedMarkdown } from '@/utils/markdown';
import { Heading } from '@/components/ui/Heading';

interface FAQAccordionProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function FAQAccordion({
  question,
  answer,
  isOpen,
  onToggle,
}: FAQAccordionProps) {
  return (
    <div className='border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors'>
      <button
        onClick={onToggle}
        className='w-full flex items-center justify-between text-left px-5 py-4 hover:bg-zinc-800/30 transition-colors'
        aria-expanded={isOpen}
      >
        <Heading
          as='h2'
          variant='h3'
          className='text-lunary-secondary-200 pr-4'
        >
          {question}
        </Heading>
        <svg
          className={`w-5 h-5 text-zinc-400 flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>
      {isOpen && (
        <div className='px-5 pb-5 text-zinc-300 text-sm leading-relaxed border-t border-zinc-800'>
          <div className='pt-4'>
            <ParsedMarkdown content={answer} />
          </div>
        </div>
      )}
    </div>
  );
}
