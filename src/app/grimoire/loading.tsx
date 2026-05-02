export default function GrimoireLoading() {
  return (
    <div className='h-full w-full'>
      <div className='mx-auto w-full max-w-5xl px-4 py-10 md:px-6 lg:px-8'>
        <div className='space-y-4'>
          <div className='h-9 w-48 animate-pulse rounded bg-surface-card/50' />
          <div className='h-4 w-full animate-pulse rounded bg-surface-card/50' />
          <div className='h-4 w-5/6 animate-pulse rounded bg-surface-card/50' />
          <div className='h-4 w-2/3 animate-pulse rounded bg-surface-card/50' />
        </div>
      </div>
    </div>
  );
}
