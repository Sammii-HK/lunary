'use client';

import type { ShareFormat } from '@/hooks/useShareModal';
import { FORMAT_LABELS } from '@/lib/share/types';

export interface ShareFormatSelectorProps {
  selected: ShareFormat;
  onChange: (format: ShareFormat) => void;
  options?: ShareFormat[];
}

const defaultOptions: ShareFormat[] = ['square', 'landscape', 'story'];

export function ShareFormatSelector({
  selected,
  onChange,
  options = defaultOptions,
}: ShareFormatSelectorProps) {
  return (
    <div className='flex flex-col gap-2'>
      <p className='text-xs text-zinc-400 uppercase tracking-wider'>Format</p>
      <div className='grid grid-cols-2 gap-2'>
        {options.map((format) => (
          <button
            key={format}
            onClick={() => onChange(format)}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              selected === format
                ? 'bg-lunary-primary-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {FORMAT_LABELS[format]}
          </button>
        ))}
      </div>
    </div>
  );
}
