import { Suspense } from 'react';
import GrimoireIndex from './GrimoireIndex';

const GrimoireHome = () => {
  return (
    <div className='h-[91vh] w-full'>
      <Suspense fallback={<div>Loading...</div>}>
        <GrimoireIndex />
      </Suspense>
    </div>
  );
};

export default GrimoireHome;
