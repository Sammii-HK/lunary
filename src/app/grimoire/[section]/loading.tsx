export default function Loading() {
  return (
    <div className='flex flex-row h-[93dvh] overflow-hidden relative'>
      <div className='flex-1 overflow-y-auto min-w-0'>
        <div className='p-4 md:p-6 lg:p-8 min-h-full'>
          <div className='space-y-6'>
            <div className='h-8 bg-zinc-800/50 rounded w-1/3 animate-pulse' />
            <div className='space-y-4'>
              <div className='h-4 bg-zinc-800/50 rounded w-full animate-pulse' />
              <div className='h-4 bg-zinc-800/50 rounded w-5/6 animate-pulse' />
              <div className='h-4 bg-zinc-800/50 rounded w-4/6 animate-pulse' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
