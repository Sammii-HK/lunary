export default function TarotLoading() {
  return (
    <div className='h-full overflow-auto space-y-6 p-4'>
      <div className='animate-pulse space-y-4'>
        <div className='h-8 bg-zinc-800 rounded w-48' />
        <div className='h-4 bg-zinc-800 rounded w-full max-w-md' />
        <div className='grid grid-cols-3 gap-4 mt-8'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='aspect-[2/3] bg-zinc-800 rounded-lg' />
          ))}
        </div>
      </div>
    </div>
  );
}
