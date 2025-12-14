'use client';

import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
  resultLabel?: string;
  className?: string;
  maxWidth?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  resultCount,
  resultLabel = 'result',
  className = '',
  maxWidth = 'max-w-md',
}: SearchInputProps) {
  return (
    <div className={className}>
      <div className={`relative ${maxWidth} mx-auto`}>
        <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none' />
        <input
          type='text'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className='w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-lunary-primary/50 focus:ring-1 focus:ring-lunary-primary/30 transition-all text-left'
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className='absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all'
            aria-label='Clear search'
          >
            <X className='w-4 h-4' />
          </button>
        )}
      </div>
      {value && resultCount !== undefined && (
        <p className='text-center text-sm text-white/50 mt-3'>
          {resultCount} {resultLabel}
          {resultCount !== 1 ? 's' : ''} for &quot;{value}&quot;
        </p>
      )}
    </div>
  );
}

export default SearchInput;
