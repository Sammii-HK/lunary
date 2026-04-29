import { CosmicSkeleton } from '@/components/states/CosmicSkeleton';

export default function HoroscopeLoading() {
  return (
    <div className='h-full overflow-auto space-y-6 p-4'>
      <div className='space-y-4'>
        <CosmicSkeleton variant='text' width={224} height={32} />
        <CosmicSkeleton variant='text' height={16} />
        <CosmicSkeleton height={256} radius={12} />
        <div className='space-y-2'>
          <CosmicSkeleton variant='text' height={16} />
          <CosmicSkeleton variant='text' width='83%' height={16} />
          <CosmicSkeleton variant='text' width='66%' height={16} />
        </div>
      </div>
    </div>
  );
}
