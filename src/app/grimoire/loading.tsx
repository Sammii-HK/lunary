export default function GrimoireLoading() {
  return (
    <div className='h-full w-full flex items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <div className='w-8 h-8 border-2 border-lunary-primary border-t-transparent rounded-full animate-spin' />
        <p className='text-sm text-zinc-400'>Loading grimoire...</p>
      </div>
    </div>
  );
}
