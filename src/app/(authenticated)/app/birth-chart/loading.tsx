export default function BirthChartLoading() {
  return (
    <div className='h-full overflow-auto space-y-6 p-4'>
      <div className='animate-pulse space-y-4'>
        <div className='h-8 bg-surface-card rounded w-48' />
        <div className='aspect-square max-w-md mx-auto bg-surface-card rounded-full' />
        <div className='grid grid-cols-2 gap-4 mt-6'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='h-24 bg-surface-card rounded-lg' />
          ))}
        </div>
      </div>
    </div>
  );
}
