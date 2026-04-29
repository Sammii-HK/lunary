import { CosmicSkeleton } from '@/components/states/CosmicSkeleton';

export default function TarotLoading() {
  return (
    <div className='h-full overflow-auto space-y-6 p-4'>
      <div className='space-y-4'>
        <CosmicSkeleton variant='text' width={192} height={32} />
        <CosmicSkeleton variant='text' height={16} />
        <div className='grid grid-cols-3 gap-4 mt-8'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='aspect-[2/3] w-full'>
              <CosmicSkeleton width='100%' height='100%' radius={8} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
