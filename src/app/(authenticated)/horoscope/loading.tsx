export default function HoroscopeLoading() {
  return (
    <div className='h-full overflow-auto space-y-6 p-4'>
      <div className='animate-pulse space-y-4'>
        <div className='h-8 bg-zinc-800 rounded w-56' />
        <div className='h-4 bg-zinc-800 rounded w-full max-w-lg' />
        <div className='h-64 bg-zinc-800 rounded-xl mt-6' />
        <div className='space-y-2'>
          <div className='h-4 bg-zinc-800 rounded w-full' />
          <div className='h-4 bg-zinc-800 rounded w-5/6' />
          <div className='h-4 bg-zinc-800 rounded w-4/6' />
        </div>
      </div>
    </div>
  );
}
