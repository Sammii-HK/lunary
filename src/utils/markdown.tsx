import Link from 'next/link';
import React from 'react';

interface ParsedMarkdownProps {
  content: string;
  className?: string;
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

    type MatchType = 'bold' | 'italic' | 'link';
    let nextMatch: { type: MatchType; match: RegExpMatchArray } | null = null;

    const candidates: Array<{ type: MatchType; match: RegExpMatchArray }> = [];
    if (boldMatch) {
      candidates.push({ type: 'bold', match: boldMatch });
    }
    if (italicMatch) {
      candidates.push({ type: 'italic', match: italicMatch });
    }
    if (linkMatch) {
      candidates.push({ type: 'link', match: linkMatch });
    }

    if (candidates.length === 0) {
      result.push(remaining);
      break;
    }

    nextMatch = candidates.reduce((acc, candidate) => {
      if (
        !acc ||
        (candidate.match.index ?? Infinity) < (acc.match.index ?? Infinity)
      ) {
        return candidate;
      }
      return acc;
    }, null);

    if (!nextMatch) {
      result.push(remaining);
      break;
    }

    const { type, match } = nextMatch;
    const index = match.index ?? 0;

    if (index > 0) {
      result.push(remaining.slice(0, index));
    }

    if (type === 'bold') {
      result.push(
        <strong key={key++} className='font-semibold text-zinc-100'>
          {match[1]}
        </strong>,
      );
    } else if (type === 'italic') {
      result.push(
        <em key={key++} className='italic text-zinc-200'>
          {match[1]}
        </em>,
      );
    } else {
      result.push(
        <Link
          key={`link-${key++}`}
          href={match[2]}
          className='text-lunary-primary-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lunary-primary-300'
        >
          {match[1]}
        </Link>,
      );
    }

    remaining = remaining.slice(index + match[0].length);
  }

  return result;
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
              <span className='text-lunary-primary-400 mt-1'>•</span>
              <span>{parseInlineMarkdown(item)}</span>
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
          className='text-xl md:text-2xl font-medium text-zinc-100 mt-8 mb-4'
        >
          {parseInlineMarkdown(text)}
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
          className='text-lg md:text-xl font-medium text-zinc-200 mt-6 mb-3'
        >
          {parseInlineMarkdown(text)}
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
          className='text-base md:text-lg font-medium text-zinc-200 mt-4 mb-2'
        >
          {parseInlineMarkdown(text)}
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
        {parseInlineMarkdown(trimmed)}
      </p>,
    );
  });

  flushList();

  return <div className={className}>{elements}</div>;
}
