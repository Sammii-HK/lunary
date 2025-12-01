export default function BlogLoading() {
  return (
    <div className='space-y-6 p-4'>
      <div className='animate-pulse space-y-4'>
        <div className='h-8 bg-zinc-800 rounded w-48' />
        <div className='grid gap-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-32 bg-zinc-800 rounded-xl' />
          ))}
        </div>
      </div>
    </div>
  );
}
