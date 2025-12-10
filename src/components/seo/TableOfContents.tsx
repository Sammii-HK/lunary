'use client';

import React from 'react';

export type TocItem = {
  id: string;
  label: string;
  level?: 2 | 3;
};

interface TableOfContentsProps {
  items: TocItem[];
  title?: string;
}

export function TableOfContents({
  items,
  title = 'On this page',
}: TableOfContentsProps) {
  if (!items.length) return null;

  return (
    <nav
      aria-label='Table of contents'
      className='mb-8 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm'
    >
      <p className='mb-2 font-medium text-zinc-100'>{title}</p>
      <ul className='space-y-1'>
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
            <a
              href={`#${item.id}`}
              className='text-zinc-400 hover:text-lunary-primary-300 transition-colors'
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
