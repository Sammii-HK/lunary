import { Suspense } from 'react';
import GrimoireIndex from './GrimoireIndex';
import { GrimoireCanonical } from '@/components/GrimoireCanonical';

const GrimoireHome = () => {
  return (
    <div className='h-[91vh] w-full'>
      <Suspense fallback={<div>Loading...</div>}>
        <GrimoireCanonical />
        <GrimoireIndex />
      </Suspense>
    </div>
  );
};

export default GrimoireHome;
