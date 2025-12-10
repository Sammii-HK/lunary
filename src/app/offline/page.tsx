'use client';

export default function OfflinePage() {
  return (
    <div className='flex flex-col items-center justify-center h-full p-6 text-center'>
      <div className='mb-8'>
        <svg
          className='w-24 h-24 text-zinc-600 mx-auto'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414'
          />
        </svg>
      </div>

      <h1 className='text-2xl font-light text-zinc-100 mb-3'>
        You&apos;re Offline
      </h1>

      <p className='text-zinc-400 mb-8 max-w-sm'>
        The cosmic connection has been temporarily disrupted. Check your
        internet connection and try again.
      </p>

      <div className='space-y-4'>
        <button
          onClick={() => window.location.reload()}
          className='px-6 py-3 bg-lunary-primary-600 hover:bg-lunary-primary-500 text-white rounded-lg transition-colors'
        >
          Try Again
        </button>

        <p className='text-xs text-zinc-400'>
          Some content may still be available from cache
        </p>
      </div>
    </div>
  );
}
