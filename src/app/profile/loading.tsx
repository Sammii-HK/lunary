export default function ProfileLoading() {
  return (
    <div className='flex flex-col items-center gap-6 p-4'>
      <div className='animate-pulse space-y-6 w-full max-w-md'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-20 h-20 bg-zinc-800 rounded-full' />
          <div className='h-6 bg-zinc-800 rounded w-32' />
          <div className='h-4 bg-zinc-800 rounded w-48' />
        </div>
        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-16 bg-zinc-800 rounded-lg' />
          ))}
        </div>
      </div>
    </div>
  );
}
