import React from 'react';

interface ParsedMarkdownProps {
  content: string;
  className?: string;
}

export function ParsedMarkdown({
  content,
  className = '',
}: ParsedMarkdownProps) {
  if (!content) return null;

  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className='space-y-2 my-4'>
          {currentList.map((item, i) => (
            <li key={i} className='flex items-start gap-3 text-zinc-300'>
              <span className='text-purple-400 mt-1'>•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>,
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    // H2 heading
    if (trimmed.startsWith('## ')) {
      flushList();
      const text = trimmed.slice(3);
      elements.push(
        <h2
          key={`h2-${index}`}
          className='text-2xl font-medium text-zinc-100 mt-8 mb-4'
        >
          {text}
        </h2>,
      );
      return;
    }

    // H3 heading
    if (trimmed.startsWith('### ')) {
      flushList();
      const text = trimmed.slice(4);
      elements.push(
        <h3
          key={`h3-${index}`}
          className='text-xl font-medium text-zinc-200 mt-6 mb-3'
        >
          {text}
        </h3>,
      );
      return;
    }

    // H4 heading
    if (trimmed.startsWith('#### ')) {
      flushList();
      const text = trimmed.slice(5);
      elements.push(
        <h4
          key={`h4-${index}`}
          className='text-lg font-medium text-zinc-200 mt-4 mb-2'
        >
          {text}
        </h4>,
      );
      return;
    }

    // Bullet list item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const text = trimmed.slice(2);
      currentList.push(text);
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${index}`} className='text-zinc-300 leading-relaxed mb-4'>
        {trimmed}
      </p>,
    );
  });

  flushList();

  return <div className={className}>{elements}</div>;
}
