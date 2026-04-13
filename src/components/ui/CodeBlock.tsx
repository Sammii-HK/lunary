'use client';

import { highlight } from 'sugar-high';
import DOMPurify from 'isomorphic-dompurify';

interface CodeBlockProps {
  code: string;
  language?: string;
}

/**
 * Syntax-highlighted code block using sugar-high (1KB, zero-dependency).
 * Output is sanitised with DOMPurify before rendering.
 */
export function CodeBlock({ code, language = 'json' }: CodeBlockProps) {
  const highlighted = highlight(code);
  const sanitised = DOMPurify.sanitize(highlighted, {
    ALLOWED_TAGS: ['span'],
    ALLOWED_ATTR: ['class', 'style'],
  });

  return (
    <div className='relative group'>
      <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
        <span className='text-[10px] text-content-muted uppercase tracking-wider'>
          {language}
        </span>
      </div>
      <pre
        className={[
          'text-sm bg-[#0d1117] p-4 rounded-lg overflow-x-auto border border-stroke-subtle/50',
          '[&_.sh__line]:block',
          '[&_.sh__token--identifier]:text-[#e6edf3]',
          '[&_.sh__token--keyword]:text-[#ff7b72]',
          '[&_.sh__token--string]:text-[#a5d6ff]',
          '[&_.sh__token--number]:text-[#79c0ff]',
          '[&_.sh__token--property]:text-[#d2a8ff]',
          '[&_.sh__token--comment]:text-[#8b949e]',
          '[&_.sh__token--punctuation]:text-[#c9d1d9]',
          '[&_.sh__token--sign]:text-[#c9d1d9]',
          '[&_.sh__token--class]:text-[#ffa657]',
          '[&_.sh__token--jsxliterals]:text-[#e6edf3]',
          '[&_.sh__token--break]:text-[#e6edf3]',
        ].join(' ')}
      >
        <code dangerouslySetInnerHTML={{ __html: sanitised }} />
      </pre>
    </div>
  );
}
