'use client';

import { useMemo } from 'react';
// @ts-ignore - MDX runtime doesn't have perfect types
import MDX from '@mdx-js/runtime';
import remarkGfm from 'remark-gfm';

const components = {
  h1: (props: any) => <h1 className='text-3xl font-bold mb-4' {...props} />,
  h2: (props: any) => (
    <h2 className='text-2xl font-semibold mb-3 mt-6' {...props} />
  ),
  h3: (props: any) => (
    <h3 className='text-xl font-medium mb-2 mt-4' {...props} />
  ),
  p: (props: any) => <p className='mb-4 leading-relaxed' {...props} />,
  ul: (props: any) => (
    <ul className='list-disc list-inside mb-4 space-y-1' {...props} />
  ),
  ol: (props: any) => (
    <ol className='list-decimal list-inside mb-4 space-y-1' {...props} />
  ),
  li: (props: any) => <li className='ml-4' {...props} />,
  blockquote: (props: any) => (
    <blockquote
      className='border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600'
      {...props}
    />
  ),
  code: (props: any) => (
    <code
      className='bg-gray-100 px-1 py-0.5 rounded text-sm font-mono'
      {...props}
    />
  ),
  pre: (props: any) => (
    <pre
      className='bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4'
      {...props}
    />
  ),
  a: (props: any) => (
    <a
      className='text-blue-600 hover:text-blue-800 underline'
      target='_blank'
      rel='noreferrer'
      {...props}
    />
  ),
  img: (props: any) => (
    <img className='max-w-full h-auto rounded-lg mb-4' {...props} />
  ),
  hr: (props: any) => <hr className='my-8 border-gray-300' {...props} />,
};

export function MdxLivePreview({ source }: { source: string }) {
  const mdxSource = useMemo(
    () => source || 'Type your MDX on the left…',
    [source],
  );

  return (
    <div className='p-5 border-l border-gray-200 overflow-auto bg-white min-h-full'>
      <div className='prose max-w-none'>
        <MDX components={components} remarkPlugins={[remarkGfm]}>
          {mdxSource}
        </MDX>
      </div>
    </div>
  );
}
