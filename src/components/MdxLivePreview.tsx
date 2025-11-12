'use client';

import { useMemo } from 'react';
import Image from 'next/image';
// Temporarily disabled MDX runtime due to build issues
// Will re-enable when working on blog functionality

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
    <Image
      src={props.src || ''}
      alt={props.alt || ''}
      width={props.width || 800}
      height={props.height || 600}
      className='max-w-full h-auto rounded-lg mb-4'
      unoptimized
      {...(props.width && props.height
        ? {}
        : { style: { width: 'auto', height: 'auto' } })}
    />
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
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4'>
          <h3 className='text-yellow-800 font-medium mb-2'>
            MDX Preview Temporarily Disabled
          </h3>
          <p className='text-yellow-700 text-sm'>
            Live MDX preview is currently disabled. Raw content is shown below.
          </p>
        </div>
        <pre className='whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded border overflow-auto max-h-96'>
          {mdxSource}
        </pre>
      </div>
    </div>
  );
}
