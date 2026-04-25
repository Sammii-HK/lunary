import { CosmicSkeleton } from '@/components/states/CosmicSkeleton';

export default function ProfileLoading() {
  return (
    <div className='flex flex-col items-center gap-6 p-4'>
      <div className='space-y-6 w-full max-w-md'>
        <div className='flex flex-col items-center gap-4'>
          <CosmicSkeleton variant='circle' width={80} />
          <CosmicSkeleton variant='text' width={128} height={24} />
          <CosmicSkeleton variant='text' width={192} height={16} />
        </div>
        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <CosmicSkeleton key={i} height={64} radius={8} />
          ))}
        </div>
      </div>
    </div>
  );
}
