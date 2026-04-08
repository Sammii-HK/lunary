'use client';

import { Search } from 'lucide-react';

interface FAQSearchProps {
  value: string;
  onChange: (value: string) => void;
  totalQuestions: number;
  visibleQuestions: number;
}

export function FAQSearch({
  value,
  onChange,
  totalQuestions,
  visibleQuestions,
}: FAQSearchProps) {
  return (
    <div className='max-w-2xl mx-auto'>
      <div className='relative'>
        <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted' />
        <input
          type='text'
          placeholder='Search FAQs...'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='w-full pl-12 pr-4 py-3 bg-surface-elevated/50 border border-stroke-subtle rounded-xl text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-lunary-primary-500/50 focus:border-lunary-primary-500'
        />
      </div>
      {value && (
        <p className='text-xs text-content-muted mt-2'>
          Showing {visibleQuestions} of {totalQuestions} questions
        </p>
      )}
    </div>
  );
}
